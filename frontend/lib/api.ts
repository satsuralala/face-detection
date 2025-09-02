// API configuration and utilities for connecting to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PersonData {
  name: string;
  age: string;
  last_seen_data: string;
  phone_number: string;
  last_seen_location: string;
  add_info: string;
}

export interface PersonResponse {
  status: string;
  person: PersonData & {
    _id: string;
    image_url: string;
  };
}

export interface PersonsListResponse {
  persons: Array<PersonData & {
    _id: string;
    image_url: string;
  }>;
}

// Add a new person with image upload
export async function addPerson(personData: PersonData, imageFile: File): Promise<PersonResponse> {
  const formData = new FormData();
  
  // Add person data as JSON
  formData.append('person', JSON.stringify(personData));
  
  // Add image file
  formData.append('file', imageFile);

  const response = await fetch(`${API_BASE_URL}/info/person`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get list of all persons
export async function getPersons(): Promise<PersonsListResponse> {
  const response = await fetch(`${API_BASE_URL}/info/people`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Health check for the API
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/docs`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}