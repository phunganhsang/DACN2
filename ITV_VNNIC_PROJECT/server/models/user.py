from pydantic import BaseModel


class User(BaseModel):
    username: str
    password: str
    name: str
    role: str


class SignUpModel(BaseModel):
    username: str
    password: str
    name: str
    role: str = "staff"


class SignInModel(BaseModel):
    username: str
    password: str


class ChangePasswordModel(BaseModel):
    username: str
    current_password: str
    new_password: str
