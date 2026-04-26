import urllib.request
import urllib.parse
import json

# Login to get token
login_url = "http://localhost:8000/users/login?username=gavin_barro&password=password"
req = urllib.request.Request(login_url, method="POST")
with urllib.request.urlopen(req) as response:
    res_data = json.loads(response.read().decode())
    token = res_data.get("access_token")
    print("Token:", token)

# Get users
req_users = urllib.request.Request("http://localhost:8000/users/")
with urllib.request.urlopen(req_users) as response:
    users = json.loads(response.read().decode())

target = next((u for u in users if u["username"] == "admin35353351"), None)
if target:
    print("Deleting user ID:", target["user_id"])
    del_url = f"http://localhost:8000/users/{target['user_id']}"
    req_del = urllib.request.Request(del_url, method="DELETE", headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req_del) as response:
            print(response.status)
    except urllib.error.HTTPError as e:
        print(e.code)
        print(e.read().decode())
else:
    print("User not found")
