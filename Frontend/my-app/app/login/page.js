'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

export default function Login() {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const router = useRouter();

    const handleChange =(e) =>{
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', formData);

            if(response.status === 200 && response.data.token){
                console.log('Login successful:', response.data);
                localStorage.setItem('token', response.data.token);
                alert('Login successful!');
                router.push('/');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    }
    return (
        <div>
            <h1>Login Page</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password" 
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );   
}