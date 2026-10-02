import re

with open('README.md', 'r', encoding='utf-8') as f:
    text = f.read()

new_demo2 = '''### DEMO 2: Leo thang đặc quyền qua Mass Assignment (Auto-binding / Over-posting)

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
  - Sử dụng **DTO (Data Transfer Object)** có chức năng như một **Whitelist**, chặn đứng hoàn toàn các injection không tặc. Hệ thống tự động vứt bỏ biến này vì nó không tồn tại trong class DTO `SafeProfileUpdateRequest`.'''

# Regex to match the demo 2 section block (from DEMO 2 header to the DEMO 3 header)
pattern = re.compile(r'### [^\n]*DEMO 2:.*?### [^\n]*DEMO 3:', re.DOTALL)
def replacer(match):
    # Prepend the emoji if there was one in DEMO 2? Nah just keep the match start
    # Let me just get the first part
    original = match.group(0)
    emoji_match = re.search(r'### (.*?)DEMO 2:', original)
    prefix = emoji_match.group(1) if emoji_match else ""
    
    emoji_match3 = re.search(r'### (.*?)DEMO 3:', original)
    prefix3 = emoji_match3.group(1) if emoji_match3 else ""
    
    return f"### {prefix}DEMO 2: Leo thang đặc quyền qua Mass Assignment (Auto-binding / Over-posting)\n\n" + \
           new_demo2[new_demo2.find("#### 1"):] + \
           f"\n\n### {prefix3}DEMO 3:"

text = pattern.sub(replacer, text)
text = text.replace('| `/users/me/lab-vulnerable`', '| `/api/users/profile`')
text = text.replace('(Lab) Cố ý có lỗi Mass Assignment', '(Lab) Endpoint minh họa khai thác Mass Assignment')

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(text)
