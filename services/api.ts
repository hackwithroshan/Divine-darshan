import axios from 'axios';
import { Temple, Service, Testimonial, Booking, User, SeasonalEvent, PrasadSubscription } from '../types';

/**
 * Intelligently parses an error object (especially from Axios) to return a user-friendly string.
 * @param {any} error The error object caught in a catch block.
 * @returns {string} A user-friendly error message.
 */
export const getApiErrorMessage = (error: any): string => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx.
            // The backend sends errors as { success: false, message: '...' }
            return error.response.data?.message || `Error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
            // The request was made but no response was received
            return 'No response from server. Please check your network connection.';
        }
    }
    // Something happened in setting up the request that triggered an Error or it's a non-Axios error.
    return error.message || 'An unexpected error occurred.';
};

const getBaseUrl = () => {
    // Check if the app is in production mode (which our build script sets).
    // If it is, use the relative path for Vercel's routing.
    // Otherwise (in local development), use the absolute path to the local backend server.
    if (process.env.NODE_ENV === 'production') {
        return '/api';
    }
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Interceptor to add the auth token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('divine_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const loginUser = (data: any) => api.post('/auth/login', data);
export const registerUser = (data: any) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');


// Temple API
export const getTemples = (): Promise<{ data: { data: Temple[] } }> => api.get('/temples');
export const getTempleById = (id: number): Promise<{ data: { data: Temple } }> => api.get(`/temples/${id}`);
export const addTemple = (templeData: Partial<Temple>) => api.post('/temples', templeData);
export const updateTemple = (id: number, templeData: Partial<Temple>) => api.put(`/temples/${id}`, templeData);
export const deleteTemple = (id: number) => api.delete(`/temples/${id}`);

// Service API
export const getServices = (): Promise<{ data: { data: Service[] } }> => api.get('/services');
export const addService = (serviceData: Partial<Service>) => api.post('/services', serviceData);
export const updateService = (id: number, serviceData: Partial<Service>) => api.put(`/services/${id}`, serviceData);
export const deleteService = (id: number) => api.delete(`/services/${id}`);

// Content API
export const getTestimonials = (): Promise<{ data: { data: Testimonial[] } }> => api.get('/content/testimonials');
export const getSeasonalEvent = (): Promise<{ data: { data: SeasonalEvent } }> => api.get('/content/seasonalevent');
export const updateSeasonalEvent = (eventData: Partial<SeasonalEvent>) => api.put('/content/seasonalevent', eventData);
export const addTestimonial = (testimonialData: Partial<Testimonial>) => api.post('/content/testimonials', testimonialData);
export const updateTestimonial = (id: number, testimonialData: Partial<Testimonial>) => api.put(`/content/testimonials/${id}`, testimonialData);
export const deleteTestimonial = (id: number) => api.delete(`/content/testimonials/${id}`);

// Booking API
// Fix: Updated type to correctly reflect the booking payload. `id` (transactionId) and `userEmail` are required from the frontend, while `status` and `userId` are handled by the backend.
export const createBooking = (bookingDetails: Omit<Booking, 'status' | 'userId'>) => api.post('/bookings', bookingDetails);
export const getUserBookings = (): Promise<{ data: { data: Booking[] } }> => api.get('/bookings/my-bookings');
export const getAllBookings = (): Promise<{ data: { data: Booking[] } }> => api.get('/bookings/all'); 

// User API
export const getUsers = (): Promise<{ data: { data: User[] } }> => api.get('/users');
export const createUser = (userData: Partial<User>) => api.post('/users', userData);
export const updateUser = (id: string, userData: Partial<User>) => api.put(`/users/${id}`, userData);
export const deleteUser = (id: string) => api.delete(`/users/${id}`);


// Subscription API
type CreateSubscriptionPayload = Omit<PrasadSubscription, 'userId' | 'nextDeliveryDate' | 'status'>;
export const createSubscription = (subscriptionDetails: CreateSubscriptionPayload) => api.post('/subscriptions', subscriptionDetails);
export const getSubscriptionsByUserId = (userId: string): Promise<{ data: { data: PrasadSubscription[] } }> => api.get('/subscriptions/my-subscriptions');

// Payment API
export const createRazorpayOrder = (amount: number): Promise<{ data: { order_id: string; key_id: string; } }> => api.post('/payments/create-order', { amount });


export default api;