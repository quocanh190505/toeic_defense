package com.toeic_defense_backend.repository;

import com.toeic_defense_backend.entity.ExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {

    List<ExamAnswer> findByExamIdOrderByQuestionNumberAsc(Long examId);
}
