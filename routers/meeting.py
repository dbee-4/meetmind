from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session
from database import get_db, User
from models.meeting import MeetingUpload, MeetingResponse, MeetingHistoryItem
from services.meeting_service import MeetingService
from dependencies import get_current_user

router = APIRouter(tags=["meetings"])


@router.post("/analyze", response_model=MeetingResponse)
async def analyze_meeting(
    meeting: MeetingUpload, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return MeetingService.analyze_and_save_meeting(db, meeting, current_user)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/meetings", response_model=List[MeetingHistoryItem])
async def get_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MeetingService.get_user_meetings(db, current_user)
