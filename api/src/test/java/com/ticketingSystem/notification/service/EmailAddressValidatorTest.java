package com.ticketingSystem.notification.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmailAddressValidatorTest {

    private final EmailAddressValidator validator = new EmailAddressValidator();

    @Test
    void acceptsValidEmailAddress() {
        assertThat(validator.isValid("user@example.com")).isTrue();
    }

    @Test
    void rejectsMalformedEmailAddress() {
        assertThat(validator.isValid("user example.com")).isFalse();
        assertThat(validator.isValid("user@example")).isFalse();
        assertThat(validator.isValid(" user@example.com")).isFalse();
        assertThat(validator.isValid(null)).isFalse();
    }
}
