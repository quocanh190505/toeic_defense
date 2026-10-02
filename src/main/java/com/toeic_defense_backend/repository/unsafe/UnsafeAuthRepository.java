package com.toeic_defense_backend.repository.unsafe;

import com.toeic_defense_backend.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UnsafeAuthRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public User findByUsernameUnsafe(String username) {

        String sql = "SELECT * FROM users " +
                "WHERE username = '" + username + "' " +
                "AND role = 'USER'";

        List<User> users = entityManager
                .createNativeQuery(sql, User.class)
                .getResultList();

        if (users.isEmpty()) {
            return null;
        }

        // Ưu tiên chọn tài khoản có vai trò USER đầu tiên trong danh sách kết quả
        for (User u : users) {
            if ("USER".equalsIgnoreCase(u.getRole())) {
                return u;
            }
        }

        return users.get(0);
    }
}
