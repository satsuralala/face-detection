import cv2
import os
from datetime import datetime
from typing import Optional
from loguru import logger
from ..app.config import settings


def send_alert(similarity: float, frame, person_id: Optional[str] = None, location: Optional[str] = None) -> str:
    """Send alert and save match frame"""
    try:
        # Create timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        sim_str = f"{similarity:.3f}".replace(".", "")
        
        # Generate filename
        filename = f"match_{timestamp}_sim_{sim_str}.jpg"
        file_path = os.path.join(settings.alerts_dir, filename)
        
        # Save frame
        cv2.imwrite(file_path, frame)
        
        # Log alert
        logger.warning(f"🚨 ALERT: Match found! Similarity: {similarity:.3f}, Saved: {file_path}")
        
        # Here you can add more alert mechanisms:
        # - Send email notification
        # - Send SMS
        # - Push notification
        # - Webhook to external system
        
        return file_path
        
    except Exception as e:
        logger.error(f"Error sending alert: {e}")
        return ""


def save_latest_match(frame, similarity: float) -> str:
    """Save the latest match frame for quick access"""
    try:
        file_path = os.path.join(settings.alerts_dir, "latest_match.jpg")
        cv2.imwrite(file_path, frame)
        logger.info(f"Latest match saved: {file_path}")
        return file_path
    except Exception as e:
        logger.error(f"Error saving latest match: {e}")
        return ""


def get_alert_count() -> int:
    """Get total number of alerts"""
    try:
        alert_files = [f for f in os.listdir(settings.alerts_dir) if f.startswith("match_")]
        return len(alert_files)
    except Exception as e:
        logger.error(f"Error counting alerts: {e}")
        return 0
