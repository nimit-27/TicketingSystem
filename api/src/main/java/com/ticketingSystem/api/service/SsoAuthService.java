package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.AuthenticatedUser;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.TokenPair;
import com.ticketingSystem.api.models.SsoLoginPayload;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SsoAuthService {
    private final AuthService authService;
    private final ExternalSsoTokenService externalSsoTokenService;
    private final LoginPayloadService loginPayloadService;
    private final JwtProperties jwtProperties;
    private final TokenPairService tokenPairService;
    private final JwtTokenService jwtTokenService;

    public SsoAuthService(AuthService authService,
                          ExternalSsoTokenService externalSsoTokenService,
                          LoginPayloadService loginPayloadService,
                          JwtProperties jwtProperties,
                          TokenPairService tokenPairService,
                          JwtTokenService jwtTokenService) {
        this.authService = authService;
        this.externalSsoTokenService = externalSsoTokenService;
        this.loginPayloadService = loginPayloadService;
        this.jwtProperties = jwtProperties;
        this.tokenPairService = tokenPairService;
        this.jwtTokenService = jwtTokenService;
    }

    public Optional<Map<String, Object>> login(SsoLoginPayload ssoLoginPayload, HttpSession session) {
        return externalSsoTokenService.requestToken(ssoLoginPayload)
                .filter(response -> response.getAccessToken() != null && !response.getAccessToken().isBlank())
                .flatMap(response -> authService.findUserByUsername(ssoLoginPayload.getUsername(), "requestor")
                        .map(user -> buildLoginResponse(user, session, response.getAccessToken())));
    }

    private Map<String, Object> buildLoginResponse(AuthenticatedUser user, HttpSession session, String externalToken) {
        LoginPayload payload = loginPayloadService.buildPayload(user);
        List<String> roles = payload.getRoles();
        List<String> levels = payload.getLevels();

        if (jwtProperties.isBypassEnabled()) {
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("roles", user.getRoles());
            session.setAttribute("levels", user.getUserLevel() != null ? user.getUserLevel().getLevelIds() : null);
        }

        TokenPair tokenPair = tokenPairService.issueTokens(payload);
        String accessToken = jwtTokenService.regenerateAccessToken(externalToken)
                .orElse(tokenPair.token());

        Map<String, Object> response = new LinkedHashMap<>();
//        response.put("token", accessToken);
//        response.put("refreshToken", tokenPair.refreshToken());
        response.put("expiresInMinutes", tokenPair.expiresInMinutes());
        response.put("refreshExpiresInMinutes", tokenPair.refreshExpiresInMinutes());
        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("roles", roles);
        response.put("permissions", payload.getPermissions());
        response.put("levels", levels);
        response.put("allowedStatusActionIds", payload.getAllowedStatusActionIds());
        response.put("allowedCrStatusActionIds", payload.getAllowedCrStatusActionIds());
        response.put("officeType", user.getOfficeType());
        response.put("officeCode", user.getOfficeCode());
        response.put("zoneCode", user.getZoneCode());
        response.put("regionCode", user.getRegionCode());
        response.put("districtCode", user.getDistrictCode());
        response.put("zoCode", user.getZoneCode());
        response.put("roCode", user.getRegionCode());
        response.put("doCode", user.getDistrictCode());
        response.put("clientType", payload.getClientType() != null ? payload.getClientType().name() : null);
        return response;
    }
}
