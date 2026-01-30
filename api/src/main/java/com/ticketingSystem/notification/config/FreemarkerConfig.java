package com.ticketingSystem.notification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import freemarker.cache.MruCacheStorage;

@Configuration
public class FreemarkerConfig {
    @Bean
    @Primary
    public freemarker.template.Configuration freemarkerConfiguration(NotificationProperties properties) throws IOException {
        freemarker.template.Configuration cfg = new freemarker.template.Configuration(freemarker.template.Configuration.VERSION_2_3_33);
        cfg.setClassLoaderForTemplateLoading(getClass().getClassLoader(), "/notification/templates");
        cfg.setDefaultEncoding("UTF-8");
        cfg.setTemplateUpdateDelayMilliseconds(properties.getFreemarker().getTemplateUpdateDelayMs());
        cfg.setCacheStorage(new MruCacheStorage(
                properties.getFreemarker().getCacheStrongSize(),
                properties.getFreemarker().getCacheSoftSize()
        ));
        return cfg;
    }
}
