package com.example.api.typesense;

import com.example.api.models.Ticket;
import com.example.api.repository.TicketRepository;
import com.example.api.service.SyncMetadataService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.typesense.api.Client;
import org.typesense.model.SearchParameters;
import org.typesense.model.SearchResult;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class TypesenseClient {
    private static final String TICKETS_COLLECTION = "tickets";

    private final Client client;
    private final TicketRepository ticketRepository;
    private final SyncMetadataService syncMetadataService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TypesenseClient(Client client, TicketRepository ticketRepository, SyncMetadataService syncMetadataService) {
        this.client = client;
        this.ticketRepository = ticketRepository;
        this.syncMetadataService = syncMetadataService;
    }

    public SearchResult searchTickets(String query) throws Exception {
        return searchTickets(query, null, null);
    }

    public SearchResult searchTickets(String query, Integer page, Integer perPage) throws Exception {
        createTicketsCollectionsIfNotExists();

        SearchParameters searchParameters = new SearchParameters()
                .q(query)
                .queryBy("subject");

        if (page != null) {
            searchParameters.page(page);
        }
        if (perPage != null) {
            searchParameters.perPage(perPage);
        }

        return client.collections(TICKETS_COLLECTION).documents().search(searchParameters);
    }

    public SearchResult listTickets(int page, int perPage) throws Exception {
        return searchTickets("*", page, perPage);
    }

    public List<Map<String, Object>> exportTicketDocuments() throws Exception {
        createTicketsCollectionsIfNotExists();
        String exported = client.collections(TICKETS_COLLECTION).documents().export();
        if (exported == null || exported.isBlank()) {
            return List.of();
        }
        String[] lines = exported.split("\\r?\\n");
        List<Map<String, Object>> documents = new ArrayList<>();
        for (String line : lines) {
            if (line == null || line.isBlank()) {
                continue;
            }
            Map<String, Object> document = objectMapper.readValue(line, new TypeReference<Map<String, Object>>() {
            });
            documents.add(document);
        }
        return documents;
    }

    public void createTicketsCollectionsIfNotExists() throws Exception {
        try {
            client.collections(TICKETS_COLLECTION).retrieve();
        } catch (Exception e) {
            var schema = new org.typesense.model.CollectionSchema();
            schema.setName(TICKETS_COLLECTION);
            schema.setFields(List.of(
                    new org.typesense.model.Field().name("id").type("string"),
                    new org.typesense.model.Field().name("subject").type("string")
            ));

            client.collections().create(schema);
        }
    }

    @Scheduled(fixedRate = 30000)
    public void syncUpdatedOrNewMasterTickets() throws Exception {
        System.out.println("Syncing only updated or new Master Tickets....");

        LocalDateTime lastSyncedTime = syncMetadataService.getLastSyncedTime();
        List<Ticket> updatedOrNewMasterTickets;

        if (lastSyncedTime == null) {
            updatedOrNewMasterTickets = ticketRepository.findAll();
        } else {
            updatedOrNewMasterTickets = ticketRepository.findByLastModifiedAfter(lastSyncedTime);
        }
        syncTicketsToTypesense(updatedOrNewMasterTickets);

        System.out.println("✅ Updated or New Master tickets synced to Typesense.");
    }

    @Scheduled(fixedRate = 60000)
    public void syncMasterTickets() throws Exception {
        System.out.println("Syncing all Master Tickets Typesense....");

        List<Ticket> masterTickets = ticketRepository.findByIsMasterTrue();
        syncTicketsToTypesense(masterTickets);

        System.out.println("✅ All Master tickets synced to Typesense.");
    }

    private void syncTicketsToTypesense(List<Ticket> tickets) throws Exception {
        for (Ticket ticket : tickets) {
            if (ticket.getMasterId() != null && !ticket.getMasterId().isBlank()) {
                continue;
            }
            Map<String, Object> doc = Map.of(
                    "id", String.valueOf(ticket.getId()),
                    "subject", ticket.getSubject()
            );
            client.collections(TICKETS_COLLECTION).documents().upsert(doc);

            syncMetadataService.updateLastSyncedTime(LocalDateTime.now());
        }
    }
}
