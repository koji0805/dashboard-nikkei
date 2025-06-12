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
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4facfe" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={{ stroke: '#666' }}
            tickFormatter={(value) => `¥${value?.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'price' ? `¥${value?.toLocaleString()}` : value?.toLocaleString(),
              name === 'price' ? '終値' : '出来高'
            ]}
            labelFormatter={(label) => `日付: ${label}`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="url(#colorPrice)"
            strokeWidth={3}
            dot={{ fill: '#4facfe', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 8, stroke: '#4facfe', strokeWidth: 2, fill: '#fff' }}
            fill="url(#colorPrice)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;