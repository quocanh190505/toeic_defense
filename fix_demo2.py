import os

path = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\service\impl\UserServiceImpl.java'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old_method = '''    @Override
    public User updateOwnProfileVulnerableLab(Long authenticatedUserId, ProfileUpdateRequest request) {
        User currentUser = getUser(authenticatedUserId);

        userRepository.findByUsername(request.getUsername())
                .filter(existingUser -> !existingUser.getId().equals(authenticatedUserId))
                .ifPresent(existingUser -> {
                    throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
                });

        // TRUE MASS ASSIGNMENT / AUTO-BINDING BUG (OWASP API3)
        // Thay vì chỉ set cứng từng trường an toàn:
        // currentUser.setUsername(request.getUsername());
        
        // Lập trình viên sử dụng cơ chế Data Binding (như BeanUtils) copy thẳng toàn bộ thuộc tính
        // từ Request DTO vào Entity. Kẻ tấn công có thể chèn trường `role` vào JSON và nó sẽ tự động được copy đè lên SQL!
        org.springframework.beans.BeanUtils.copyProperties(request, currentUser);

        // Đảm bảo MySQL ghi HOA (không bắt buộc, để khớp hệ thống)
        if (currentUser.getRole() != null) {
            currentUser.setRole(currentUser.getRole().toUpperCase());
        }

        return userRepository.save(currentUser);
    }'''

new_method = '''    @Override
    public User updateOwnProfileVulnerableLab(Long authenticatedUserId, User updateData) {
        User currentUser = getUser(authenticatedUserId);

        if (updateData.getUsername() != null) {
            userRepository.findByUsername(updateData.getUsername())
                    .filter(existingUser -> !existingUser.getId().equals(authenticatedUserId))
                    .ifPresent(existingUser -> {
                        throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
                    });
            currentUser.setUsername(updateData.getUsername());
        }

        if (updateData.getEmail() != null) {
            currentUser.setEmail(updateData.getEmail());
        }

        // Framework hoặc mapper (như BeanUtils.copyProperties) copy thẳng toàn bộ:
        org.springframework.beans.BeanUtils.copyProperties(updateData, currentUser, "id", "password");

        if (currentUser.getRole() != null) {
            currentUser.setRole(currentUser.getRole().toUpperCase());
        }

        return userRepository.save(currentUser);
    }'''

c = c.replace(old_method, new_method)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

# Now edit UserController.java
path = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\controller\UserController.java'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

old_ctrl = '''    @PutMapping("/me/lab-vulnerable")
    public ResponseEntity<ApiResponse<UserResponse>> updateOwnProfileVulnerableLab(
            @RequestBody @Valid ProfileUpdateRequest request,
            Authentication authentication
    ) {'''

new_ctrl = '''    @PutMapping("/api/users/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateOwnProfileVulnerableLab(
            @RequestBody User request,
            Authentication authentication
    ) {'''

c = c.replace(old_ctrl, new_ctrl)

# Update toUserResponse mapping
old_resp = '''    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .build();
    }'''

new_resp = '''    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .email(user.getEmail())
                .isVerified(user.isVerified())
                .balance(user.getBalance())
                .build();
    }'''

c = c.replace(old_resp, new_resp)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
