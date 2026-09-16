package com.toeic_defense_backend.service.impl;

import com.toeic_defense_backend.dto.response.ExamSearchResponse;
import com.toeic_defense_backend.repository.unsafe.UnsafeExamSearchRepository;
import com.toeic_defense_backend.service.ExamSearchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamSearchServiceImpl implements ExamSearchService {

    UnsafeExamSearchRepository unsafeExamSearchRepository;

    @Override
    public List<ExamSearchResponse> searchUnsafe(String keyword) {
        return unsafeExamSearchRepository.searchUnsafe(keyword);
    }

    @Override
    public List<ExamSearchResponse> search(String keyword) {
        return unsafeExamSearchRepository.searchSafe(keyword);
    }
}
