package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TicketDto;
import com.ticketingSystem.api.dto.TicketSearchResultDto;
import com.ticketingSystem.api.dto.TypesenseTicketDto;
import com.ticketingSystem.api.dto.TypesenseTicketPageResponse;
import com.ticketingSystem.api.exception.InvalidRequestException;
import com.ticketingSystem.api.exception.ResourceNotFoundException;
import com.ticketingSystem.api.exception.TicketNotFoundException;
import com.ticketingSystem.api.mapper.DtoMapper;
import com.ticketingSystem.api.models.*;
import com.ticketingSystem.api.repository.TicketCommentRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.CategoryRepository;
import com.ticketingSystem.api.repository.SubCategoryRepository;
import com.ticketingSystem.api.repository.PriorityRepository;
import com.ticketingSystem.api.repository.UploadedFileRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.UserRepository;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.RecommendedSeverityFlowRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.enums.Mode;
import com.ticketingSystem.api.enums.TicketStatus;
import com.ticketingSystem.api.enums.FeedbackStatus;
import com.ticketingSystem.api.enums.RecommendedSeverityStatus;
import com.ticketingSystem.api.typesense.TypesenseClient;
import com.ticketingSystem.notification.enums.ChannelType;
import com.ticketingSystem.notification.service.NotificationService;
import com.ticketingSystem.api.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.typesense.model.SearchResult;
import org.typesense.model.SearchResultHit;
import org.typesense.model.SearchResultRequestParams;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class TicketService {
    private static final String TICKET_CREATED_NOTIFICATION_CODE = "TICKET_CREATED";
    private static final String TICKET_ASSIGNED_NOTIFICATION_CODE = "TICKET_ASSIGNED";
    private static final String TICKET_STATUS_UPDATE_NOTIFICATION_CODE = "TICKET_STATUS_UPDATE";
    private static final String TICKET_UPDATED_NOTIFICATION_CODE = "TICKET_UPDATED";
    private static final String IT_MANAGER_ROLE_NAME = "IT Manager";
    private static final String TEAM_LEAD_ROLE_NAME = "Team Lead";
    private static final String RECOMMENDED_SEVERITY_APPROVED_UPDATE_TYPE = "RECOMMENDED_SEVERITY_APPROVED";
    private final TypesenseClient typesenseClient;
    @Value("${app.search.engine:default}")
    private String searchEngine;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final RequesterUserRepository requesterUserRepository;
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
    private final StakeholderRepository stakeholderRepository;
    private final RoleRepository roleRepository;
    private final TicketSlaService ticketSlaService;
    private final RecommendedSeverityFlowRepository recommendedSeverityFlowRepository;
    private final TicketIdGenerator ticketIdGenerator;

    public List<Ticket> getTickets() {
        System.out.println("Getting tickets...");
        return ticketRepository.findAll();
    }

    public TicketDto mapWithStatusId(Ticket ticket) {
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
            List<com.ticketingSystem.api.models.UploadedFile> files = uploadedFileRepository.findByTicket_IdAndIsActive(ticket.getId(), "Y");
            List<String> paths = files.stream().map(UploadedFile::getRelativePath).toList();
            dto.setAttachmentPaths(paths);
        } else {
            dto.setAttachmentPaths(Collections.emptyList());
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

        if (ticket.getStakeholder() != null && !ticket.getStakeholder().isBlank()) {
            dto.setStakeholderId(ticket.getStakeholder());
            dto.setStakeholder(resolveStakeholderName(ticket.getStakeholder()));
        } else {
            dto.setStakeholderId(null);
            dto.setStakeholder(null);
        }

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().isBlank()) {
            dto.setAssignedToName(resolveUserDisplayName(ticket.getAssignedTo()));
        } else {
            dto.setAssignedToName(null);
        }
        return dto;
    }

    private String resolveStakeholderName(String stakeholderId) {
        if (stakeholderId == null || stakeholderId.isBlank()) {
            return null;
        }
        try {
            Integer id = Integer.valueOf(stakeholderId);
            return stakeholderRepository.findById(id)
                    .map(Stakeholder::getDescription)
                    .orElse(stakeholderId);
        } catch (NumberFormatException ex) {
            return stakeholderId;
        }
    }

    private String firstNonBlank(String primary, String fallback) {
        return (primary != null && !primary.isBlank()) ? primary : fallback;
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

        if(ticket.isMaster()) {
            ticket.setMasterId(null);
            ticket.setMaster(true);
        }
        if (ticket.getUpdatedBy() == null) ticket.setUpdatedBy(ticket.getAssignedBy());

        if (ticket.getMode() == null && ticket.getModeId() != null) {
            ticket.setMode(Mode.fromId(ticket.getModeId()));
        }

//      Ticket Id Generator
        if (ticket.getId() == null || ticket.getId().isBlank()) {
            ticket.setId(ticketIdGenerator.generateTicketId(ticket.getMode()));
        }

        // If userId exists
        if (ticket.getUserId() != null && !ticket.getUserId().isEmpty()) {
            userRepository.findById(ticket.getUserId()).ifPresentOrElse(user -> {
                ticket.setUser(user);
                if (ticket.getRequestorName() == null || ticket.getRequestorName().isBlank()) {
                    ticket.setRequestorName(user.getUsername());
                }
                if (ticket.getRequestorEmailId() == null) {
                    ticket.setRequestorEmailId(user.getEmailId());
                }
                if (ticket.getRequestorMobileNo() == null) {
                    ticket.setRequestorMobileNo(user.getMobileNo());
                }
                if (ticket.getOffice() == null) {
                    ticket.setOffice(user.getOffice());
                }
            }, () -> requesterUserRepository.findById(ticket.getUserId()).ifPresent(requester -> {
                if (ticket.getRequestorName() == null || ticket.getRequestorName().isBlank()) {
                    ticket.setRequestorName(requester.getName());
                }
                if (ticket.getRequestorEmailId() == null) {
                    ticket.setRequestorEmailId(requester.getEmailId());
                }
                if (ticket.getRequestorMobileNo() == null) {
                    ticket.setRequestorMobileNo(requester.getMobileNo());
                }
                ticket.setOffice(firstNonBlank(ticket.getOffice(), requester.getOffice()));
                ticket.setOfficeCode(firstNonBlank(ticket.getOfficeCode(), requester.getOfficeCode()));
                ticket.setRegionCode(firstNonBlank(ticket.getRegionCode(), requester.getRegionCode()));
                ticket.setZoneCode(firstNonBlank(ticket.getZoneCode(), requester.getZoneCode()));
                ticket.setDistrictCode(firstNonBlank(ticket.getDistrictCode(), requester.getDistrictCode()));
            }));
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

        List<StatusHistory> histories = new ArrayList<>();

        histories.add(statusHistoryService.addHistory(saved.getId(), saved.getUpdatedBy(), null, openId, sla, null));

        if (isAssigned) {
            assignmentHistoryService.addHistory(saved.getId(), saved.getAssignedBy(), saved.getAssignedTo(), saved.getLevelId(), null);

            String assignedId = workflowService.getStatusIdByCode(TicketStatus.ASSIGNED.name());
            boolean slaAssigned = workflowService.getSlaFlagByStatusId(assignedId);

            histories.add(statusHistoryService.addHistory(saved.getId(), saved.getUpdatedBy(), openId, assignedId, slaAssigned, null));
        }
        ticketSlaService.calculateAndSaveByCalendar(saved, histories);

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
            ticketSlaService.calculateAndSaveByCalendar(saved, historyEntries);
        }

        return mapWithStatusId(saved);
    }

    public List<TicketSearchResultDto> search(String query) throws Exception {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        if ("typesense".equalsIgnoreCase(searchEngine)) {
            SearchResult result = typesenseClient.searchTickets(query);
            List<SearchResultHit> hits = result.getHits() != null ? result.getHits() : Collections.emptyList();
            return hits.stream()
                    .map(SearchResultHit::getDocument)
                    .map(this::mapDocumentToTypesenseTicket)
                    .filter(Objects::nonNull)
                    .map(dto -> new TicketSearchResultDto(dto.getId(), dto.getSubject()))
                    .toList();
        }

        List<Ticket> tickets = ticketRepository.searchMasterTicketsBySubjectOrId(
                query,
                PageRequest.of(0, 10)
        );
        return tickets.stream()
                .map(ticket -> new TicketSearchResultDto(ticket.getId(), ticket.getSubject()))
                .toList();
    }

    public List<TypesenseTicketDto> getAllMasterTicketsFromTypesense() {
        try {
            List<Map<String, Object>> documents = typesenseClient.exportTicketDocuments();
            return documents.stream()
                    .map(this::mapDocumentToTypesenseTicket)
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch tickets from Typesense", e);
        }
    }

    public TypesenseTicketPageResponse getMasterTicketsPageFromTypesense(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = size > 0 ? size : 10;
        try {
            SearchResult result = typesenseClient.listTickets(safePage + 1, safeSize);
            List<SearchResultHit> hits = result.getHits() != null ? result.getHits() : Collections.emptyList();
            List<TypesenseTicketDto> tickets = hits.stream()
                    .map(SearchResultHit::getDocument)
                    .map(this::mapDocumentToTypesenseTicket)
                    .filter(Objects::nonNull)
                    .toList();

            SearchResultRequestParams params = result.getRequestParams();
            int resolvedSize = params != null && params.getPerPage() != null && params.getPerPage() > 0
                    ? params.getPerPage()
                    : safeSize;

            long totalFound = result.getFound() != null ? result.getFound() : 0;
            int totalPages = resolvedSize > 0 ? (int) Math.ceil((double) totalFound / resolvedSize) : 0;

            return new TypesenseTicketPageResponse(
                    tickets,
                    safePage,
                    resolvedSize,
                    totalFound,
                    totalPages
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch paginated tickets from Typesense", e);
        }
    }

    private TypesenseTicketDto mapDocumentToTypesenseTicket(Map<String, Object> document) {
        if (document == null || document.isEmpty()) {
            return null;
        }
        Object idObj = document.get("id");
        Object subjectObj = document.get("subject");
        if (idObj == null) {
            return null;
        }
        String id = String.valueOf(idObj);
        String subject = subjectObj != null ? String.valueOf(subjectObj) : null;
        return new TypesenseTicketDto(id, subject);
    }

    public Page<TicketDto> searchTickets(String query, String statusId, Boolean master,
                                         String assignedTo, String assignedBy, String requestorId, String levelId, String priority,
                                         String severity, String createdBy, String category, String subCategory, String fromDate, String toDate, Pageable pageable) {
        ArrayList<String> statusIds = (statusId == null || statusId.isBlank())
                ? null
                : Arrays.stream(statusId.split(","))
                    .map(String::trim)
                    .collect(Collectors.toCollection(ArrayList::new));
        List<String> severityFilters = (severity == null || severity.isBlank())
                ? null
                : Arrays.stream(severity.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        LocalDateTime from = DateTimeUtils.parseToLocalDateTime(fromDate);
        LocalDateTime to = DateTimeUtils.parseToLocalDateTime(toDate);
        Page<Ticket> page = ticketRepository.searchTickets(query, statusIds, master, assignedTo, assignedBy, requestorId, levelId, priority, severityFilters, createdBy, category, subCategory, from, to, pageable);
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
                && !Objects.equals(updated.getRecommendedSeverity(), previousRecommendedSeverity);
        boolean recommendedByChanged = updated.getSeverityRecommendedBy() != null
                && !Objects.equals(updated.getSeverityRecommendedBy(), previousRecommendedBy);
        boolean severityApproved = updated.getSeverity() != null
                && previousRecommendedSeverity != null
                && updated.getSeverity().equals(previousRecommendedSeverity)
                && !Objects.equals(previousSeverity, updated.getSeverity());

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
        if(updatedStatus == TicketStatus.RESOLVED) {
            if (existing.getResolvedAt() == null) {
                existing.setResolvedAt(LocalDateTime.now());
            }
        }
        if (updatedStatus == TicketStatus.CLOSED) {
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
        if (updated.getOffice() != null) existing.setOffice(updated.getOffice());
        if (updated.getOfficeCode() != null) existing.setOfficeCode(updated.getOfficeCode());
        if (updated.getRegionCode() != null) existing.setRegionCode(updated.getRegionCode());
        if (updated.getZoneCode() != null) existing.setZoneCode(updated.getZoneCode());
        if (updated.getDistrictCode() != null) existing.setDistrictCode(updated.getDistrictCode());
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
            final Optional<User> approverUserOptional = approver != null
                    ? findUserByIdOrUsername(approver)
                    : Optional.empty();
            final Optional<String> itManagerRoleIdOptional = findRoleIdByName(IT_MANAGER_ROLE_NAME);
            final Optional<String> teamLeadRoleIdOptional = findRoleIdByName(TEAM_LEAD_ROLE_NAME);
            recommendedSeverityFlowRepository
                    .findTopByTicket_IdAndRecommendedSeverityAndRecommendedSeverityStatusOrderByIdDesc(id, previousRecommendedSeverity, RecommendedSeverityStatus.PENDING)
                    .ifPresent(flow -> {
                        flow.setRecommendedSeverityStatus(RecommendedSeverityStatus.APPROVED);
                        flow.setSeverityApprovedBy(approver);
                        recommendedSeverityFlowRepository.save(flow);

                        if (approverUserOptional.isPresent()
                                && itManagerRoleIdOptional.isPresent()
                                && userHasRole(approverUserOptional.get(), itManagerRoleIdOptional.get())
                                && teamLeadRoleIdOptional.isPresent()) {
                            notifyRoleMembersOfRecommendedSeverityApproval(
                                    saved,
                                    previousRecommendedSeverity,
                                    approver,
                                    teamLeadRoleIdOptional.get()
                            );
                        }
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
            data.put("requestorName", recipientName);
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

        TicketStatus effectiveStatus = updatedStatus != null ? updatedStatus : ticket.getTicketStatus();
        sendRoleStatusUpdateNotifications(ticket, effectiveStatus, data);
    }

    private void sendRoleStatusUpdateNotifications(Ticket ticket,
                                                   TicketStatus status,
                                                   Map<String, Object> existingData) {
        if (ticket == null || status != TicketStatus.AWAITING_ESCALATION_APPROVAL) {
            return;
        }

        findRoleIdByName(IT_MANAGER_ROLE_NAME)
                .ifPresent(roleId -> notifyRoleMembersOfStatusUpdate(ticket, roleId, existingData));
    }

    private void notifyRoleMembersOfStatusUpdate(Ticket ticket,
                                                 String roleId,
                                                 Map<String, Object> existingData) {
        if (roleId == null || roleId.isBlank()) {
            return;
        }

        List<User> roleMembers = userRepository.findAll()
                .stream()
                .filter(user -> userHasRole(user, roleId))
                .toList();

        if (roleMembers.isEmpty()) {
            return;
        }

        Map<String, Object> baseData = new HashMap<>(existingData != null ? existingData : Map.of());
        baseData.remove("recipientName");

        for (User member : roleMembers) {
            try {
                String recipientIdentifier = resolveRecipientIdentifier(member);
                Map<String, Object> notificationData = new HashMap<>(baseData);
                String memberName = resolveUserName(member);
                if (memberName != null && !memberName.isBlank()) {
                    notificationData.put("recipientName", memberName);
                }
                notificationService.sendNotification(
                        ChannelType.IN_APP,
                        TICKET_STATUS_UPDATE_NOTIFICATION_CODE,
                        notificationData,
                        recipientIdentifier
                );
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    private void notifyRoleMembersOfRecommendedSeverityApproval(Ticket ticket,
                                                                 String approvedSeverity,
                                                                 String approverIdentifier,
                                                                 String roleId) {
        if (ticket == null || roleId == null || roleId.isBlank()) {
            return;
        }

        List<User> roleMembers = userRepository.findAll()
                .stream()
                .filter(user -> userHasRole(user, roleId))
                .toList();

        if (roleMembers.isEmpty()) {
            return;
        }

        String severityDisplay = firstNonBlank(approvedSeverity, ticket.getSeverity());
        String actorDisplayName = resolveUserDisplayName(approverIdentifier);
        String updateMessage = (severityDisplay != null && !severityDisplay.isBlank())
                ? String.format("Recommended severity %s approved by %s", severityDisplay, actorDisplayName)
                : String.format("Recommended severity approved by %s", actorDisplayName);

        for (User member : roleMembers) {
            try {
                String recipientIdentifier = resolveRecipientIdentifier(member);
                Map<String, Object> notificationData = new HashMap<>();
                notificationData.put("ticketId", ticket.getId());
                notificationData.put("ticketNumber", ticket.getId());
                notificationData.put("updateType", RECOMMENDED_SEVERITY_APPROVED_UPDATE_TYPE);
                notificationData.put("updateMessage", updateMessage);
                notificationData.put("actorName", actorDisplayName);
                if (severityDisplay != null && !severityDisplay.isBlank()) {
                    notificationData.put("recommendedSeverity", severityDisplay);
                }

                String memberName = resolveUserName(member);
                if (memberName != null && !memberName.isBlank()) {
                    notificationData.put("recipientName", memberName);
                }

                notificationService.sendNotification(
                        ChannelType.IN_APP,
                        TICKET_UPDATED_NOTIFICATION_CODE,
                        notificationData,
                        recipientIdentifier
                );
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    private Optional<String> findRoleIdByName(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return Optional.empty();
        }

        return roleRepository.findByRoleIgnoreCaseAndIsDeletedFalse(roleName)
                .map(Role::getRoleId)
                .map(String::valueOf);
    }

    private boolean userHasRole(User user, String roleId) {
        if (user == null || roleId == null || roleId.isBlank()) {
            return false;
        }

        String roles = user.getRoles();
        if (roles == null || roles.isBlank()) {
            return false;
        }

        String trimmedRoleId = roleId.trim();
        return Arrays.stream(roles.split("\\|"))
                .map(String::trim)
                .anyMatch(trimmedRoleId::equals);
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
        String lower = value.replace('_', ' ').toLowerCase(Locale.ROOT);
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

    private void sendRequestorMasterLinkNotification(Ticket ticket,
                                                     Ticket masterTicket,
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
        data.put("updateType", "MASTER_LINKED");

        String recipientName = resolveUserName(ticket.getUser(), ticket.getRequestorName(), ticket.getRequestorEmailId());
        if (recipientName != null && !recipientName.isBlank()) {
            data.put("recipientName", recipientName);
        }

        if (masterTicket != null) {
            data.put("masterTicketId", masterTicket.getId());
            if (masterTicket.getSubject() != null && !masterTicket.getSubject().isBlank()) {
                data.put("masterTicketSubject", masterTicket.getSubject());
            }
        }

        if (updatedBy != null && !updatedBy.isBlank()) {
            data.put("actorName", resolveUserDisplayName(updatedBy));
        }

        String masterDisplay = masterTicket != null
                ? firstNonBlank(masterTicket.getSubject(), masterTicket.getId())
                : null;
        String actorDisplay = updatedBy != null && !updatedBy.isBlank()
                ? resolveUserDisplayName(updatedBy)
                : null;

        String updateMessage;
        if (masterDisplay != null && actorDisplay != null) {
            updateMessage = String.format("Ticket linked to master %s by %s", masterDisplay, actorDisplay);
        } else if (masterDisplay != null) {
            updateMessage = String.format("Ticket linked to master %s", masterDisplay);
        } else if (actorDisplay != null) {
            updateMessage = String.format("Ticket linked to a master ticket by %s", actorDisplay);
        } else {
            updateMessage = "Ticket linked to a master ticket";
        }
        data.put("updateMessage", updateMessage);

        try {
            notificationService.sendNotification(
                    ChannelType.IN_APP,
                    TICKET_UPDATED_NOTIFICATION_CODE,
                    data,
                    recipientIdentifier
            );
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public TicketDto addAttachments(String id, List<String> paths) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        if (paths != null && !paths.isEmpty()) {
            for (String relativePath : paths) {
                uploadedFileRepository.findByTicket_IdAndRelativePath(id, relativePath)
                        .ifPresent(uf -> {
                            if (!"Y".equalsIgnoreCase(uf.getIsActive())) {
                                uf.setIsActive("Y");
                                uploadedFileRepository.save(uf);
                            }
                        });
            }
            ticket.setLastModified(LocalDateTime.now());
            ticket = ticketRepository.save(ticket);
        }
        return mapWithStatusId(ticket);
    }

    public TicketDto removeAttachment(String id, String path) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        boolean attachmentUpdated = uploadedFileRepository.findByTicket_IdAndRelativePath(id, path)
                .map(uf -> {
                    if (!"N".equalsIgnoreCase(uf.getIsActive())) {
                        uf.setIsActive("N");
                        uploadedFileRepository.save(uf);
                    }
                    return true;
                })
                .orElse(false);
        if (attachmentUpdated) {
            ticket.setLastModified(LocalDateTime.now());
            ticket = ticketRepository.save(ticket);
        }
        return mapWithStatusId(ticket);
    }

    public TicketDto linkToMaster(String id, String masterId, String updatedBy) {
        if (masterId == null || masterId.isBlank()) {
            throw new InvalidRequestException("Master ticket id is required.");
        }
        if (Objects.equals(id, masterId)) {
            throw new InvalidRequestException("Ticket cannot be linked to itself as master.");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));
        if (ticket.isMaster()) {
            throw new InvalidRequestException("Master ticket cannot be linked to another master ticket.");
        }

        Ticket masterTicket = ticketRepository.findById(masterId)
                .orElseThrow(() -> new TicketNotFoundException(masterId));
        if (!masterTicket.isMaster()) {
            throw new InvalidRequestException(String.format("Ticket %s is not marked as a master ticket.", masterId));
        }

        if (Objects.equals(ticket.getMasterId(), masterId)) {
            return mapWithStatusId(ticket);
        }

        ticket.setMasterId(masterId);
        if (updatedBy != null && !updatedBy.isBlank()) {
            ticket.setUpdatedBy(updatedBy);
        }
        ticket.setLastModified(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        addLinkingHistory(saved, updatedBy, String.format("Linked to master ticket %s", masterId));
        sendRequestorMasterLinkNotification(saved, masterTicket, updatedBy);
        return mapWithStatusId(saved);
    }

    public TicketDto unlinkFromMaster(String id, String updatedBy) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        String existingMasterId = ticket.getMasterId();
        if (existingMasterId == null || existingMasterId.isBlank()) {
            throw new InvalidRequestException("Ticket is not linked to any master ticket.");
        }

        ticket.setMasterId("");
        if (updatedBy != null && !updatedBy.isBlank()) {
            ticket.setUpdatedBy(updatedBy);
        }
        ticket.setLastModified(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        addLinkingHistory(saved, updatedBy, String.format("Unlinked from master ticket %s", existingMasterId));
        return mapWithStatusId(saved);
    }

    public TicketDto markAsMaster(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException(id));

        ticket.setMaster(true);
        ticket.setMasterId(null);
        ticket.setLastModified(LocalDateTime.now());

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



    public List<TicketDto> getChildTickets(String masterId) {
        Ticket masterTicket = ticketRepository.findById(masterId)
                .orElseThrow(() -> new TicketNotFoundException(masterId));
        if (!masterTicket.isMaster()) {
            throw new InvalidRequestException(String.format("Ticket %s is not marked as a master ticket.", masterId));
        }

        return ticketRepository.findByMasterId(masterId)
                .stream()
                .map(this::mapWithStatusId)
                .collect(Collectors.toList());
    }

    private void addLinkingHistory(Ticket ticket, String updatedBy, String remark) {
        String actor = updatedBy != null && !updatedBy.isBlank()
                ? updatedBy
                : ticket.getUpdatedBy();

        assignmentHistoryService.addHistory(
                ticket.getId(),
                actor,
                ticket.getAssignedTo(),
                ticket.getLevelId(),
                remark
        );

        String statusId = resolveCurrentStatusId(ticket);
        Boolean slaFlag = statusId != null ? workflowService.getSlaFlagByStatusId(statusId) : null;

        statusHistoryService.addHistory(
                ticket.getId(),
                actor,
                statusId,
                statusId,
                slaFlag,
                remark
        );
    }

    private String resolveCurrentStatusId(Ticket ticket) {
        if (ticket.getStatus() != null) {
            return ticket.getStatus().getStatusId();
        }
        if (ticket.getTicketStatus() != null) {
            return workflowService.getStatusIdByCode(ticket.getTicketStatus().name());
        }
        return null;
    }

    public List<Ticket> getMasterTickets() {
        return ticketRepository.findByIsMasterTrue();
    }
}

