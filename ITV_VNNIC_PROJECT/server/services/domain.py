
from pymongo.collection import Collection
from fastapi import HTTPException
from typing import Optional
import datetime

from ..database.mongodb import Domains
from ..database.models.domain import DomainSchema


class DomainService:
    domain_collection: Collection = Domains

    @staticmethod
    def get_domain_by_name(domain_name: str) -> Optional[dict]:
        return DomainService.domain_collection.find_one({"domain": domain_name})

    @staticmethod
    def create_domain(domain_scheme: DomainSchema):
        if DomainService.get_domain_by_name(domain_scheme.domain):
            return

        domain_dict = domain_scheme.dict()
        DomainService.domain_collection.insert_one(domain_dict)

    @staticmethod
    def update_domain(domain_name: str):
        if not DomainService.get_domain_by_name(domain_name):
            raise HTTPException(status_code=404, detail="Domain not found")

        DomainService.domain_collection.update_one(
            {"domain": domain_name},
            {"$set": {"isReview": False}}
        )
    
    @staticmethod
    def update_domain_review(domain_name: str, type_domain: str, result: int , note: str):
        if not DomainService.get_domain_by_name(domain_name):
            raise HTTPException(status_code=404, detail="Domain not found")
         # Lấy thời gian hiện tại và định dạng theo dd/mm/yyyy
        last_update = datetime.datetime.now().strftime("%d/%m/%Y")
        DomainService.domain_collection.update_one(
            {"domain": domain_name},
            {"$set": {"isReview": True,"typeDomain": type_domain, "result": result, "lastUpdate": last_update , "note" : note}}
        )
    
