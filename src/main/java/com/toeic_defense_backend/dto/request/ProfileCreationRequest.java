package com.toeic_defense_backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileCreationRequest {
    private String fullName;
    private String email;
    private String phone;
    private Long userId;
}
