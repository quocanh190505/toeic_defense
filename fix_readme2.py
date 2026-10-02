import re
with open('README.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith('### 🛠 DEMO 2:'):
        skip = True
        new_demo2 = '''### 🛠 DEMO 2: Leo thang đặc quyền qua Mass Assignment (Auto-binding / Over-posting)

#### 1. Nguyên lý lỗ hổng (API3:2023 Broken Object Property Level Authorization):
Hệ thống cung cấp một API cập nhật hồ sơ cá nhân thiếu an toàn tại `PUT /api/users/profile`. Cụ thể, thay vì sử dụng Data Transfer Object (DTO) làm màng lọc, framework tự động binding (ánh xạ) toàn bộ dữ liệu từ HTTP Request Body trực tiếp vào Entity `User`. Ở Service layer, lập trình viên sử dụng `BeanUtils.copyProperties(updateData, currentUser)` để copy dữ liệu.
Bằng kỹ thuật Mass Assignment, kẻ tấn công có thể chèn thêm các trường nhạy cảm ẩn (`role`, `isVerified`, `balance`) vào payload JSON để tự động ghi đè thuộc tính nội bộ của đối tượng trong Database.

#### 2. Trình tự thực hành khai thác (Exploit):
- **Bước 1 (Đăng nhập):** Sử dụng tài khoản `student1` / `123456` để lấy JWT token hợp lệ.
- **Bước 2 (Chỉ định Payload độc hại):** Thay vì chỉ gửi `username`, kẻ tấn công bổ sung thêm các thuộc tính nhạy cảm có trong cấu trúc `User` Entity (như `role`, `isVerified`, `balance`) vào JSON payload.
- **Bước 3 (Thực thi Request với Postman/Burp Suite/cURL hoặc chạy test scripts):** 
  - Đánh trực tiếp vào endpoint `PUT /api/users/profile` của backend:
    ```json
    {
      "username": "student1_hacked",
      "role": "ADMIN",
      "isVerified": true,
      "balance": 999999
    }
    ```
- **Bước 4 (Tiến hành khai thác):** Nhấn Send. Hệ thống trả về `200 OK` hiển thị rõ thông tin phản hồi có chứa các cờ `role`, `isVerified`, `balance` vừa bị thao túng thành công!
- **Bước 5 (Kiểm chứng quyền lực):** Tiến hành Đăng xuất. Đăng nhập lại bằng API chuẩn bảo mật (`POST /api/auth/loginSecure`) với `student1_hacked`/`123456`. Lúc này, bạn đã sở hữu phiên làm việc của **ADMIN** và có toàn quyền kiểm soát hệ thống!

#### 3. Cấu trúc 2 API song song (So sánh Vulnerable vs Safe):
Hệ thống backend đã được thiết lập sẵn **2 điểm cuối (endpoints)** để minh họa cả lỗ hổng và cách vá:
- ❌ **API Chứa lỗ hổng (Khai thác):** `PUT /api/users/profile`
  - *Method:* `updateOwnProfileVulnerableLab(@RequestBody User request)`
  - Sử dụng trực tiếp Entity làm parameter và map trực tiếp qua `BeanUtils`, không dùng màng lọc.
- ✅ **API An toàn (Giải pháp khắc phục phòng thủ):** `PUT /users/me`
  - *Method:* `updateOwnProfile(@RequestBody @Valid SafeProfileUpdateRequest request)`
  - Sử dụng **DTO (Data Transfer Object)** có chức năng như một **Whitelist**, chặn đứng hoàn toàn các injection không tặc. Cho dù Hacker có cố thêm `"role": "ADMIN"` vào body ở API này, hệ thống tự động vứt bỏ biến này vì nó không tồn tại trong class DTO `SafeProfileUpdateRequest`.

'''
        new_lines.append(new_demo2)
        continue
    
    if skip and line.startswith('### 🛠 DEMO 3:'):
        skip = False
    
    if not skip:
        # Also replace the summary table entry
        if '| `/users/me/lab-vulnerable`' in line:
            line = '| `PUT` | `/api/users/profile` | Authenticated | (Lab) Cố ý có lỗi Mass Assignment |\n'
        new_lines.append(line)

with open('README.md', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
