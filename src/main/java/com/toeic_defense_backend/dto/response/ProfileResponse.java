package com.toeic_defense_backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Long userId;
    private String username;
}
