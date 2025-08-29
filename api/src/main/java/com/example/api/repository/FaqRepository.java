package com.example.api.repository;

import com.example.api.models.Faq;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, String> {
}

