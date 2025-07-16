package com.example.api.repository;

import com.example.api.models.Ticket;
import com.example.api.models.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {
    List<TicketComment> findByTicketOrderByCreatedAtDesc(Ticket ticket);
}
