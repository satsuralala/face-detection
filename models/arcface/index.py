import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis

class ArcFaceModel:
    def __init__(self, ctx_id=0):
        self.app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
        self.app.prepare(ctx_id=ctx_id, det_size=(640, 640))
    
    def get_embedding_from_frame(self, frame):
        """
        Extract facial embedding from a frame/image
        Returns: numpy array of embedding or None if no face detected
        """
        try:
            faces = self.app.get(frame)
            if len(faces) > 0:
                return faces[0].embedding
            return None
        except Exception as e:
            print(f"Error extracting embedding: {e}")
            return None

# Test code (only runs when this file is run directly)
if __name__ == "__main__":
    app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    img = insightface.data.get_image('t1')
    faces = app.get(img)
    embeddings = []
    for face in faces:
        embedding = face.embedding  # 512-d vector
        embeddings.append(embedding)

    print("Number of faces detected:", len(embeddings))
    print("Embedding vector shape:", embeddings[0].shape)

    np.save("./embeddings/t1_embedding.npy", embeddings[0])
