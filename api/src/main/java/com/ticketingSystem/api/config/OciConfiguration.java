package com.ticketingSystem.api.config;

import com.oracle.bmc.Region;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class OciConfiguration {

    @Bean
    public AuthenticationDetailsProvider authenticationDetailsProvider() throws IOException {
        return new ConfigFileAuthenticationDetailsProvider(ConfigFileReader.parseDefault());
    }

    @Bean
    public ObjectStorageClient objectStorageClient(OciProperties properties,
                                                   AuthenticationDetailsProvider provider) {
        Region region = Region.fromRegionCodeOrId(properties.getRegion());
        ObjectStorageClient client = ObjectStorageClient.builder()
                .region(region)
                .build(provider);
        if (properties.getEndpoint() != null && !properties.getEndpoint().isBlank()) {
            client.setEndpoint(properties.getEndpoint());
        }
        return client;
    }
}
