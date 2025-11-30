package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.CreateUserRequest;
import com.ticketingSystem.api.dto.HelpdeskUserDto;
import com.ticketingSystem.api.dto.PaginationResponse;
import com.ticketingSystem.api.dto.RequesterUserDto;
import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.service.RequesterUserService;
import com.ticketingSystem.api.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class UserController {
    private final UserService userService;
    private final RequesterUserService requesterUserService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/helpdesk")
    public ResponseEntity<List<HelpdeskUserDto>> getHelpdeskUsers() {
        return ResponseEntity.ok(userService.getAllHelpdeskUsers());
    }

    @GetMapping("/helpdesk/search")
    public ResponseEntity<PaginationResponse<HelpdeskUserDto>> searchHelpdeskUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String roleId,
            @RequestParam(required = false) String stakeholderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.searchHelpdeskUsers(query, roleId, stakeholderId, PageRequest.of(page, size)));
    }

    @GetMapping("/helpdesk/{userId}")
    public ResponseEntity<HelpdeskUserDto> getHelpdeskUserDetails(@PathVariable String userId) {
        return userService.getHelpdeskUserDetails(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/requesters")
    public ResponseEntity<List<RequesterUserDto>> getRequesterUsers() {
        return ResponseEntity.ok(requesterUserService.getAllRequesterUsers());
    }

    @GetMapping("/requesters/search")
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
        return ResponseEntity.ok(requesterUserService.searchRequesterUsers(query, roleId, stakeholderId, officeCode, officeType, zoneCode, regionCode, districtCode, PageRequest.of(page, size)));
    }

    @GetMapping("/requesters/office-types")
    public ResponseEntity<List<String>> getRequesterOfficeTypes() {
        return ResponseEntity.ok(requesterUserService.getOfficeTypes());
    }

    @GetMapping("/requesters/{userId}")
    public ResponseEntity<RequesterUserDto> getRequesterUserDetails(@PathVariable String userId) {
        return requesterUserService.getRequesterUser(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/requesters/{userId}/appoint-rno")
    public ResponseEntity<RequesterUserDto> appointRequesterAsRno(@PathVariable String userId) {
        return ResponseEntity.ok(requesterUserService.appointAsRegionalNodalOfficer(userId));
    }

    @PostMapping("/by-roles")
    public ResponseEntity<List<UserDto>> getUsersByRoles(@RequestBody List<String> roleIds) {
        return ResponseEntity.ok(userService.getUsersByRoles(roleIds));
    }

    @GetMapping("/{userId}")
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
    public ResponseEntity<?> addUser(@RequestBody User user) {
        User saved = userService.saveUser(user);
        return ResponseEntity.ok(java.util.Map.of("message", "User " + saved.getName() + " added successfully"));
    }

    @PostMapping("/admin")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId,
                                                   @RequestBody User user) {
        return userService.updateUser(userId, user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
