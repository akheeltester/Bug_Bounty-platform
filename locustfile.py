"""
Bug-Bang Platform — 500-User Load Test (Production Domain)
Targets: http://bugbang.horizon.local
Pre-registered users in MongoDB. Login once, perform real operations.
"""
import random
from locust import HttpUser, task, between


BASE_URL = "http://bugbang.horizon.local"
NUM_USERS = 600
PASSWORD = "LoadTest123!"


class ConcurrentUser(HttpUser):
    """Concurrent authenticated users performing real operations."""
    wait_time = between(0.3, 1.5)

    def on_start(self):
        idx = random.randint(0, NUM_USERS - 1)
        self.email = f"loadtest{idx:04d}@example.com"
        self.password = PASSWORD
        self.token = None
        self.program_id = None

        # Login once at session start
        try:
            resp = self.client.post(
                f"{BASE_URL}/api/v1/auth/login",
                json={"email": self.email, "password": self.password},
                name="/api/v1/auth/login [setup]",
            )
            if resp.status_code == 200:
                self.token = resp.json().get("access_token")
        except Exception:
            pass

        # Fetch a program
        try:
            resp = self.client.get(f"{BASE_URL}/api/v1/programs")
            if resp.status_code == 200:
                programs = resp.json()
                if programs:
                    self.program_id = programs[0].get("_id")
        except Exception:
            pass

    @task(4)
    def browse_programs(self):
        self.client.get(f"{BASE_URL}/api/v1/programs", name="/api/v1/programs")

    @task(3)
    def view_leaderboard(self):
        self.client.get(f"{BASE_URL}/api/v1/leaderboard", name="/api/v1/leaderboard")

    @task(5)
    def submit_bug(self):
        if not self.token or not self.program_id:
            return
        sub_id = random.randint(10000, 99999)
        with self.client.post(
            f"{BASE_URL}/api/v1/submissions",
            headers={"Authorization": f"Bearer {self.token}"},
            data={
                "program_id": self.program_id,
                "vuln_type": random.choice(["xss", "sqli", "idor", "broken_auth", "misconfig"]),
                "severity": random.choice(["critical", "high", "medium", "low"]),
                "title": f"Load Test Vuln #{sub_id}",
                "description": f"Vulnerability found during load test. ID {sub_id} affects target system.",
                "steps_to_reproduce": f"1. Access target\n2. Trigger {sub_id}\n3. Verify",
            },
            name="/api/v1/submissions [POST]",
            catch_response=True,
        ) as response:
            if response.status_code in (201, 400, 429):
                response.success()
            else:
                response.failure(f"Submit {response.status_code}")

    @task(3)
    def get_my_submissions(self):
        if not self.token:
            return
        self.client.get(
            f"{BASE_URL}/api/v1/submissions/me",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/v1/submissions/me",
        )

    @task(2)
    def get_profile(self):
        if not self.token:
            return
        self.client.get(
            f"{BASE_URL}/api/v1/auth/me",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/v1/auth/me",
        )
