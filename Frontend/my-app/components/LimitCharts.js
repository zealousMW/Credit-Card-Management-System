'use client';

// Note: We are importing PieChart and Pie from recharts now
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import axios from 'axios';

// This component still takes a single card object as a prop
export default function LimitChart({ card }) {
  
  // The data structure for a pie chart is an array of objects,
  // each with a 'name' and a 'value'.
  
  const chartData = [
    { name: 'Used Limit', value: Number(card.usedLimit) },
    { name: 'Unused Limit', value: card.unusedLimit },
  ];

  // We can define colors to make the chart visually appealing
  const COLORS = ['#d9534f', '#5cb85c']; // Red for used, Green for unused

  // Handle the edge case where the limit is 0 to avoid a chart error
  if (card.creditLimit === 0) {
    return <p>Cannot display chart as credit limit is zero.</p>;
  }

  // Handle the case where a card is completely unused to show a full green circle
  const isUnused = card.usedLimit === 0;

  // State for the new pie chart
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('6m');
  const [loading, setLoading] = useState(true);

  // State to toggle between the two charts
  const [activeChart, setActiveChart] = useState('limitUsage');

  useEffect(() => {
    console.log('useEffect triggered with cardId:', card?.id, 'and period:', period);

    const fetchChartData = async () => {
      if (!card?.id) {
        console.warn('fetchChartData skipped: card.id is undefined or falsy');
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching pie chart data for cardId:', card.id, 'and period:', period);
        const response = await axios.get(
          `http://localhost:3000/api/categories/spending/${card.id}?period=${period}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Fetched pie chart data:', response.data);

        // Transform the data to match the expected structure for the chart
        const transformedData = response.data.map(item => ({
          name: item.name,
          value: parseFloat(item.total_spent),
        }));

        if (Array.isArray(transformedData) && transformedData.every(item => 'name' in item && 'value' in item)) {
          setData(transformedData);
        } else {
          console.error('Unexpected data format after transformation:', transformedData);
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch pie chart data', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [card?.id, period]);

  const getButtonStyle = (btnPeriod) => ({
    margin: '0 5px',
    padding: '5px 10px',
    backgroundColor: period === btnPeriod ? '#007bff' : '#f8f9fa',
    color: period === btnPeriod ? '#fff' : '#000',
    border: '1px solid #007bff',
    borderRadius: '5px',
    cursor: 'pointer',
  });

  return (
    <div>
      <div style={{ marginBottom: '15px' }}>
        <button
          style={getButtonStyle('limitUsage')}
          onClick={() => setActiveChart('limitUsage')}
        >
          Credit Limit Usage
        </button>
        <button
          style={getButtonStyle('spendingByCategory')}
          onClick={() => setActiveChart('spendingByCategory')}
        >
          Spending by Category
        </button>
      </div>

      {activeChart === 'limitUsage' && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Credit Limit Usage</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={isUnused ? [{ name: 'Unused Limit', value: 1 }] : chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {isUnused ? (
                    <Cell fill={COLORS[1]} />
                  ) : (
                    chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                  )}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeChart === 'spendingByCategory' && (
        <div>
          <h3>Spending by Category</h3>
          <div style={{ marginBottom: '15px' }}>
            <button style={getButtonStyle('3m')} onClick={() => setPeriod('3m')}>Last 3 Months</button>
            <button style={getButtonStyle('6m')} onClick={() => setPeriod('6m')}>Last 6 Months</button>
            <button style={getButtonStyle('all')} onClick={() => setPeriod('all')}>All Time</button>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            {loading ? (
              <p>Loading chart...</p>
            ) : data.length === 0 ? (
              <p>No spending data available for this period.</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}