import os
import re

filepath = r'F:\toeic-defense-backend\toeic-defense-backend\README.md'

with open(filepath, 'r', encoding='utf-8') as f:
    readme = f.read()

# Update Demo 2 Step 5 to emphasize that they must use SECURE LOGIN to log back in
# and explain WHY SQLi bypass cannot be used to verify the admin role.

text_old = r"- \*\*Bước 5 \(Kiểm chứng quyền lực\):\*\* Đăng xuất và đăng nhập lại bằng tên đăng nhập mới \(`student1_hacked`\)\. Lúc này, tài khoản của bạn đã được gắn Role \*\*ADMIN\*\*\. Bạn ngay lập tức có quyền truy cập vào thanh Menu \"Admin\" và quản lý toàn bộ hệ thống!"

text_new = r"""- **Bước 5 (Kiểm chứng quyền lực):** Đăng xuất và tiến hành **ĐĂNG NHẬP CHÍNH QUY (Secure Login)** bằng Tên đăng nhập mới (`student1_hacked`) và mật khẩu gốc của tài khoản đó (VD: `123456`). Lúc này, tài khoản của bạn đã được gắn Role **ADMIN**. Bạn được cấp thẻ JWT quản trị và ngay lập tức có quyền truy cập thanh Menu "Admin"!
  > **❌ Lưu ý rất quan trọng:** Tuyệt đối KHÔNG ĐƯỢC dùng lại mã Hack SQL Injection (`' OR '1'='1' -- `) để đăng nhập vào test. Lý do là CSDL Backend được code gài độ ưu tiên: Dù bạn có mưu trí SQLi, Code luôn lọc và chỉ cho phép bạn chui vào các tài khoản có Role là `USER`. Nên nếu bạn vừa nâng mình thành `ADMIN`, lệnh Hack SQLi đó sẽ đẩy bạn vào một account học viên khác (hoặc báo lỗi 401), làm bạn lầm tưởng là việc leo quyền thất bại!"""

readme = re.sub(text_old, text_new, readme, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(readme)
