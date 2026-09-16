package com.toeic_defense_backend.mapper;

import com.toeic_defense_backend.dto.request.ExamCreationRequest;
import com.toeic_defense_backend.entity.Exam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ExamMapper {

    @Mapping(target = "id", ignore = true)
    Exam toExam(ExamCreationRequest request);

    @Mapping(target = "id", ignore = true)
    void updateExam(
            @MappingTarget Exam exam,
            ExamCreationRequest request
    );
}
