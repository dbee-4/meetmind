from sqlalchemy.orm import Session
from database import Meeting, User
from models.meeting import MeetingUpload, MeetingResponse
from services.analyzer import analyze_transcript
from datetime import datetime
from typing import List

class MeetingService:
    @staticmethod
    def analyze_and_save_meeting(db: Session, meeting: MeetingUpload, current_user: User) -> MeetingResponse:
        participant_names = [p.name for p in meeting.participants]

        # 1. External Analysis
        result = analyze_transcript(
            title=meeting.title,
            transcript=meeting.transcript,
            participants=participant_names,
        )

        if "error" in result:
            raise Exception(result["error"])

        # 2. Database Persistance (Linked to current user)
        new_meeting = Meeting(
            user_id=current_user.id,
            title=meeting.title,
            transcript=meeting.transcript,
            health_score=result["health_score"],
            summary=result["summary"],
            engagement=result["engagement"],
            sentiment_timeline=result["sentiment_timeline"],
            follow_ups=result["follow_ups"],
            created_at=datetime.utcnow()
        )
        db.add(new_meeting)
        db.commit()
        db.refresh(new_meeting)

        return MeetingResponse(
            title=meeting.title,
            health_score=result["health_score"],
            summary=result["summary"],
            engagement=result["engagement"],
            sentiment_timeline=result["sentiment_timeline"],
            follow_ups=result["follow_ups"],
        )

    @staticmethod
    def get_user_meetings(db: Session, current_user: User) -> List[Meeting]:
        return db.query(Meeting).filter(Meeting.user_id == current_user.id).order_by(Meeting.created_at.desc()).all()
