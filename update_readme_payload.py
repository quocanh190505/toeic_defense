import os
import re

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\README.md'

with open(filepath, 'r', encoding='utf-8') as f:
    readme = f.read()

# Replace the payload in DEMO 1 with the one provided by the user.

old_demo1 = """    ```json
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
  - Kẻ tấn công đăng nhập thành công vào tài khoản `student1` mà **không cần biết mật khẩu**, máy chủ cấp JWT Token với quyền học viên (`USER`). (Lưu ý: Backend có code chặn cứng việc login bằng `ADMIN` qua cổng này, tạo tiền đề cho bài Lab Leo thang đặc quyền)."""

new_demo1 = """    ```json
    {
      "username": "' OR '1'='1' -- ",
      "password": "any_password"
    }
    ```
- **Kết quả trước khi khắc phục:** 
  - Câu truy vấn SQL trở thành: `WHERE username = '' OR '1'='1' -- ' AND role = 'USER'`.
  - Toàn bộ điều kiện kiểm tra đằng sau (gồm cả việc lọc theo Role) đã bị vô hiệu hóa vì dấu `-- ` (comment). Mệnh đề `OR '1'='1'` luôn đúng với mọi dòng dữ liệu, do đó CSDL sẽ trả về toàn bộ User.
  - Sau đó code Backend của hệ thống sẽ tự động lọc và đăng nhập vào tài khoản đầu tiên mang quyền Học viên (thường là `student1`).
  - Điểm nguy hiểm nhất: Kẻ tấn công **không cần phải đoán tên đăng nhập (`admin` hay `student1`)** và **không cần biết mật khẩu**, vẫn lập tức có được phiên đăng nhập hợp lệ với Token (`USER`) để tạo tiền đề cho việc thực hiện tiếp bài Lab thứ hai (Leo thang đặc quyền)."""

readme = readme.replace(old_demo1, new_demo1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(readme)
