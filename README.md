# 日経平均株価可視化ダッシュボード

FastAPI + React + PostgreSQLを使用した日経平均株価のリアルタイム可視化ダッシュボード

## 要件定義

### 1. 機能要件

#### コア機能
- 日経平均株価のリアルタイム表示
- 過去データの時系列グラフ表示（日次、週次、月次、年次）
- 価格変動のアラート機能
- データのCSV/Excel エクスポート機能

#### 表示機能
- 現在価格、前日比、変動率の表示
- ローソク足チャート
- 移動平均線（5日、25日、75日）
- 出来高グラフ
- 銘柄別パフォーマンス比較

#### ユーザー機能
- ダッシュボードのカスタマイズ
- お気に入り銘柄の登録
- 価格アラートの設定

### 2. 非機能要件

#### パフォーマンス
- ページ読み込み時間：3秒以内
- リアルタイムデータ更新：5秒間隔
- 同時接続ユーザー数：1000人まで対応
- データベースクエリ応答時間：100ms以内

#### 可用性・信頼性
- システム稼働率：99.9%
- データバックアップ：日次自動実行
- ダウンタイム：月間4時間以内

#### セキュリティ
- HTTPS通信の強制
- APIレート制限
- SQLインジェクション対策
- XSS攻撃対策

#### 拡張性
- マイクロサービス対応可能な設計
- 水平スケーリング対応
- 新機能追加の容易性

### 3. 技術要件・アーキテクチャ

#### 技術スタック
- **バックエンド**: FastAPI (Python 3.9+)
- **フロントエンド**: React 18+ (TypeScript)
- **データベース**: PostgreSQL 14+
- **キャッシュ**: Redis
- **Webサーバー**: Nginx
- **コンテナ**: Docker & Docker Compose

#### システム構成
```
Frontend (React) → API Gateway → Backend (FastAPI) → Database (PostgreSQL)
                                      ↓
                              External APIs (株価データ)
```

#### API設計
- RESTful API
- OpenAPI (Swagger) ドキュメント自動生成
- WebSocket（リアルタイム更新）
- レスポンス形式：JSON

#### データ取得
- Yahoo Finance API
- Alpha Vantage API
- 日本取引所グループAPI（検討）

### 4. データ要件

#### データベース設計
```sql
-- 株価データテーブル
stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  open_price DECIMAL(10,2),
  high_price DECIMAL(10,2),
  low_price DECIMAL(10,2),
  close_price DECIMAL(10,2),
  volume BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ユーザーテーブル
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- アラート設定テーブル
alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol VARCHAR(10),
  condition_type VARCHAR(20), -- 'above', 'below'
  target_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### データ保持期間
- 日次データ：10年間
- 分次データ：1年間
- リアルタイムデータ：1週間

#### データ更新頻度
- 市場開場中：5秒間隔
- 市場閉場中：日次バッチ処理

### 5. 開発フェーズ

#### Phase 1: 基盤構築
- プロジェクト構造設定
- Docker環境構築
- データベース設計・構築

#### Phase 2: バックエンド開発
- FastAPI基本設定
- データベース接続
- 株価データ取得API実装

#### Phase 3: フロントエンド開発
- React基盤構築
- チャートライブラリ実装
- UI/UXデザイン

#### Phase 4: 統合・テスト
- API統合
- リアルタイム機能実装
- パフォーマンステスト

## セットアップ

### 前提条件
- Docker & Docker Compose
- Node.js 16+
- Python 3.9+

### 環境構築
```bash
# リポジトリクローン
git clone <repository-url>
cd dashboard-nikkei

# Docker環境起動
docker-compose up -d

# フロントエンド依存関係インストール
cd frontend
npm install

# バックエンド依存関係インストール
cd ../backend
pip install -r requirements.txt
```

### 開発サーバー起動
```bash
# バックエンド起動
cd backend
uvicorn main:app --reload

# フロントエンド起動
cd frontend
npm start
```

## ライセンス

MIT License