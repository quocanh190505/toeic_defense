package com.toeic_defense_backend.service;





import com.toeic_defense_backend.dto.request.ExamCreationRequest;
import com.toeic_defense_backend.entity.Exam;

import java.util.List;

public interface ExamService {

    Exam createExam(ExamCreationRequest request);

    List<Exam> getExams();

    Exam getExam(Long id);

    Exam updateExam(Long id, ExamCreationRequest request);

    void deleteExam(Long id);
}