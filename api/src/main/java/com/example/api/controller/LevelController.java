package com.example.api.controller;

import com.example.api.dto.UserDto;
import com.example.api.dto.LevelDto;
import com.example.api.service.LevelService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/levels")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class LevelController {
    private final LevelService levelService;

    @GetMapping
    public ResponseEntity<List<LevelDto>> getAllLevels() {
        return ResponseEntity.ok(levelService.getAllLevels());
    }

    @GetMapping("/{levelId}/users")
    public ResponseEntity<Set<UserDto>> getUserByLevel(@PathVariable String levelId) {
        Set<UserDto> users = levelService.getUsersByLevel(levelId).orElseGet(Collections::emptySet);

        return ResponseEntity.ok(users);
    }
}
