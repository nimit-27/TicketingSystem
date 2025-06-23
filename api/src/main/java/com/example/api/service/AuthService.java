package com.example.api.service;

import com.example.api.models.Employee;
import com.example.api.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class AuthService {
    private final EmployeeRepository employeeRepository;

    public AuthService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Optional<Employee> authenticate(String userId, String password) {
        return employeeRepository.findByUserId(userId)
                .filter(emp -> Objects.equals(emp.getPassword(), password));
    }
}
