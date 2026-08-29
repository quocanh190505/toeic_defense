package com.toeic_defense_backend.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamCreationRequest {
    private String title;
    private String description;
}
