# service_user.py
from pymongo.collection import Collection
from bson.objectid import ObjectId
from pydantic import BaseModel, ValidationError
from typing import Optional
from fastapi import HTTPException
import bcrypt
import base64

from ..database.mongodb import Users
from ..database.models.user import User


class UserService:
    def __init__(self, user_collection: Collection):
        self.user_collection = user_collection

    def get_user_by_username(self, username: str) -> Optional[dict]:
        return self.user_collection.find_one({"username": username})

    def authenticate_user(self, username: str, password: str) -> bool:
        user = self.get_user_by_username(username)
        if user:
            stored_password = base64.b64decode(
                user['password'].encode('utf-8'))
            if bcrypt.checkpw(password.encode('utf-8'), stored_password):
                return True , user
        return False , None

    def create_user(self, user: User) -> dict:
        if self.get_user_by_username(user.username):
            raise HTTPException(
                status_code=400, detail="Username already exists")

        # Hash the password before storing and encode to Base64
        hashed_password = bcrypt.hashpw(
            user.password.encode('utf-8'), bcrypt.gensalt())
        hashed_password_str = base64.b64encode(hashed_password).decode('utf-8')

        user_dict = user.dict()
        user_dict['password'] = hashed_password_str

        result = self.user_collection.insert_one(user_dict)
        return self.user_collection.find_one({"_id": result.inserted_id})

    def update_password(self, username: str, current_password: str, new_password: str):
        # Authenticate the user with the current password
        if not self.authenticate_user(username, current_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user = self.get_user_by_username(username)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Hash the new password and encode to Base64
        hashed_password = bcrypt.hashpw(
            new_password.encode('utf-8'), bcrypt.gensalt())
        hashed_password_str = base64.b64encode(hashed_password).decode('utf-8')

        # Update the password in the database
        update_result = self.user_collection.update_one(
            {"username": username},
            {"$set": {"password": hashed_password_str}}
        )

        if update_result.modified_count == 0:
            raise HTTPException(
                status_code=500, detail="Failed to update password")
        else:
            print("Update password successfully")
            return "Update password successfully"

    def delete_user_by_name(self, username: str):
        if self.get_user_by_username(username):
            return self.user_collection.delete_one({"username": username})
        else:
            raise HTTPException(
                status_code=400, detail="Username doesn't exists")


user_service = UserService(Users)


def create_user_service(user: User):
    try:
        created_user = user_service.create_user(user)
        print("User created:", created_user)
    except HTTPException as e:
        print(f"HTTP Exception: {e.detail}")


def get_user_by_username_service(username: str):
    user = user_service.get_user_by_username(username)
    if user:
        print("User found:", user)
    else:
        print("User not found")


def authenticate_user_service(username: str, password: str):
    is_authenticated , user = user_service.authenticate_user(username, password)
    print("Authentication successful:", is_authenticated)
    return is_authenticated , user


def delete_user_by_name_service(username: str):
    user_service.delete_user_by_name(username)


def update_password_service(username: str, current_password: str, new_password: str):
    return user_service.update_password(username, current_password, new_password)
