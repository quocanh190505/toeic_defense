package com.toeic_defense_backend.service;

import com.toeic_defense_backend.dto.request.SubmitExamRequest;
import com.toeic_defense_backend.entity.ExamResult;

import java.util.List;

public interface ExamResultService {

    ExamResult submitExam(Long authenticatedUserId, SubmitExamRequest request);

    List<ExamResult> getMyResults(Long authenticatedUserId);

    List<ExamResult> getResults();

    ExamResult getResult(Long id);

    void deleteResult(Long id);
}
