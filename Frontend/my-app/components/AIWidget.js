'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AIWidget({ cardId }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!cardId) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:3000/api/insights/${cardId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInsights(res.data);
      } catch (error) {
        console.error('Failed to fetch AI insights', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [cardId]);

  if (loading) return <p>Generating advanced AI analysis...</p>;
  if (!insights) return null;

  return (
    <div style={{ border: '1px dashed blue', padding: '10px', marginTop: '10px' }}>
      <h4>AI-Powered Financial Review</h4>
      <p><strong>Overall Risk Score:</strong> {insights.riskScore}</p>
      <p><strong>Spending Habit Analysis:</strong> {insights.spendingHabitAnalysis}</p>
      <p><strong>Payment Behavior Analysis:</strong> {insights.paymentBehaviorAnalysis}</p>
      <p><strong>Actionable Advice:</strong> {insights.actionableAdvice}</p>
      <p><strong>Predicted Date to Reach Limit:</strong> {insights.predictedLimitDate}</p>
    </div>
  );
}