import os
import cv2
import numpy as np
import sys
sys.path.append('.')
from models.arcface.index import ArcFaceModel

# Initialize ArcFace
arcface = ArcFaceModel(ctx_id=0)


def process_uploaded_photo(photo_path, person_name):
    """
    Detect face, extract embedding, and save it for future comparison.
    Enhanced version with better image preprocessing.
    """
    # Read the uploaded photo
    img = cv2.imread(photo_path)
    if img is None:
        print("Error: Image not found.")
        return

    # Image preprocessing for better face detection
    print("🔄 Processing image...")
    
    # Convert to RGB (OpenCV uses BGR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Resize if image is too large (helps with processing)
    height, width = img.shape[:2]
    if max(height, width) > 800:
        scale = 800 / max(height, width)
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = cv2.resize(img, (new_width, new_height))
        img_rgb = cv2.resize(img_rgb, (new_width, new_height))
        print(f"📏 Resized image to {new_width}x{new_height}")

    # Get embedding
    print("🔍 Detecting face and extracting embedding...")
    embedding = arcface.get_embedding_from_frame(img)
    
    if embedding is None:
        print("❌ No face detected in uploaded photo.")
        print("💡 Tips:")
        print("   - Make sure your face is clearly visible")
        print("   - Good lighting helps")
        print("   - Face should be centered and not too small")
        return

    # Save embedding
    save_path = f"./embeddings/uploaded_embeddings/{person_name}.npy"
    np.save(save_path, embedding)
    print(f"✅ Embedding saved for {person_name} at {save_path}")
    print(f"📊 Embedding shape: {embedding.shape}")
    
    # Test the embedding quality
    test_similarity = cosine_similarity(embedding, embedding)
    print(f"🧪 Self-similarity test: {test_similarity:.3f} (should be 1.0)")


def cosine_similarity(a, b):
    """Calculate cosine similarity between two vectors"""
    from numpy import dot
    from numpy.linalg import norm
    return dot(a, b) / (norm(a) * norm(b))
