import subprocess
import requests
import sys

def deploy(commit_message="Update website content"):
    print(f"Deploying changes with message: '{commit_message}'...")
    subprocess.run(["git", "add", "."], check=True)
    try:
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
    except subprocess.CalledProcessError:
        print("No new changes to commit.")
    
    print("Pushing to GitHub (main)...")
    subprocess.run(["git", "push", "origin", "main"], check=True)
    print("Successfully pushed to GitHub! Hostinger will auto-deploy the changes.")
    
    print("Testing live site...")
    r = requests.get("https://pssglobal.co.in/", timeout=10)
    print(f"[{r.status_code}] https://pssglobal.co.in/ ({len(r.content)} bytes)")

if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "Update website content"
    deploy(msg)
