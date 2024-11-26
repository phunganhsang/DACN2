from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException

from .routers.root import router

try:
    """ try cactch exception to catch error avoid crash app """
    app = FastAPI(timeout_keep_alive=999999999999999999999999999999999999999999999999)  # define app
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(router)
except:
    raise HTTPException(status_code=500, detail="Cannot host app")
