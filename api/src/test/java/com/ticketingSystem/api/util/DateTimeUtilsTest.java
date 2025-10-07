package com.ticketingSystem.api.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class DateTimeUtilsTest {

    @Nested
    @DisplayName("parseToLocalDateTime")
    class ParseToLocalDateTime {

        @Test
        void shouldParseIsoOffsetDateTime() {
            LocalDateTime result = DateTimeUtils.parseToLocalDateTime("2024-01-10T15:45:30+05:00");

            assertThat(result).isEqualTo(LocalDateTime.of(2024, 1, 10, 15, 45, 30));
        }

        @Test
        void shouldParseCustomPatternWhenOffsetIsMissing() {
            LocalDateTime result = DateTimeUtils.parseToLocalDateTime("2024-03-05T08:15:00");

            assertThat(result).isEqualTo(LocalDateTime.of(2024, 3, 5, 8, 15));
        }

        @Test
        void shouldParseDateOnlyValuesAsStartOfDay() {
            LocalDateTime result = DateTimeUtils.parseToLocalDateTime("2024-07-01");

            assertThat(result).isEqualTo(LocalDateTime.of(2024, 7, 1, 0, 0));
        }

        @Test
        void shouldReturnNullWhenInputCannotBeParsed() {
            LocalDateTime result = DateTimeUtils.parseToLocalDateTime("not-a-date");

            assertThat(result).isNull();
        }

        @Test
        void shouldReturnNullWhenInputIsBlank() {
            LocalDateTime result = DateTimeUtils.parseToLocalDateTime("   ");

            assertThat(result).isNull();
        }
    }
}
