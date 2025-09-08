from app.schemas.schema import PersonCreate
from fastapi import APIRouter
from app.models.model import Person
from bson import ObjectId
import numpy as np
import base64
import cv2
from typing import Dict
from models.arcface.index import ArcFaceModel
from ml.recognition import cosine_similarity
from fastapi import FastAPI, HTTPException
from fastapi import WebSocket, WebSocketDisconnect
router = APIRouter()

arcface = ArcFaceModel(ctx_id=0)




@router.get("/person/{id}")
async def get_person(id: str):
    try:
        object_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Person ID format")

    item = await Person.find_one({"_id": object_id})
    if item:
        return item
    else:
        raise HTTPException(status_code=404, detail="Person not found")

active_connections: Dict[str, WebSocket] = {}


@router.websocket("/ws/{id}")
async def start_detection(websocket: WebSocket, id: str):
    await websocket.accept()

    try:
        object_id = ObjectId(id)
        person = await Person.find_one({"_id": object_id})
        if not person or not person.embedding:
            await websocket.send_json({"error": "Person not found or has no embedding"})
            await websocket.close(code=1000, reason="Person not found or has no embedding")
            return

        embedding_array = np.array(person.embedding)
    except Exception:
        await websocket.send_json({"error": "Invalid Person ID"})
        await websocket.close()
        return

    active_connections[id] = websocket
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except WebSocketDisconnect:
                raise
            except Exception as e:

                try:
                    await websocket.send_json({"error": f"receive error: {e}"})
                except Exception:
                    pass
                continue

            img_b64 = data.get("frame")
            if not img_b64:
                continue

            try:
                img_data = base64.b64decode(img_b64.split(",")[-1])
                np_arr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                if img is None:
                    continue
            except Exception as e:
                try:
                    await websocket.send_json({"error": f"decode error: {e}"})
                except Exception:
                    pass
                continue

            try:
                face_embedding = arcface.get_embedding_from_frame(img)
                if face_embedding is not None:
                    sim = cosine_similarity(embedding_array, face_embedding)
                    matched = sim > 0.4
                    await websocket.send_json({
                        "matched": bool(matched),
                        "similarity": float(sim),
                        "name": person.name if bool(matched) else None
                    })
                else:
                    await websocket.send_json({"matched": False})
            except Exception as e:
                try:
                    await websocket.send_json({"error": f"processing error: {e}"})
                except Exception:
                    pass
                continue

    except WebSocketDisconnect:
        active_connections.pop(id, None)
    except Exception as e:

        try:
            await websocket.send_json({"error": f"internal error: {e}"})
            await websocket.close(code=1011)
        except Exception:
            pass


