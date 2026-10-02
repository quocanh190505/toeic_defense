package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.request.UpdateRoleRequest;
import com.toeic_defense_backend.dto.request.ProfileUpdateRequest;
import com.toeic_defense_backend.dto.request.SafeProfileUpdateRequest;
import com.toeic_defense_backend.dto.request.UserCreationRequest;
import com.toeic_defense_backend.dto.response.UserResponse;
import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @RequestBody @Valid UserCreationRequest request
    ) {
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(userService.createUser(request)))
                .status(HttpStatus.OK.value())
                .message("Create user successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsers() {
        ApiResponse<List<UserResponse>> apiResponse = ApiResponse.<List<UserResponse>>builder()
                .data(userService.getUsers().stream()
                        .map(this::toUserResponse)
                        .collect(Collectors.toList()))
                .status(HttpStatus.OK.value())
                .message("Get users successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long userId) {
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(userService.getUser(userId)))
                .status(HttpStatus.OK.value())
                .message("Get user successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long userId,
            @RequestBody @Valid UserCreationRequest request
    ) {
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(userService.updateUser(userId, request)))
                .status(HttpStatus.OK.value())
                .message("Update user successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateOwnProfile(
            @RequestBody @Valid SafeProfileUpdateRequest request,
            Authentication authentication
    ) {
        Long authenticatedUserId = Long.parseLong(authentication.getName());
        User updatedUser = userService.updateOwnProfile(authenticatedUserId, request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(updatedUser))
                .status(HttpStatus.OK.value())
                .message("Profile updated successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/api/users/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateOwnProfileVulnerableLab(
            @RequestBody User request,
            Authentication authentication
    ) {
        Long authenticatedUserId = Long.parseLong(authentication.getName());
        User updatedUser = userService.updateOwnProfileVulnerableLab(authenticatedUserId, request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(updatedUser))
                .status(HttpStatus.OK.value())
                .message("Lab profile updated successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getOwnProfile(Authentication authentication) {
        Long authenticatedUserId = Long.parseLong(authentication.getName());
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(userService.getUser(authenticatedUserId)))
                .status(HttpStatus.OK.value())
                .message("Get profile successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{userId}/roleSecure")
    public ResponseEntity<ApiResponse<UserResponse>> updateRoleSecure(
            @PathVariable Long userId,
            @RequestBody @Valid UpdateRoleRequest request
    ) {
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(userService.updateRole(userId, request.getRole())))
                .status(HttpStatus.OK.value())
                .message("Update role successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .email(user.getEmail())
                .build();
    }
}
