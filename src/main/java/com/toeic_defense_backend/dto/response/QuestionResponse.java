package com.toeic_defense_backend.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuestionResponse {

    private Long id;
    private Long examId;
    private String examTitle;
    private Integer questionNumber;
    private String content;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
}
