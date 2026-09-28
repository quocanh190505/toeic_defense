package com.toeic_defense_backend.config;

import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        initAdminAccount();
        initDefaultStudentAccount();
    }

    private void initAdminAccount() {
        Optional<User> existingAdmin = userRepository.findByUsername("admin");

        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .role("ADMIN")
                    .build();

            userRepository.save(admin);
            log.info(">>> [DATA INITIALIZER] Đã khởi tạo tài khoản mặc định: username='admin', password='admin', role='ADMIN'");
        } else {
            User admin = existingAdmin.get();
            boolean needUpdate = false;

            if (!"ADMIN".equals(admin.getRole())) {
                admin.setRole("ADMIN");
                needUpdate = true;
            }

            if (!passwordEncoder.matches("admin", admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode("admin"));
                needUpdate = true;
            }

            if (needUpdate) {
                userRepository.save(admin);
                log.info(">>> [DATA INITIALIZER] Đã cập nhật quyền ADMIN và mật khẩu 'admin' cho tài khoản 'admin'");
            } else {
                log.info(">>> [DATA INITIALIZER] Tài khoản 'admin' với quyền ADMIN đã tồn tại sẵn trong CSDL");
            }
        }
    }

    private void initDefaultStudentAccount() {
        // Đảm bảo có ít nhất 1 tài khoản học viên (role USER) để có dữ liệu cho lab SQL Injection bypass
        boolean hasUser = userRepository.findAll().stream()
                .anyMatch(u -> "USER".equals(u.getRole()));

        if (!hasUser) {
            User student = User.builder()
                    .username("student1")
                    .password(passwordEncoder.encode("123456"))
                    .role("USER")
                    .build();

            userRepository.save(student);
            log.info(">>> [DATA INITIALIZER] Đã khởi tạo tài khoản học viên mẫu: username='student1', role='USER'");
        }
    }
}
