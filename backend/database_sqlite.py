import sqlite3
import os

def init_db():
    db_path = "nikkei.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol TEXT NOT NULL,
            date DATE NOT NULL,
            open_price REAL,
            high_price REAL,
            low_price REAL,
            close_price REAL,
            volume INTEGER,
            dividend_yield_simple REAL,
            dividend_yield_index REAL,
            per_weighted REAL,
            per_index REAL,
            pbr_weighted REAL,
            pbr_index REAL,
            market_cap REAL,
            trading_value REAL,
            market_share REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute("SELECT COUNT(*) FROM stocks")
    if cursor.fetchone()[0] == 0:
        sample_data = [
            ('N225', '2024-01-01', 33000.00, 33500.00, 32800.00, 33200.00, 1000000, 2.21, 2.06, 15.55, 19.09, 1.41, 1.87, 705.95, 2.79, 73.64),
            ('N225', '2024-01-02', 33200.00, 33800.00, 33100.00, 33600.00, 1200000, 2.19, 2.04, 15.73, 19.25, 1.43, 1.89, 710.20, 2.85, 73.82),
            ('N225', '2024-01-03', 33600.00, 34000.00, 33400.00, 33900.00, 1100000, 2.17, 2.02, 15.91, 19.42, 1.45, 1.91, 715.45, 2.72, 74.01),
            ('N225', '2024-01-04', 33900.00, 34200.00, 33700.00, 34100.00, 1300000, 2.15, 2.00, 16.08, 19.58, 1.47, 1.93, 720.70, 2.95, 74.19),
            ('N225', '2024-01-05', 34100.00, 34500.00, 33900.00, 34300.00, 1150000, 2.13, 1.98, 16.25, 19.75, 1.49, 1.95, 725.95, 2.81, 74.38)
        ]
        
        cursor.executemany('''
            INSERT INTO stocks (symbol, date, open_price, high_price, low_price, close_price, volume, 
                              dividend_yield_simple, dividend_yield_index, per_weighted, per_index, 
                              pbr_weighted, pbr_index, market_cap, trading_value, market_share)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sample_data)
    
    conn.commit()
    conn.close()

def get_db():
    return sqlite3.connect("nikkei.db")