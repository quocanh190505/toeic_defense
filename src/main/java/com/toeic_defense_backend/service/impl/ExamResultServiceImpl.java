package com.toeic_defense_backend.service.impl;

import com.toeic_defense_backend.dto.request.SubmitExamRequest;
import com.toeic_defense_backend.dto.request.SubmittedAnswerRequest;
import com.toeic_defense_backend.entity.Exam;
import com.toeic_defense_backend.entity.ExamAnswer;
import com.toeic_defense_backend.entity.ExamResult;
import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.repository.ExamAnswerRepository;
import com.toeic_defense_backend.repository.ExamRepository;
import com.toeic_defense_backend.repository.ExamResultRepository;
import com.toeic_defense_backend.repository.UserRepository;
import com.toeic_defense_backend.service.ExamResultService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamResultServiceImpl implements ExamResultService {

    ExamResultRepository examResultRepository;
    ExamRepository examRepository;
    ExamAnswerRepository examAnswerRepository;
    UserRepository userRepository;

    @Override
    public ExamResult submitExam(Long authenticatedUserId, SubmitExamRequest request) {
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_NOT_FOUND));

        Map<Integer, ExamAnswer> answerKey = examAnswerRepository
                .findByExamIdOrderByQuestionNumberAsc(request.getExamId())
                .stream()
                .collect(Collectors.toMap(
                        ExamAnswer::getQuestionNumber,
                        Function.identity()
                ));

        int correctCount = 0;
        for (SubmittedAnswerRequest submittedAnswer : request.getAnswers()) {
            ExamAnswer correctAnswer = answerKey.get(submittedAnswer.getQuestionNumber());
            if (correctAnswer != null
                    && correctAnswer.getCorrectAnswer()
                    .equalsIgnoreCase(submittedAnswer.getSelectedAnswer())) {
                correctCount++;
            }
        }

        int totalQuestions = answerKey.size();
        double score = totalQuestions == 0
                ? 0.0
                : Math.round((correctCount * 10.0 / totalQuestions) * 100.0) / 100.0;

        ExamResult result = ExamResult.builder()
                .user(user)
                .exam(exam)
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .score(score)
                .submittedAnswers(serializeSubmittedAnswers(request))
                .submittedAt(Instant.now())
                .build();

        return examResultRepository.save(result);
    }

    @Override
    public List<ExamResult> getMyResults(Long authenticatedUserId) {
        return examResultRepository.findByUserIdOrderBySubmittedAtDesc(authenticatedUserId);
    }

    @Override
    public List<ExamResult> getResults() {
        return examResultRepository.findAll();
    }

    @Override
    public ExamResult getResult(Long id) {
        return examResultRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXAM_RESULT_NOT_FOUND));
    }

    private String serializeSubmittedAnswers(SubmitExamRequest request) {
        return request.getAnswers().stream()
                .map(answer -> answer.getQuestionNumber() + ":" + answer.getSelectedAnswer())
                .collect(Collectors.joining(","));
    }
}
