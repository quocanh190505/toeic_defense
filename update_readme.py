import os
import re

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\README.md'

with open(filepath, 'r', encoding='utf-8') as f:
    readme = f.read()

# 1. Update DEMO 1 (Authentication Bypass)
# Update payload and description to match the code (logging in as `student1` bypassing password)

demo1_new = """### 🔴 DEMO 1: SQL Injection Login & Authentication Bypass

#### 1. Lỗ hổng (Unsafe Endpoint):
- **Endpoint:** `POST /api/auth/loginUnsafe`
- **Cơ chế lỗi trong code:** Câu truy vấn SQL được tạo bằng cách cộng chuỗi trực tiếp từ input username:
  ```java
  String sql = "SELECT * FROM users WHERE username = '" + username + "' AND role = 'USER'";
  ```
- **Khai thác (Attack Payload):**
  - Kẻ tấn công có thể đăng nhập vào bất kỳ tài khoản học viên nào (VD: `student1`) mà không cần mật khẩu.
  - Gửi body JSON với payload loại bỏ phần kiểm tra phía sau bằng ký tự comment (`-- ` hoặc `#`):
    ```json
    {
      "username": "student1' -- ",
      "password": "any_password"
    }
    ```
  - Hoặc payload luôn đúng để lấy tài khoản người dùng đầu tiên:
    ```json
    {
      "username": "xyz' OR '1'='1",
      "password": "any_password"
    }
    ```
- **Kết quả trước khi khắc phục:** 
  - Tại payload thứ nhất, câu lệnh trở thành `WHERE username = 'student1' -- ' AND role = 'USER'`. Hệ thống bỏ qua phần điều kiện phía sau và so khớp mật khẩu cũng bị bỏ qua hoàn toàn.
  - Kẻ tấn công đăng nhập thành công vào tài khoản `student1` mà **không cần biết mật khẩu**, máy chủ cấp JWT Token với quyền học viên (`USER`). (Lưu ý: Backend có code chặn cứng việc login bằng `ADMIN` qua cổng này, tạo tiền đề cho bài Lab Leo thang đặc quyền).

#### 2. Giải pháp khắc phục (Secure Implementation):
- **Endpoint an toàn:** `POST /api/auth/loginSecure`
- **Cơ chế phòng thủ:**
  1. Sử dụng Spring Data JPA Repository (`userRepository.findByUsername(username)`) thực thi câu truy vấn qua **PreparedStatement** (tham số hóa Parameter Binding). Câu truy vấn không thể bị bẻ cong.
  2. Mật khẩu được băm (BCrypt) và kiểm định nghiêm ngặt qua `passwordEncoder.matches()`. Mọi nỗ lực SQLi đều bị từ chối trả về `401 Unauthorized`."""

readme = re.sub(r'### 🔴 DEMO 1: SQL Injection Login & Authentication Bypass.*?#### 2\. Giải pháp khắc phục \(Secure Implementation\):.*?trả về `401 Unauthorized` hoặc `400 Bad Request`\.', demo1_new, readme, flags=re.DOTALL)

# 2. Update DEMO Leo thang đặc quyền (Detailed Steps)
demo2_new = """### 🔴 DEMO 2: Leo thang đặc quyền qua Mass Assignment (Privilege Escalation)

#### 1. Nguyên lý lỗ hổng:
Hệ thống có API bảo vệ an toàn `PUT /users/me`, tuy nhiên có để lọt một endpoint phục vụ kiểm thử là `PUT /users/me/lab-vulnerable`. Model dữ liệu (DTO) của endpoint này nhận ánh xạ trường `role` tự do từ JSON payload trực tiếp vào Object User. Bằng kỹ thuật Mass Assignment, học viên (USER) có thể tự phong mình làm ADMIN.

#### 2. Trình tự các bước thực hành khai thác bằng Burp Suite:
- **Bước 1 (Đăng nhập):** Sử dụng tài khoản `student1` / `123456` (hoặc khai thác từ lỗ hổng DEMO 1) để lấy token đăng nhập hợp lệ.
- **Bước 2 (Chặn bắt request):** Mở giao diện "Hồ sơ cá nhân", bật tính năng **Intercept is ON** trên Burp Suite. Ấn nút "👤 Thay đổi tài khoản" và tiến hành lưu thay đổi tên đăng nhập.
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
- **Bước 4 (Tiến hành khai thác):** Nhấn Send. Trả về `200 OK` cho thấy hồ sơ được cập nhật thành công xuống Database.
- **Bước 5 (Kiểm chứng quyền lực):** Đăng xuất và đăng nhập lại bằng tên đăng nhập mới (`student1_hacked`). Lúc này, tài khoản của bạn đã được gắn Role **ADMIN**. Bạn ngay lập tức có quyền truy cập vào thanh Menu "Admin" và quản lý toàn bộ hệ thống!

#### 3. Giải pháp khắc phục:
Trong API thực tế (`/users/me`), sử dụng DTO khắt khe (`SafeProfileUpdateRequest`) loại bỏ hoàn toàn trường `role`. Tuyệt đối không cho map trường chứa quyền từ Request của người dùng vào Entity."""

readme = re.sub(r'### 🔴 DEMO: Leo thang đặc quyền qua Mass Assignment.*?thay đổi role trong endpoint quản trị có phân quyền\.', demo2_new, readme, flags=re.DOTALL)

# 3. Add CVE-2012 Testing Steps at the very end of section 6
cve2012_demo = """

### 🔴 DEMO 4: Tái hiện lỗ hổng cơ sở dữ liệu CVE-2012-2122 (MySQL Authentication Bypass)

#### 1. Giới thiệu CVE-2012-2122
Trong giai đoạn năm 2012, các nhánh phiên bản MySQL (điển hình như 5.1.61, 5.5.22) được biên dịch trên môi trường nhân Linux với hàm `memcmp()` trả về giá trị vượt quá phạm vi [-128, 127], dẫn đến việc hàm so sánh mật khẩu vô tình đánh giá là khớp ở tỷ lệ `1/256`. 
Tin tặc có thể đăng nhập vào **root** của CSDL bằng một mật khẩu sai mà không cần tốn quá nhiều sức.

#### 2. Trình tự tiến hành kiểm thử thực nghiệm:
- **Bước 1 (Dựng môi trường dễ bị tấn công):** Đảm bảo bạn đang cài đặt và chạy container MySQL/MariaDB thuộc các bản Build lỗi (ví dụ MariaDB 5.2.11 hoặc MySQL 5.5.23 Ubuntu compiled).
- **Bước 2 (Chạy kịch bản Bruteforce One-Liner):** 
  Mở Bash shell hoặc Terminal Linux để thực hiện đánh bom liên tục vào MySQL Server cục bộ bằng một mật khẩu sai (VD: `wrong_pass`). Chạy vòng lặp lệnh:
  ```bash
  for i in $(seq 1 300); do 
      mysql -u root -p'wrong_pass' -h 127.0.0.1 -e 'SELECT USER(), VERSION();' && echo "Bypass Success!" && break
  done
  ```
- **Bước 3 (Quan sát kết quả):** Hệ thống sẽ trả về lỗi `Access denied` liên tục. Tuy nhiên trung bình khoảng 256 lần thử (~ tích tắc), lệnh sẽ chen ngang thành công và trả về bảng `USER() - VERSION()` với dòng "Bypass Success!".
- **Bước 4 (Kết luận & Khắc phục):** Nắm quyền truy cập ROOT dễ dàng mà không tốn tài nguyên dò mật khẩu. Khắc phục duy nhất là luôn nâng cấp cấu hình máy chủ MySQL lên phiên bản vá lỗi (>= 5.5.24 hoặc 8.x LTS hiện nay như TOEIC Defense đang cấu hình)."""

# We'll just replace "### 🔴 DEMO 3: Cơ chế bảo mật MySQL Least Privilege & User Separation"
# with itself + the new DEMO 4.
readme = readme.replace("### 🔴 DEMO 3: Cơ chế bảo mật MySQL Least Privilege & User Separation", "### 🔴 DEMO 3: Cơ chế bảo mật MySQL Least Privilege & User Separation")
if "DEMO 4: Tái hiện lỗ hổng cơ sở dữ liệu CVE-2012-2122" not in readme:
    # Append it after DEMO 3 block
    demo3_pattern = r"(### 🔴 DEMO 3: Cơ chế bảo mật MySQL Least Privilege & User Separation.*?Không thể sử dụng các hàm nguy hiểm như `LOAD_FILE\(\)` hoặc `INTO OUTFILE` để trích xuất file nhạy cảm `/etc/passwd` hay ghi Web Shell\.)"
    readme = re.sub(demo3_pattern, r"\1" + cve2012_demo, readme, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(readme)
