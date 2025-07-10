package com.example.api.service;

import com.example.api.dto.UserDto;
import com.example.api.models.User;
import com.example.api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> getUserDetails(Integer userId) {
        return userRepository.findById(userId);
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
            return dto;
        }).toList();
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> updateUser(Integer id, User updated) {
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

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
}
