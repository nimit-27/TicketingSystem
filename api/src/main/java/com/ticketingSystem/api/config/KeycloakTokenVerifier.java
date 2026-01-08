
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
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;

import java.net.URL;
import java.time.Duration;
import java.util.Map;
import java.util.Set;

public class KeycloakTokenVerifier {
    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;
    private final String expectedIssuer;
    private final String expectedAudience;

    public KeycloakTokenVerifier(String issuer, String jwksUri, String audience) throws Exception {
        this.expectedAudience = audience;
        this.expectedIssuer = issuer;

        var resourceRetriever = new DefaultResourceRetriever(2000, 2000); // 2s connect/read
        JWKSource<SecurityContext> jwtSource = new RemoteJWKSet<>(new URL(jwksUri), resourceRetriever);

        jwtProcessor = new DefaultJWTProcessor<>();
        JWSKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwtSource);
        jwtProcessor.setJWSKeySelector(keySelector);

        // Validate exp/nbf/iat + exact issuer, with small clock skew
        var exactMatch = Map.of("iss", expectedIssuer);
        var requiredClaims = Set.of("exp", "iat");
        var defaultVerifier = new DefaultJWTClaimsVerifier<SecurityContext>();
        defaultVerifier.setMaxClockSkew(120);

        jwtProcessor.setJWTClaimsSetVerifier((claims, ctx) -> {
            defaultVerifier.verify(claims, ctx);
            var aud = claims.getAudience();
            if (aud == null || !aud.contains(expectedAudience)) {
                throw new BadJWTException("Invalid audience");
            }
        });
    }

    public JWTClaimsSet verify(String extToken) throws Exception {
        return jwtProcessor.process(extToken, null);
    }
}
