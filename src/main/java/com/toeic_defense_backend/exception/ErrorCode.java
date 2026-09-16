package com.toeic_defense_backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {

    EXAM_NOT_FOUND(1001, "Exam not found", HttpStatus.NOT_FOUND),
    EXAM_ALREADY_EXISTS(1002, "Exam already exists", HttpStatus.BAD_REQUEST),
    EXAM_ANSWER_NOT_FOUND(1003, "Exam answer not found", HttpStatus.NOT_FOUND),
    QUESTION_NOT_FOUND(1004, "Question not found", HttpStatus.NOT_FOUND),
    EXAM_RESULT_NOT_FOUND(1005, "Exam result not found", HttpStatus.NOT_FOUND),

    USER_NOT_FOUND(2001, "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(2002, "Username already exists", HttpStatus.BAD_REQUEST),

    PROFILE_NOT_FOUND(3001, "Profile not found", HttpStatus.NOT_FOUND),

    UNAUTHENTICATED(4001, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS(4002, "Invalid username or password", HttpStatus.UNAUTHORIZED),
    INVALID_OLD_PASSWORD(4003, "Invalid old password", HttpStatus.BAD_REQUEST),

    INVALID_REQUEST(9001, "Invalid request", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(
            int code,
            String message,
            HttpStatusCode statusCode
    ) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
