package com.example.api.typesense;

import com.example.api.models.Ticket;
import com.example.api.repository.SyncMetadataRepository;
import com.example.api.repository.TicketRepository;
import com.example.api.service.SyncMetadataService;
import com.example.api.service.TicketService;
import org.springframework.cglib.core.Local;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.typesense.api.Client;
import org.typesense.model.SearchParameters;
import org.typesense.model.SearchResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class TypesenseClient {
    private final Client client;
    private final TicketRepository ticketRepository;
    private final SyncMetadataService syncMetadataService;

    public TypesenseClient(Client client, TicketRepository ticketRepository, SyncMetadataService syncMetadataService) {
        this.client = client;
        this.ticketRepository = ticketRepository;
        this.syncMetadataService = syncMetadataService;
    }

    public SearchResult searchTickets(String query) throws Exception {
        createTicketsCollectionsIfNotExists();

        SearchParameters searchParameters = new SearchParameters()
                .q(query)
                .queryBy("subject");

        return client.collections("tickets").documents().search((SearchParameters) searchParameters);
    }

    public void createTicketsCollectionsIfNotExists() throws Exception {
        try {
            client.collections("tickets").retrieve();
        } catch (Exception e) {
            // Create collection
            var schema = new org.typesense.model.CollectionSchema();
            schema.setName("tickets");
            schema.setFields(List.of(
                    new org.typesense.model.Field().name("id").type("string"),
                    new org.typesense.model.Field().name("subject").type("string")
            ));

//            schema.setDefaultSortingField("id");
            client.collections().create(schema);
        }
    }

    @Scheduled(fixedRate = 30000)
    public void syncUpdatedOrNewMasterTickets() throws Exception {
        System.out.println("Syncing only updated or new Master Tickets....");

        LocalDateTime lastSyncedTime = syncMetadataService.getLastSyncedTime();
        List<Ticket> updatedOrNewMasterTickets = ticketRepository.findByLastModifiedAfter(lastSyncedTime);
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
        for(Ticket ticket : tickets) {
            Map<String, Object> doc = Map.of(
                    "id", String.valueOf(ticket.getId()),
                    "subject", ticket.getSubject()
            );
            client.collections("tickets").documents().upsert(doc);

            syncMetadataService.updateLastSyncedTime(LocalDateTime.now());
        }
    }
}
