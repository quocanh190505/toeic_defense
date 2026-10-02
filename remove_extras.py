import re

path1 = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\entity\User.java'
with open(path1, "r", encoding="utf-8") as f: text1 = f.read()
text1 = re.sub(r'    @Column\(name = "is_verified", columnDefinition = "boolean default false"\)\s+private boolean isVerified;\s+@Column\(precision = 19, scale = 2\)\s+private java\.math\.BigDecimal balance;\n?', '', text1)
with open(path1, "w", encoding="utf-8") as f: f.write(text1)

path2 = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\dto\response\UserResponse.java'
with open(path2, "r", encoding="utf-8") as f: text2 = f.read()
text2 = re.sub(r'\s+private boolean isVerified;\s+private java\.math\.BigDecimal balance;', '', text2)
with open(path2, "w", encoding="utf-8") as f: f.write(text2)

path3 = r'F:\toeic-defense-backend\toeic-defense-backend\src\main\java\com\toeic_defense_backend\controller\UserController.java'
with open(path3, "r", encoding="utf-8") as f: text3 = f.read()
text3 = re.sub(r'\s*\.isVerified\(user\.isVerified\(\)\)\s*\.balance\(user\.getBalance\(\)\)', '', text3)
with open(path3, "w", encoding="utf-8") as f: f.write(text3)

path4 = r'F:\toeic-defense-backend\toeic-defense-backend\test_exploit.py'
with open(path4, "r", encoding="utf-8") as f: text4 = f.read()
text4 = text4.replace(', "isVerified": True, "balance": 999999', '')
with open(path4, "w", encoding="utf-8") as f: f.write(text4)

path5 = r'F:\toeic-defense-backend\toeic-defense-backend\test_lab2.py'
with open(path5, "r", encoding="utf-8") as f: text5 = f.read()
text5 = text5.replace(', "isVerified": True, "balance": 999999', '')
with open(path5, "w", encoding="utf-8") as f: f.write(text5)

path6 = r'F:\toeic-defense-backend\toeic-defense-backend\README.md'
with open(path6, "r", encoding="utf-8") as f: text6 = f.read()
text6 = text6.replace('âm ẩn (`role`, `isVerified`, `balance`) vào payload', 'âm ẩn (`role`) vào payload')
text6 = text6.replace(' Entity (như `role`, `isVerified`, `balance`) vào JSON', ' Entity (chủ yếu là `role`) vào JSON')
text6 = text6.replace(',\n      "isVerified": true,\n      "balance": 999999', '')
text6 = text6.replace('cờ `role`, `isVerified`, `balance` vừa bị thao', 'cờ `role` vừa bị thao')
with open(path6, "w", encoding="utf-8") as f: f.write(text6)
