# Frontend-Backend Connection Setup

This guide explains how to connect your frontend (Next.js) with your backend (FastAPI) for the person adding functionality.

## Architecture Overview

- **Backend**: FastAPI server with MongoDB and Cloudinary integration
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Connection**: REST API calls using native fetch

## Backend API Endpoints

### Add Person
- **URL**: `POST /info/person`
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `person` (form field): JSON string containing person data
  - `file` (form field): Image file

### Get Persons
- **URL**: `GET /info/people`
- **Response**: JSON array of all persons

## Frontend Implementation

### API Configuration (`/frontend/lib/api.ts`)
- Contains all API functions and TypeScript interfaces
- Configurable backend URL via environment variables
- Error handling for API calls

### Upload Modal (`/frontend/src/components/upload-modal.tsx`)
- Form fields match backend schema exactly
- Real API integration with proper error handling
- File upload with image preview

### Main Page (`/frontend/src/app/page.tsx`)
- Fetches real data from backend
- Displays persons from database
- Refreshes data after adding new persons

## Running the Application

### Option 1: Use the provided script
```bash
./run_dev.sh
```

### Option 2: Manual startup

1. **Start Backend**:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend
- Cloudinary credentials are already configured in the code
- MongoDB connection is handled by the existing database setup

## Data Flow

1. **Adding a Person**:
   - User fills form in frontend modal
   - Frontend calls `addPerson()` API function
   - API sends FormData with person JSON + image file
   - Backend uploads image to Cloudinary
   - Backend saves person data to MongoDB
   - Frontend shows success message and refreshes list

2. **Displaying Persons**:
   - Frontend calls `getPersons()` on page load
   - Backend returns all persons from MongoDB
   - Frontend displays persons with images from Cloudinary URLs

## Key Files Modified

### Backend
- `/backend/app/models/model.py` - Added `image_url` field
- `/backend/app/routes/route.py` - Updated to accept form data

### Frontend
- `/frontend/lib/api.ts` - New API configuration and functions
- `/frontend/src/components/upload-modal.tsx` - Real API integration
- `/frontend/src/app/page.tsx` - Real data fetching and display
- `/frontend/.env.local` - Environment configuration

## Troubleshooting

1. **CORS Issues**: Add CORS middleware to FastAPI if needed
2. **API Connection**: Check that backend is running on port 8000
3. **Image Upload**: Verify Cloudinary credentials are correct
4. **MongoDB**: Ensure MongoDB connection is working

## Testing the Connection

1. Start both servers
2. Open frontend at http://localhost:3000
3. Click "Шинэ хүн" (Add New Person)
4. Fill the form and upload an image
5. Submit - should see success message
6. Person should appear in the list with Cloudinary image URL