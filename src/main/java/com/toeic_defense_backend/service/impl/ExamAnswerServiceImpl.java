package com.toeic_defense_backend.service.impl;

import com.toeic_defense_backend.dto.request.ExamAnswerRequest;
import com.toeic_defense_backend.entity.Exam;
import com.toeic_defense_backend.entity.ExamAnswer;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.repository.ExamAnswerRepository;
import com.toeic_defense_backend.repository.ExamRepository;
import com.toeic_defense_backend.service.ExamAnswerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamAnswerServiceImpl implements ExamAnswerService {

    ExamAnswerRepository examAnswerRepository;
    ExamRepository examRepository;

    @Override
    public ExamAnswer createAnswer(ExamAnswerRequest request) {
        Exam exam = getExam(request.getExamId());

        ExamAnswer answer = ExamAnswer.builder()
                .exam(exam)
                .questionNumber(request.getQuestionNumber())
                .correctAnswer(request.getCorrectAnswer())
                .explanation(request.getExplanation())
                .build();

        return examAnswerRepository.save(answer);
    }

    @Override
    public List<ExamAnswer> getAnswers() {
        return examAnswerRepository.findAll();
    }

    @Override
    public List<ExamAnswer> getAnswersByExam(Long examId) {
        return examAnswerRepository.findByExamIdOrderByQuestionNumberAsc(examId);
    }

    @Override
    public ExamAnswer getAnswer(Long id) {
        return examAnswerRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_ANSWER_NOT_FOUND));
    }

    @Override
    public ExamAnswer updateAnswer(Long id, ExamAnswerRequest request) {
        ExamAnswer answer = getAnswer(id);

        answer.setExam(getExam(request.getExamId()));
        answer.setQuestionNumber(request.getQuestionNumber());
        answer.setCorrectAnswer(request.getCorrectAnswer());
        answer.setExplanation(request.getExplanation());

        return examAnswerRepository.save(answer);
    }

    @Override
    public void deleteAnswer(Long id) {
        examAnswerRepository.delete(getAnswer(id));
    }

    private Exam getExam(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));
    }
}
