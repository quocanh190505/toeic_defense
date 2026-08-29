package com.toeic_defense_backend.dto.response;



import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private String token;
    private Long userId;
    private String username;
    private String role;
}
