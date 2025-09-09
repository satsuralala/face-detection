import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis


class ArcFaceModel:
    def __init__(self, ctx_id=0):
        self.app = FaceAnalysis(
            providers=['CPUExecutionProvider', 'CPUExecutionProvider'])
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

    def get_embedding_and_bbox_from_frame(self, frame):
        """
        Extract facial embedding and bounding box from a frame/image
        Returns: tuple (embedding, bbox) or (None, None) if no face detected
        bbox format: [x, y, width, height]
        """
        try:
            faces = self.app.get(frame)
            if len(faces) > 0:
                face = faces[0]
                # Extract bounding box coordinates
                bbox = face.bbox.astype(int)  # [x1, y1, x2, y2]
                # Convert to [x, y, width, height] format
                x, y, x2, y2 = bbox
                width = x2 - x
                height = y2 - y
                bbox_formatted = [x, y, width, height]
                
                return face.embedding, bbox_formatted
            return None, None
        except Exception as e:
            print(f"Error extracting embedding and bbox: {e}")
            return None, None


if __name__ == "__main__":
    app = FaceAnalysis(
        providers=['CPUExecutionProvider', 'CPUExecutionProvider'])
    app.prepare(ctx_id=0, det_size=(640, 640))
    img = insightface.data.get_image('t1')
    faces = app.get(img)
    embeddings = []
    for face in faces:
        embedding = face.embedding
        embeddings.append(embedding)

    print("Number of faces detected:", len(embeddings))
    print("Embedding vector shape:", embeddings[0].shape)

    np.save("./embeddings/t1_embedding.npy", embeddings[0])
