package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.request.SubmitExamRequest;
import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.response.ExamResultResponse;
import com.toeic_defense_backend.entity.ExamResult;
import com.toeic_defense_backend.service.ExamResultService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/exam-results")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamResultController {

    ExamResultService examResultService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<ExamResultResponse>> submitExam(
            @RequestBody @Valid SubmitExamRequest request,
            Authentication authentication
    ) {
        Long authenticatedUserId =
                Long.parseLong(authentication.getName());

        return ResponseEntity.ok(ApiResponse.<ExamResultResponse>builder()
                .data(toExamResultResponse(
                        examResultService.submitExam(authenticatedUserId, request)
                ))
                .status(HttpStatus.OK.value())
                .message("Submit exam successfully")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> getMyResults(
            Authentication authentication
    ) {
        Long authenticatedUserId =
                Long.parseLong(authentication.getName());

        return ResponseEntity.ok(ApiResponse.<List<ExamResultResponse>>builder()
                .data(examResultService.getMyResults(authenticatedUserId).stream()
                        .map(this::toExamResultResponse)
                        .toList())
                .status(HttpStatus.OK.value())
                .message("Get my results successfully")
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> getResults() {
        return ResponseEntity.ok(ApiResponse.<List<ExamResultResponse>>builder()
                .data(examResultService.getResults().stream()
                        .map(this::toExamResultResponse)
                        .toList())
                .status(HttpStatus.OK.value())
                .message("Get exam results successfully")
                .build());
    }

    @GetMapping("/{resultId}")
    public ResponseEntity<ApiResponse<ExamResultResponse>> getResult(
            @PathVariable Long resultId
    ) {
        return ResponseEntity.ok(ApiResponse.<ExamResultResponse>builder()
                .data(toExamResultResponse(examResultService.getResult(resultId)))
                .status(HttpStatus.OK.value())
                .message("Get exam result successfully")
                .build());
    }

    private ExamResultResponse toExamResultResponse(ExamResult result) {
        return ExamResultResponse.builder()
                .id(result.getId())
                .userId(result.getUser().getId())
                .username(result.getUser().getUsername())
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getTitle())
                .totalQuestions(result.getTotalQuestions())
                .correctCount(result.getCorrectCount())
                .score(result.getScore())
                .submittedAnswers(result.getSubmittedAnswers())
                .submittedAt(result.getSubmittedAt())
                .build();
    }
}
