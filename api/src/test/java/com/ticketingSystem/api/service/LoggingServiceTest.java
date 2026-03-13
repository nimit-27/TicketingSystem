package com.ticketingSystem.api.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;

class LoggingServiceTest {

    @Test
    void performSampleTaskShouldHandleInternalExceptionAndNotPropagate() {
        LoggingService service = new LoggingService();

        // The method intentionally throws and catches an exception to demonstrate error logging.
        assertThatCode(service::performSampleTask).doesNotThrowAnyException();
    }
}
