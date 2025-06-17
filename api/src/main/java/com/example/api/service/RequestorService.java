package com.example.api.service;

import com.example.api.models.Requestor;
import com.example.api.repository.RequestorRepository;
import org.springframework.stereotype.Service;

@Service
public class RequestorService {
    private final RequestorRepository requestorRepository;

    public RequestorService(RequestorRepository requestorRepository) {
        this.requestorRepository = requestorRepository;
    }

    public Requestor save(Requestor requestor) {
        return requestorRepository.save(requestor);
    }
}
