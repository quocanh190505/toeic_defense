package com.toeic_defense_backend.service;

import com.toeic_defense_backend.dto.request.UserCreationRequest;
import com.toeic_defense_backend.dto.request.ProfileUpdateRequest;
import com.toeic_defense_backend.dto.request.SafeProfileUpdateRequest;
import com.toeic_defense_backend.dto.request.RegisterRequest;
import com.toeic_defense_backend.entity.User;

import java.util.List;

public interface UserService {

    User register(RegisterRequest request);

    User createUser(UserCreationRequest request);

    List<User> getUsers();

    User getUser(Long id);

    User updateUser(Long id, UserCreationRequest request);

    User updateOwnProfile(Long authenticatedUserId, SafeProfileUpdateRequest request);

    User updateOwnProfileVulnerableLab(Long authenticatedUserId, ProfileUpdateRequest request);

    User updateRole(Long id, String role);

    void deleteUser(Long id);
}
