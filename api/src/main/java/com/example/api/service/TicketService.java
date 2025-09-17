package com.example.api.service;

import com.example.api.dto.TicketDto;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.exception.TicketNotFoundException;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.User;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.models.StatusHistory;
import com.example.api.models.SubCategory;
import com.example.api.models.Severity;
import com.example.api.models.RecommendedSeverityFlow;
import com.example.api.repository.UserRepository;
import com.example.api.repository.TicketCommentRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.StatusMasterRepository;
import com.example.api.repository.CategoryRepository;
import com.example.api.repository.SubCategoryRepository;
import com.example.api.repository.PriorityRepository;
import com.example.api.repository.UploadedFileRepository;
import com.example.api.repository.RecommendedSeverityFlowRepository;
import com.example.api.service.AssignmentHistoryService;
import com.example.api.service.StatusHistoryService;
import com.example.api.service.TicketStatusWorkflowService;
import com.example.api.service.TicketSlaService;
import com.example.api.enums.TicketStatus;
import com.example.api.enums.FeedbackStatus;
import com.example.api.enums.RecommendedSeverityStatus;
import com.example.api.typesense.TypesenseClient;
import com.example.notification.enums.ChannelType;
import com.example.notification.service.NotificationService;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.typesense.model.SearchResult;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@AllArgsConstructor
public class TicketService {
    private final TypesenseClient typesenseClient;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final AssignmentHistoryService assignmentHistoryService;
    private final StatusHistoryService statusHistoryService;
    private final NotificationService notificationService;
    private final TicketStatusWorkflowService workflowService;
    private final StatusMasterRepository statusMasterRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final PriorityRepository priorityRepository;
    private final UploadedFileRepository uploadedFileRepository;
    private final TicketSlaService ticketSlaService;
    private final RecommendedSeverityFlowRepository recommendedSeverityFlowRepository;

    public List<Ticket> getTickets() {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
    }

    private TicketDto mapWithStatusId(Ticket ticket) {
        TicketDto dto = DtoMapper.toTicketDto(ticket);
        // category names
        if (ticket.getCategory() != null) {
            dto.setCategoryId(ticket.getCategory());
            categoryRepository.findById(ticket.getCategory())
                    .ifPresent(cat -> dto.setCategory(cat.getCategory()));
        }
        if (ticket.getSubCategory() != null) {
            dto.setSubCategoryId(ticket.getSubCategory());
            subCategoryRepository.findById(ticket.getSubCategory())
                    .ifPresent(sub -> dto.setSubCategory(sub.getSubCategory()));
        }
        // priority info
        if (ticket.getPriority() != null) {
            dto.setPriorityId(ticket.getPriority());
            priorityRepository.findById(ticket.getPriority())
                    .ifPresent(p -> dto.setPriority(p.getLevel()));
        }
        // status info
        if (ticket.getStatus() != null) {
            dto.setStatusId(ticket.getStatus().getStatusId());
            dto.setStatusLabel(ticket.getStatus().getLabel());
            dto.setStatusName(ticket.getStatus().getStatusName());
        } else if (ticket.getTicketStatus() != null) {
            String sid = workflowService.getStatusIdByCode(ticket.getTicketStatus().name());
            dto.setStatusId(sid);
            statusMasterRepository.findById(sid).ifPresent(s -> {
                dto.setStatusLabel(s.getLabel());
                dto.setStatusName(s.getStatusName());
            });
        }
        // short ticket id
        if (dto.getId() != null) {
            dto.setShortId(dto.getId().length() > 8 ? dto.getId().substring(0,8) : dto.getId());
        }
        if (ticket.getId() != null) {
            java.util.List<com.example.api.models.UploadedFile> files = uploadedFileRepository.findByTicket_IdAndIsActive(ticket.getId(), "Y");
            java.util.List<String> paths = files.stream().map(com.example.api.models.UploadedFile::getRelativePath).toList();
            dto.setAttachmentPath(String.join(",", paths));
            dto.setAttachmentPaths(paths);
        }
        if (ticket.getId() != null && ticket.getRecommendedSeverity() != null) {
            recommendedSeverityFlowRepository
                    .findTopByTicket_IdAndRecommendedSeverityOrderByIdDesc(ticket.getId(), ticket.getRecommendedSeverity())
                    .ifPresent(flow -> {
                        if (flow.getRecommendedSeverityStatus() != null) {
                            dto.setRecommendedSeverityStatus(flow.getRecommendedSeverityStatus().name());
                        }
                        dto.setSeverityApprovedBy(flow.getSeverityApprovedBy());
                    });
        }
        return dto;
    }

    public Page<TicketDto> getTickets(String priority, Pageable pageable) {
        Page<Ticket> ticketPage;
        if (priority != null && !priority.equalsIgnoreCase("All")) {
            ticketPage = ticketRepository.findByPriority(priority, pageable);
        } else {
            ticketPage = ticketRepository.findAll(pageable);
        }
        return ticketPage.map(this::mapWithStatusId);
    }

    public TicketDto getTicket(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        return mapWithStatusId(ticket);
    }

    public TicketDto addTicket(Ticket ticket) {
        System.out.println("TicketService: addTicket - method");
        if(ticket.isMaster()) ticket.setMasterId(null);
        if (ticket.getUpdatedBy() == null) {
            ticket.setUpdatedBy(ticket.getAssignedBy());
        }

        // If userId is neither null nor empty
        if (ticket.getUserId() != null && !ticket.getUserId().isEmpty()) {
            User user = userRepository.findById(ticket.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", ticket.getUserId()));
            ticket.setUser(user);
            ticket.setRequestorName(user.getUsername());
        }

        // TO DO: Remove TicketStatus during Code Cleaning
        if (ticket.getStatus() == null && ticket.getTicketStatus() != null) {
            String id = workflowService.getStatusIdByCode(ticket.getTicketStatus().name());
            if (id != null) {
                statusMasterRepository.findById(id).ifPresent(ticket::setStatus);
            }
        }
        if (ticket.getTicketStatus() == null && ticket.getStatus() != null) {
            String code = ticket.getStatus().getStatusCode();
            if (code != null) {
                ticket.setTicketStatus(TicketStatus.valueOf(code));
            }
        }
        if (ticket.getSeverity() == null && ticket.getSubCategory() != null) {
            subCategoryRepository.findById(ticket.getSubCategory())
                    .map(SubCategory::getSeverity)
                    .map(Severity::getId)
                    .ifPresent(ticket::setSeverity);
        }
        boolean isAssigned = ticket.getAssignedTo() != null && !ticket.getAssignedTo().isEmpty();
        if (!isAssigned) {
            ticket.setTicketStatus(TicketStatus.OPEN);
            String openId = workflowService.getStatusIdByCode(TicketStatus.OPEN.name());
            statusMasterRepository.findById(openId).ifPresent(ticket::setStatus);
        } else if (ticket.getStatus() == null) {
            ticket.setTicketStatus(TicketStatus.ASSIGNED);
            String assignId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
            statusMasterRepository.findById(assignId).ifPresent(ticket::setStatus);
        }
        System.out.println("TicketService: Saving the ticket to repository now...");
        ticket.setLastModified(LocalDateTime.now());
        Ticket saved = ticketRepository.save(ticket);

        String openId = workflowService.getStatusIdByCode(TicketStatus.OPEN.name());
        boolean sla = workflowService.getSlaFlagByStatusId(openId);
        java.util.List<StatusHistory> histories = new java.util.ArrayList<>();
        histories.add(statusHistoryService.addHistory(saved.getId(), saved.getUpdatedBy(), null, openId, sla, null));
        if (isAssigned) {
            assignmentHistoryService.addHistory(saved.getId(), saved.getAssignedBy(), saved.getAssignedTo(), saved.getLevelId(), null);
            String assignedId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
            boolean slaAssigned = workflowService.getSlaFlagByStatusId(assignedId);
            histories.add(statusHistoryService.addHistory(saved.getId(), saved.getUpdatedBy(), openId, assignedId, slaAssigned, null));
        }
        ticketSlaService.calculateAndSave(saved, histories);

        // Prepare data model for Freemarker template
        Map<String, Object> data = new HashMap<>();
        if (saved.getUser() != null) {
            data.put("username", saved.getUser().getName());
        } else {
            data.put("username", saved.getRequestorName());
        }
        data.put("ticketId", saved.getId());

        // Send notification using EMAIL channel and TicketCreated template
        try {
            notificationService.sendNotification(
                    ChannelType.EMAIL,
                    "email/TicketCreated",
                    data,
                    saved.getUser() != null ? saved.getUser().getEmailId() : saved.getRequestorEmailId()
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return mapWithStatusId(saved);
    }

    public SearchResult search(String query) throws Exception {
        return typesenseClient.searchTickets(query);
    }

    public Page<TicketDto> searchTickets(String query, String statusId, Boolean master,
                                         String assignedTo, String assignedBy, String requestorId, String levelId, String priority,
                                         Pageable pageable) {
        ArrayList<String> statusIds = (statusId == null || statusId.isBlank())
                ? null
                : Arrays.stream(statusId.split(","))
                    .map(String::trim)
                    .collect(Collectors.toCollection(ArrayList::new));
        Page<Ticket> page = ticketRepository.searchTickets(query, statusIds, master, assignedTo, assignedBy, requestorId, levelId, priority, pageable);
        return page.map(this::mapWithStatusId);
    }

    public TicketDto updateTicket(String id, Ticket updated) {
        Ticket existing = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        String previousSeverity = existing.getSeverity();
        String previousRecommendedSeverity = existing.getRecommendedSeverity();
        String previousRecommendedBy = existing.getSeverityRecommendedBy();
        String previousAssignedTo = existing.getAssignedTo();
        TicketStatus previousStatus = existing.getTicketStatus();
        String previousStatusId = existing.getStatus() != null ? existing.getStatus().getStatusId()
                : (previousStatus != null ? workflowService.getStatusIdByCode(previousStatus.name()) : null);

        boolean recommendedSeverityChanged = updated.getRecommendedSeverity() != null
                && !java.util.Objects.equals(updated.getRecommendedSeverity(), previousRecommendedSeverity);
        boolean recommendedByChanged = updated.getSeverityRecommendedBy() != null
                && !java.util.Objects.equals(updated.getSeverityRecommendedBy(), previousRecommendedBy);
        boolean severityApproved = updated.getSeverity() != null
                && previousRecommendedSeverity != null
                && updated.getSeverity().equals(previousRecommendedSeverity)
                && !java.util.Objects.equals(previousSeverity, updated.getSeverity());

        TicketStatus updatedStatus = updated.getTicketStatus();
        String updatedStatusId = updated.getStatus() != null ? updated.getStatus().getStatusId() : null;
        String remark = updated.getRemark();
        if (updatedStatus == null && updatedStatusId != null) {
            String code = workflowService.getStatusCodeById(updatedStatusId);
            if (code != null) {
                updatedStatus = TicketStatus.valueOf(code);
            }
        }
        if (updatedStatusId == null && updatedStatus != null) {
            updatedStatusId = workflowService.getStatusIdByCode(updatedStatus.name());
        }
        if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
        if (updatedStatus != null) existing.setTicketStatus(updatedStatus);
        if (updatedStatusId != null) statusMasterRepository.findById(updatedStatusId).ifPresent(existing::setStatus);
        if (updatedStatus == TicketStatus.CLOSED) {
            if (existing.getResolvedAt() == null) {
                existing.setResolvedAt(LocalDateTime.now());
            }
            if (existing.getFeedbackStatus() == null) {
                existing.setFeedbackStatus(FeedbackStatus.PENDING);
            }
        }
        if (updated.getSubCategory() != null) {
            existing.setSubCategory(updated.getSubCategory());
            if (updated.getSeverity() == null) {
                subCategoryRepository.findById(updated.getSubCategory())
                        .map(SubCategory::getSeverity)
                        .map(Severity::getId)
                        .ifPresent(existing::setSeverity);
            }
        }
        if (updated.getPriority() != null) existing.setPriority(updated.getPriority());
        if (updated.getSeverity() != null) existing.setSeverity(updated.getSeverity());
        if (updated.getRecommendedSeverity() != null) existing.setRecommendedSeverity(updated.getRecommendedSeverity());
        if (updated.getImpact() != null) existing.setImpact(updated.getImpact());
        if (updated.getSeverityRecommendedBy() != null) existing.setSeverityRecommendedBy(updated.getSeverityRecommendedBy());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getAttachmentPath() != null) existing.setAttachmentPath(updated.getAttachmentPath());
        if (updated.getAssignedToLevel() != null) existing.setAssignedToLevel(updated.getAssignedToLevel());
        if (updated.getLevelId() != null) existing.setLevelId(updated.getLevelId());
        boolean assignmentChangeAllowed = updated.getAssignedTo() != null
                && updatedStatus != TicketStatus.PENDING_WITH_REQUESTER
                && updatedStatus != TicketStatus.PENDING_WITH_FCI;
        if (assignmentChangeAllowed) {
            existing.setAssignedTo(updated.getAssignedTo());
            if (!updated.getAssignedTo().equals(previousAssignedTo) && existing.getAssignedTo() != null && updatedStatus == null && updatedStatusId == null) {
                existing.setTicketStatus(TicketStatus.ASSIGNED);
                String assignId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
                statusMasterRepository.findById(assignId).ifPresent(existing::setStatus);
            }
        }
        if (updated.getUpdatedBy() != null) existing.setUpdatedBy(updated.getUpdatedBy());
        existing.setLastModified(LocalDateTime.now());
        Ticket saved = ticketRepository.save(existing);
        String updatedBy = updated.getUpdatedBy() != null ? updated.getUpdatedBy() : existing.getUpdatedBy();
        if (assignmentChangeAllowed && !updated.getAssignedTo().equals(previousAssignedTo)) {
            assignmentHistoryService.addHistory(id,
                    updated.getAssignedBy() != null ? updated.getAssignedBy() : updatedBy,
                    updated.getAssignedTo(),
                    updated.getLevelId() != null ? updated.getLevelId() : existing.getLevelId(),
                    remark);
            if (updatedStatusId == null && updatedStatus == null && previousStatus != TicketStatus.ASSIGNED) {
                String assignedId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
                boolean slaAssigned = workflowService.getSlaFlagByStatusId(assignedId);
                String prevId = previousStatusId;
                statusHistoryService.addHistory(id, updatedBy, prevId, assignedId, slaAssigned, remark);
                previousStatus = TicketStatus.ASSIGNED;
                previousStatusId = assignedId;
            }
        }
        // ensure status history is recorded whenever status changes via actions
        if (updatedStatusId == null && updatedStatus != null) {
            updatedStatusId = workflowService.getStatusIdByCode(updatedStatus.name());
        }
        if (updatedStatusId != null && !updatedStatusId.equals(previousStatusId)) {
            boolean slaCurr = workflowService.getSlaFlagByStatusId(updatedStatusId);
            statusHistoryService.addHistory(id, updatedBy, previousStatusId, updatedStatusId, slaCurr, remark);
            if ((updated.getAssignedTo() == null || !assignmentChangeAllowed || updated.getAssignedTo().equals(previousAssignedTo))
                    && remark != null && !remark.isBlank()) {
                String currentAssignee = existing.getAssignedTo();
                if (currentAssignee != null && !currentAssignee.isBlank()) {
                    assignmentHistoryService.addHistory(id, updatedBy, currentAssignee, existing.getLevelId(), remark);
                }
            }
        }

        if ((recommendedSeverityChanged || recommendedByChanged)
                && saved.getRecommendedSeverity() != null
                && updated.getSeverityRecommendedBy() != null) {
            RecommendedSeverityFlow flow = new RecommendedSeverityFlow();
            flow.setTicket(saved);
            flow.setSeverity(saved.getSeverity());
            flow.setRecommendedSeverity(saved.getRecommendedSeverity());
            flow.setSeverityRecommendedBy(saved.getSeverityRecommendedBy());
            flow.setRecommendedSeverityStatus(RecommendedSeverityStatus.PENDING);
            flow.setSeverityApprovedBy(null);
            recommendedSeverityFlowRepository.save(flow);
        }

        if (severityApproved && previousRecommendedSeverity != null) {
            final String approver = updatedBy;
            recommendedSeverityFlowRepository
                    .findTopByTicket_IdAndRecommendedSeverityAndRecommendedSeverityStatusOrderByIdDesc(id, previousRecommendedSeverity, RecommendedSeverityStatus.PENDING)
                    .ifPresent(flow -> {
                        flow.setRecommendedSeverityStatus(RecommendedSeverityStatus.APPROVED);
                        flow.setSeverityApprovedBy(approver);
                        recommendedSeverityFlowRepository.save(flow);
                    });
        }
        return mapWithStatusId(saved);
    }

    public TicketDto addAttachments(String id, List<String> paths) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        List<String> all = new java.util.ArrayList<>();
        if (ticket.getAttachmentPath() != null && !ticket.getAttachmentPath().isEmpty()) {
            all.addAll(java.util.Arrays.asList(ticket.getAttachmentPath().split(",")));
        }
        if (paths != null) {
            all.addAll(paths);
        }
        ticket.setAttachmentPath(String.join(",", all));
        Ticket saved = ticketRepository.save(ticket);
        return mapWithStatusId(saved);
    }

    public TicketDto removeAttachment(String id, String path) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        if (ticket.getAttachmentPath() != null && !ticket.getAttachmentPath().isEmpty()) {
            java.util.List<String> list = new java.util.ArrayList<>(
                    java.util.Arrays.asList(ticket.getAttachmentPath().split(",")));
            list.removeIf(p -> p.equals(path));
            ticket.setAttachmentPath(String.join(",", list));
        }
        uploadedFileRepository.findByTicket_IdAndRelativePath(id, path)
                .ifPresent(uf -> {
                    uf.setIsActive("N");
                    uploadedFileRepository.save(uf);
                });
        Ticket saved = ticketRepository.save(ticket);
        return mapWithStatusId(saved);
    }

    public TicketDto linkToMaster(String id, String masterId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        ticket.setMasterId(masterId);
        Ticket saved = ticketRepository.save(ticket);
        return mapWithStatusId(saved);
    }

    public TicketComment addComment(String id, String comment) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        TicketComment tc = new TicketComment();
        tc.setTicket(ticket);
        tc.setComment(comment);
        tc.setCreatedAt(java.time.LocalDateTime.now());
        return commentRepository.save(tc);
    }

    public List<TicketComment> getComments(String id, Integer count) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        List<TicketComment> list = commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
        if (count == null || count >= list.size()) {
            return list;
        }
        return list.subList(0, count);
    }

    public TicketComment updateComment(String commentId, String comment) {
        TicketComment existing = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketComment", commentId));
        existing.setComment(comment);
        return commentRepository.save(existing);
    }

    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);
    }



    public List<Ticket> getMasterTickets() {
        return ticketRepository.findByIsMasterTrue();
    }
}

