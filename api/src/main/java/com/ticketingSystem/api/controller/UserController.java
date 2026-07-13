package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.ChangePasswordRequest;
import com.ticketingSystem.api.dto.CreateUserRequest;
import com.ticketingSystem.api.dto.HelpdeskUserDto;
import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.RequesterUserDto;
import com.ticketingSystem.api.dto.ResetPasswordRequest;
import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.exception.RateLimitExceededException;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.service.RequesterUserService;
import com.ticketingSystem.api.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class UserController {
    private static final int MAX_USER_LIST_PAGE_SIZE = 100;
    private static final String USER_LIST_ACCESS = "@jwtProperties.isBypassEnabled() or @policyEvaluationService.hasResourceAccess(authentication, 'users')";

    private final UserService userService;
    private final RequesterUserService requesterUserService;

    @GetMapping
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/helpdesk")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<List<HelpdeskUserDto>> getHelpdeskUsers() {
        return ResponseEntity.ok(userService.getAllHelpdeskUsers());
    }

    @GetMapping("/helpdesk/search")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<PaginationResponse<HelpdeskUserDto>> searchHelpdeskUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String roleId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        requireSearchCriteria(query, roleId, stakeholderId);
        return ResponseEntity.ok(userService.searchHelpdeskUsers(query, roleId, stakeholderId, securePageRequest(page, size)));
    }

    @GetMapping("/helpdesk/{userId}")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<HelpdeskUserDto> getHelpdeskUserDetails(@PathVariable String userId) {
        return userService.getHelpdeskUserDetails(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/requesters")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<List<RequesterUserDto>> getRequesterUsers() {
        return ResponseEntity.ok(requesterUserService.getAllRequesterUsers());
    }

    @GetMapping("/requesters/search")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<PaginationResponse<RequesterUserDto>> searchRequesterUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String roleId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(required = false) String officeCode,
            @RequestParam(required = false) String officeType,
            @RequestParam(required = false) String zoneCode,
            @RequestParam(required = false) String regionCode,
            @RequestParam(required = false) String districtCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        requireSearchCriteria(query, roleId, stakeholderId, officeCode, officeType, zoneCode, regionCode, districtCode);
        return ResponseEntity.ok(requesterUserService.searchRequesterUsers(query, roleId, stakeholderId, officeCode, officeType, zoneCode, regionCode, districtCode, securePageRequest(page, size)));
    }

    @GetMapping("/requesters/office-types")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<List<String>> getRequesterOfficeTypes() {
        return ResponseEntity.ok(requesterUserService.getOfficeTypes());
    }

    @GetMapping("/requesters/{userId}")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<RequesterUserDto> getRequesterUserDetails(@PathVariable String userId) {
        return requesterUserService.getRequesterUser(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/requesters/{userId}/appoint-rno")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<RequesterUserDto> appointRequesterAsRno(@PathVariable String userId) {
        return ResponseEntity.ok(requesterUserService.appointAsRegionalNodalOfficer(userId));
    }

    @PostMapping("/by-roles")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<List<UserDto>> getUsersByRoles(@RequestBody List<String> roleIds) {
        return ResponseEntity.ok(userService.getUsersByRoles(roleIds));
    }

    @GetMapping("/{userId}")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<?> getUserDetails(@PathVariable String userId) {
//        Optional<User> user = userService.getUserDetails(userId);
        return userService.getUserDetails(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity
                        .noContent()
                        .header("Error-Message", "User not found with id: " + userId)
                        .build());
    }

    @PostMapping
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<?> addUser(@RequestBody User user) {
        User saved = userService.saveUser(user);
        return ResponseEntity.ok(java.util.Map.of("message", "User " + saved.getName() + " added successfully"));
    }

    @GetMapping("/check-username")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<Map<String, Boolean>> checkUsernameAvailability(@RequestParam String username) {
        boolean available = userService.isUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @PostMapping("/admin")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{userId}")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<User> updateUser(@PathVariable String userId,
                                                   @RequestBody User user) {
        return userService.updateUser(userId, user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    private Pageable securePageRequest(int page, int size) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be negative");
        }
        if (size < 1 || size > MAX_USER_LIST_PAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must be between 1 and " + MAX_USER_LIST_PAGE_SIZE);
        }
        return PageRequest.of(page, size);
    }

    private void requireSearchCriteria(String... criteria) {
        boolean hasCriteria = Stream.of(criteria)
                .anyMatch(value -> value != null && !value.trim().isEmpty());
        if (!hasCriteria) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "At least one search or filter parameter is required");
        }
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, String>> changePassword(@PathVariable String userId,
                                                              @Valid @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(userId, request);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (RateLimitExceededException ex) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(ex.getRetryAfterSeconds()))
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{userId}/password/reset")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable String userId,
                                                             @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(userId, request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize(USER_LIST_ACCESS)
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
