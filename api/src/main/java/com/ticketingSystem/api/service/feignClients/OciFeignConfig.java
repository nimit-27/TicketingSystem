package com.ticketingSystem.api.service.feignClients;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import feign.codec.Encoder;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;

@Configuration
public class OciFeignConfig {

    @Bean
    public Encoder feignEncoder() {
        return new SpringEncoder(() -> new HttpMessageConverters(
                new ByteArrayHttpMessageConverter(),
                new StringHttpMessageConverter(),
                new MappingJackson2HttpMessageConverter()
        ));
    }
    
    // This empty interceptor will override the global ADFeignClientRequestInterceptor
    // for the OCI Feign client, preventing the Bearer token from being added
    @Bean
    public feign.RequestInterceptor ociRequestInterceptor() {
        return template -> {
            // Do nothing - this prevents the global interceptor from running
            // OCI uses its own signature-based authentication
        };
    }

//    @Bean
//    public RequestInterceptor preserveEncodedUri() {
//        return new RequestInterceptor() {
//            @Override
//            public void apply(RequestTemplate template) {
//                // Mark current path as already-encoded (prevents Feign from decoding %2F to /)
//                template.uri(template.path(), true);
//            }
//        };
//    }

}
