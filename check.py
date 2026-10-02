import requests

login_url = "http://localhost:8090/api/auth/loginSecure"
# The user might have changed their username to student1_hacked, so let's log in
res = requests.post(login_url, json={"username": "student1_hacked", "password": "123456"})
print("Secure Login:", res.status_code, res.text)
