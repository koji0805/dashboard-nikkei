import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './StockChart';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stocks');
      setStocks(response.data.stocks);
      setLoading(false);
    } catch (error) {
      console.error('データ取得エラー:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">データを読み込み中</div>
      </div>
    );
  }

  const latestStock = stocks[0];
  const calculateChange = () => {
    if (stocks.length >= 2) {
      const current = stocks[0].close_price;
      const previous = stocks[1].close_price;
      const change = current - previous;
      const changePercent = ((change / previous) * 100);
      return { change, changePercent };
    }
    return { change: 0, changePercent: 0 };
  };

  const { change, changePercent } = calculateChange();

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>📈 日経平均株価ダッシュボード</h1>
          <p>リアルタイム株価情報とチャート分析</p>
        </header>

        <div className="dashboard-grid">
          {latestStock && (
            <div className="card price-card">
              <h2>最新価格</h2>
              <div className="price-value">
                ¥{latestStock.close_price?.toLocaleString()}
              </div>
              <div className="price-info">
                <div className="price-detail">
                  <div className="price-detail-label">前日比</div>
                  <div className="price-detail-value" style={{
                    color: change >= 0 ? '#10b981' : '#ef4444'
                  }}>
                    {change >= 0 ? '+' : ''}¥{change?.toFixed(2)} ({changePercent?.toFixed(2)}%)
                  </div>
                </div>
                <div className="price-detail">
                  <div className="price-detail-label">日付</div>
                  <div className="price-detail-value">{latestStock.date}</div>
                </div>
                <div className="price-detail">
                  <div className="price-detail-label">出来高</div>
                  <div className="price-detail-value">{latestStock.volume?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {latestStock && (
            <>
              <div className="card">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">始値</div>
                    <div className="stat-value">¥{latestStock.open_price?.toLocaleString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">高値</div>
                    <div className="stat-value">¥{latestStock.high_price?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">安値</div>
                    <div className="stat-value">¥{latestStock.low_price?.toLocaleString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">終値</div>
                    <div className="stat-value">¥{latestStock.close_price?.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="card chart-card">
            <h2 className="chart-title">📊 価格推移チャート</h2>
            <StockChart data={stocks} />
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <h2 className="table-title">📋 詳細データ</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>始値</th>
                  <th>高値</th>
                  <th>安値</th>
                  <th>終値</th>
                  <th>出来高</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.id}>
                    <td>{stock.date}</td>
                    <td>¥{stock.open_price?.toLocaleString()}</td>
                    <td>¥{stock.high_price?.toLocaleString()}</td>
                    <td>¥{stock.low_price?.toLocaleString()}</td>
                    <td>¥{stock.close_price?.toLocaleString()}</td>
                    <td>{stock.volume?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;