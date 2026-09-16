package com.toeic_defense_backend.repository.unsafe;

import com.toeic_defense_backend.dto.response.ExamSearchResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UnsafeExamSearchRepository {

    JdbcTemplate jdbcTemplate;

    public List<ExamSearchResponse> searchUnsafe(String keyword) {
        String sql = "SELECT title FROM exams WHERE title LIKE '%" + keyword + "%'";

        log.warn("[SQLI DEMO] Executing query: {}", sql);

        return jdbcTemplate.query(
                sql,
                (resultSet, rowNumber) -> new ExamSearchResponse(
                        resultSet.getString("title")
                )
        );
    }

    public List<ExamSearchResponse> searchSafe(String keyword) {
        String sql = "SELECT title FROM exams WHERE title LIKE ?";

        return jdbcTemplate.query(
                sql,
                (resultSet, rowNumber) -> new ExamSearchResponse(
                        resultSet.getString("title")
                ),
                "%" + keyword + "%"
        );
    }
}
