import os

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\service\impl\UserServiceImpl.java'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to change the method signature of updateOwnProfileVulnerableLab
old_method = r'''    @Override
    public User updateOwnProfileVulnerableLab(Long authenticatedUserId, ProfileUpdateRequest request) {
        User user = getUser(authenticatedUserId);

        userRepository.findByUsername(request.getUsername())
                .filter(existingUser -> !existingUser.getId().equals(authenticatedUserId))
                .ifPresent(existingUser -> {
                    throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
                });

        user.setUsername(request.getUsername());
        if (request.getRole() != null && !request.getRole().isBlank()) {
            // Intentionally vulnerable endpoint, isolated for the local lab demo.
            user.setRole(request.getRole().toUpperCase());
        }
        return userRepository.save(user);
    }'''

new_method = r'''    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Override
    public User updateOwnProfileVulnerableLab(Long authenticatedUserId, java.util.Map<String, Object> updateData) {
        User currentUser = getUser(authenticatedUserId);

        // TRUE MASS ASSIGNMENT / AUTO-BINDING BUG (OWASP API3)
        // Lập trình viên sử dụng ObjectMapper hoặc BeanUtils copy trực tiếp dữ liệu từ request lên Object Entity
        // Dẫn đến kẻ tấn công có thể ghi đè bất kỳ trường nào (như role, id)
        try {
            objectMapper.readerForUpdating(currentUser).readValue(objectMapper.writeValueAsString(updateData));
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gán dữ liệu tự động Mass Assignment: " + e.getMessage());
        }

        // Fix case cho chữ ADMIN (hoặc để tự do, MySQL phân biệt hoa thường khi chạy Security).
        if (currentUser.getRole() != null) {
            currentUser.setRole(currentUser.getRole().toUpperCase());
        }

        return userRepository.save(currentUser);
    }'''

content = content.replace(old_method, new_method)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Now UserService.java
filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\service\UserService.java'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("User updateOwnProfileVulnerableLab(Long authenticatedUserId, ProfileUpdateRequest request);",
                          "User updateOwnProfileVulnerableLab(Long authenticatedUserId, java.util.Map<String, Object> updateData);")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

# Now UserController.java
filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\controller\UserController.java'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_controller = r'''    @PutMapping("/me/lab-vulnerable")
    public ResponseEntity<ApiResponse<UserResponse>> updateOwnProfileVulnerableLab(
            @RequestBody @Valid ProfileUpdateRequest request,
            Authentication authentication
    ) {
        Long authenticatedUserId = Long.parseLong(authentication.getName());
        User updatedUser = userService.updateOwnProfileVulnerableLab(authenticatedUserId, request);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(updatedUser))
                .status(HttpStatus.OK.value())
                .message("Lab profile updated successfully")
                .build();
        return ResponseEntity.ok(apiResponse);
    }'''

new_controller = r'''    @PutMapping("/me/lab-vulnerable")
    public ResponseEntity<ApiResponse<UserResponse>> updateOwnProfileVulnerableLab(
            @RequestBody java.util.Map<String, Object> updateData,
            Authentication authentication
    ) {
        Long authenticatedUserId = Long.parseLong(authentication.getName());
        User updatedUser = userService.updateOwnProfileVulnerableLab(authenticatedUserId, updateData);
        ApiResponse<UserResponse> apiResponse = ApiResponse.<UserResponse>builder()
                .data(toUserResponse(updatedUser))
                .status(HttpStatus.OK.value())
                .message("Lab profile updated successfully via Mass Assignment!")
                .build();
        return ResponseEntity.ok(apiResponse);
    }'''

content = content.replace(old_controller, new_controller)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

