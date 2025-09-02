import os
import uuid
from typing import Optional
from fastapi import UploadFile, HTTPException
from loguru import logger
from ..app.config import settings


def validate_image_file(file: UploadFile) -> bool:
    """Validate uploaded image file"""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Check file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"File extension not allowed. Allowed: {settings.allowed_extensions}"
        )
    
    return True


def save_uploaded_file(file: UploadFile, directory: str) -> str:
    """Save uploaded file and return file path"""
    try:
        # Create directory if it doesn't exist
        os.makedirs(directory, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1].lower()
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(directory, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        logger.info(f"File saved: {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        raise HTTPException(status_code=500, detail="Error saving file")


def get_file_size_mb(file_path: str) -> float:
    """Get file size in MB"""
    try:
        size_bytes = os.path.getsize(file_path)
        return size_bytes / (1024 * 1024)
    except Exception:
        return 0.0


def delete_file(file_path: str) -> bool:
    """Delete file if it exists"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File deleted: {file_path}")
            return True
        return False
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return False


def ensure_directory(directory: str) -> None:
    """Ensure directory exists"""
    os.makedirs(directory, exist_ok=True)

