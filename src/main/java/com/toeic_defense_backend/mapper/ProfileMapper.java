package com.toeic_defense_backend.mapper;

import com.toeic_defense_backend.dto.request.ProfileCreationRequest;
import com.toeic_defense_backend.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Profile toProfile(ProfileCreationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updateProfile(
            @MappingTarget Profile profile,
            ProfileCreationRequest request
    );
}
