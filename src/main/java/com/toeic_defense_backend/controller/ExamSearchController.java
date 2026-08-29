package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.response.ExamSearchResponse;
import com.toeic_defense_backend.service.ExamSearchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExamSearchController {

    ExamSearchService examSearchService;

    @GetMapping("/searchUnsafe")
    public List<ExamSearchResponse> searchUnsafe(
            @RequestParam(defaultValue = "") String keyword
    ) {
        return examSearchService.searchUnsafe(keyword);
    }

    @GetMapping("/search")
    public List<ExamSearchResponse> search(
            @RequestParam(defaultValue = "") String keyword
    ) {
        return examSearchService.search(keyword);
    }
}
