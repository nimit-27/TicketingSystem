package com.example.api.service;

import com.example.api.dto.EmployeeDto;
import com.example.api.dto.LevelDto;
import com.example.api.models.Employee;
import com.example.api.models.Level;
import com.example.api.repository.LevelRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class LevelService {
    private final LevelRepository levelRepository;

    public LevelService(LevelRepository levelRepository) {
        this.levelRepository = levelRepository;
    }

    public List<LevelDto> getAllLevels() {
        return levelRepository.findAll().stream().map(level -> {
            LevelDto dto = new LevelDto();
            dto.setLevelId(level.getLevelId());
            dto.setLevelName(level.getLevelName());
            return dto;
        }).toList();
    }

    public Optional<Set<EmployeeDto>> getEmployeesByLevel(String levelId) {
        return levelRepository
                .findById(Integer.valueOf(levelId))
                .map(level -> {
                    Set<EmployeeDto> employeeDtos = new HashSet<EmployeeDto>();
                    for (Employee employee : level.getEmployees()) { // This access triggers lazy loading
                        EmployeeDto dto = new EmployeeDto();
                        dto.setEmployeeId(employee.getEmployeeId());
                        dto.setUserId(employee.getUserId());
                        dto.setName(employee.getName());
                        dto.setEmailId(employee.getEmailId());
                        dto.setMobileNo(employee.getMobileNo());
                        dto.setOffice(employee.getOffice());
                        employeeDtos.add(dto);
                    }
                    return (employeeDtos);
                });
    }
}
