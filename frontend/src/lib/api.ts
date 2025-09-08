import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Person {
  _id: string;
  name: string;
  age: string;
  last_seen_data: string;
  phone_number: string;
  last_seen_location: string;
  add_info: string;
  img: string;
  embedding?: number[];
}

export interface ApiResponse<T> {
  persons?: T[];
  status?: string;
  person?: T;
}

// Get all persons from the API
export const fetchAllPersons = async (): Promise<Person[]> => {
  try {
    const response = await axios.get<ApiResponse<Person>>(`${API_URL}/people`);
    return response.data.persons || [];
  } catch (error) {
    console.error('Error fetching persons:', error);
    throw error;
  }
};

// Get a specific person by ID
export const fetchPersonById = async (id: string): Promise<Person> => {
  try {
    const response = await axios.get<Person>(`${API_URL}/person/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching person:', error);
    throw error;
  }
};

// Create a new person
export const createPerson = async (personData: Omit<Person, '_id'>): Promise<Person> => {
  try {
    const response = await axios.post<ApiResponse<Person>>(`${API_URL}/person`, personData);
    return response.data.person!;
  } catch (error) {
    console.error('Error creating person:', error);
    throw error;
  }
};