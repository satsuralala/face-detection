import cv2
import numpy as np
from models.arcface.index import ArcFaceModel
from src.recognition import cosine_similarity
from src.alert_system import send_alert  # or simple print/log

# Load ArcFace model
arcface = ArcFaceModel(ctx_id=-1)

# Load uploaded-photo embeddings
uploaded_embedding = np.load("./embeddings/uploaded_embeddings/person1.npy")

# Open video feed (0 = default webcam, or path to CCTV/video file)
cap = cv2.VideoCapture(0)

threshold = 0.70  # similarity threshold

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detect faces and get embeddings
    face_embedding = arcface.get_embedding_from_frame(frame)

    if face_embedding is not None:
        sim = cosine_similarity(uploaded_embedding, face_embedding)
        if sim > threshold:
            send_alert(sim, frame)  # log or notify match

    # Optional: display video with bounding boxes
    cv2.imshow("Video Feed", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
