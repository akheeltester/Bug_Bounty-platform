#!/usr/bin/env python3
"""Pre-register test users in bulk before running Locust load test."""
import requests
import sys
import time
import concurrent.futures

BASE_URL = "http://localhost:25005"
NUM_USERS = 600  # register extra in case of duplicates

def register_user(i):
    email = f"loadtest{i:04d}@test.local"
    data = {
        "email": email,
        "username": f"loaduser{i:04d}",
        "password": "LoadTest123!",
        "full_name": f"Load User {i:04d}",
    }
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/register", json=data, timeout=30)
        return (i, r.status_code, r.json().get("message", ""))
    except Exception as e:
        return (i, 0, str(e))

if __name__ == "__main__":
    print(f"Pre-registering {NUM_USERS} test users...")
    start = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(register_user, i) for i in range(NUM_USERS)]
        done = 0
        for f in concurrent.futures.as_completed(futures):
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{NUM_USERS} submitted...")
    
    elapsed = time.time() - start
    print(f"Done in {elapsed:.1f}s")
    sys.exit(0)
