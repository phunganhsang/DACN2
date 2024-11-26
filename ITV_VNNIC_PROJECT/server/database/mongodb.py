from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "apikey"
client = MongoClient(uri , server_api= ServerApi('1'))
db = client.project_vnnic

Domains = db["domain"]
Users = db["user"]
