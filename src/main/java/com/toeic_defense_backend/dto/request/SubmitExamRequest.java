package com.toeic_defense_backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubmitExamRequest {

    @NotNull
    private Long examId;

    @Valid
    @NotEmpty
    private List<SubmittedAnswerRequest> answers;
}
