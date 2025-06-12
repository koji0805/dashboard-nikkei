from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database_sqlite import get_db, init_db

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
            "open_price": float(row[3]),
            "high_price": float(row[4]),
            "low_price": float(row[5]),
            "close_price": float(row[6]),
            "volume": row[7]
        })
    
    return {"stocks": stocks}