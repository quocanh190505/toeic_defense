package com.toeic_defense_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamAnswerRequest {

    @NotNull
    private Long examId;

    @NotNull
    private Integer questionNumber;

    @NotBlank
    private String correctAnswer;

    private String explanation;
}
