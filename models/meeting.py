from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class Participant(BaseModel):
    name: str
    role: str

class MeetingUpload(BaseModel):
    title: str
    transcript: str
    participants: List[Participant]

class MeetingResponse(BaseModel):
    title: str
    health_score: int
    summary: str
    engagement: dict
    sentiment_timeline: list
    follow_ups: dict

class MeetingHistoryItem(BaseModel):
    id: int
    title: str
    health_score: int
    summary: str
    created_at: datetime

    class Config:
        from_attributes = True
