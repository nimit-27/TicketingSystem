package com.ticketingSystem.notification.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.task.TaskExecutor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.Properties;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableConfigurationProperties(SmtpMailProperties.class)
public class EmailNotificationConfig {

    @Bean
    @ConditionalOnProperty(prefix = "smtp", name = "host")
    public JavaMailSender smtpJavaMailSender(SmtpMailProperties smtpProperties, Environment environment) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(smtpProperties.getHost());
        if (smtpProperties.getPort() != null) {
            mailSender.setPort(smtpProperties.getPort());
        }
        mailSender.setUsername(firstNonBlank(smtpProperties.getUserKey(), smtpProperties.getUserid()));
        mailSender.setPassword(smtpProperties.getUser().getPassword());

        Properties javaMailProperties = mailSender.getJavaMailProperties();
        setIfPresent(javaMailProperties, "mail.smtp.auth", firstConfiguredProperty(
                environment,
                "mail.smtp.auth",
                "mail.smtps.auth"
        ));
        setIfPresent(javaMailProperties, "mail.smtps.auth", environment.getProperty("mail.smtps.auth"));
        setIfPresent(javaMailProperties, "mail.smtp.starttls.enable", environment.getProperty("mail.smtp.starttls.enable"));
        setIfPresent(javaMailProperties, "mail.smtp.ssl.enable", environment.getProperty("mail.smtp.ssl.enable"));
        setIfPresent(javaMailProperties, "mail.smtp.connectiontimeout", environment.getProperty("mail.smtp.connectiontimeout"));
        setIfPresent(javaMailProperties, "mail.smtp.timeout", environment.getProperty("mail.smtp.timeout"));
        setIfPresent(javaMailProperties, "mail.smtp.writetimeout", environment.getProperty("mail.smtp.writetimeout"));
        return mailSender;
    }

    private String firstConfiguredProperty(Environment environment, String... propertyNames) {
        if (propertyNames == null) {
            return null;
        }
        for (String propertyName : propertyNames) {
            String value = environment.getProperty(propertyName);
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private void setIfPresent(Properties properties, String key, String value) {
        if (value != null && !value.isBlank()) {
            properties.put(key, value);
        }
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    @Bean(name = "emailNotificationExecutor")
    public TaskExecutor emailNotificationExecutor(NotificationProperties properties) {
        NotificationProperties.EmailDispatcher settings = properties.getEmailDispatcher();
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix("email-dispatch-");
        executor.setCorePoolSize(settings.getExecutorCorePoolSize());
        executor.setMaxPoolSize(settings.getExecutorMaxPoolSize());
        executor.setQueueCapacity(settings.getExecutorQueueCapacity());
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
