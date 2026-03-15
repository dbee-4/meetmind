from dotenv import load_dotenv
import os
import json
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("Key found:", api_key[:15] if api_key else "NOT FOUND")
genai.configure(api_key=api_key)
model = genai.GenerativeModel("models/gemini-2.5-flash")


def analyze_transcript(title: str, transcript: str, participants: list) -> dict:
    """
    Sends a meeting transcript to Gemini and returns a structured analysis dict.
    Uses a deterministic formula and enforced scoring rules.
    """
    try:
        # Instruction for the AI to follow a specific scoring logic
        user_prompt = f"""
You are an expert meeting analyst. Analyze this meeting transcript carefully and objectively.
You must be consistent, deterministic, and follow the exact rules provided below.

Meeting Title: {title}
Participants: {participants}
Transcript:
{transcript}

Analyze the transcript and return ONLY a valid JSON object with NO markdown, NO backticks, NO extra text.

Rules for sentiment detection:
- positive: speaker expresses enthusiasm, agreement, praise, excitement
- neutral: speaker makes factual statements, asks questions, gives updates, agrees calmly
- negative: speaker expresses CLEAR disagreement, frustration, complaints, or conflict

IMPORTANT: Calm agreement like 'I agree' or 'sounds good' or factual statements 
are NEUTRAL not negative. Only mark someone negative if they explicitly 
express frustration, strong disagreement, or complaints.

Rules for scoring:
1. Engagement Score (0-100 per person): 
   - Base the score on ACTUAL speaking frequency and contribution quality.
   - CRITICAL: If a participant has NEGATIVE sentiment, their engagement score MUST be significantly lower than those with positive or neutral sentiment.
   - CRITICAL RULE: A participant with NEGATIVE sentiment MUST have a lower engagement score than participants with POSITIVE sentiment. Bob is negative so Bob's score must be the lowest.
2. Health Score Calculation:
   - You MUST calculate the final health_score using this exact formula:
     health_score = (average_engagement * 0.4) + (positive_sentiment_ratio_out_of_100 * 0.3) + (has_action_items_score * 0.3)
   - average_engagement: Mean of all participant engagement scores.
   - positive_sentiment_ratio: Percentage of participants with positive sentiment (0 to 100).
   - has_action_items_score: 100 if there are clear next steps, 0 otherwise.
3. Follow-ups (Guaranteed):
   - Every single participant in the meeting MUST have at least one follow-up action item listed.
   - If someone was passive, their follow-up should be "Review meeting notes and provide feedback."

IMPORTANT: sentiment_timeline must have exactly ONE entry per participant showing their OVERALL dominant sentiment across the entire transcript. Do NOT create multiple entries for the same person.

Return this exact structure:
{{
  "health_score": <calculated_integer>,
  "summary": "<2-3 sentence summary>",
  "engagement": {{
    "<participant_name>": <integer 0-100>
  }},
  "sentiment_timeline": [
    {{"speaker": "<name>", "sentiment": "<positive|neutral|negative>"}}
  ],
  "follow_ups": {{
    "<name>": ["<action item 1>", "<action item 2>"]
  }}
}}
"""

        # Setting temperature=0 for maximum consistency/determinism
        generation_config = genai.types.GenerationConfig(temperature=0)
        
        response = model.generate_content(
            user_prompt, 
            generation_config=generation_config
        )

        raw_text = response.text
        
        # Clean up markdown code blocks
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0]
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0]

        result = json.loads(raw_text.strip())
        return result

    except json.JSONDecodeError as e:
        return {
            "error": "Failed to parse Gemini response as JSON",
            "details": str(e),
            "health_score": 0,
            "summary": "Analysis failed due to a JSON parsing error.",
            "engagement": {},
            "sentiment_timeline": [],
            "follow_ups": {},
        }
    except Exception as e:
        return {
            "error": "Unexpected error during analysis",
            "details": str(e),
            "health_score": 0,
            "summary": "Analysis failed due to an unexpected error.",
            "engagement": {},
            "sentiment_timeline": [],
            "follow_ups": {},
        }
