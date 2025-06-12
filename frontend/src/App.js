import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockChart from './StockChart';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    fetchStocks();
    
    // 5分ごとに自動更新
    const interval = setInterval(() => {
      fetchStocks();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      console.log('データ取得開始...');
      const response = await axios.get('http://localhost:8000/stocks');
      console.log('レスポンス:', response.data);
      
      if (response.data && response.data.stocks) {
        setStocks(response.data.stocks);
        setLastUpdate(new Date());
        console.log('データ設定完了:', response.data.stocks.length, '件');
      }
      setLoading(false);
    } catch (error) {
      console.error('データ取得エラー:', error);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/stocks/refresh');
      await fetchStocks();
    } catch (error) {
      console.error('データ更新エラー:', error);
      setLoading(false);
    }
  };

  const generateRecentData = async () => {
    setLoading(true);
    try {
      console.log('過去30日分のデータを生成中...');
      await axios.post('http://localhost:8000/stocks/generate-recent');
      await fetchStocks();
      console.log('履歴データ生成完了');
    } catch (error) {
      console.error('履歴データ生成エラー:', error);
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
      {/* トップナビゲーション */}
      <nav className="top-nav">
        <div className="nav-logo">日経平均株価 インデックス</div>
        <ul className="nav-links">
          <li><a href="#news">ニュース・リリース</a></li>
          <li><a href="#indices">指数一覧</a></li>
          <li><a href="#archives">日経平均アーカイブ</a></li>
          <li><a href="#learn">学習</a></li>
        </ul>
      </nav>

      <div className="main-container">
        {/* サイドバー */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">インデックス</h3>
            <ul className="sidebar-menu">
              <li><a href="#" className="active">日経平均株価</a></li>
              <li><a href="#">日経平均VI</a></li>
              <li><a href="#">TOPIX</a></li>
              <li><a href="#">JPX日経400</a></li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">アーカイブ</h3>
            <ul className="sidebar-menu">
              <li><a href="#">サマリー</a></li>
              <li><a href="#">パフォーマンス</a></li>
              <li><a href="#">構成銘柄</a></li>
              <li><a href="#">セクター</a></li>
            </ul>
          </div>
          <div className="sidebar-section">
            <h3 className="sidebar-title">ガバナンス</h3>
            <ul className="sidebar-menu">
              <li><a href="#">委員会</a></li>
              <li><a href="#">規則・ガイドライン</a></li>
              <li><a href="#">ライセンス</a></li>
            </ul>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="content-area">
          <div className="page-header">
            <div>
              <h1>日経平均株価 サマリー</h1>
              <div className="date-display">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              {lastUpdate && (
                <div className="last-update">
                  最終更新: {lastUpdate.toLocaleTimeString('ja-JP')}
                </div>
              )}
            </div>
            <div className="button-group">
              <button className="refresh-button" onClick={refreshData} disabled={loading}>
                {loading ? '更新中...' : 'データ更新'}
              </button>
              <button className="generate-button" onClick={generateRecentData} disabled={loading}>
                {loading ? '生成中...' : '履歴データ生成'}
              </button>
            </div>
          </div>

          <div className="price-chart-container" role="main" aria-label="株価ダッシュボード">
            {latestStock && (
              <section className="card price-card" aria-labelledby="current-price-title">
                <h2 id="current-price-title">最新価格</h2>
                <div className="price-value">
                  ¥{latestStock.close_price?.toLocaleString()}
                </div>
                <div className="price-info">
                  <div className="price-detail">
                    <div className="price-detail-label">前日比</div>
                    <div className="price-detail-value" style={{
                      color: change >= 0 ? 'var(--da-green-500)' : 'var(--da-red-500)'
                    }}>
                      {change >= 0 ? '+' : ''}¥{change?.toFixed(2)} ({changePercent?.toFixed(2)}%)
                    </div>
                  </div>
                  <div className="price-detail">
                    <div className="price-detail-label">日付</div>
                    <div className="price-detail-value">{latestStock.date}</div>
                  </div>
                </div>
                <div className="price-details">
                  <div className="detail-row">
                    <span className="detail-label">始値</span>
                    <span className="detail-value">{latestStock.open_price?.toLocaleString()}</span>
                    <span className="detail-time">09:00</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">高値</span>
                    <span className="detail-value">{latestStock.high_price?.toLocaleString()}</span>
                    <span className="detail-time">09:11</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">安値</span>
                    <span className="detail-value">{latestStock.low_price?.toLocaleString()}</span>
                    <span className="detail-time">10:39</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">除数</span>
                    <span className="detail-value">30.06422294</span>
                    <span className="detail-time"></span>
                  </div>
                </div>
              </section>
            )}

            <section className="card chart-card" aria-labelledby="chart-title">
              <h2 id="chart-title" className="chart-title">価格推移チャート</h2>
              <StockChart data={stocks} />
            </section>
          </div>

          <div className="dashboard-grid">

          {latestStock && (
            <>
              <section className="card" aria-labelledby="basic-stats-title">
                <h3 id="basic-stats-title" className="section-title">基本データ</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">始値</div>
                    <div className="stat-value">¥{latestStock.open_price?.toLocaleString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">高値</div>
                    <div className="stat-value">¥{latestStock.high_price?.toLocaleString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">安値</div>
                    <div className="stat-value">¥{latestStock.low_price?.toLocaleString()}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">出来高</div>
                    <div className="stat-value">{latestStock.volume?.toLocaleString()}</div>
                  </div>
                </div>
              </section>

              <section className="card" aria-labelledby="dividend-title">
                <h3 id="dividend-title" className="section-title">配当利回り</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">単純平均</div>
                    <div className="stat-value">{latestStock.dividend_yield_simple?.toFixed(2)}%</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">指数ベース</div>
                    <div className="stat-value">{latestStock.dividend_yield_index?.toFixed(2)}%</div>
                  </div>
                </div>
              </section>

              <section className="card" aria-labelledby="per-title">
                <h3 id="per-title" className="section-title">株価収益率(PER)</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">加重平均</div>
                    <div className="stat-value">{latestStock.per_weighted?.toFixed(2)}倍</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">指数ベース</div>
                    <div className="stat-value">{latestStock.per_index?.toFixed(2)}倍</div>
                  </div>
                </div>
              </section>

              <section className="card" aria-labelledby="pbr-title">
                <h3 id="pbr-title" className="section-title">株価純資産倍率(PBR)</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">加重平均</div>
                    <div className="stat-value">{latestStock.pbr_weighted?.toFixed(2)}倍</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">指数ベース</div>
                    <div className="stat-value">{latestStock.pbr_index?.toFixed(2)}倍</div>
                  </div>
                </div>
              </section>

              <section className="card" aria-labelledby="market-title">
                <h3 id="market-title" className="section-title">市場データ</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">時価総額</div>
                    <div className="stat-value">{latestStock.market_cap?.toFixed(2)}兆円</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">売買代金</div>
                    <div className="stat-value">{latestStock.trading_value?.toFixed(2)}兆円</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">市場占有率</div>
                    <div className="stat-value">{latestStock.market_share?.toFixed(2)}%</div>
                  </div>
                </div>
              </section>
            </>
          )}


          <section className="card" aria-labelledby="sector-title">
            <h3 id="sector-title" className="section-title">セクター別ウェイト</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">技術</div>
                <div className="stat-value">23.5%</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">消費者サービス</div>
                <div className="stat-value">18.2%</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">資本財・サービス</div>
                <div className="stat-value">15.8%</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">素材</div>
                <div className="stat-value">12.1%</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">金融</div>
                <div className="stat-value">11.4%</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">その他</div>
                <div className="stat-value">19.0%</div>
              </div>
            </div>
          </section>

          <section className="card full-width-table" aria-labelledby="top-stocks-title">
            <h3 id="top-stocks-title" className="section-title">上位10銘柄（ウェイト順）</h3>
            <div className="table-container">
              <table className="table wide-table" role="table" aria-label="上位銘柄テーブル">
                <thead>
                  <tr>
                    <th scope="col" style={{width: '10%'}}>順位</th>
                    <th scope="col" style={{width: '50%'}}>銘柄名</th>
                    <th scope="col" style={{width: '20%'}}>ウェイト</th>
                    <th scope="col" style={{width: '20%'}}>株価</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>トヨタ自動車</td>
                    <td>3.8%</td>
                    <td>¥2,850</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>ソニーグループ</td>
                    <td>3.2%</td>
                    <td>¥12,500</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>キーエンス</td>
                    <td>2.9%</td>
                    <td>¥65,000</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>東京エレクトロン</td>
                    <td>2.5%</td>
                    <td>¥28,400</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>三菱UFJフィナンシャル・グループ</td>
                    <td>2.1%</td>
                    <td>¥1,320</td>
                  </tr>
                  <tr>
                    <td>6</td>
                    <td>信越化学工業</td>
                    <td>1.9%</td>
                    <td>¥4,250</td>
                  </tr>
                  <tr>
                    <td>7</td>
                    <td>ファーストリテイリング</td>
                    <td>1.8%</td>
                    <td>¥8,900</td>
                  </tr>
                  <tr>
                    <td>8</td>
                    <td>アドバンテスト</td>
                    <td>1.7%</td>
                    <td>¥9,200</td>
                  </tr>
                  <tr>
                    <td>9</td>
                    <td>KDDI</td>
                    <td>1.6%</td>
                    <td>¥4,180</td>
                  </tr>
                  <tr>
                    <td>10</td>
                    <td>ダイキン工業</td>
                    <td>1.5%</td>
                    <td>¥21,800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="data-table full-width-table" aria-labelledby="data-table-title">
            <div className="table-header">
              <h2 id="data-table-title" className="table-title">詳細データ</h2>
            </div>
            <div className="table-container">
              <table className="table wide-table" role="table" aria-label="株価詳細データテーブル">
                <thead>
                  <tr>
                    <th scope="col" style={{width: '16%'}}>日付</th>
                    <th scope="col" style={{width: '16%'}}>始値</th>
                    <th scope="col" style={{width: '16%'}}>高値</th>
                    <th scope="col" style={{width: '16%'}}>安値</th>
                    <th scope="col" style={{width: '16%'}}>終値</th>
                    <th scope="col" style={{width: '20%'}}>出来高</th>
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
          </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;