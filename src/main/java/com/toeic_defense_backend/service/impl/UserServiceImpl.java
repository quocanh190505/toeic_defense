package com.toeic_defense_backend.service.impl;

import com.toeic_defense_backend.dto.request.RegisterRequest;
import com.toeic_defense_backend.dto.request.UserCreationRequest;
import com.toeic_defense_backend.dto.request.ProfileUpdateRequest;
import com.toeic_defense_backend.dto.request.SafeProfileUpdateRequest;
import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.mapper.UserMapper;
import com.toeic_defense_backend.repository.UserRepository;
import com.toeic_defense_backend.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        return userRepository.save(user);
    }

    @Override
    public User createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        return userRepository.save(user);
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );
    }

    @Override
    public User updateUser(
            Long id,
            UserCreationRequest request
    ) {
        User user = getUser(id);

        userRepository.findByUsername(request.getUsername())
                .filter(existingUser -> !existingUser.getId().equals(id))
                .ifPresent(existingUser -> {
                    throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
                });

        user.setUsername(request.getUsername());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            user.setRole(request.getRole());
        }

        return userRepository.save(user);
    }

    @Override
    public User updateOwnProfile(Long authenticatedUserId, SafeProfileUpdateRequest request) {
        User user = getUser(authenticatedUserId);

        userRepository.findByUsername(request.getUsername())
                .filter(existingUser -> !existingUser.getId().equals(authenticatedUserId))
                .ifPresent(existingUser -> {
                    throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        });

        user.setUsername(request.getUsername());
        return userRepository.save(user);
    }

    @Override
    public User updateOwnProfileVulnerableLab(Long authenticatedUserId, User updateData) {
        User currentUser = getUser(authenticatedUserId);

        if (updateData.getUsername() != null) {
            userRepository.findByUsername(updateData.getUsername())
                    .filter(existingUser -> !existingUser.getId().equals(authenticatedUserId))
                    .ifPresent(existingUser -> {
                        throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
                    });
            currentUser.setUsername(updateData.getUsername());
        }

        if (updateData.getEmail() != null) {
            currentUser.setEmail(updateData.getEmail());
        }

        // Framework hoặc mapper (như BeanUtils.copyProperties) copy thẳng toàn bộ:
        org.springframework.beans.BeanUtils.copyProperties(updateData, currentUser, "id", "password");

        if (currentUser.getRole() != null) {
            currentUser.setRole(currentUser.getRole().toUpperCase());
        }

        return userRepository.save(currentUser);
    }
    @Override
    public User updateRole(Long id, String role) {
        User user = getUser(id);

        user.setRole(role);

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = getUser(id);

        userRepository.delete(user);
    }
}
