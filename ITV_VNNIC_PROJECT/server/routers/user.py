import fastapi
from fastapi import Response, Depends

from fastapi import HTTPException
from ..models.user import User, SignInModel, ChangePasswordModel, SignUpModel
from ..services.user import create_user_service, authenticate_user_service, update_password_service
from ..middleware.security import validate_token, generate_token
import json

router_user = fastapi.APIRouter()


@router_user.post('/signup')
async def sign_up(signup_data: SignUpModel):
    try:
        user = User(**signup_data.dict())
        create_user_service(user)
        res = {
            "message": "Đăng ký thành công",
            "status": 200
        }
        return Response(status_code=200, content=json.dumps(res))
    except Exception as error:
        print(error)
        res = json.dumps({"message": "Lỗi"})
        return Response(status_code=404, content=res)


@router_user.post('/signin')
async def sign_in(signin_data: SignInModel):
    try:
        is_auth, user = authenticate_user_service(
            signin_data.username, signin_data.password)
        if (is_auth):
            token = generate_token(signin_data.username)
            return {'token': token, 'username': signin_data.username, 'role': user['role']}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as error:
        print(error)
        res = json.dumps({"message": "Lỗi"})
        return Response(status_code=404, content=res)


@router_user.post('/changepassword', dependencies=[Depends(validate_token)])
async def change_password(change_password_data: ChangePasswordModel):
    try:
        return update_password_service(change_password_data.username, change_password_data.current_password, change_password_data.new_password)
    except Exception as error:
        print(error)
        res = json.dumps({"message": "Lỗi"})
        return Response(status_code=404, content=res)
