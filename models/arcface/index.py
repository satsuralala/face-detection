import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
from insightface.data import get_image as ins_get_image

app = FaceAnalysis(providers=['CUDAExecutionProvider', 'CPUExecutionProvider'])
app.prepare(ctx_id=0, det_size=(640, 640))
img = ins_get_image('t1')
faces = app.get(img)
embeddings = []
for face in faces:
    embedding = face.embedding  # 512-d vector
    embeddings.append(embedding)

print("Number of faces detected:", len(embeddings))
print("Embedding vector shape:", embeddings[0].shape)

np.save("./embeddings/t1_embedding.npy", embeddings[0])
