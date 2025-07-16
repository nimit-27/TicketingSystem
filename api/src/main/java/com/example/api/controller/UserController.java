package com.example.api.controller;

import com.example.api.dto.UserDto;
import com.example.api.models.User;
import com.example.api.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable String userId) {
//        Optional<User> user = userService.getUserDetails(userId);
        return userService.getUserDetails(Integer.valueOf(userId))
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

    @PutMapping("/{userId}")
    public ResponseEntity<User> updateUser(@PathVariable String userId,
                                                   @RequestBody User user) {
        return userService.updateUser(Integer.valueOf(userId), user)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(Integer.valueOf(userId));
        return ResponseEntity.noContent().build();
    }
}
