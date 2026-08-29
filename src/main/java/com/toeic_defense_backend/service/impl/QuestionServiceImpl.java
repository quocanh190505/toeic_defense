package com.toeic_defense_backend.service.impl;

import com.toeic_defense_backend.dto.request.QuestionRequest;
import com.toeic_defense_backend.entity.Exam;
import com.toeic_defense_backend.entity.Question;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.repository.ExamRepository;
import com.toeic_defense_backend.repository.QuestionRepository;
import com.toeic_defense_backend.service.QuestionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionServiceImpl implements QuestionService {

    QuestionRepository questionRepository;
    ExamRepository examRepository;

    @Override
    public Question createQuestion(QuestionRequest request) {
        Question question = Question.builder()
                .exam(getExam(request.getExamId()))
                .questionNumber(request.getQuestionNumber())
                .content(request.getContent())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .build();

        return questionRepository.save(question);
    }

    @Override
    public List<Question> getQuestions() {
        return questionRepository.findAll();
    }

    @Override
    public List<Question> getQuestionsByExam(Long examId) {
        return questionRepository.findByExamIdOrderByQuestionNumberAsc(examId);
    }

    @Override
    public Question getQuestion(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
    }

    @Override
    public Question updateQuestion(Long id, QuestionRequest request) {
        Question question = getQuestion(id);

        question.setExam(getExam(request.getExamId()));
        question.setQuestionNumber(request.getQuestionNumber());
        question.setContent(request.getContent());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());

        return questionRepository.save(question);
    }

    @Override
    public void deleteQuestion(Long id) {
        questionRepository.delete(getQuestion(id));
    }

    private Exam getExam(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));
    }
}
