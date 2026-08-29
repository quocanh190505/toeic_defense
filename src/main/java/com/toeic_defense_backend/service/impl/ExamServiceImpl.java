package com.toeic_defense_backend.service.impl;




import com.toeic_defense_backend.dto.request.ExamCreationRequest;
import com.toeic_defense_backend.entity.Exam;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.mapper.ExamMapper;
import com.toeic_defense_backend.repository.ExamRepository;
import com.toeic_defense_backend.service.ExamService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;



@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamServiceImpl implements ExamService {

    ExamRepository examRepository;
    ExamMapper examMapper;

    @Override
    public Exam createExam(ExamCreationRequest request) {

        if (examRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.EXAM_ALREADY_EXISTS);
        }

        Exam exam = examMapper.toExam(request);

        return examRepository.save(exam);
    }

    @Override
    public List<Exam> getExams() {
        return examRepository.findAll();
    }

    @Override
    public Exam getExam(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.EXAM_NOT_FOUND)
                );
    }

    @Override
    public Exam updateExam(
            Long id,
            ExamCreationRequest request
    ) {
        Exam exam = getExam(id);

        examMapper.updateExam(exam, request);

        return examRepository.save(exam);
    }

    @Override
    public void deleteExam(Long id) {
        Exam exam = getExam(id);

        examRepository.delete(exam);
    }
}
