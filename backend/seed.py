from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from models import Feedback, ETLJob

PROGRAMS = [
    "Java Backend Development",
    "Python for Data Science",
    "React & Frontend Engineering",
    "Cloud Computing with AWS",
    "DevOps & CI/CD Pipelines",
    "SQL & Database Design",
    "Agile & Scrum Fundamentals",
    "Cybersecurity Essentials",
]

PARTICIPANTS = [
    "Aarav Mehta", "Priya Sharma", "Ravi Kumar", "Sneha Iyer", "Karthick Rajan",
    "Divya Nair", "Arjun Patel", "Meera Krishnan", "Vikram Reddy", "Ananya Singh",
    "Rohit Gupta", "Lakshmi Venkat", "Suresh Babu", "Pooja Desai", "Nikhil Joshi",
    "Kavya Pillai", "Deepak Rao", "Harini Mohan", "Aditya Shah", "Swati Bansal",
    "Rahul Verma", "Nandita Bose", "Sanjay Nair", "Tanya Kapoor", "Manoj Tiwari",
    "Ritika Choudhary", "Vijay Srinivas", "Pallavi Ghosh", "Akash Dubey", "Shreya Mishra",
]

COMMENTS = {
    5: [
        "Outstanding training! The instructor explained every concept with real-world examples. Highly recommend to everyone.",
        "Best program I've attended in years. Practical hands-on sessions made the difference.",
        "Exceeded all my expectations. The content was thorough and the pace was perfect.",
        "Fantastic sessions! I gained immense confidence in applying these skills at work.",
        "Brilliant course structure. Learned more in these sessions than months of self-study.",
        "The trainer was incredibly knowledgeable and patient. The exercises were very well designed.",
        "Top-notch content delivery. I immediately applied what I learned in my current project.",
    ],
    4: [
        "Very good training overall. A few advanced topics could use more depth but the foundation is solid.",
        "Great program. The labs were practical and relevant. Looking forward to the advanced module.",
        "Really helpful sessions. The content was well-structured and easy to follow.",
        "Good course with lots of practical exercises. Minor areas to improve in timing.",
        "Enjoyed the training thoroughly. Would appreciate more case studies in future batches.",
        "Well-organized curriculum. Trainer was approachable and answered all questions clearly.",
        "Solid training experience. The real-world examples made complex topics easy to understand.",
    ],
    3: [
        "Decent training. Covered the basics well but expected more advanced content.",
        "Average experience. Some sessions felt rushed. Would benefit from more practice time.",
        "Content was relevant but delivery could be improved. More interactive exercises would help.",
        "Moderate training. The fundamentals were covered but the pacing was inconsistent.",
        "Okay course overall. Some topics were explained very quickly. More examples needed.",
    ],
    2: [
        "Below expectations. The content was too basic and did not match the advertised level.",
        "Needs significant improvement. Several topics were skipped due to time constraints.",
        "Disappointing. Expected hands-on labs but most sessions were lecture-only.",
    ],
    1: [
        "Very poor experience. The trainer was unprepared and the material was outdated.",
        "Completely missed the mark. The schedule was not followed and content was irrelevant.",
    ],
}

RATING_WEIGHTS = [1, 2, 3, 12, 18]


def seed_database(db: Session) -> None:
    if db.query(Feedback).count() >= 5:
        return

    now = datetime.utcnow()
    random.seed(42)

    records = []
    for i in range(50):
        rating = random.choices([1, 2, 3, 4, 5], weights=RATING_WEIGHTS)[0]
        days_ago = random.randint(1, 90)
        hours_ago = random.randint(0, 23)
        submitted_at = now - timedelta(days=days_ago, hours=hours_ago)

        records.append(Feedback(
            participant_name=random.choice(PARTICIPANTS),
            program_name=random.choice(PROGRAMS),
            rating=rating,
            comments=random.choice(COMMENTS[rating]),
            submitted_at=submitted_at,
        ))

    db.bulk_save_objects(records)

    etl_files = [
        ("batch_import_jan_2026.csv", 20, 0, 1, 19),
        ("training_data_feb_2026.xlsx", 15, 1, 0, 14),
        ("q1_feedback_dump.csv", 18, 2, 2, 14),
    ]
    for idx, (fname, total, invalid, dupes, imported) in enumerate(etl_files):
        valid = total - invalid
        db.add(ETLJob(
            filename=fname,
            status="completed",
            total_records=total,
            valid_records=valid,
            invalid_records=invalid,
            duplicate_records=dupes,
            imported_records=imported,
            created_at=now - timedelta(days=60 - idx * 20),
            completed_at=now - timedelta(days=60 - idx * 20, minutes=-2),
        ))

    db.commit()
