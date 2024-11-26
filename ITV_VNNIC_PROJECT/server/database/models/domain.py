from pydantic import BaseModel
from datetime import datetime

class DomainSchema(BaseModel):
    domain: str
    entropy: float
    percentageDigits: float
    domainLength: int
    specialChars: int
    typeDomain: str
    wordSensitive: str
    metadata: str
    officialDomain: str
    isReview : bool
    note: str
    result: int
    lastUpdate: str