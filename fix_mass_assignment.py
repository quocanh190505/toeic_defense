import os

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\service\impl\UserServiceImpl.java'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the method
pattern = r'    @Override\s+public User updateOwnProfileVulnerableLab\(Long authenticatedUserId, ProfileUpdateRequest request\) \{.*?(?=    @Override|}$)'
match = re.search(pattern, content, re.DOTALL)
if match:
    old_method = match.group(0)
    
    new_method = r'''    @Override
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
    }
'''
    content = content.replace(old_method, new_method)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("Method not found!")
