from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database_sqlite import get_db, init_db
import random
from datetime import datetime, timedelta

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

def generate_recent_data():
    """過去30日分の最新データを生成"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 既存の古いデータを削除
    cursor.execute("DELETE FROM stocks WHERE date < '2025-05-13'")
    
    base_price = 38000
    current_date = datetime.now()
    
    # 過去30日分のデータを生成
    for i in range(30, 0, -1):
        date = (current_date - timedelta(days=i)).strftime('%Y-%m-%d')
        
        # 前日からの変動
        if i == 30:
            price = base_price
        else:
            change_rate = random.uniform(-0.025, 0.025)
            price = price * (1 + change_rate)
        
        open_price = price * random.uniform(0.995, 1.005)
        high_price = max(open_price, price) * random.uniform(1.0, 1.02)
        low_price = min(open_price, price) * random.uniform(0.98, 1.0)
        close_price = price
        volume = random.randint(1000000, 1800000)
        
        # 指標
        dividend_yield_simple = random.uniform(2.0, 2.5)
        dividend_yield_index = dividend_yield_simple * random.uniform(0.9, 0.95)
        per_weighted = random.uniform(15.0, 17.0)
        per_index = per_weighted * random.uniform(1.1, 1.3)
        pbr_weighted = random.uniform(1.3, 1.6)
        pbr_index = pbr_weighted * random.uniform(1.2, 1.4)
        market_cap = random.uniform(700, 750)
        trading_value = random.uniform(2.5, 3.5)
        market_share = random.uniform(73, 75)
        
        # データを挿入（重複を避ける）
        cursor.execute("SELECT COUNT(*) FROM stocks WHERE date = ? AND symbol = ?", (date, 'N225'))
        if cursor.fetchone()[0] == 0:
            cursor.execute('''
                INSERT INTO stocks (symbol, date, open_price, high_price, low_price, close_price, volume, 
                                  dividend_yield_simple, dividend_yield_index, per_weighted, per_index, 
                                  pbr_weighted, pbr_index, market_cap, trading_value, market_share)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', ('N225', date, open_price, high_price, low_price, close_price, volume,
                  dividend_yield_simple, dividend_yield_index, per_weighted, per_index,
                  pbr_weighted, pbr_index, market_cap, trading_value, market_share))
    
    conn.commit()
    conn.close()
    return price

@app.post("/stocks/refresh")
async def refresh_stock_data():
    """最新データの更新"""
    conn = get_db()
    cursor = conn.cursor()
    
    # 最新の株価を取得
    cursor.execute("SELECT close_price FROM stocks ORDER BY date DESC LIMIT 1")
    result = cursor.fetchone()
    latest_price = result[0] if result else 38000
    
    # 新しい価格をランダムに生成（前日比±2%以内）
    change_rate = random.uniform(-0.02, 0.02)
    new_price = latest_price * (1 + change_rate)
    
    # 他の値もランダムに生成
    today = datetime.now().strftime('%Y-%m-%d')
    open_price = new_price * random.uniform(0.995, 1.005)
    high_price = max(open_price, new_price) * random.uniform(1.0, 1.015)
    low_price = min(open_price, new_price) * random.uniform(0.985, 1.0)
    volume = random.randint(1000000, 1500000)
    
    # 指標をランダムに生成
    dividend_yield_simple = random.uniform(2.0, 2.5)
    dividend_yield_index = dividend_yield_simple * random.uniform(0.9, 0.95)
    per_weighted = random.uniform(15.0, 17.0)
    per_index = per_weighted * random.uniform(1.1, 1.3)
    pbr_weighted = random.uniform(1.3, 1.6)
    pbr_index = pbr_weighted * random.uniform(1.2, 1.4)
    market_cap = random.uniform(700, 750)
    trading_value = random.uniform(2.5, 3.0)
    market_share = random.uniform(73, 75)
    
    # 今日のデータが既に存在するかチェック
    cursor.execute("SELECT COUNT(*) FROM stocks WHERE date = ? AND symbol = ?", (today, 'N225'))
    exists = cursor.fetchone()[0] > 0
    
    if exists:
        # 更新
        cursor.execute('''
            UPDATE stocks SET 
            open_price = ?, high_price = ?, low_price = ?, close_price = ?, volume = ?,
            dividend_yield_simple = ?, dividend_yield_index = ?, per_weighted = ?, per_index = ?,
            pbr_weighted = ?, pbr_index = ?, market_cap = ?, trading_value = ?, market_share = ?
            WHERE date = ? AND symbol = ?
        ''', (open_price, high_price, low_price, new_price, volume,
              dividend_yield_simple, dividend_yield_index, per_weighted, per_index,
              pbr_weighted, pbr_index, market_cap, trading_value, market_share,
              today, 'N225'))
    else:
        # 新規挿入
        cursor.execute('''
            INSERT INTO stocks (symbol, date, open_price, high_price, low_price, close_price, volume, 
                              dividend_yield_simple, dividend_yield_index, per_weighted, per_index, 
                              pbr_weighted, pbr_index, market_cap, trading_value, market_share)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('N225', today, open_price, high_price, low_price, new_price, volume,
              dividend_yield_simple, dividend_yield_index, per_weighted, per_index,
              pbr_weighted, pbr_index, market_cap, trading_value, market_share))
    
    conn.commit()
    conn.close()
    
    return {"message": "株価データを更新しました", "new_price": new_price}

@app.post("/stocks/generate-recent")
async def generate_recent_stock_data():
    """過去30日分の最新データを生成"""
    latest_price = generate_recent_data()
    return {"message": "過去30日分のデータを生成しました", "latest_price": latest_price}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)