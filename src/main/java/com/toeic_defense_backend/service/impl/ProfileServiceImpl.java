package com.toeic_defense_backend.service.impl;

import com.toeic_defense_backend.dto.request.ProfileCreationRequest;
import com.toeic_defense_backend.entity.Profile;
import com.toeic_defense_backend.entity.User;
import com.toeic_defense_backend.exception.AppException;
import com.toeic_defense_backend.exception.ErrorCode;
import com.toeic_defense_backend.mapper.ProfileMapper;
import com.toeic_defense_backend.repository.ProfileRepository;
import com.toeic_defense_backend.repository.UserRepository;
import com.toeic_defense_backend.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {

    ProfileRepository profileRepository;
    UserRepository userRepository;
    ProfileMapper profileMapper;

    @Override
    public Profile createProfile(ProfileCreationRequest request) {
        if (profileRepository.existsByUserId(request.getUserId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        User user = getUser(request.getUserId());
        Profile profile = profileMapper.toProfile(request);
        profile.setUser(user);

        return profileRepository.save(profile);
    }

    @Override
    public List<Profile> getProfiles() {
        return profileRepository.findAll();
    }

    @Override
    public Profile getProfile(Long id) {
        return profileRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.PROFILE_NOT_FOUND)
                );
    }

    @Override
    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.PROFILE_NOT_FOUND)
                );
    }

    @Override
    public Profile updateProfile(
            Long id,
            ProfileCreationRequest request
    ) {
        Profile profile = getProfile(id);

        if (!profile.getUser().getId().equals(request.getUserId())
                && profileRepository.existsByUserId(request.getUserId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        User user = getUser(request.getUserId());

        profileMapper.updateProfile(profile, request);
        profile.setUser(user);

        return profileRepository.save(profile);
    }

    @Override
    public void deleteProfile(Long id) {
        Profile profile = getProfile(id);

        profileRepository.delete(profile);
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND)
                );
    }
}
