package com.toeic_defense_backend.controller;

import com.toeic_defense_backend.dto.request.ProfileCreationRequest;
import com.toeic_defense_backend.dto.request.PersonalProfileUpdateRequest;
import com.toeic_defense_backend.dto.response.ApiResponse;
import com.toeic_defense_backend.dto.response.ProfileResponse;
import com.toeic_defense_backend.entity.Profile;
import com.toeic_defense_backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileController {

    ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getOwnProfile(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        ApiResponse<ProfileResponse> response = ApiResponse.<ProfileResponse>builder()
                .data(toProfileResponse(profileService.getOrCreateOwnProfile(userId)))
                .status(HttpStatus.OK.value())
                .message("Get profile successfully")
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateOwnProfile(
            @RequestBody @Valid PersonalProfileUpdateRequest request,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        ApiResponse<ProfileResponse> response = ApiResponse.<ProfileResponse>builder()
                .data(toProfileResponse(profileService.updateOwnProfile(userId, request)))
                .status(HttpStatus.OK.value())
                .message("Profile updated successfully")
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @RequestBody @Valid ProfileCreationRequest request
    ) {
        ApiResponse<ProfileResponse> apiResponse = ApiResponse.<ProfileResponse>builder()
                .data(toProfileResponse(profileService.createProfile(request)))
                .status(HttpStatus.OK.value())
                .message("Create profile successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getProfiles() {
        ApiResponse<List<ProfileResponse>> apiResponse = ApiResponse.<List<ProfileResponse>>builder()
                .data(profileService.getProfiles().stream()
                        .map(this::toProfileResponse)
                        .collect(Collectors.toList()))
                .status(HttpStatus.OK.value())
                .message("Get profiles successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{profileId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@PathVariable Long profileId) {
        ApiResponse<ProfileResponse> apiResponse = ApiResponse.<ProfileResponse>builder()
                .data(toProfileResponse(profileService.getProfile(profileId)))
                .status(HttpStatus.OK.value())
                .message("Get profile successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileByUserId(@PathVariable Long userId) {
        ApiResponse<ProfileResponse> apiResponse = ApiResponse.<ProfileResponse>builder()
                .data(toProfileResponse(profileService.getProfileByUserId(userId)))
                .status(HttpStatus.OK.value())
                .message("Get profile successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{profileId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable Long profileId,
            @RequestBody @Valid ProfileCreationRequest request
    ) {
        ApiResponse<ProfileResponse> apiResponse = ApiResponse.<ProfileResponse>builder()
                .data(toProfileResponse(profileService.updateProfile(profileId, request)))
                .status(HttpStatus.OK.value())
                .message("Update profile successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{profileId}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable Long profileId) {
        profileService.deleteProfile(profileId);
        return ResponseEntity.noContent().build();
    }

    private ProfileResponse toProfileResponse(Profile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .email(profile.getEmail())
                .phone(profile.getPhone())
                .userId(profile.getUser().getId())
                .username(profile.getUser().getUsername())
                .build();
    }
}
