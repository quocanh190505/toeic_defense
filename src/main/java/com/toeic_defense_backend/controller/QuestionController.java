package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.request.QuestionRequest;
import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.response.QuestionResponse;
import com.toeic_defense_backend.entity.Question;
import com.toeic_defense_backend.service.QuestionService;
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
@RequestMapping("/questions")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionController {

    QuestionService questionService;

    @PostMapping
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @RequestBody @Valid QuestionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<QuestionResponse>builder()
                .data(toQuestionResponse(questionService.createQuestion(request)))
                .status(HttpStatus.OK.value())
                .message("Create question successfully")
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestions() {
        return ResponseEntity.ok(ApiResponse.<List<QuestionResponse>>builder()
                .data(questionService.getQuestions().stream()
                        .map(this::toQuestionResponse)
                        .toList())
                .status(HttpStatus.OK.value())
                .message("Get questions successfully")
                .build());
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestionsByExam(
            @PathVariable Long examId
    ) {
        return ResponseEntity.ok(ApiResponse.<List<QuestionResponse>>builder()
                .data(questionService.getQuestionsByExam(examId).stream()
                        .map(this::toQuestionResponse)
                        .toList())
                .status(HttpStatus.OK.value())
                .message("Get questions successfully")
                .build());
    }

    @GetMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestion(
            @PathVariable Long questionId
    ) {
        return ResponseEntity.ok(ApiResponse.<QuestionResponse>builder()
                .data(toQuestionResponse(questionService.getQuestion(questionId)))
                .status(HttpStatus.OK.value())
                .message("Get question successfully")
                .build());
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody @Valid QuestionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.<QuestionResponse>builder()
                .data(toQuestionResponse(questionService.updateQuestion(questionId, request)))
                .status(HttpStatus.OK.value())
                .message("Update question successfully")
                .build());
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }

    private QuestionResponse toQuestionResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .examId(question.getExam().getId())
                .examTitle(question.getExam().getTitle())
                .questionNumber(question.getQuestionNumber())
                .content(question.getContent())
                .optionA(question.getOptionA())
                .optionB(question.getOptionB())
                .optionC(question.getOptionC())
                .optionD(question.getOptionD())
                .build();
    }
}
