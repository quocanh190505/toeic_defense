package com.toeic_defense_backend.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ExamResultResponse {

    private Long id;
    private Long userId;
    private String username;
    private Long examId;
    private String examTitle;
    private Integer totalQuestions;
    private Integer correctCount;
    private Double score;
    private String submittedAnswers;
    private Instant submittedAt;
}
