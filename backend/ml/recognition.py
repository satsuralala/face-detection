import numpy as np
from typing import Optional, Tuple
import cv2
from loguru import logger


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors"""
    try:
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return dot_product / (norm_a * norm_b)
    except Exception as e:
        logger.error(f"Error calculating cosine similarity: {e}")
        return 0.0


def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate euclidean distance between two vectors"""
    try:
        return np.linalg.norm(a - b)
    except Exception as e:
        logger.error(f"Error calculating euclidean distance: {e}")
        return float('inf')


def compare_faces(embedding1: np.ndarray, embedding2: np.ndarray, threshold: float = 0.4) -> Tuple[bool, float]:
    """Compare two face embeddings and return match result"""
    similarity = cosine_similarity(embedding1, embedding2)
    is_match = similarity >= threshold
    return is_match, similarity


def get_confidence_level(similarity: float) -> str:
    """Get confidence level based on similarity score"""
    if similarity >= 0.7:
        return "high"
    elif similarity >= 0.5:
        return "medium"
    else:
        return "low"
