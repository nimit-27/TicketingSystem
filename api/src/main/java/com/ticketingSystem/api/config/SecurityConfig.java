package com.ticketingSystem.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtProperties jwtProperties;
    private final CorsProperties corsProperties;
    private final ClientTokenAuthenticationFilter clientTokenAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtProperties jwtProperties,
                          CorsProperties corsProperties,
                          ClientTokenAuthenticationFilter clientTokenAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtProperties = jwtProperties;
        this.corsProperties = corsProperties;
        this.clientTokenAuthenticationFilter = clientTokenAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'"))
        );

        if (jwtProperties.isBypassEnabled()) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }

        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("helpdesk/auth/login", "helpdesk/auth/logout", "helpdesk/auth/refresh",
                        "helpdesk/auth/login/sso", "helpdesk/auth/sso",
                        "helpdesk/auth/session",
                        "/auth/logout", "/auth/login", "/auth/refresh", "/auth/sso", "/auth/session",
                        "auth/login/sso", "auth/sso", "auth/session",
                        "/m/auth/token", "/helpdesk/m/auth/token",
                        "/ext/auth/token", "/helpdesk/ext/auth/token").permitAll()
                .requestMatchers("/public/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
        );
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(clientTokenAuthenticationFilter, JwtAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildCorsConfiguration());
        return source;
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", buildCorsConfiguration());
        return new CorsFilter(source);
    }

    private CorsConfiguration buildCorsConfiguration() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOrigins = corsProperties.getAllowedOrigins();
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            configuration.setAllowedOriginPatterns(List.of("*"));
        } else {
            configuration.setAllowedOrigins(allowedOrigins);
            configuration.setAllowedOriginPatterns(allowedOrigins);
        }
        configuration.setAllowedMethods(corsProperties.getAllowedMethods());
        configuration.setAllowedHeaders(corsProperties.getAllowedHeaders());
        configuration.setExposedHeaders(corsProperties.getExposedHeaders());
        configuration.setAllowCredentials(corsProperties.isAllowCredentials());
        configuration.setMaxAge(corsProperties.getMaxAge());
        return configuration;
    }
}
