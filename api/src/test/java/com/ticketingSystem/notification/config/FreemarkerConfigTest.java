package com.ticketingSystem.notification.config;

import freemarker.template.Configuration;
import freemarker.template.Template;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class FreemarkerConfigTest {

    private Configuration configuration;

    @BeforeEach
    void setUp() throws Exception {
        NotificationProperties properties = new NotificationProperties();
        configuration = new FreemarkerConfig().freemarkerConfiguration(properties);
    }

    @Test
    void shouldLoadSmsTemplateFromResources() throws Exception {
        Template template = configuration.getTemplate("sms/TicketCreated.ftl");

        assertThat(template).isNotNull();
    }
}
