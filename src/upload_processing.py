
from src.process_uploaded_photo import process_uploaded_photo
if __name__ == "__main__":
    uploaded_photo_path = "./data/uploaded_photos/profile.jpg"
    process_uploaded_photo(uploaded_photo_path, "person1")
