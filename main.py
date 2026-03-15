from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from routers import meeting, auth_router
import time
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("meetmind")

load_dotenv()

app = FastAPI(title="MeetMind API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for logging and timing
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    formatted_process_time = "{0:.2f}ms".format(process_time)
    logger.info(f"Method: {request.method} Path: {request.url.path} Status: {response.status_code} Duration: {formatted_process_time}")
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

app.include_router(auth_router.router, prefix="/api")
app.include_router(meeting.router, prefix="/api")


@app.get("/")
async def root():
    return {"status": "MeetMind API is running"}
