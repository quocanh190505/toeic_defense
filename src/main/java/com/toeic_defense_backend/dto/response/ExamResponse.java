package com.toeic_defense_backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamResponse {

    private Long id;
    private String title;
    private String description;
}
