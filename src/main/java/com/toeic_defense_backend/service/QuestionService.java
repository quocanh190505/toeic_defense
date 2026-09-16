package com.toeic_defense_backend.service;

import com.toeic_defense_backend.dto.request.QuestionRequest;
import com.toeic_defense_backend.entity.Question;

import java.util.List;

public interface QuestionService {

    Question createQuestion(QuestionRequest request);

    List<Question> getQuestions();

    List<Question> getQuestionsByExam(Long examId);

    Question getQuestion(Long id);

    Question updateQuestion(Long id, QuestionRequest request);

    void deleteQuestion(Long id);
}
