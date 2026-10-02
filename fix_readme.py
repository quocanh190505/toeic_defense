import re

with open('README.md', 'r', encoding='utf-8') as f:
    c = f.read()

old_demo2 = '''### 🛠 DEMO 2: Leo thang đặc quyền qua Mass Assignment (Privilege Escalation)

#### 1. Nguyên lý lỗ hổng:
Hệ thống có API bảo vệ an toàn `PUT /users/me`, tuy nhiên có để lọt một endpoint phục vụ kiểm thử là `PUT /users/me/lab-vulnerable`. Model dữ liệu (DTO) của endpoint này nhận ánh xạ trường `role` tự do từ JSON payload trực tiếp vào Object User. Bằng kỹ thuật Mass Assignment, học viên (USER) có thể tự phong mình làm ADMIN.

#### 2. Trình tự thực hành khai thác bằng Burp Suite:
- **Bước 1 (Đăng nhập):** Sử dụng tài khoản `student1` / `123456` (hoặc khai thác từ lỗ hổng DEMO 1) để lấy token đăng nhập hợp lệ.
- **Bước 2 (Chặn bắt request):** Mở giao diện "Hồ sơ cá nhân", bật tính năng **Intercept is ON** trên Burp Suite. Ấn nút "💾 Thay đổi tài khoản" và tiến hành lưu thay đổi tên đăng nhập.
- **Bước 3 (Chỉnh sửa HTTP Request):** 
  - Đẩy request vừa chặn được sang công cụ **Repeater** (Ctrl + R).
  - Thay đổi đường dẫn endpoint từ `PUT /users/me` thành `PUT /users/me/lab-vulnerable`.
  - Trong body JSON của request, bổ sung trường `"role"`:
    ```json
    {
      "username": "student1_hacked",
      "role": "ADMIN"
    }
    ```
- **Bước 4 (Tiến hành khai thác):** Nhấn Send. Trả về `200 OK` cho thấy hồ sơ đã được cập nhật thành công xuống Database.
- **Bước 5 (Kiểm chứng quyền lực):** Đăng xuất và tiến hành **ĐĂNG NHẬP CHÍNH QUY (Secure Login)** bằng Tên đăng nhập mới (`student1_hacked`) và mật khẩu gốc của tài khoản đó (VD: `123456`). Lúc này, tài khoản của bạn đã được gán Role **ADMIN**. Bạn được cấp thẻ JWT quản trị và ngay lập tức có quyền truy cập thanh Menu "Admin"!
  > **🚨 Lưu ý rất quan trọng:** Tuyệt đối KHÔNG ĐƯỢC dùng lại mánh Hack SQL Injection (`' OR '1'='1' -- `) để đăng nhập vào test. Lý do là CSDL Backend được code giả định ưu tiên: Dù bạn có mưu trí SQLi, Code luôn lọc và chỉ cho phép bạn chui vào các tài khoản có Role là `USER`. Nên nếu bạn vừa nâng mình thành `ADMIN`, lệnh Hack SQLi đó sẽ đẩy bạn vào một account học viên khác (hoặc báo lỗi 401), làm bạn lầm tưởng là việc leo quyền thất bại!

#### 3. Giải pháp khắc phục:
Trong API thực tế (`/users/me`), sử dụng DTO khắt khe (`SafeProfileUpdateRequest`) loại bỏ hoàn toàn trường `role`. Tuyệt đối không cho map trường chứa quyền từ Request của người dùng vào Entity.'''

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
Hệ thống backend đã được thiết lập sẵn **2 endpoint** để minh họa cả lỗ hổng và cách vá:
- ❌ **API Chứa lỗ hổng (Khai thác):** `PUT /api/users/profile`
  - *Method:* `updateOwnProfileVulnerableLab(@RequestBody User request)`
  - Sử dụng trực tiếp Entity làm parameter và map trực tiếp qua `BeanUtils`, không dùng màng lọc.
- ✅ **API An toàn (Giải pháp khắc phục phòng thủ):** `PUT /users/me`
  - *Method:* `updateOwnProfile(@RequestBody @Valid SafeProfileUpdateRequest request)`
  - Sử dụng **DTO (Data Transfer Object)** có chức năng như một **Whitelist**, chặn đứng hoàn toàn các injection không tặc. Cho dù Hacker có cố thêm `"role": "ADMIN"` vào body ở API này, hệ thống tự động vứt bỏ biến này vì nó không tồn tại trong class DTO `SafeProfileUpdateRequest`.'''

c = c.replace(old_demo2, new_demo2)

with open('README.md', 'w', encoding='utf-8') as f:
    f.write(c)
