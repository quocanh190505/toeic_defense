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
- **Cơ chế lỗi trong code:** Câu truy vấn SQL được tạo bằng cách cộng chuỗi trực tiếp từ input username:
  ```java
  String sql = "SELECT * FROM users WHERE username = '" + username + "' AND role = 'USER'";
  ```
- **Khai thác (Attack Payload):**
  - Kẻ tấn công có thể đăng nhập vào bất kỳ tài khoản học viên nào (VD: `student1`) mà không cần mật khẩu.
  - Gửi body JSON với payload loại bỏ phần kiểm tra phía sau bằng ký tự comment (`-- ` hoặc `#`):
    ```json
    {
      "username": "' OR '1'='1' -- ",
      "password": "any_password"
    }
    ```
- **Kết quả trước khi khắc phục:** 
  - Câu truy vấn SQL trở thành: `WHERE username = '' OR '1'='1' -- ' AND role = 'USER'`.
  - Toàn bộ điều kiện kiểm tra đằng sau (gồm cả việc lọc theo Role) đã bị vô hiệu hóa vì dấu `-- ` (comment). Mệnh đề `OR '1'='1'` luôn đúng với mọi dòng dữ liệu, do đó CSDL sẽ trả về toàn bộ User.
  - Sau đó code Backend của hệ thống sẽ tự động lọc và đăng nhập vào tài khoản đầu tiên mang quyền Học viên (thường là `student1`).
  - Điểm nguy hiểm nhất: Kẻ tấn công **không cần phải đoán tên đăng nhập (`admin` hay `student1`)** và **không cần biết mật khẩu**, vẫn lập tức có được phiên đăng nhập hợp lệ với Token (`USER`) để tạo tiền đề cho việc thực hiện tiếp bài Lab thứ hai (Leo thang đặc quyền).

#### 2. Giải pháp khắc phục (Secure Implementation):
- **Endpoint an toàn:** `POST /api/auth/loginSecure`
- **Cơ chế phòng thủ:**
  1. Sử dụng Spring Data JPA Repository (`userRepository.findByUsername(username)`) thực thi câu truy vấn qua **PreparedStatement** (tham số hóa Parameter Binding). Câu truy vấn không thể bị bẻ cong.
  2. Mật khẩu được băm (BCrypt) và kiểm định nghiêm ngặt qua `passwordEncoder.matches()`. Mọi nỗ lực SQLi đều bị từ chối trả về `401 Unauthorized`.

---

### 🔴 DEMO 2: Leo thang đặc quyền qua Mass Assignment (Auto-binding / Over-posting)

#### 1. Nguyên lý lỗ hổng (API3:2023 Broken Object Property Level Authorization):
Hệ thống cung cấp một API cập nhật hồ sơ cá nhân thiếu an toàn tại `PUT /api/users/profile`. Cụ thể, thay vì sử dụng Data Transfer Object (DTO) làm màng lọc, framework tự động binding (ánh xạ) toàn bộ dữ liệu từ HTTP Request Body trực tiếp vào Entity `User`. Ở Service layer, lập trình viên sử dụng `BeanUtils.copyProperties(updateData, currentUser)` để copy dữ liệu.
Bằng kỹ thuật Mass Assignment, kẻ tấn công có thể chèn thêm các trường nhạy cảm ẩn (`role`, `isVerified`, `balance`) vào payload JSON để tự động ghi đè thuộc tính nội bộ của đối tượng trong Database.

#### 2. Trình tự Khai thác Chuỗi (Tiếp nối trực tiếp từ Demo 1):
- **Bước 1 (Kế thừa Phiên truy cập):** Trực tiếp kế thừa thành quả từ bài Lab 1. Sau khi vọt quyền thành công bằng payload SQL Injection kinh điển (' OR '1'='1), hacker lúc này ĐÃ lọt được vào bên trong hệ thống với tư cách là một người dùng (quyền USER). Không cần bận tâm đến việc thu thập tài khoản nữa, kẻ tấn công đi thẳng đến tính năng **Cập nhật Hồ sơ**.
- **Bước 2 (Gài bẫy Payload qua Burp Suite):** Tại giao diện cập nhật, hacker quyết định đổi username cũ thành một tên hoàn toàn mới, ví dụ student_hacked. Khi bấm Lưu, hacker dùng Burp Suite bắt chặn Request gửi đến máy chủ (URL lỗi: PUT /users/api/users/profile).
- **Bước 3 (Thực thi Mass Assignment):** Hacker cố tình lồng ghép thêm trường 
ole mang giá trị tối cao vào trong nội dung JSON để ép máy chủ phân quyền:
    `json
    {
      "username": "student_hacked",
      "role": "ADMIN"
    }
    `
- **Bước 4 (Nâng quyền thành công):** Nhấn Send. Vì endpoint Backend thiết kế cẩu thả không sử dụng màng lọc DTO, hàm BeanUtils tự động ghi đè luôn thuộc tính 
ole trong cơ sở dữ liệu. Hacker thành công thay đổi vai vế của tài khoản đang mượn thành ADMIN (Phản hồi 200 OK hiển thị dấu hiệu cờ ADMIN).
- **Bước 5 (Trở thành Quản trị viên):** Hacker đăng xuất hệ thống. Tiến hành vòng lại Form đăng nhập và dùng SQL Injection thêm một lần nữa đối với phần Tài Khoản, chỉ cần gõ đúng cái tên vừa đổi: student_hacked' -- . Đăng nhập trót lọt, hệ thống cấp phát phiên làm việc mới, và nhờ cơ sở dữ liệu đã lưu chữ ADMIN, ứng dụng hiển thị luôn giao diện Quản trị Hệ thống. Toàn bộ kịch bản thâu tóm hoàn tất!

#### 3. Cấu trúc 2 API song song (So sánh Vulnerable vs Safe):
Hệ thống backend đã được thiết lập sẵn **2 điểm cuối (endpoints)** để minh họa cả lỗ hổng và cách vá:
- ❌ **API Chứa lỗ hổng (Khai thác):** `PUT /api/users/profile`
  - *Method:* `updateOwnProfileVulnerableLab(@RequestBody User request)`
  - Sử dụng trực tiếp Entity làm parameter và map trực tiếp qua `BeanUtils`, không dùng màng lọc.
- ✅ **API An toàn (Giải pháp khắc phục phòng thủ):** `PUT /users/me`
  - *Method:* `updateOwnProfile(@RequestBody @Valid SafeProfileUpdateRequest request)`
  - Sử dụng **DTO (Data Transfer Object)** có chức năng như một **Whitelist**, chặn đứng hoàn toàn các injection không tặc. Hệ thống tự động vứt bỏ biến này vì nó không tồn tại trong class DTO `SafeProfileUpdateRequest`.

### 🔴 DEMO 3: SQL Injection Search & MySQL Database Fingerprinting

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
- **Bước 4 (Kết luận & Khắc phục):** Nắm quyền truy cập ROOT dễ dàng mà không tốn tài nguyên dò mật khẩu. Khắc phục duy nhất là luôn nâng cấp cấu hình máy chủ MySQL lên phiên bản vá lỗi (>= 5.5.24 hoặc 8.x LTS hiện nay như TOEIC Defense đang cấu hình).


> **Liên kết Kịch bản:** Khi Hacker lấy được quyền 
oot của Database ở bước này, hệ lụy sinh ra là vô cùng khủng khiếp (Có thể xóa sạch dữ liệu, tước quyền máy chủ). Đó là lúc cơ chế phòng thủ ở DEMO 5 phát huy tác dụng.


---

### 🟢 GIAI ĐOẠN PHÒNG THỦ TỔNG LỰC & TÁI THIẾT HỆ THỐNG
*Kết luận sau 4 Demo đầu: Hệ thống cũ (chạy qua Docker cổng 3307 với MySQL 5.x) bộc lộ quá nhiều lỗ hổng chí mạng. Nhóm ra quyết định: ĐÓNG CỬA hoàn toàn máy chủ Docker cũ. Tiến hành di dời toàn bộ sang phiên bản MySQL mới nhất trên máy chủ gốc (Cổng 3306) và áp dụng các tiêu chuẩn an ninh bậc nhất.*

---

### 🟢 DEMO 5: Chặn đứng thảm họa bằng "Least Privilege" (Trên hệ thống mới 3306)

#### 1. Tư duy phòng thủ
Kể cả khi đã nâng cấp lên MySQL xịn nhất, chúng ta tuyệt đối KHÔNG bao giờ đi vào lối mòn cũ là để Backend ứng dụng sử dụng mật khẩu root. 
**Giải pháp:** Áp dụng nguyên tắc "Least Privilege" (Đặc quyền tối thiểu), tạo riêng một tài khoản nội bộ cho API chỉ có quyền Đọc/Ghi dữ liệu thường ngày, KHÔNG CÓ bất kỳ quyền thao tác cấu trúc (DDL) nào.

#### 2. Cấu hình thực hành dành cho nhóm (Tại MySQL Native 3306)
Thành viên mở MySQL Command Line (hoặc Navicat kết nối vào cổng 3306) và chạy chuỗi lệnh:

`sql
-- 1. Tạo tài khoản cấp thấp bảo vệ Backend
CREATE USER 'toeic_app'@'localhost' IDENTIFIED BY 'AppSecurePass2026!';

-- 2. Chỉ cấp quyền Thao tác Dữ liệu (DML). TUYỆT ĐỐI không cấp quyền hệ thống.
GRANT SELECT, INSERT, UPDATE, DELETE ON toeic_db.* TO 'toeic_app'@'localhost';

-- 3. Khóa quyền, áp dụng ngay
FLUSH PRIVILEGES;
`
*(Trong Source Code, sửa file pplication.yml trỏ về url: jdbc:mysql://localhost:3306/toeic_db và dùng username 	oeic_app nói trên).*

#### 3. Trình diễn nghiệm thu
Đóng vai hacker vừa cố vọt quyền chui được vào thông qua tài khoản này, cố ý gõ lệnh tàn phá bằng: 
DROP TABLE users;
=> **MySQL 8.x lập tức tát văng yêu cầu:** ERROR 1142 (42000): DROP command denied to user...
Quyền năng của Hacker bị trói chặt lại. Chặn đứng một thảm họa hệ thống!

---

### 🟢 DEMO 6 (CHỐT HẠ): Vòng an toàn cuối cùng - Sao lưu Cơ Sở Dữ Liệu (Database Backup)

#### 1. Lời dẫn chốt hạ (Tại sao phải Backup?)
> *"Thưa ban giám khảo, kể cả khi chúng ta sở hữu mã hóa bảo mật hiện đại nhất, phân cấp đặc quyền tuyệt đối đến đâu, hệ thống CSDL vẫn không thể chống lại được thảm họa vật lý (cháy nổ máy chủ) hay sự phá hoại của mã độc mã hóa (Ransomware). Do đó, chốt chặn sinh tử cuối cùng của mọi tiêu chuẩn An Toàn Thông Tin ISO:27001 phải là: SAO LƯU DỮ LIỆU ĐỊNH KỲ".*

#### 2. Thực hành sao lưu dành cho nhóm 
Chứng minh khả năng phản ứng và khôi phục khi hệ thống sập. Từ cửa sổ Terminal / PowerShell của máy gốc (Windows/Linux), thành viên sử dụng công cụ mysqldump để sinh file dự phòng:


# Lệnh sao lưu toàn bộ cấu trúc và dữ liệu của toeic_db ra một tệp tin an toàn
mysqldump -u root -p toeic_db > backup_toeic_db_2026.sql
`
*(Ấn Enter và nhập mật khẩu root của máy bạn).*

**Kết quả màn trình diễn:** 
Ngay lập tức, một tệp tin ackup_toeic_db_2026.sql sẽ được tự sinh ra tại thư mục hiện hành. Bạn hãy bấm mở file này lên giới thiệu cho các thầy cô xem: Bên trong chứa tất cả các lịch sử bảng biểu, câu hỏi, điểm thi. Giờ đây, nếu Database hỏng nặng đứt gãy, kỹ sư chỉ việc ném file này vào máy chủ là toàn bộ ngôi trường TOEIC sẽ sống lại nguyên vẹn trong 5 phút!

**Lời kết vỗ tay:** Nhờ Sự kết hợp của "Vá lỗi lập trình DTO/SQLi" + "Nâng cấp, phân quyền cơ sở (Least Privilege)" + "Quy trình chống thảm họa Backup", TOEIC Defense System lúc này đã trở thành một pháo đài bất khả xâm phạm! Nhóm xin phép kết thúc phần Demo!

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
| `PUT` | `/api/users/profile` | Authenticated | (Lab) Endpoint minh họa khai thác Mass Assignment |

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
