package com.ticketingSystem.api.service;

import com.ticketingSystem.api.config.JwtProperties;
import com.ticketingSystem.api.dto.AuthenticatedUser;
import com.ticketingSystem.api.dto.LoginPayload;
import com.ticketingSystem.api.dto.TokenPair;
import com.ticketingSystem.api.enums.ClientType;
import com.ticketingSystem.api.models.SsoLoginPayload;
import com.ticketingSystem.api.permissions.RolePermission;
import com.ticketingSystem.api.repository.RoleRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SsoAuthService {
    private final AuthService authService;
    private final ExternalSsoTokenService externalSsoTokenService;
    private final PermissionService permissionService;
    private final RoleRepository roleRepository;
    private final JwtProperties jwtProperties;
    private final TokenPairService tokenPairService;
    private final JwtTokenService jwtTokenService;

    public SsoAuthService(AuthService authService,
                          ExternalSsoTokenService externalSsoTokenService,
                          PermissionService permissionService,
                          RoleRepository roleRepository,
                          JwtProperties jwtProperties,
                          TokenPairService tokenPairService,
                          JwtTokenService jwtTokenService) {
        this.authService = authService;
        this.externalSsoTokenService = externalSsoTokenService;
        this.permissionService = permissionService;
        this.roleRepository = roleRepository;
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
        List<String> roles = user.getRoles() == null ? List.of()
                : Arrays.asList(user.getRoles().split("\\|"));
        List<Integer> roleIds = roles.stream()
                .filter(r -> !r.isBlank())
                .map(Integer::parseInt)
                .toList();

        List<String> levels = user.getUserLevel() == null || user.getUserLevel().getLevelIds() == null
                ? List.of()
                : Arrays.asList(user.getUserLevel().getLevelIds().split("\\|"));

        RolePermission permissions = permissionService.mergeRolePermissions(roleIds);

        Set<String> allowedStatusActionIds = new HashSet<>();
        roleRepository.findAllById(roleIds).forEach(r -> {
            if (r.getAllowedStatusActionIds() != null) {
                for (String s : r.getAllowedStatusActionIds().split("\\|")) {
                    if (!s.isBlank()) {
                        allowedStatusActionIds.add(s.trim());
                    }
                }
            }
        });

        if (jwtProperties.isBypassEnabled()) {
            session.setAttribute("userId", user.getUserId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("roles", user.getRoles());
            session.setAttribute("levels", user.getUserLevel() != null ? user.getUserLevel().getLevelIds() : null);
        }

        ClientType clientType = ClientType.INTERNAL;

        LoginPayload payload = LoginPayload.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .roles(roles)
                .levels(levels)
                .permissions(permissions)
                .allowedStatusActionIds(allowedStatusActionIds)
                .clientType(clientType)
                .build();

        TokenPair tokenPair = tokenPairService.issueTokens(payload);
        String accessToken = jwtTokenService.regenerateAccessToken(externalToken)
                .orElse(tokenPair.token());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", accessToken);
        response.put("refreshToken", tokenPair.refreshToken());
        response.put("expiresInMinutes", tokenPair.expiresInMinutes());
        response.put("refreshExpiresInMinutes", tokenPair.refreshExpiresInMinutes());
        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("roles", roles);
        response.put("permissions", permissions);
        response.put("levels", levels);
        response.put("allowedStatusActionIds", allowedStatusActionIds);
        response.put("clientType", clientType.name());
        return response;
    }
}
