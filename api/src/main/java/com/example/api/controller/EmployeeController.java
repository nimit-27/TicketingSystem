package com.example.api.controller;

import com.example.api.models.Employee;
import com.example.api.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<?> getEmployeeDetails(@PathVariable Integer employeeId) {
//        Optional<Employee> employee = employeeService.getEmployeeDetails(employeeId);
        return employeeService.getEmployeeDetails(employeeId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity
                        .noContent()
                        .header("Error-Message", "Employee not found with id: " + employeeId)
                        .build());
    }
}
