package com.toeic_defense_backend.service;

import com.toeic_defense_backend.dto.request.ProfileCreationRequest;
import com.toeic_defense_backend.entity.Profile;

import java.util.List;

public interface ProfileService {

    Profile createProfile(ProfileCreationRequest request);

    List<Profile> getProfiles();

    Profile getProfile(Long id);

    Profile getProfileByUserId(Long userId);

    Profile updateProfile(Long id, ProfileCreationRequest request);

    void deleteProfile(Long id);
}
