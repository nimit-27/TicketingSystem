package com.example.notification.service;

import com.example.notification.enums.ChannelType;
import freemarker.template.Configuration;
import freemarker.template.Template;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
import java.util.Map;

@Component
public class EmailNotifier implements Notifier {
    private final Configuration freemarker;

    public EmailNotifier(Configuration freemarker) {
        this.freemarker = freemarker;
    }

    @Override
    public ChannelType getChannel() {
        return ChannelType.EMAIL;
    }

    @Override
    public void send(String templateName, Map<String, Object> data, String recipient) throws Exception {
        Template template = freemarker.getTemplate(templateName + ".ftl");
        StringWriter out = new StringWriter();
        template.process(data, out);
        String body = out.toString();
        System.out.println("Email notification sent");
    }
}
