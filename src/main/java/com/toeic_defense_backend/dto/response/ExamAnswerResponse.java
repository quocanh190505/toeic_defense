package com.toeic_defense_backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamAnswerResponse {

    private Long id;
    private Long examId;
    private String examTitle;
    private Integer questionNumber;
    private String correctAnswer;
    private String explanation;
}
