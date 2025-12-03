package com.ticketingSystem.api.config;

import com.oracle.bmc.Region;
import com.oracle.bmc.auth.AuthenticationDetailsProvider;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Configuration
public class OciConfiguration {

    @Bean
    public AuthenticationDetailsProvider authenticationDetailsProvider(OciProperties properties) throws IOException {
        ConfigFileReader.ConfigFile configFile;
        String configPath = properties.getConfigFile();
        String profile = properties.getProfile();

        if (configPath != null && !configPath.isBlank()) {
            Path ociConfig = Path.of(configPath);
            if (!Files.exists(ociConfig) || !Files.isRegularFile(ociConfig)) {
                throw new IOException("OCI config file not found at " + ociConfig.toAbsolutePath());
            }
            configFile = ConfigFileReader.parse(ociConfig.toString(), profile);
        } else {
            try {
                configFile = ConfigFileReader.parseDefault();
            } catch (IOException ex) {
                throw new IOException("OCI config file not found. Set 'oci.config-file' (or OCI_CONFIG_FILE) and 'oci.profile' (or OCI_CONFIG_PROFILE) to point to a valid OCI CLI config.", ex);
            }
        }

        return new ConfigFileAuthenticationDetailsProvider(configFile);
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
