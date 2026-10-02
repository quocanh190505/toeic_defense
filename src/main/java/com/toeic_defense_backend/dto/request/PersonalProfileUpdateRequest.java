package com.toeic_defense_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PersonalProfileUpdateRequest {

    @NotBlank
    @Size(max = 120)
    private String fullName;

    @Email
    @Size(max = 180)
    private String email;

    @Size(max = 30)
    private String phone;
}
