package com.toeic_defense_backend.service;

import com.toeic_defense_backend.dto.request.ExamAnswerRequest;
import com.toeic_defense_backend.entity.ExamAnswer;

import java.util.List;

public interface ExamAnswerService {

    ExamAnswer createAnswer(ExamAnswerRequest request);

    List<ExamAnswer> getAnswers();

    List<ExamAnswer> getAnswersByExam(Long examId);

    ExamAnswer getAnswer(Long id);

    ExamAnswer updateAnswer(Long id, ExamAnswerRequest request);

    void deleteAnswer(Long id);
}
