package com.ticketingSystem.api.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.util.DefaultResourceRetriever;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import java.net.MalformedURLException;
import java.net.URL;

public class KeycloakTokenVerifier {
    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;
    private final String expectedIssuer;
    private final String expectedAudience;

    public KeycloakTokenVerifier(String issuer, String jwksUri, String audience) throws MalformedURLException {
        this.expectedAudience = audience;
        this.expectedIssuer = issuer;


        // Optionally tune timeouts / caching for JWKS
        var resourceRetriever = new DefaultResourceRetriever(2000, 2000);

        // JWKS source (fetches keys by 'kid', caches them)
        JWKSource<SecurityContext> jwtSource = new RemoteJWKSet<>(new URL(jwksUri), resourceRetriever);


        // JWT processor configured for RS256 keys from JWKS
        jwtProcessor = new DefaultJWTProcessor<>();

        JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwtSource);
        jwtProcessor.setJWSKeySelector(keySelector);

        // Custom claims verification: issuer + audience
        jwtProcessor.setJWTClaimsSetVerifier((claims, ctx) -> {
            if(!expectedIssuer.equals(claims.getIssuer())) {
                throw new BadJWTException("Invalid issuer");
            }
            if(!expectedAudience.equals(claims.getAudience())) {
                throw new BadJWTException("Invalid audience");
            }
            // exp/nbf/iat are validated automatically by processor; you can add leeway if needed.
        });
    }

    public JWTClaimsSet verify(String extToken) throws Exception {
        // Will throw if signature or claims invalid; returns trusted claims if OK
        return jwtProcessor.process(extToken, null);
    }
}
