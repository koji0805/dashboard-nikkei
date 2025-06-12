import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ data }) {
  const chartData = data.map(stock => ({
    date: stock.date,
    price: stock.close_price,
    volume: stock.volume
  })).reverse();

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#5F6368' }}
            tickLine={{ stroke: '#DADCE0' }}
            axisLine={{ stroke: '#DADCE0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#5F6368' }}
            tickLine={{ stroke: '#DADCE0' }}
            axisLine={{ stroke: '#DADCE0' }}
            tickFormatter={(value) => `¥${value?.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'price' ? `¥${value?.toLocaleString()}` : value?.toLocaleString(),
              name === 'price' ? '終値' : '出来高'
            ]}
            labelFormatter={(label) => `日付: ${label}`}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #E8EAED',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              color: '#202124'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#0969DA"
            strokeWidth={2}
            dot={{ fill: '#0969DA', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#0969DA', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;