from fastapi import APIRouter

from .infer import router_infer
from .user import router_user
from .domain import router_domain
# from .content import router_content

router = APIRouter()
router.include_router(router_infer, prefix="/infer", tags=["infer"])
router.include_router(router_user, prefix="/user", tags=["user"])
router.include_router(router_domain, prefix="/domain", tags=["domain"])
