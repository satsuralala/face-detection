def send_alert(similarity, frame):
    print(f"[ALERT] Match found! Similarity: {similarity:.2f}")
    # Save frame with match for review
    import cv2
    cv2.imwrite("./alerts/match_frame.jpg", frame)
