package com.toeic_defense_backend.repository;

import com.toeic_defense_backend.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
