package com.ticketingSystem.notification.service;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.StringWriter;
import java.util.Map;

@Component
public class EmailTemplateRenderer {
    private static final String SUBJECT_PREFIX = "Subject:";

    private final Configuration freemarker;

    public EmailTemplateRenderer(@Qualifier("freemarkerConfiguration") Configuration freemarker) {
        this.freemarker = freemarker;
    }

    public EmailContent render(String templateName, Map<String, Object> model) throws IOException, TemplateException {
        Template template = freemarker.getTemplate(templateName);
        StringWriter out = new StringWriter();
        template.process(model, out);
        String raw = out.toString();
        return parseSubject(raw);
    }

    private EmailContent parseSubject(String raw) {
        if (raw == null || raw.isBlank()) {
            return new EmailContent(null, "");
        }
        String trimmed = raw.stripLeading();
        if (!trimmed.startsWith(SUBJECT_PREFIX)) {
            return new EmailContent(null, raw);
        }
        int newlineIndex = trimmed.indexOf('\n');
        if (newlineIndex < 0) {
            String subject = trimmed.substring(SUBJECT_PREFIX.length()).trim();
            return new EmailContent(subject, "");
        }
        String subjectLine = trimmed.substring(0, newlineIndex);
        String subject = subjectLine.substring(SUBJECT_PREFIX.length()).trim();
        String body = trimmed.substring(newlineIndex + 1).stripLeading();
        return new EmailContent(subject, body);
    }
}
