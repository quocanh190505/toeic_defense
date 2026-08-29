package com.toeic_defense_backend.service;

import com.toeic_defense_backend.dto.response.ExamSearchResponse;

import java.util.List;

public interface ExamSearchService {

    List<ExamSearchResponse> searchUnsafe(String keyword);

    List<ExamSearchResponse> search(String keyword);
}
