package com.ticketingSystem.api.controller;

import com.ticketingSystem.api.dto.CreateUserRequest;
import com.ticketingSystem.api.dto.HelpdeskUserDto;
import com.ticketingSystem.api.dto.RequesterUserDto;
import com.ticketingSystem.api.dto.UserDto;
import com.ticketingSystem.api.models.User;
import com.ticketingSystem.api.service.RequesterUserService;
import com.ticketingSystem.api.service.UserService;
import lombok.AllArgsConstructor;
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

    @GetMapping("/requesters/{userId}")
    public ResponseEntity<RequesterUserDto> getRequesterUserDetails(@PathVariable String userId) {
        return requesterUserService.getRequesterUser(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
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
