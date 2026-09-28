package com.toeic_defense_backend.service.impl;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.toeic_defense_backend.dto.request.ChangePasswordSecureRequest;
import com.toeic_defense_backend.dto.request.LoginRequest;
import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.repository.UserRepository;
import com.toeic_defense_backend.repository.unsafe.UnsafeAuthRepository;
import com.toeic_defense_backend.service.AuthService;
import com.toeic_defense_backend.dto.response.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UnsafeAuthRepository unsafeAuthRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.signerKey}")
    private String signerKey;

    @Override
    public LoginResponse loginUnsafe(LoginRequest request) {

        User user = unsafeAuthRepository.findByUsernameUnsafe(
                request.getUsername()
        );

        if (user == null) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!"USER".equals(user.getRole())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        return toLoginResponse(user);
    }

    @Override
    public LoginResponse loginSecure(LoginRequest request) {

        User user = userRepository.findByUsername(
                        request.getUsername()
                )
                .orElseThrow(() ->
                        new AppException(ErrorCode.INVALID_CREDENTIALS)
                );

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        return toLoginResponse(user);
    }

    @Override
    public LoginResponse refreshToken(Long authenticatedUserId) {
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );

        return toLoginResponse(user);
    }

    @Override
    public void changePasswordSecure(
            Long authenticatedUserId,
            ChangePasswordSecureRequest request
    ) {
        if (request == null || request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );

        boolean matches = false;
        try {
            matches = passwordEncoder.matches(
                    request.getOldPassword(),
                    user.getPassword()
            );
        } catch (Exception ignored) {}

        if (!matches && !request.getOldPassword().equals(user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword().trim())
        );

        userRepository.save(user);
    }

    private LoginResponse toLoginResponse(User user) {
        return LoginResponse.builder()
                .token(generateToken(user))
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }

    private String generateToken(User user) {

        JWSHeader header = new JWSHeader(
                JWSAlgorithm.HS512
        );

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getId().toString())
                .issuer("toeic-defense-backend")
                .issueTime(new Date())
                .expirationTime(
                        Date.from(
                                Instant.now().plusSeconds(3600)
                        )
                )
                .claim("username", user.getUsername())
                .claim("role", user.getRole())
                .build();

        SignedJWT signedJWT = new SignedJWT(
                header,
                claimsSet
        );

        try {

            signedJWT.sign(
                    new MACSigner(
                            signerKey.getBytes()
                    )
            );

            return signedJWT.serialize();

        } catch (JOSEException e) {
            throw new RuntimeException(
                    "Không thể tạo JWT token"
            );
        }
    }
}
