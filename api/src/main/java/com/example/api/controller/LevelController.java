package com.example.api.controller;

import com.example.api.dto.EmployeeDto;
import com.example.api.dto.LevelDto;
import com.example.api.service.LevelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/levels")
@CrossOrigin(origins = "http://localhost:3000")
public class LevelController {
    private final LevelService levelService;

    public LevelController(LevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping
    public ResponseEntity<List<LevelDto>> getAllLevels() {
        return ResponseEntity.ok(levelService.getAllLevels());
    }

    @GetMapping("/{levelId}/employees")
    public ResponseEntity<Set<EmployeeDto>> getEmployeeByLevel(@PathVariable String levelId) {
        Optional<Set<EmployeeDto>> employeesOptional = levelService.getEmployeesByLevel(levelId);

        return employeesOptional.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
