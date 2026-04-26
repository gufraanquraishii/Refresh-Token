// api/todoApi.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TODOS_URL = `${API_URL}/todos`;

// Helper: Get token
const getAuthHeader = async () => {
  const session = await getSession();
  const token = session?.accessToken;
  return { Authorization: `Bearer ${token}` };
};

// Pure axios functions - NO TanStack here
export const todoApi = {
  getAll: async () => {
    const { data } = await axios.get(TODOS_URL, { headers: await getAuthHeader() });
    return data;
  },
  
  getById: async (id: string) => {
    const { data } = await axios.get(`${TODOS_URL}/${id}`, { headers: await getAuthHeader() });
    return data;
  },
  
  create: async (todo: { title: string; description?: string }) => {
    const { data } = await axios.post(TODOS_URL, todo, { headers: await getAuthHeader() });
    return data;
  },
  
  update: async (id: string, todo: { title?: string; completed?: boolean }) => {
    const { data } = await axios.put(`${TODOS_URL}/${id}`, todo, { headers: await getAuthHeader() });
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await axios.delete(`${TODOS_URL}/${id}`, { headers: await getAuthHeader() });
    return data;
  },
  
  toggle: async (id: string) => {
    const { data } = await axios.patch(`${TODOS_URL}/${id}/toggle`, {}, { headers: await getAuthHeader() });
    return data;
  },
};