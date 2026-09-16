package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.request.ExamCreationRequest;
import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.response.ExamResponse;
import com.toeic_defense_backend.entity.Exam;
import com.toeic_defense_backend.service.ExamService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/exams")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamController {

    ExamService examService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @RequestBody @Valid ExamCreationRequest request
    ) {
        ApiResponse<ExamResponse> apiResponse = ApiResponse.<ExamResponse>builder()
                .data(toExamResponse(examService.createExam(request)))
                .status(HttpStatus.OK.value())
                .message("Create exam successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getExams() {
        ApiResponse<List<ExamResponse>> apiResponse = ApiResponse.<List<ExamResponse>>builder()
                .data(examService.getExams().stream()
                        .map(this::toExamResponse)
                        .collect(Collectors.toList()))
                .status(HttpStatus.OK.value())
                .message("Get exams successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{examId}")
    public ResponseEntity<ApiResponse<ExamResponse>> getExam(@PathVariable Long examId) {
        ApiResponse<ExamResponse> apiResponse = ApiResponse.<ExamResponse>builder()
                .data(toExamResponse(examService.getExam(examId)))
                .status(HttpStatus.OK.value())
                .message("Get exam successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{examId}")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable Long examId,
            @RequestBody @Valid ExamCreationRequest request
    ) {
        ApiResponse<ExamResponse> apiResponse = ApiResponse.<ExamResponse>builder()
                .data(toExamResponse(examService.updateExam(examId, request)))
                .status(HttpStatus.OK.value())
                .message("Update exam successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long examId) {
        examService.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }

    private ExamResponse toExamResponse(Exam exam) {
        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .description(exam.getDescription())
                .build();
    }
}
