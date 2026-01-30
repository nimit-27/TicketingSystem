package com.ticketingSystem.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class EmailNotificationConfig {

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
