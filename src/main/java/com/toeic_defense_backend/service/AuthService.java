package com.toeic_defense_backend.service;


import com.toeic_defense_backend.dto.request.ChangePasswordSecureRequest;
import com.toeic_defense_backend.dto.request.LoginRequest;
import com.toeic_defense_backend.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse loginUnsafe(LoginRequest request);

    LoginResponse loginSecure(LoginRequest request);

    LoginResponse refreshToken(Long authenticatedUserId);

    void changePasswordSecure(Long authenticatedUserId,
                              ChangePasswordSecureRequest request);
}
