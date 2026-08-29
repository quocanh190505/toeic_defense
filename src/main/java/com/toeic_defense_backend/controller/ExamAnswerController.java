package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.request.ExamAnswerRequest;
import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.response.ExamAnswerResponse;
import com.toeic_defense_backend.entity.ExamAnswer;
import com.toeic_defense_backend.service.ExamAnswerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/exam-answers")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamAnswerController {

    ExamAnswerService examAnswerService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExamAnswerResponse>> createAnswer(
            @RequestBody @Valid ExamAnswerRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<ExamAnswerResponse>builder()
                .data(toExamAnswerResponse(examAnswerService.createAnswer(request)))
                .status(HttpStatus.OK.value())
                .message("Create exam answer successfully")
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamAnswerResponse>>> getAnswers() {
        return ResponseEntity.ok(ApiResponse.<List<ExamAnswerResponse>>builder()
                .data(examAnswerService.getAnswers().stream()
                        .map(this::toExamAnswerResponse)
                        .toList())
                .status(HttpStatus.OK.value())
                .message("Get exam answers successfully")
                .build());
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<ApiResponse<List<ExamAnswerResponse>>> getAnswersByExam(
            @PathVariable Long examId
    ) {
        return ResponseEntity.ok(ApiResponse.<List<ExamAnswerResponse>>builder()
                .data(examAnswerService.getAnswersByExam(examId).stream()
                        .map(this::toExamAnswerResponse)
                        .toList())
                .status(HttpStatus.OK.value())
                .message("Get exam answers successfully")
                .build());
    }

    @GetMapping("/{answerId}")
    public ResponseEntity<ApiResponse<ExamAnswerResponse>> getAnswer(
            @PathVariable Long answerId
    ) {
        return ResponseEntity.ok(ApiResponse.<ExamAnswerResponse>builder()
                .data(toExamAnswerResponse(examAnswerService.getAnswer(answerId)))
                .status(HttpStatus.OK.value())
                .message("Get exam answer successfully")
                .build());
    }

    @PutMapping("/{answerId}")
    public ResponseEntity<ApiResponse<ExamAnswerResponse>> updateAnswer(
            @PathVariable Long answerId,
            @RequestBody @Valid ExamAnswerRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<ExamAnswerResponse>builder()
                .data(toExamAnswerResponse(examAnswerService.updateAnswer(answerId, request)))
                .status(HttpStatus.OK.value())
                .message("Update exam answer successfully")
                .build());
    }

    @DeleteMapping("/{answerId}")
    public ResponseEntity<ApiResponse<Void>> deleteAnswer(@PathVariable Long answerId) {
        examAnswerService.deleteAnswer(answerId);
        return ResponseEntity.noContent().build();
    }

    private ExamAnswerResponse toExamAnswerResponse(ExamAnswer answer) {
        return ExamAnswerResponse.builder()
                .id(answer.getId())
                .examId(answer.getExam().getId())
                .examTitle(answer.getExam().getTitle())
                .questionNumber(answer.getQuestionNumber())
                .correctAnswer(answer.getCorrectAnswer())
                .explanation(answer.getExplanation())
                .build();
    }
}
