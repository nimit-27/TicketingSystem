package com.example.api.service;

import com.example.api.models.Employee;
import com.example.api.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCrypt;

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
                .filter(emp -> {
                    String stored = emp.getPassword();
                    if (stored == null) {
                        return false;
                    }
                    if (isBcryptHash(stored)) {
                        if (isBcryptHash(password)) {
                            return Objects.equals(stored, password);
                        }
                        return BCrypt.checkpw(password, stored);
                    }
                    return Objects.equals(stored, password);
                });
    }

    private boolean isBcryptHash(String str) {
        return str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$");
    }
}
