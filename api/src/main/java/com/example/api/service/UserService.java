package com.example.api.service;

import com.example.api.dto.UserDto;
import com.example.api.mapper.DtoMapper;
import com.example.api.models.User;
import com.example.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<UserDto> getUserDetails(String userId) {
        return userRepository.findById(userId).map(DtoMapper::toUserDto);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(emp -> {
            UserDto dto = new UserDto();
            dto.setUserId(emp.getUserId());
            dto.setUsername(emp.getUsername());
            dto.setName(emp.getName());
            dto.setEmailId(emp.getEmailId());
            dto.setMobileNo(emp.getMobileNo());
            dto.setOffice(emp.getOffice());
            dto.setRoles(emp.getRoles());
            if (emp.getUserLevel() != null && emp.getUserLevel().getLevelIds() != null) {
                dto.setLevels(java.util.Arrays.asList(emp.getUserLevel().getLevelIds().split("\\|")));
            } else dto.setLevels(Collections.emptyList());
            return dto;
        }).toList();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> updateUser(String id, User updated) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setEmailId(updated.getEmailId());
                    existing.setMobileNo(updated.getMobileNo());
                    existing.setOffice(updated.getOffice());
                    existing.setUsername(updated.getUsername());
                    return userRepository.save(existing);
                });
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
