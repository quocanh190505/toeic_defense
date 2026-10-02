# TOEIC Defense - Spring Boot & MySQL Security Lab

> **Đề tài nghiên cứu & thực nghiệm:**  
> *"Kiến trúc, các thành phần, tính năng và các cơ chế bảo mật của MySQL. Xây dựng website kết nối database trong MySQL; thực nghiệm một số demo tấn công và triển khai các cơ chế bảo mật của MySQL để khắc phục. Đánh giá hiệu quả trước và sau khi áp dụng giải pháp."*

---

## 📌 1. Giới thiệu tổng quan

**TOEIC Defense** là một hệ thống web full-stack kết hợp giữa **ứng dụng luyện thi TOEIC trực tuyến** hoàn chỉnh và **môi trường kiểm thử an toàn thông tin (Security Lab)** thực tế.

Hệ thống được thiết kế phục vụ 2 mục tiêu song hành:
1. **Nghiệp vụ thực tế:** 
   - **Học viên:** Đăng nhập, tra cứu đề thi, làm bài thi trắc nghiệm trực tuyến có đếm ngược thời gian (timer), nộp bài tự động tính điểm, xem lịch sử làm bài và làm lại bài thi.
   - **Quản trị viên (Admin):** Quản lý ngân hàng đề thi, thêm/sửa/xoá câu hỏi và đáp án, quản lý tài khoản người dùng & phân quyền hệ thống (Role-based Access Control), theo dõi toàn bộ lịch sử thi của học viên.
2. **Security Lab (Minh họa tấn công & Phòng thủ CSDL MySQL):**
   - Trực tiếp mô phỏng các kỹ thuật tấn công phổ biến nhắm vào tầng CSDL (SQL Injection Auth Bypass, Data Extraction & Database Fingerprinting, Privilege Escalation).
   - Triển khai và đối sánh các cơ chế phòng thủ chuyên sâu: **PreparedStatement / Parameter Binding**, **Mã hoá mật khẩu một chiều BCrypt**, **Nguyên tắc đặc quyền tối thiểu (Least Privilege)** và **Phân tách tài khoản MySQL (User Privilege Separation)**.

---

## 🛠 2. Công nghệ sử dụng

- **Ngôn ngữ:** Java 21 LTS
- **Backend Framework:** Spring Boot 4.x / 3.4.x (Spring Web MVC, Spring Data JPA)
- **Bảo mật & Xác thực:** Spring Security, OAuth2 Resource Server, JWT (Nimbus JOSE + JWT), BCrypt Password Encoder
- **Cơ sở dữ liệu:** MySQL Server 8.x (Hỗ trợ cấu hình lab MySQL 5.5.x cho CVE testing)
- **Thư viện phụ trợ:** Lombok, MapStruct
- **Frontend:** HTML5, CSS3 hiện đại, Vanilla JavaScript (Single/Multi-page static app, không phụ thuộc nặng framework bên thứ ba)
- **Build tool:** Maven Wrapper (`mvnw` / `mvnw.cmd`)

---

## 👥 3. Tài khoản mặc định & Tự động khởi tạo dữ liệu

Hệ thống tích hợp sẵn `DataInitializer` (chạy tự động khi ứng dụng khởi động lần đầu):

| Tài khoản (Username) | Mật khẩu (Password) | Vai trò (Role) | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin` | **`ADMIN`** | Quản trị đề thi, câu hỏi, tài khoản người dùng, phân quyền, xem toàn bộ lịch sử thi |
| **`student1`** | `123456` | **`USER`** | Luyện thi TOEIC, nộp bài, xem lịch sử làm bài cá nhân |

> [!NOTE]  
> Mật khẩu được tự động băm bằng thuật toán **BCrypt** trước khi lưu vào bảng `users` trong MySQL.  
> Để đảm bảo tính bảo mật của hệ thống nội bộ, tính năng đăng ký tài khoản tự do ngoài trang chủ đã được khóa (`/api/auth/register` trả về `403 Forbidden`). Việc cấp tài khoản mới được quản lý tập trung bởi Admin tại trang Quản trị.

---

## 🚀 4. Hướng dẫn cài đặt & Chạy ứng dụng

### 4.1. Yêu cầu môi trường
- **JDK 21** hoặc mới hơn: kiểm tra bằng `java -version`
- **MySQL Server 8.x**: kiểm tra bằng `mysql --version`
- **Git**
- Trình duyệt hiện đại (Chrome, Edge, Firefox)
- *(Tùy chọn cho kiểm thử)*: Burp Suite Community / Postman / cURL

### 4.2. Khởi tạo Database MySQL
Mở MySQL Client hoặc MySQL Workbench, tạo cơ sở dữ liệu `toeic_db`:

```sql
CREATE DATABASE IF NOT EXISTS toeic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE toeic_db;
```

*(Tùy chọn)* Nạp sẵn bộ dữ liệu mẫu đề thi TOEIC và tài khoản phân quyền MySQL:
```powershell
mysql -u root -p toeic_db < src/main/resources/demo-mysql-security.sql
```

### 4.3. Cấu hình file `application.properties`
Mở file `src/main/resources/application.properties` và chỉnh sửa mật khẩu MySQL máy của bạn:

```properties
spring.application.name=toeic-defense-backend
spring.datasource.url=jdbc:mysql://localhost:3306/toeic_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Cấu hình cổng chạy ứng dụng (mặc định 8090, có thể chỉnh 8080 nếu cần)
server.port=8090

# Hibernate cấu hình tự động cập nhật bảng
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Khóa bí mật ký JWT
jwt.signerKey=4c6e10c9680cb914433276664cac8c82fa33f0608e022ec374df5379ef5c5ae0116227deeb217afb409231aa67a562e6a57ccf624f88005b8ac3e7769b160f72
```

### 4.4. Biên dịch và khởi chạy
Từ thư mục chứa project (`toeic-defense-backend`):

- **Trên Windows (PowerShell / Command Prompt):**
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
- **Trên Linux / macOS:**
  ```bash
  chmod +x mvnw
  ./mvnw spring-boot:run
  ```

Khi màn hình console xuất hiện dòng chữ thông báo:
```text
Started ToeicDefenseBackendApplication in ... seconds
```
Ứng dụng đã sẵn sàng tại địa chỉ: **`http://localhost:8090`** (hoặc port bạn đã cấu hình).

---

## 🖥 5. Sơ đồ các trang giao diện (Web Frontend)

| Đường dẫn (URL) | Tệp HTML tương ứng | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :--- |
| `http://localhost:8090/login.html` | `login.html` | Đăng nhập hệ thống (hỗ trợ cả mode bảo mật và test lab SQLi) | Public |
| `http://localhost:8090/home.html` | `home.html` | Trang chủ giới thiệu, điều hướng luyện thi | Đã đăng nhập (`USER` / `ADMIN`) |
| `http://localhost:8090/exams.html` | `exams.html` | Danh sách đề thi TOEIC, tìm kiếm đề thi | Đã đăng nhập |
| `http://localhost:8090/exam.html?id={id}` | `exam.html` | Giao diện phòng thi trực tuyến, đếm ngược giờ, nộp bài | Đã đăng nhập |
| `http://localhost:8090/result.html` | `result.html` | Lịch sử làm bài thi cá nhân, lọc theo ngày/trạng thái | Học viên (`USER`) |
| `http://localhost:8090/admin.html` | `admin.html` | Quản trị người dùng, phân quyền, ngân hàng đề thi & câu hỏi | **`ADMIN`** |
| `http://localhost:8090/admin-results.html` | `admin-results.html` | Giám sát kết quả & lịch sử làm bài của toàn bộ học viên | **`ADMIN`** |

> **Tính năng đổi mật khẩu cá nhân:** Tích hợp trực tiếp tại thanh Menu trên tất cả các trang nội bộ qua nút **"🔑 Đổi mật khẩu"**, sử dụng API an toàn mã hóa BCrypt.

---

## 🎯 6. Kịch bản thực nghiệm Bảo mật (Security Lab)

### 🔴 DEMO 1: SQL Injection Login & Authentication Bypass

#### 1. Lỗ hổng (Unsafe Endpoint):
- **Endpoint:** `POST /api/auth/loginUnsafe`
- **Cơ chế lỗi trong code:** Câu truy vấn SQL được tạo bằng cách cộng chuỗi trực tiếp từ input người dùng:
  ```java
  String sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  ```
- **Khai thác (Attack Payload):**
  - Gửi body JSON:
    ```json
    {
      "username": "admin' OR '1'='1",
      "password": "anything"
    }
    ```
  - Hoặc bypass bằng ký tự comment SQL:
    ```json
    {
      "username": "admin' -- ",
      "password": ""
    }
    ```
- **Kết quả trước khi khắc phục:** Câu lệnh trở thành `WHERE username = 'admin' OR '1'='1' ...`, luôn trả về bản ghi hợp lệ. Kẻ tấn công đăng nhập thành công vào tài khoản `admin` mà **không cần biết mật khẩu**, máy chủ cấp JWT Token với quyền quản trị viên.

#### 2. Giải pháp khắc phục (Secure Implementation):
- **Endpoint an toàn:** `POST /api/auth/loginSecure`
- **Cơ chế phòng thủ:**
  1. Sử dụng Spring Data JPA Repository (`userRepository.findByUsername(username)`) thực thi câu truy vấn qua **PreparedStatement** (tham số hóa Parameter Binding). Input người dùng được xử lý thuần túy là dữ liệu chuỗi (literal data), không thể làm thay đổi cấu trúc cú pháp của lệnh SQL.
  2. Mật khẩu không bao giờ so sánh chuỗi trần trong SQL mà được băm bằng thuật toán một chiều an toàn:
     ```java
     passwordEncoder.matches(request.getPassword(), user.getPassword())
     ```
  3. Mọi payload SQL Injection đưa vào đều bị coi là username không tồn tại, trả về `401 Unauthorized` hoặc `400 Bad Request`.

---

### 🔴 DEMO: Leo thang đặc quyền qua Mass Assignment

- Giao diện `profile.html` chỉ gửi `username`; form không hiển thị trường `role`.
- API thường `PUT /users/me` dùng DTO chỉ có `username` và bỏ qua trường lạ. Endpoint `PUT /users/me/lab-vulnerable` nhận DTO lab có `role` và service áp dụng trường này. Cả hai lấy danh tính tài khoản từ JWT; request không thể chọn userId.
- Thực hành trong ứng dụng lab chạy cục bộ: đăng nhập `student1`, đổi tên/lưu hồ sơ để bắt request API, gửi sang Repeater, đổi URL thành `/users/me/lab-vulnerable` rồi thêm `"role":"ADMIN"` vào JSON. Nếu role được đổi, đăng nhập lại để nhận JWT mới và kiểm tra quyền quản trị.
- Bản lab này cố ý giữ lỗi để học và thử nghiệm trong phạm vi project cục bộ. Khi triển khai thực tế, xóa `role` khỏi DTO và chỉ thay đổi role trong endpoint quản trị có phân quyền.
### 🔴 DEMO 2: SQL Injection Search & MySQL Database Fingerprinting

#### 1. Lỗ hổng & Khai thác Fingerprint (Unsafe Endpoint):
- **Endpoint:** `GET /api/exams/searchUnsafe?keyword={payload}`
- **Cơ chế lỗi:** Ghép chuỗi trong câu lệnh tìm kiếm:
  ```java
  String sql = "SELECT title FROM exams WHERE title LIKE '%" + keyword + "%'";
  ```
- **Khai thác (UNION-Based SQL Injection để trích xuất phiên bản CSDL):**
  - Payload kiểm tra phiên bản MySQL:
    ```text
    ' UNION SELECT VERSION() -- 
    ```
  - URL-encoded payload:
    ```text
    %27%20UNION%20SELECT%20VERSION()%20--%20
    ```
  - Payload trích xuất tên người dùng hiện tại và tên database:
    ```text
    %27%20UNION%20SELECT%20CONCAT(USER(),%20'%20-%20',%20DATABASE(),%20'%20-%20',%20VERSION())%20--%20
    ```

**Ví dụ thực hiện bằng cURL:**
```bash
curl -X GET "http://localhost:8090/api/exams/searchUnsafe?keyword=%27%20UNION%20SELECT%20VERSION()%20--%20" \
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Kết quả trả về:**
```json
[
  {
    "title": "8.0.44"
  }
]
```
> Kẻ tấn công xác định chính xác phiên bản CSDL đang vận hành (MySQL Fingerprinting), từ đó tra cứu các lỗ hổng đã công bố (CVE) tương ứng với phiên bản đó.

#### 2. Giải pháp khắc phục:
- **Endpoint an toàn:** `GET /api/exams/search?keyword={keyword}`
- **Cơ chế phòng thủ:**
  - Sử dụng Parameter Binding trong JPA Query:
    ```java
    @Query("SELECT e FROM Exam e WHERE e.title LIKE %:keyword%")
    List<Exam> searchExams(@Param("keyword") String keyword);
    ```
  - Khi gửi cùng payload trên vào endpoint an toàn, hệ thống chỉ tìm kiếm đề thi nào có tiêu đề chứa chuỗi ký tự `' UNION SELECT VERSION() -- ` và trả về danh sách rỗng (`[]`), loại bỏ hoàn toàn khả năng thực thi lệnh injection.

---

### 🔴 DEMO 3: Cơ chế bảo mật MySQL Least Privilege & User Separation

Một trong những sai lầm bảo mật phổ biến nhất là để ứng dụng web kết nối CSDL bằng tài khoản `root`. Nếu bị SQL Injection, kẻ tấn công có toàn quyền đọc ghi file, drop database hoặc chiếm quyền server.

Trong file `src/main/resources/demo-mysql-security.sql`, giải pháp **Đặc quyền tối thiểu (Least Privilege)** được cấu hình như sau:

```sql
-- 1. Tạo user ứng dụng với đặc quyền giới hạn DML (Data Manipulation Language)
CREATE USER IF NOT EXISTS 'toeic_app'@'localhost' IDENTIFIED BY 'AppPassword123@!';

-- 2. Chỉ cấp quyền đọc và ghi dữ liệu nghiệp vụ, TUYỆT ĐỐI KHÔNG cấp quyền DDL hoặc quyền quản trị
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.* TO 'toeic_app'@'localhost';

-- 3. Tạo user chỉ đọc (dành cho module báo cáo / audit log)
CREATE USER IF NOT EXISTS 'toeic_readonly'@'localhost' IDENTIFIED BY 'ReadOnly123@!';
GRANT SELECT ON toeic_db.* TO 'toeic_readonly'@'localhost';

FLUSH PRIVILEGES;
```

**Đánh giá hiệu quả bảo mật:**
- Ngay cả khi xảy ra lỗi SQL Injection, câu lệnh `DROP TABLE`, `ALTER TABLE` hay truy cập CSDL hệ thống `mysql.*` đều bị MySQL Engine từ chối:
  ```text
  ERROR 1142 (42000): DROP command denied to user 'toeic_app'@'localhost' for table 'users'
  ```
- Không thể sử dụng các hàm nguy hiểm như `LOAD_FILE()` hoặc `INTO OUTFILE` để trích xuất file nhạy cảm `/etc/passwd` hay ghi Web Shell.

---

## 📋 7. Bảng tổng hợp Endpoint API

### Xác thực & Phân quyền (`/api/auth`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/loginSecure` | Public | Đăng nhập an toàn (JPA PreparedStatement + BCrypt) |
| `POST` | `/api/auth/loginUnsafe` | Public | **(Lab)** Đăng nhập lỗi ghép chuỗi SQLi |
| `POST` | `/api/auth/register` | Disabled | Đăng ký công khai (đã khóa - chỉ cấp tài khoản qua Admin) |
| `PUT` | `/api/auth/changePasswordSecure` | Authenticated | Đổi mật khẩu cá nhân an toàn |

### Đề thi & Câu hỏi (`/exams`, `/questions`, `/api/exams`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/exams` | Authenticated | Lấy danh sách tất cả đề thi |
| `GET` | `/exams/{id}` | Authenticated | Lấy thông tin chi tiết một đề thi |
| `POST` | `/exams` | `ADMIN` | Thêm mới đề thi |
| `PUT` | `/exams/{id}` | `ADMIN` | Cập nhật đề thi |
| `DELETE` | `/exams/{id}` | `ADMIN` | Xóa đề thi |
| `GET` | `/questions/exam/{examId}` | Authenticated | Lấy danh sách câu hỏi kèm 4 lựa chọn theo đề thi |
| `POST` | `/questions` | `ADMIN` | Thêm câu hỏi và đáp án đúng |
| `PUT` | `/questions/{id}` | `ADMIN` | Cập nhật câu hỏi và đáp án |
| `DELETE` | `/questions/{id}` | `ADMIN` | Xóa câu hỏi |
| `GET` | `/api/exams/search` | Authenticated | Tìm kiếm đề thi an toàn (Parameterized) |
| `GET` | `/api/exams/searchUnsafe` | Authenticated | **(Lab)** Tìm kiếm lỗi SQLi Fingerprinting |

### Nộp bài & Kết quả thi (`/exam-results`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/exam-results/submit` | Authenticated | Nộp bài thi, chấm điểm tự động và lưu lịch sử |
| `GET` | `/exam-results/me` | Authenticated | Xem lịch sử các lần thi của học viên đang đăng nhập |
| `GET` | `/exam-results` | `ADMIN` | Lấy toàn bộ lịch sử nộp bài của tất cả học viên |

### Quản trị & hồ sơ người dùng (`/users`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | `ADMIN` | Xem danh sách tất cả tài khoản trong hệ thống |
| `POST` | `/users` | `ADMIN` | Tạo mới tài khoản học viên hoặc admin |
| `PUT` | `/users/{id}` | `ADMIN` | Cập nhật username, mật khẩu mới hoặc đổi role |
| `DELETE` | `/users/{id}` | `ADMIN` | Xóa tài khoản người dùng |
| `PUT` | `/users/me` | Authenticated | Cập nhật an toàn, chỉ đổi username |
| `PUT` | `/users/me/lab-vulnerable` | Authenticated | (Lab) Cố ý có lỗi Mass Assignment |

---

## 📂 8. Cấu trúc thư mục nguồn

```text
toeic-defense-backend/
├── pom.xml                               # File cấu hình dependencies Maven
├── mvnw / mvnw.cmd                       # Maven Wrapper thực thi không cần cài sẵn Maven
└── src/
    ├── main/
    │   ├── java/com/toeic_defense_backend/
    │   │   ├── ToeicDefenseBackendApplication.java # Class khởi chạy Spring Boot
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java   # Cấu hình Spring Security, JWT & phân quyền URL
    │   │   │   └── DataInitializer.java  # Tự động nạp tài khoản admin & student1
    │   │   ├── controller/               # REST Controllers xử lý Request
    │   │   ├── dto/                      # Request / Response Transfer Objects
    │   │   ├── entity/                   # JPA Entities (User, Exam, Question, ExamResult, ...)
    │   │   ├── exception/                # Quản lý ngoại lệ tập trung (GlobalExceptionHandler)
    │   │   ├── repository/
    │   │   │   ├── unsafe/               # Các Repository chứa lỗi SQL Injection có chủ đích
    │   │   │   │   ├── UnsafeAuthRepository.java
    │   │   │   │   └── UnsafeExamSearchRepository.java
    │   │   │   └── ...                   # Spring Data JPA Repositories an toàn
    │   │   └── service/                  # Business Logic Layer
    │   └── resources/
    │       ├── application.properties    # Cấu hình DB, Port, JWT SignerKey
    │       ├── demo-mysql-security.sql   # Script SQL phân quyền Least Privilege & data mẫu
    │       └── static/                   # Toàn bộ giao diện Web Frontend
    │           ├── login.html / login.js
    │           ├── home.html / home.js
    │           ├── exams.html / exams.js
    │           ├── exam.html / exam.js
    │           ├── result.html / result.js
    │           ├── admin.html / admin.js
    │           ├── admin-results.html / admin-results.js
    │           ├── change-password.js
    │           └── style.css
    └── test/                             # Unit Test & Integration Test
```

---

## ⚠️ 9. Khuyến cáo & Lưu ý bảo mật

1. **Phạm vi kiểm thử an toàn:**  
   Các endpoint `loginUnsafe` và `searchUnsafe` được xây dựng phục vụ **mục đích học tập, nghiên cứu và diễn tập trong khuôn khổ đề tài**. Tuyệt đối không đưa các endpoint này vào môi trường production hoặc các hệ thống thực tế.
2. **Bảo mật mã nguồn:**  
   Không commit mật khẩu nhạy cảm của CSDL thật lên các kho lưu trữ Git công khai (GitHub public repo). Khuyến khích sử dụng biến môi trường (`Environment Variables`) hoặc file cấu hình riêng biệt (`application-local.properties`).
3. **Tuân thủ đạo đức an toàn thông tin:**  
   Chỉ thực hiện quét và khai thác thử nghiệm (bằng Burp Suite, SQLMap, Kali Linux) trên chính máy cục bộ (localhost) hoặc môi trường lab được cấp phép.
