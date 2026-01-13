package com.ticketingSystem.api.service;

import com.ticketingSystem.api.dto.TypesenseTicketDto;
import com.ticketingSystem.api.dto.TypesenseTicketPageResponse;
import com.ticketingSystem.api.repository.CategoryRepository;
import com.ticketingSystem.api.repository.PriorityRepository;
import com.ticketingSystem.api.repository.RecommendedSeverityFlowRepository;
import com.ticketingSystem.api.repository.RequesterUserRepository;
import com.ticketingSystem.api.repository.RoleRepository;
import com.ticketingSystem.api.repository.StakeholderRepository;
import com.ticketingSystem.api.repository.StatusHistoryRepository;
import com.ticketingSystem.api.repository.StatusMasterRepository;
import com.ticketingSystem.api.repository.SubCategoryRepository;
import com.ticketingSystem.api.repository.TicketCommentRepository;
import com.ticketingSystem.api.repository.TicketRepository;
import com.ticketingSystem.api.repository.UploadedFileRepository;
import com.ticketingSystem.api.repository.UserRepository;
import com.ticketingSystem.api.typesense.TypesenseClient;
import com.ticketingSystem.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.typesense.model.SearchResult;
import org.typesense.model.SearchResultHit;
import org.typesense.model.SearchRequestParams;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTypesenseTest {

    @Mock
    private TypesenseClient typesenseClient;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RequesterUserRepository requesterUserRepository;
    @Mock
    private TicketCommentRepository commentRepository;
    @Mock
    private AssignmentHistoryService assignmentHistoryService;
    @Mock
    private StatusHistoryService statusHistoryService;
    @Mock
    private StatusHistoryRepository statusHistoryRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private TicketStatusWorkflowService workflowService;
    @Mock
    private StatusMasterRepository statusMasterRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private SubCategoryRepository subCategoryRepository;
    @Mock
    private PriorityRepository priorityRepository;
    @Mock
    private UploadedFileRepository uploadedFileRepository;
    @Mock
    private StakeholderRepository stakeholderRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private TicketSlaService ticketSlaService;
    @Mock
    private RecommendedSeverityFlowRepository recommendedSeverityFlowRepository;
    @Mock
    private TicketIdGenerator ticketIdGenerator;

    private TicketService ticketService;

//    @BeforeEach
//    void setUp() {
//        ticketService = new TicketService(
//                typesenseClient,
//                ticketRepository,
//                userRepository,
//                requesterUserRepository,
//                commentRepository,
//                assignmentHistoryService,
//                statusHistoryService,
//                statusHistoryRepository,
//                notificationService,
//                workflowService,
//                statusMasterRepository,
//                categoryRepository,
//                subCategoryRepository,
//                priorityRepository,
//                uploadedFileRepository,
//                stakeholderRepository,
//                roleRepository,
//                ticketSlaService,
//                recommendedSeverityFlowRepository,
//                ticketIdGenerator
//        );
//    }

    @Test
    void shouldMapTypesenseDocumentsToDtos() throws Exception {
        Map<String, Object> first = Map.of("id", "T-1", "subject", "Subject one");
        Map<String, Object> second = Map.of("id", "T-2");
        when(typesenseClient.exportTicketDocuments()).thenReturn(List.of(first, second, Map.of()));

        List<TypesenseTicketDto> result = ticketService.getAllMasterTicketsFromTypesense();

        assertThat(result)
                .extracting(TypesenseTicketDto::getId)
                .containsExactly("T-1", "T-2");
        assertThat(result)
                .filteredOn(dto -> "T-1".equals(dto.getId()))
                .first()
                .extracting(TypesenseTicketDto::getSubject)
                .isEqualTo("Subject one");
    }

    @Test
    void shouldWrapExceptionsFromTypesenseExport() throws Exception {
        when(typesenseClient.exportTicketDocuments()).thenThrow(new RuntimeException("boom"));

        assertThatThrownBy(ticketService::getAllMasterTicketsFromTypesense)
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to fetch tickets from Typesense")
                .hasCauseInstanceOf(RuntimeException.class);
    }

    @Test
    void shouldReturnPagedResultFromTypesense() throws Exception {
        SearchResult result = mock(SearchResult.class);
        SearchResultHit hit = mock(SearchResultHit.class);
        when(hit.getDocument()).thenReturn(Map.of("id", "ABC", "subject", "Test"));
        when(result.getHits()).thenReturn(List.of(hit));

        SearchRequestParams params = mock(SearchRequestParams.class);
        when(params.getPerPage()).thenReturn(5);
        when(result.getRequestParams()).thenReturn(params);
        when(result.getFound()).thenReturn(12);

        when(typesenseClient.listTickets(1, 10)).thenReturn(result);

        TypesenseTicketPageResponse response = ticketService.getMasterTicketsPageFromTypesense(-3, 0);

        assertThat(response.getPage()).isEqualTo(0);
        assertThat(response.getSize()).isEqualTo(5);
        assertThat(response.getTotalFound()).isEqualTo(12);
        assertThat(response.getTotalPages()).isEqualTo(3);
        assertThat(response.getTickets())
                .extracting(TypesenseTicketDto::getId)
                .containsExactly("ABC");
    }

    @Test
    void shouldWrapExceptionsFromTypesensePagination() throws Exception {
        when(typesenseClient.listTickets(anyInt(), anyInt())).thenThrow(new RuntimeException("down"));

        assertThatThrownBy(() -> ticketService.getMasterTicketsPageFromTypesense(0, 25))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to fetch paginated tickets from Typesense");
    }
}
