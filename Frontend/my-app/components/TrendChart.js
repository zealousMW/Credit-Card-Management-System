'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart({ cardId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardId) return;

    const fetchTrendData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/insights/trends/${cardId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch trend data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendData();
  }, [cardId]);

  if (loading) return <p>Loading trend data...</p>;
  // if (data.length < 2) return <p>Not enough data to display a spending trend.</p>;

  return (
    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
        <h4>Spending Trend Over Time</h4>
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} name="Billed Amount" />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
}