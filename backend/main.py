from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database_sqlite import get_db, init_db
import requests
import random
from datetime import datetime, timedelta
import yfinance as yf
import schedule
import threading
import time

app = FastAPI()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "日経平均株価ダッシュボード API"}

@app.get("/stocks")
def get_stocks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM stocks ORDER BY date DESC LIMIT 10")
    rows = cursor.fetchall()
    conn.close()
    
    stocks = []
    for row in rows:
        stocks.append({
            "id": row[0],
            "symbol": row[1],
            "date": str(row[2]),
            "open_price": float(row[3]) if row[3] else 0,
            "high_price": float(row[4]) if row[4] else 0,
            "low_price": float(row[5]) if row[5] else 0,
            "close_price": float(row[6]) if row[6] else 0,
            "volume": row[7] if row[7] else 0,
            "dividend_yield_simple": float(row[8]) if row[8] else 0,
            "dividend_yield_index": float(row[9]) if row[9] else 0,
            "per_weighted": float(row[10]) if row[10] else 0,
            "per_index": float(row[11]) if row[11] else 0,
            "pbr_weighted": float(row[12]) if row[12] else 0,
            "pbr_index": float(row[13]) if row[13] else 0,
            "market_cap": float(row[14]) if row[14] else 0,
            "trading_value": float(row[15]) if row[15] else 0,
            "market_share": float(row[16]) if row[16] else 0
        })
    
    return {"stocks": stocks}

def fetch_real_nikkei_data():
    """Yahoo Financeから日経平均の実際のデータを取得（軽量版）"""
    try:
        print("日経平均データを取得中...")
        
        # 日経平均のシンボル
        nikkei = yf.Ticker("^N225")
        
        # シンプルに1日のデータのみ取得
        daily_data = nikkei.history(period="1d")
        
        if daily_data.empty:
            print("Yahoo Financeからデータが取得できませんでした")
            return None
            
        # 最新の価格情報
        latest = daily_data.iloc[-1]
        today = datetime.now().strftime('%Y-%m-%d')
        
        # データを整理
        data = {
            'symbol': 'N225',
            'date': today,
            'open_price': float(latest['Open']),
            'high_price': float(latest['High']),
            'low_price': float(latest['Low']),
            'close_price': float(latest['Close']),
            'volume': int(latest['Volume']) if 'Volume' in latest and latest['Volume'] > 0 else 1000000,
            # 指標はリアルタイムでは取得困難なのでランダム生成を継続
            'dividend_yield_simple': random.uniform(2.0, 2.5),
            'dividend_yield_index': random.uniform(1.8, 2.3),
            'per_weighted': random.uniform(15.0, 17.0),
            'per_index': random.uniform(16.5, 22.1),
            'pbr_weighted': random.uniform(1.3, 1.6),
            'pbr_index': random.uniform(1.6, 2.2),
            'market_cap': random.uniform(700, 750),
            'trading_value': random.uniform(2.5, 3.0),
            'market_share': random.uniform(73, 75)
        }
        
        print(f"データ取得成功: {data['close_price']:.2f}")
        return data
        
    except Exception as e:
        print(f"データ取得エラー: {e}")
        return None

def update_nikkei_data():
    """データベースに最新の日経平均データを更新"""
    data = fetch_real_nikkei_data()
    
    if not data:
        print("データ取得に失敗しました")
        return False
        
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # 今日のデータが既に存在するかチェック
        cursor.execute("SELECT COUNT(*) FROM stocks WHERE date = ? AND symbol = ?", 
                      (data['date'], data['symbol']))
        exists = cursor.fetchone()[0] > 0
        
        if exists:
            # 更新
            cursor.execute('''
                UPDATE stocks SET 
                open_price = ?, high_price = ?, low_price = ?, close_price = ?, volume = ?,
                dividend_yield_simple = ?, dividend_yield_index = ?, per_weighted = ?, per_index = ?,
                pbr_weighted = ?, pbr_index = ?, market_cap = ?, trading_value = ?, market_share = ?
                WHERE date = ? AND symbol = ?
            ''', (data['open_price'], data['high_price'], data['low_price'], data['close_price'], 
                  data['volume'], data['dividend_yield_simple'], data['dividend_yield_index'],
                  data['per_weighted'], data['per_index'], data['pbr_weighted'], data['pbr_index'],
                  data['market_cap'], data['trading_value'], data['market_share'],
                  data['date'], data['symbol']))
        else:
            # 新規挿入
            cursor.execute('''
                INSERT INTO stocks (symbol, date, open_price, high_price, low_price, close_price, volume, 
                                  dividend_yield_simple, dividend_yield_index, per_weighted, per_index, 
                                  pbr_weighted, pbr_index, market_cap, trading_value, market_share)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (data['symbol'], data['date'], data['open_price'], data['high_price'], 
                  data['low_price'], data['close_price'], data['volume'],
                  data['dividend_yield_simple'], data['dividend_yield_index'], 
                  data['per_weighted'], data['per_index'], data['pbr_weighted'], 
                  data['pbr_index'], data['market_cap'], data['trading_value'], data['market_share']))
        
        conn.commit()
        conn.close()
        print(f"日経平均データを更新しました: {data['close_price']:.2f}")
        return True
        
    except Exception as e:
        print(f"データベース更新エラー: {e}")
        return False

# スケジューラーを設定
def run_scheduler():
    """バックグラウンドでスケジューラーを実行"""
    while True:
        schedule.run_pending()
        time.sleep(60)  # 1分ごとにチェック

# 初期化時のデータ更新をコメントアウト（起動を高速化）
# update_nikkei_data()

# スケジューラーは手動更新のみに変更
# schedule.every(15).minutes.do(update_nikkei_data)
# scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
# scheduler_thread.start()

@app.post("/stocks/refresh")
async def refresh_stock_data():
    """手動でデータを更新"""
    success = update_nikkei_data()
    
    if success:
        # 最新データを取得して返す
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT close_price FROM stocks ORDER BY date DESC, id DESC LIMIT 1")
        result = cursor.fetchone()
        conn.close()
        
        new_price = result[0] if result else 0
        return {"message": "日経平均の最新データを更新しました", "new_price": new_price}
    else:
        return {"message": "データ更新に失敗しました", "new_price": 0}