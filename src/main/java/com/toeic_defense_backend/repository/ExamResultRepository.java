package com.toeic_defense_backend.repository;

import com.toeic_defense_backend.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    List<ExamResult> findByUserIdOrderBySubmittedAtDesc(Long userId);
}
