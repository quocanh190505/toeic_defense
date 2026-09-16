package com.toeic_defense_backend.mapper;

import com.toeic_defense_backend.dto.request.UserCreationRequest;
import com.toeic_defense_backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    User toUser(UserCreationRequest request);

    @Mapping(target = "id", ignore = true)
    void updateUser(
            @MappingTarget User user,
            UserCreationRequest request
    );
}
