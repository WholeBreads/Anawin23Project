import subprocess
import os
import sys
import webbrowser
import time

def main():
    print("="*50)
    print("Restarting your Social Web App...")
    print("="*50)
    
    # Get the directory where this script is located
    app_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(app_dir)
    print(f"Working directory: {app_dir}")

    print("\nStarting Expo Server with Cache Clearing (-c)...")
    print("1. A QR Code will appear in this terminal.")
    print("2. Scan it with the 'Expo Go' app.")
    print("\nPress Ctrl+C to stop the server.\n")

    # Add Node.js to path if it's not there
    node_path = r"C:\Program Files\nodejs"
    if node_path not in os.environ["PATH"]:
        os.environ["PATH"] = node_path + os.pathsep + os.environ["PATH"]

    # Construct the command with --clear flag to fix caching issues
    cmd = "npx expo start -c"

    try:
        # Run the command
        subprocess.run(cmd, shell=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
