"""
Bug-Bang — Realistic 100-Participant Competition Simulation
Users are pre-authenticated (login happens during competition setup).
Tests concurrent reads + writes during an active competition.
"""
import random
import requests
from locust import HttpUser, task, between, events


BASE_URL = "http://bugbang.horizon.local"
PASSWORD = "LoadTest123!"


def get_valid_token(email, password):
    try:
        r = requests.post(f"{BASE_URL}/api/v1/auth/login",
            json={"email": email, "password": password}, timeout=5)
        if r.status_code == 200:
            return r.json().get("access_token")
    except:
        pass
    return None


class CompetitionParticipant(HttpUser):
    """
    Simulates a real competition participant:
    - Already logged in (token obtained once)
    - Browses programs, checks leaderboard
    - Submits vulnerability reports
    - Views their own submissions
    """
    wait_time = between(0.5, 3.0)

    def on_start(self):
        self.token = None
        self.program_id = None

        # Try to login with pre-registered users
        for attempt in range(3):
            idx = random.randint(0, 599)
            email = f"loadtest{idx:04d}@example.com"
            self.token = get_valid_token(email, PASSWORD)
            if self.token:
                break

        if not self.token:
            # If can't login, still test public endpoints
            pass

        # Fetch programs
        try:
            r = self.client.get(f"{BASE_URL}/api/v1/programs")
            if r.status_code == 200:
                programs = r.json()
                if programs:
                    self.program_id = programs[0].get("_id")
        except:
            pass

    @task(5)
    def browse_programs(self):
        self.client.get(f"{BASE_URL}/api/v1/programs", name="/api/v1/programs")

    @task(4)
    def view_leaderboard(self):
        self.client.get(f"{BASE_URL}/api/v1/leaderboard", name="/api/v1/leaderboard")

    @task(3)
    def check_profile(self):
        if not self.token:
            return
        self.client.get(
            f"{BASE_URL}/api/v1/auth/me",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/v1/auth/me",
        )

    @task(6)
    def submit_vulnerability(self):
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
                "title": f"Competition Vuln #{sub_id}",
                "description": f"Discovered during competition. Issue {sub_id} allows unauthorized access to system resources.",
                "steps_to_reproduce": f"1. Navigate to target\n2. Exploit {sub_id}\n3. Observe impact",
            },
            name="/api/v1/submissions [POST]",
            catch_response=True,
        ) as resp:
            if resp.status_code in (201, 400, 429):
                resp.success()
            else:
                resp.failure(f"Submit {resp.status_code}")

    @task(3)
    def view_my_submissions(self):
        if not self.token:
            return
        self.client.get(
            f"{BASE_URL}/api/v1/submissions/me",
            headers={"Authorization": f"Bearer {self.token}"},
            name="/api/v1/submissions/me",
        )
