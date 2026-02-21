import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const API_BASE_URL = 'http://localhost:3000/';
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { arg }) => {
    if (typeof arg === 'object' && arg.headers) {
      Object.entries(arg.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        }
      });
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

const createMainBaseQuery = () => baseQuery;
export default createMainBaseQuery;
