package com.example.api.service;

import com.example.api.models.Employee;
import com.example.api.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Optional<Employee> getEmployeeDetails(Integer employeeId) {
        return employeeRepository.findById(employeeId);
    }
}
