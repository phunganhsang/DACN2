from pydantic import BaseModel
from datetime import datetime

class InferDomainResponse(BaseModel):
    domain: str
    entropy: float
    percentageDigits: float
    domainLength: int
    specialChars: int
    typeDomain: str
    wordSensitive: str
    metadata: str
    officialDomain: str
    note: str
    result: int
    lastUpdate: str

class ReviewDomainModel(BaseModel):
    domain: str
    typeDomain: str
    result: int
    note:str