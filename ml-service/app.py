from flask import Flask, request, jsonify
import pickle
import numpy as np

app = Flask(__name__)

# ================= LOAD ARTIFACTS =================
model = pickle.load(open("model.pkl", "rb"))
student_encoder = pickle.load(open("student_encoder.pkl", "rb"))
subject_encoder = pickle.load(open("subject_encoder.pkl", "rb"))
teacher_ids = pickle.load(open("teacher_ids.pkl", "rb"))

@app.route("/", methods=["GET"])
def home():
    return "EduMeet ML Service is running"

@app.route("/recommend-teachers", methods=["POST"])
def recommend_teachers():
    payload = request.json or {}

    student_id = payload.get("student_id")
    subject = payload.get("subject")

    # ================= DEBUG =================
    print("Received student_id:", student_id)
    print("Received subject:", subject)

    # ================= VALIDATION =================
    if (
        student_id not in student_encoder.classes_
        or subject not in subject_encoder.classes_
    ):
        return jsonify({
            "recommended_teachers": [],
            "source": "ml"
        })

    # ================= ENCODE =================
    try:
        student_enc = student_encoder.transform([student_id])[0]
        subject_enc = subject_encoder.transform([subject])[0]
    except Exception as e:
        print("Encoding error:", e)
        return jsonify({
            "recommended_teachers": [],
            "source": "ml"
        })

    # ================= PREDICT =================
    query = np.array([[student_enc, subject_enc]])
    _, indices = model.kneighbors(query)

    # ================= MAP TO TEACHERS =================
    recommended = list(
        set(teacher_ids[i] for i in indices[0])
    )

    return jsonify({
        "recommended_teachers": recommended,
        "source": "ml"
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)
