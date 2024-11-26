import fastapi
from fastapi import Response, Depends
from fastapi.responses import JSONResponse

from ..models.infer import ReviewDomainModel 
from ..services.domain import DomainService
from ..middleware.security import validate_token, generate_token

router_domain = fastapi.APIRouter()


@router_domain.post('/review', dependencies=[Depends(validate_token)])
async def review_domain(review_domain: ReviewDomainModel):
    try:
        DomainService.update_domain_review(
            domain_name=review_domain.domain, 
            type_domain=review_domain.typeDomain,
            result=review_domain.result, 
            note = review_domain.note
        )
        return JSONResponse(content={"message": "Đã cập nhật sang trạng thái đánh giá"}, status_code=200)
    except Exception as error:
        # print(f"Đã xảy ra lỗi: {error}")
        import traceback
        # traceback.print_exc()
        return JSONResponse(content={"message": str(error)}, status_code=500)


