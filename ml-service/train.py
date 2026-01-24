import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.neighbors import NearestNeighbors
import pickle

# ================= LOAD DATA =================
data = pd.read_csv("appointments.csv")

# ================= ENCODERS =================
student_encoder = LabelEncoder()
subject_encoder = LabelEncoder()

data["student_enc"] = student_encoder.fit_transform(data["student_id"])
data["subject_enc"] = subject_encoder.fit_transform(data["subject"])

# ================= FEATURES =================
X = data[["student_enc", "subject_enc"]].values

# ================= MODEL =================
model = NearestNeighbors(n_neighbors=3, metric="euclidean")
model.fit(X)

# ================= SAVE ARTIFACTS =================
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(student_encoder, open("student_encoder.pkl", "wb"))
pickle.dump(subject_encoder, open("subject_encoder.pkl", "wb"))

# IMPORTANT: Save ONLY teacher_ids (NOT full DataFrame)
teacher_ids = data["teacher_id"].astype(str).values
pickle.dump(teacher_ids, open("teacher_ids.pkl", "wb"))

print("✅ Model trained and saved successfully")
