package com.toeic_defense_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {

    @NotBlank
    private String username;

    // Intentionally exposed for the local mass-assignment security lab.
    private String role;

}
