import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ data }) {
  const chartData = data.map(stock => ({
    date: stock.date,
    price: stock.close_price,
    volume: stock.volume
  })).reverse();

  // Y軸の範囲を計算（現在価格から上下2000円程度）
  const prices = chartData.map(d => d.price).filter(p => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = chartData[chartData.length - 1]?.price || 38000;
  
  // 現在価格を基準に上下2000円の範囲を設定
  const yAxisMin = Math.max(0, currentPrice - 2000);
  const yAxisMax = currentPrice + 2000;
  
  // ただし、実際のデータがこの範囲を超える場合は調整
  const finalMin = Math.min(yAxisMin, minPrice - 500);
  const finalMax = Math.max(yAxisMax, maxPrice + 500);

  return (
    <div style={{ width: '100%', height: '350px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={chartData} 
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <clipPath id="chart-area">
              <rect x="0" y="0" width="100%" height="100%" />
            </clipPath>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: '#5F6368' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={5}
          />
          <YAxis 
            domain={[finalMin, finalMax]}
            tick={{ fontSize: 10, fill: '#5F6368' }}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(value) => `¥${Math.round(value).toLocaleString()}`}
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
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, stroke: '#0969DA', strokeWidth: 2, fill: '#ffffff' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;