package com.ticketingSystem.api.service;

import com.ticketingSystem.api.models.IssueType;
import com.ticketingSystem.api.repository.IssueTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IssueTypeService {
    private static final String ACTIVE_FLAG = "1";
    private static final Duration SLA_FLAG_CACHE_TTL = Duration.ofMinutes(2);

    private final IssueTypeRepository repository;
    private final ConcurrentHashMap<String, CachedSlaFlag> slaFlagCache = new ConcurrentHashMap<>();

    public IssueTypeService(IssueTypeRepository repository) {
        this.repository = repository;
    }

    public List<IssueType> getAllActive() {
        return repository.findByIsActive(ACTIVE_FLAG);
    }

    public boolean isSlaEnabledForIssueType(String issueTypeId) {
        if (issueTypeId == null || issueTypeId.isBlank()) {
            return false;
        }
        Instant now = Instant.now();
        CachedSlaFlag cached = slaFlagCache.get(issueTypeId);
        if (cached != null && now.isBefore(cached.expiresAt())) {
            return cached.enabled();
        }
        boolean enabled = repository.findById(issueTypeId)
                .map(IssueType::getSlaFlag)
                .orElse(false);
        slaFlagCache.put(issueTypeId, new CachedSlaFlag(enabled, now.plus(SLA_FLAG_CACHE_TTL)));
        return enabled;
    }

    private record CachedSlaFlag(boolean enabled, Instant expiresAt) {}
}
