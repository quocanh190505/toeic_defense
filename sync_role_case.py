import os

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\service\impl\UserServiceImpl.java'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace user.setRole(request.getRole()); with user.setRole(request.getRole().toUpperCase());

old_code = r'''        if (request.getRole() != null && !request.getRole().isBlank()) {
            // Intentionally vulnerable endpoint, isolated for the local lab demo.
            user.setRole(request.getRole());
        }'''

new_code = r'''        if (request.getRole() != null && !request.getRole().isBlank()) {
            // Intentionally vulnerable endpoint, isolated for the local lab demo.
            user.setRole(request.getRole().toUpperCase());
        }'''

content = content.replace(old_code, new_code)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
