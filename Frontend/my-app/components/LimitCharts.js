'use client';

// Note: We are importing PieChart and Pie from recharts now
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={isUnused ? [{name: 'Unused Limit', value: 1}] : chartData}
            cx="50%" // center X
            cy="50%" // center Y
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {/* This maps our data to the colors we defined */}
            {isUnused ? 
              <Cell fill={COLORS[1]} /> : 
              chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))
            }
          </Pie>
          {/* Tooltip shows details on hover */}
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          {/* Legend provides a key for the colors */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}