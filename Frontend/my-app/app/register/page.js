'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`, formData);
            console.log('Registration successful:', response.data);
            alert('Registration successful!');
            
            } catch (error) {
                console.error('Registration failed:', error);
                }   
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200">
            <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-white">Credit Card Management - Register</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="name"
                            placeholder="Enter your username"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <a href="/login" className="text-indigo-500 hover:underline">Login here</a>
                </p>
            </div>
        </div>
    );
}