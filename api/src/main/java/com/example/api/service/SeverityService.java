package com.example.api.service;

import com.example.api.models.Severity;
import com.example.api.repository.SeverityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeverityService {
    private final SeverityRepository repository;

    public SeverityService(SeverityRepository repository) {
        this.repository = repository;
    }

    public List<Severity> getAll() {
        return repository.findAll();
    }
}
