package com.toeic_defense_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SafeProfileUpdateRequest {

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;
}
