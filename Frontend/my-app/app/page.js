'use client';

import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    creditLimit: ''
  });
  const [username, setUsername] = useState('');
  const router = useRouter();

  const fetchCards = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        router.push('/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/cards', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }

      setCards(response.data);
      setUsername(localStorage.getItem('username') || 'User');
    } catch (err) {
      setError('Failed to fetch cards. Please try again.');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in.');
        router.push('/login');
        return;
      }

      const response = await axios.post('http://localhost:3000/api/cards', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('Card added successfully!');
      setFormData({ cardNumber: '', creditLimit: '' });
      fetchCards();
    } catch (err) {
      setError('Failed to add card. Please try again.');
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg font-semibold text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500 text-lg font-semibold">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg">{username}</span>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto bg-gray-900 shadow-lg rounded-xl p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <span className="material-icons text-blue-500 mr-2">credit_card</span>
            Your Credit Cards
          </h2>
        </div>
        {cards.length === 0 ? (
          <p className="text-gray-400">You have not added any cards yet.</p>
        ) : (
          <ul className="space-y-6">
            {cards.map(card => (
              <Link href={`/card/${card.id}`} key={card.id}>
                <li className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-xl hover:border-blue-500 transition-all">
                  <strong className="block text-lg font-semibold text-blue-400">
                    Card ending in: **** **** **** {card.cardNumber}
                  </strong>
                  <div className="mt-2">
                    <p className="text-gray-400">
                      <span className="font-medium text-gray-500">Credit Limit:</span> Rs {card.creditLimit}
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium text-gray-500">Unused Credit:</span> Rs {card.unusedLimit}
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium text-gray-500">Balance Payment:</span> Rs {card.currentBalance}
                    </p>
                    <p className="text-blue-500 underline mt-2">Click here for more details</p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        )}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-6 bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Add New Credit Card
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Credit Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="creditLimit"
                placeholder="Credit Limit"
                value={formData.creditLimit}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <DialogFooter>
                <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  Add Card
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
