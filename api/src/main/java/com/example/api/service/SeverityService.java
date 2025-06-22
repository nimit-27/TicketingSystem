package com.example.api.service;

import com.example.api.repository.SeverityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeverityService {
    private final SeverityRepository repository;

    public SeverityService(SeverityRepository repository) {
        this.repository = repository;
    }

    public List<String> getAllValues() {
        return repository.findAll().stream().map(s -> s.getValue()).toList();
    }
}
