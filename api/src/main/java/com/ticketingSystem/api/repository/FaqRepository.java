package com.ticketingSystem.api.repository;

import com.ticketingSystem.api.models.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, String> {
}

