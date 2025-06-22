package com.example.api.service;

import com.example.api.repository.PriorityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriorityService {
    private final PriorityRepository repository;

    public PriorityService(PriorityRepository repository) {
        this.repository = repository;
    }

    public List<String> getAllValues() {
        return repository.findAll().stream().map(p -> p.getValue()).toList();
    }
}
