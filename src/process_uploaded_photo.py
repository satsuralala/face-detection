import os
import cv2
import numpy as np
from models.arcface.index import ArcFaceModel

# Initialize ArcFace
arcface = ArcFaceModel(ctx_id=0)


def process_uploaded_photo(photo_path, person_name):
    """
    Detect face, extract embedding, and save it for future comparison.
    """
    # Read the uploaded photo
    img = cv2.imread(photo_path)
    if img is None:
        print("Error: Image not found.")
        return

    # Get embedding
    embedding = arcface.get_embedding_from_frame(img)
    if embedding is None:
        print("No face detected in uploaded photo.")
        return

    # Save embedding
    save_path = f"./embeddings/uploaded_embeddings/{person_name}.npy"
    np.save(save_path, embedding)
    print(f"Embedding saved for {person_name} at {save_path}")
