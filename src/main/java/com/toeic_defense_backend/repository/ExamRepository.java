package com.toeic_defense_backend.repository;

import com.toeic_defense_backend.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    boolean existsByTitle(String title);
}
