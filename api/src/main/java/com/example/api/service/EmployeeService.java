package com.example.api.service;

import com.example.api.dto.EmployeeDto;
import com.example.api.models.Employee;
import com.example.api.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
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

    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream().map(emp -> {
            EmployeeDto dto = new EmployeeDto();
            dto.setEmployeeId(emp.getEmployeeId());
            dto.setUserId(emp.getUserId());
            dto.setName(emp.getName());
            dto.setEmailId(emp.getEmailId());
            dto.setMobileNo(emp.getMobileNo());
            dto.setOffice(emp.getOffice());
            return dto;
        }).toList();
    }

    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public Optional<Employee> updateEmployee(Integer id, Employee updated) {
        return employeeRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setEmailId(updated.getEmailId());
                    existing.setMobileNo(updated.getMobileNo());
                    existing.setOffice(updated.getOffice());
                    existing.setUserId(updated.getUserId());
                    return employeeRepository.save(existing);
                });
    }

    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id);
    }
}
