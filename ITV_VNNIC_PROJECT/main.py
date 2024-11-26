import uvicorn
import sys
import subprocess

from utils.get_config import get_config
from utils.levenshtein_distance import get_levenshtein_distance
from src.preprocessing.filter_fake_domain import is_phishing_url
config = get_config()


def main():
    if len(sys.argv) > 1:
        # command
        command = sys.argv[1]
        match command:
            case "server":
                host = config['server']['host']
                port = config['server']['port']
                uvicorn.run("server:app", host=host, port=port, reload=True)
            case "test":
                import os
                ui_directory = f"{os.getcwd()}/test"
                subprocess.run(["python", "test.py"], cwd=ui_directory)
            case _:  # default case
                s2 = "quoc.com.vn"
                status,list_uy_tin = is_phishing_url(s2)
                if len(list_uy_tin)==0:
                    print(status,s2)
                else:
                    print(list_uy_tin)
                print("Đang Test")
    else:
        print("Usage: python main.py server")


if __name__ == "__main__":
    main()
