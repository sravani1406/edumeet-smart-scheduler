from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb://127.0.0.1:27017")
db = client["edumeet"]

appointments = db.appointments.find({}, {
    "student": 1,
    "teacher": 1,
    "subject": 1
})

rows = []
for a in appointments:
    rows.append({
        "student_id": str(a["student"]),
        "teacher_id": str(a["teacher"]),
        "subject": a["subject"],
        "booking_count": 1
    })

df = pd.DataFrame(rows)
df.to_csv("appointments.csv", index=False)

print("appointments.csv generated from MongoDB")
