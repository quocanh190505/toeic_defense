package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.request.ChangePasswordSecureRequest;
import com.toeic_defense_backend.dto.request.LoginRequest;
import com.toeic_defense_backend.dto.request.RegisterRequest;
import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.response.LoginResponse;
import com.toeic_defense_backend.dto.response.RegisterResponse;
import com.toeic_defense_backend.dto.response.UserResponse;
import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.service.AuthService;
import com.toeic_defense_backend.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;
    UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @RequestBody @Valid RegisterRequest request
    ) {
        User user = userService.register(request);

        RegisterResponse registerResponse = RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .build();

        ApiResponse<RegisterResponse> apiResponse = ApiResponse.<RegisterResponse>builder()
                .data(registerResponse)
                .status(HttpStatus.OK.value())
                .message("Register successfully")
                .build();

        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/loginUnsafe")
    public LoginResponse loginUnsafe(
            @RequestBody LoginRequest request
    ) {
        return authService.loginUnsafe(request);
    }

    @PostMapping("/loginSecure")
    public LoginResponse loginSecure(
            @RequestBody LoginRequest request
    ) {
        return authService.loginSecure(request);
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        Long authenticatedUserId =
                Long.parseLong(authentication.getName());

        User user = userService.getUser(authenticatedUserId);

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    @PostMapping("/refresh")
    public LoginResponse refresh(Authentication authentication) {
        Long authenticatedUserId =
                Long.parseLong(authentication.getName());

        return authService.refreshToken(authenticatedUserId);
    }

    @PutMapping("/changePasswordSecure")
    public String changePasswordSecure(
            @RequestBody ChangePasswordSecureRequest request,
            Authentication authentication
    ) {
        Long authenticatedUserId =
                Long.parseLong(authentication.getName());

        authService.changePasswordSecure(
                authenticatedUserId,
                request
        );

        return "Change password successfully";
    }
}
