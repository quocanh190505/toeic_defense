package com.toeic_defense_backend.repository;

import com.toeic_defense_backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByExamIdOrderByQuestionNumberAsc(Long examId);

    long countByExamId(Long examId);
}
