from src.alert_system import send_alert  # or simple print/log
from src.recognition import cosine_similarity
from models.arcface.index import ArcFaceModel
import cv2
import numpy as np
import sys
sys.path.append('.')


def run_video_detection():
    # Load ArcFace model
    arcface = ArcFaceModel(ctx_id=-1)

    # Load uploaded-photo embeddings
    uploaded_embedding = np.load(
        "./embeddings/uploaded_embeddings/person1.npy")
    print("✅ Loaded facial embedding from profile1.jpg")
    print("🎥 Starting video detection...")

    # Open video feed (0 = default webcam, or path to CCTV/video file)
    cap = cv2.VideoCapture(0)

    threshold = 0.40  # similarity threshold
    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # Detect faces and get embeddings
        face_embedding = arcface.get_embedding_from_frame(frame)

        if face_embedding is not None:
            sim = cosine_similarity(uploaded_embedding, face_embedding)

            # Show similarity score every 30 frames (about 1 second)
            if frame_count % 30 == 0:
                print(f"👤 Face detected! Similarity: {sim:.3f}")

            if sim > threshold:
                print(f"🚨 ALERT! MATCH FOUND! Similarity: {sim:.3f}")
                send_alert(sim, frame)  # log or notify match
        else:
            # Show when no face is detected every 30 frames
            if frame_count % 30 == 0:
                print("❌ No face detected in frame")

        # Optional: display video with bounding boxes
        cv2.imshow("Video Feed", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("🛑 Video detection stopped")


# Run directly if this file is executed
if __name__ == "__main__":
    run_video_detection()
