import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_register():
    print("Testing Registration...")
    data = {
        "username": "testuser_" + str(int(time.time())),
        "password": "testpass123",
        "name": "Test User",
        "role": "parent",
        "region": "Thiruvananthapuram",
        "email": "test@example.com",
        "phone": "9876543210"
    }
    import time
    data["username"] = "testuser_" + str(int(time.time()))
    
    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

def test_login():
    print("\nTesting Login...")
    data = {
        "username": "parent1",
        "password": "parent123"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    import time
    test_register()
    test_login()
