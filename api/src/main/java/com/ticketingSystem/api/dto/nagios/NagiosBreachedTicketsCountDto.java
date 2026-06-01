package com.ticketingSystem.api.dto.nagios;

import java.time.Instant;

public record NagiosBreachedTicketsCountDto(String service,
                                            Instant generatedAt,
                                            int days,
                                            long breachedTicketsCount) {
}
