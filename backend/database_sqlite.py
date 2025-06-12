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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute("SELECT COUNT(*) FROM stocks")
    if cursor.fetchone()[0] == 0:
        sample_data = [
            ('N225', '2024-01-01', 33000.00, 33500.00, 32800.00, 33200.00, 1000000),
            ('N225', '2024-01-02', 33200.00, 33800.00, 33100.00, 33600.00, 1200000),
            ('N225', '2024-01-03', 33600.00, 34000.00, 33400.00, 33900.00, 1100000),
            ('N225', '2024-01-04', 33900.00, 34200.00, 33700.00, 34100.00, 1300000),
            ('N225', '2024-01-05', 34100.00, 34500.00, 33900.00, 34300.00, 1150000)
        ]
        
        cursor.executemany('''
            INSERT INTO stocks (symbol, date, open_price, high_price, low_price, close_price, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', sample_data)
    
    conn.commit()
    conn.close()

def get_db():
    return sqlite3.connect("nikkei.db")