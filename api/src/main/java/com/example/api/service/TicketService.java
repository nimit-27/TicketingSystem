package com.example.api.service;

import com.example.api.dto.TicketDto;
import com.example.api.exception.ResourceNotFoundException;
import com.example.api.exception.TicketNotFoundException;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import com.example.api.models.StatusHistory;
import com.example.api.models.Status;
import com.example.api.models.SubCategory;
import com.example.api.models.Severity;
import com.example.api.models.RecommendedSeverityFlow;
import com.example.api.models.User;
import com.example.api.repository.UserRepository;
import com.example.api.repository.TicketCommentRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.repository.StatusHistoryRepository;
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
    private static final String TICKET_CREATED_NOTIFICATION_CODE = "TICKET_CREATED";
    private static final String TICKET_ASSIGNED_NOTIFICATION_CODE = "TICKET_ASSIGNED";
    private static final String TICKET_STATUS_UPDATE_NOTIFICATION_CODE = "TICKET_STATUS_UPDATE";
    private static final String TICKET_UPDATED_NOTIFICATION_CODE = "TICKET_UPDATED";
    private final TypesenseClient typesenseClient;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCommentRepository commentRepository;
    private final AssignmentHistoryService assignmentHistoryService;
    private final StatusHistoryService statusHistoryService;
    private final StatusHistoryRepository statusHistoryRepository;
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

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().isBlank()) {
            dto.setAssignedToName(resolveUserDisplayName(ticket.getAssignedTo()));
        } else {
            dto.setAssignedToName(null);
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
        if (ticket.getUpdatedBy() == null) ticket.setUpdatedBy(ticket.getAssignedBy());

        // If userId exists
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

        if (isAssigned) {
            sendAssignmentNotification(saved, saved.getAssignedTo(), saved.getAssignedBy());
            sendRequestorAssignmentNotification(
                    saved,
                    null,
                    saved.getAssignedTo(),
                    saved.getAssignedBy() != null ? saved.getAssignedBy() : saved.getUpdatedBy()
            );
        }

        if (saved.getReportedDate() != null && saved.getSeverity() != null) {
            List<StatusHistory> historyEntries = statusHistoryRepository.findByTicketOrderByTimestampAsc(saved);
            ticketSlaService.calculateAndSave(saved, historyEntries);
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
        Status previousStatusEntity = existing.getStatus();
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
        boolean assignmentChanged = assignmentChangeAllowed && !Objects.equals(updated.getAssignedTo(), previousAssignedTo);
        if (assignmentChangeAllowed) {
            existing.setAssignedTo(updated.getAssignedTo());
            if (assignmentChanged && existing.getAssignedTo() != null && updatedStatus == null && updatedStatusId == null) {
                existing.setTicketStatus(TicketStatus.ASSIGNED);
                String assignId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
                statusMasterRepository.findById(assignId).ifPresent(existing::setStatus);
            }
//            try {
//                notificationService.sendNotification(
//                        ChannelType.IN_APP,
//                        TICKET_CREATED_NOTIFICATION_CODE,
//                        data,
//                        recipientIdentifier
//                );
//            } catch (Exception e) {
//                e.printStackTrace();
//            }
        }

        boolean isReopenedStatus = updatedStatus == TicketStatus.REOPENED;
        if (!isReopenedStatus && updatedStatusId != null) {
            String updatedStatusCode = workflowService.getStatusCodeById(updatedStatusId);
            if (updatedStatusCode != null) {
                isReopenedStatus = TicketStatus.REOPENED.name().equalsIgnoreCase(updatedStatusCode);
            }
        }
        if (isReopenedStatus) {
            existing.setResolvedAt(null);
            existing.setAssignedTo(null);
            existing.setAssignedToLevel(null);
            existing.setLevelId(null);
        }
        if (updated.getUpdatedBy() != null) existing.setUpdatedBy(updated.getUpdatedBy());
        existing.setLastModified(LocalDateTime.now());
        Ticket saved = ticketRepository.save(existing);
        String updatedBy = updated.getUpdatedBy() != null ? updated.getUpdatedBy() : existing.getUpdatedBy();
        if (assignmentChanged) {
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
// NOTIFY ASSIGNEE
            sendAssignmentNotification(
                    saved,
                    updated.getAssignedTo(),
                    updated.getAssignedBy() != null ? updated.getAssignedBy() : updatedBy
            );
// NOTIFY REQUESTOR
            sendRequestorAssignmentNotification(
                    saved,
                    previousAssignedTo,
                    updated.getAssignedTo(),
                    updated.getAssignedBy() != null ? updated.getAssignedBy() : updatedBy
            );
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

            sendStatusUpdateNotification(
                    saved,
                    previousStatus,
                    previousStatusEntity,
                    previousStatusId,
                    updatedStatus,
                    updatedStatusId,
                    updatedBy
            );
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

    private void sendAssignmentNotification(Ticket ticket, String assignedTo, String assignedBy) {
        if (assignedTo == null || assignedTo.isBlank()) {
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", ticket.getId());

        Optional<User> assignee = findUserByIdOrUsername(assignedTo);
        assignee.ifPresent(user -> {
            if (user.getName() != null && !user.getName().isBlank()) {
                data.put("assigneeName", user.getName());
            } else if (user.getUsername() != null && !user.getUsername().isBlank()) {
                data.put("assigneeName", user.getUsername());
            }
        });
        if (!data.containsKey("assigneeName")) {
            data.put("assigneeName", assignedTo);
        }

        String assignedByValue = assignedBy;
        if (assignedByValue == null || assignedByValue.isBlank()) {
            assignedByValue = ticket.getUpdatedBy();
        }
        if (assignedByValue != null && !assignedByValue.isBlank()) {
            data.put("assignedBy", assignedByValue);
        }

        try {
            String recipient = resolveRecipientIdentifier(
                    assignee.orElse(null),
                    assignedTo
            );
            notificationService.sendNotification(
                    ChannelType.IN_APP,
                    TICKET_ASSIGNED_NOTIFICATION_CODE,
                    data,
                    recipient
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendRequestorAssignmentNotification(Ticket ticket,
                                                     String previousAssignee,
                                                     String newAssignee,
                                                     String actor) {
        if (ticket == null) {
            return;
        }

        User requestor = ticket.getUser();
        if (requestor == null && ticket.getUserId() != null && !ticket.getUserId().isBlank()) {
            requestor = userRepository.findById(ticket.getUserId()).orElse(null);
            if (requestor != null) {
                ticket.setUser(requestor);
            }
        }

        String recipientIdentifier;
        try {
            recipientIdentifier = resolveRecipientIdentifier(
                    ticket.getUser(),
                    ticket.getUserId(),
                    ticket.getRequestorEmailId(),
                    ticket.getRequestorName()
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", ticket.getId());
        data.put("ticketNumber", ticket.getId());
        data.put("updateType", "ASSIGNMENT_UPDATED");

        String recipientName = resolveUserName(ticket.getUser(), ticket.getRequestorName(), ticket.getRequestorEmailId());
        if (recipientName != null && !recipientName.isBlank()) {
            data.put("recipientName", recipientName);
        }

        if (actor != null && !actor.isBlank()) {
            data.put("actorName", resolveUserDisplayName(actor));
        }

        String previousAssigneeDisplay = previousAssignee != null && !previousAssignee.isBlank()
                ? resolveUserDisplayName(previousAssignee)
                : null;
        String newAssigneeDisplay = newAssignee != null && !newAssignee.isBlank()
                ? resolveUserDisplayName(newAssignee)
                : null;

        if (previousAssigneeDisplay != null) {
            data.put("previousAssignee", previousAssigneeDisplay);
        }
        if (newAssigneeDisplay != null) {
            data.put("currentAssignee", newAssigneeDisplay);
        }

        String updateMessage = buildAssignmentUpdateMessage(previousAssigneeDisplay, newAssigneeDisplay);
        if (updateMessage != null) {
            data.put("updateMessage", updateMessage);
        }

        try {
            notificationService.sendNotification(
                    ChannelType.IN_APP,
                    TICKET_UPDATED_NOTIFICATION_CODE,
                    data,
                    recipientIdentifier
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendStatusUpdateNotification(Ticket ticket,
                                              TicketStatus previousStatus,
                                              Status previousStatusEntity,
                                              String previousStatusId,
                                              TicketStatus updatedStatus,
                                              String updatedStatusId,
                                              String updatedBy) {
        if (ticket == null) {
            return;
        }

        User requestor = ticket.getUser();
        if (requestor == null && ticket.getUserId() != null && !ticket.getUserId().isBlank()) {
            requestor = userRepository.findById(ticket.getUserId()).orElse(null);
            if (requestor != null) {
                ticket.setUser(requestor);
            }
        }

        String recipientIdentifier;
        try {
            recipientIdentifier = resolveRecipientIdentifier(
                    ticket.getUser(),
                    ticket.getUserId(),
                    ticket.getRequestorEmailId(),
                    ticket.getRequestorName()
            );
        } catch (Exception ex) {
            ex.printStackTrace();
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("ticketId", ticket.getId());
        data.put("ticketNumber", ticket.getId());
        data.put("oldStatus", resolveStatusDisplay(previousStatus, previousStatusEntity, previousStatusId));
        data.put("newStatus", resolveStatusDisplay(updatedStatus != null ? updatedStatus : ticket.getTicketStatus(), ticket.getStatus(), updatedStatusId));

        String recipientName = resolveUserName(ticket.getUser(), ticket.getRequestorName(), ticket.getRequestorEmailId());
        if (recipientName != null && !recipientName.isBlank()) {
            data.put("recipientName", recipientName);
        }

        if (updatedBy != null && !updatedBy.isBlank()) {
            data.put("actorName", resolveUserDisplayName(updatedBy));
        }

        try {
            notificationService.sendNotification(
                    ChannelType.IN_APP,
                    TICKET_STATUS_UPDATE_NOTIFICATION_CODE,
                    data,
                    recipientIdentifier
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String buildAssignmentUpdateMessage(String previousAssignee, String newAssignee) {
        if (newAssignee != null && !newAssignee.isBlank()) {
            if (previousAssignee != null && !previousAssignee.isBlank()) {
                if (previousAssignee.equals(newAssignee)) {
                    return null;
                }
                return String.format("Ticket reassigned from %s to %s", previousAssignee, newAssignee);
            }
            return String.format("Ticket assigned to %s", newAssignee);
        }
        if (previousAssignee != null && !previousAssignee.isBlank()) {
            return String.format("Ticket unassigned from %s", previousAssignee);
        }
        return null;
    }

    private String resolveStatusDisplay(TicketStatus statusEnum, Status statusEntity, String statusId) {
        String display = extractStatusDisplayFromEntity(statusEntity);
        if (display != null) {
            return display;
        }

        if (statusEnum != null) {
            return humanize(statusEnum.name());
        }

        if (statusId != null && !statusId.isBlank()) {
            return statusMasterRepository.findById(statusId)
                    .map(this::extractStatusDisplayFromEntity)
                    .orElseGet(() -> {
                        String code = workflowService.getStatusCodeById(statusId);
                        if (code != null && !code.isBlank()) {
                            return humanize(code);
                        }
                        return statusId;
                    });
        }

        return "N/A";
    }

    private String extractStatusDisplayFromEntity(Status status) {
        if (status == null) {
            return null;
        }
        if (status.getLabel() != null && !status.getLabel().isBlank()) {
            return status.getLabel();
        }
        if (status.getStatusName() != null && !status.getStatusName().isBlank()) {
            return status.getStatusName();
        }
        if (status.getStatusCode() != null && !status.getStatusCode().isBlank()) {
            return humanize(status.getStatusCode());
        }
        return null;
    }

    private String humanize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        String lower = value.replace('_', ' ').toLowerCase(java.util.Locale.ROOT);
        String[] parts = lower.split(" ");
        StringBuilder builder = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
        }
        return builder.toString();
    }

    private String resolveUserName(User user, String... fallbacks) {
        if (user != null) {
            String resolved = firstNonBlank(user.getName(), user.getUsername(), user.getUserId());
            if (resolved != null) {
                return resolved;
            }
        }
        return firstNonBlank(fallbacks);
    }

    private String resolveUserDisplayName(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return "System";
        }
        return findUserByIdOrUsername(identifier)
                .map(user -> firstNonBlank(user.getName(), user.getUsername(), user.getUserId()))
                .orElse(identifier);
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private Optional<User> findUserByIdOrUsername(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        Optional<User> byId = userRepository.findById(identifier);
        if (byId.isPresent()) {
            return byId;
        }
        return userRepository.findByUsername(identifier);
    }

    private String resolveRecipientIdentifier(User user, String... fallbackIdentifiers) {
        if (user != null) {
            if (user.getUserId() != null && !user.getUserId().isBlank()) {
                return user.getUserId();
            }
            if (user.getUsername() != null && !user.getUsername().isBlank()) {
                return user.getUsername();
            }
            if (user.getEmailId() != null && !user.getEmailId().isBlank()) {
                return user.getEmailId();
            }
        }

        if (fallbackIdentifiers != null) {
            for (String identifier : fallbackIdentifiers) {
                if (identifier != null && !identifier.isBlank()) {
                    return identifier;
                }
            }
        }

        throw new IllegalStateException("Unable to resolve recipient identifier for in-app notification");
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

