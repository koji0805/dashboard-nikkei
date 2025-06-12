# 実装ルール・方針

## 基本方針

### シンプル・軽量実装
- **実装はシンプルにかつコード量が少なく実装**することを最優先とする
- 過度な抽象化や複雑な設計パターンは避ける
- 必要最小限の機能から開始し、段階的に拡張する
- 外部ライブラリの使用は必要最小限に留める

## コーディング規約

### 全般
- コード行数を最小化する
- 1つのファイルは200行以内を目標とする
- 関数は20行以内、クラスは100行以内を目標とする
- 不要なコメントは書かない（コード自体が説明となるように）

### Python (FastAPI)
```python
# 良い例：シンプルで短い
@app.get("/stocks/{symbol}")
async def get_stock(symbol: str):
    return {"symbol": symbol, "price": 25000}

# 悪い例：不要に複雑
class StockService:
    def __init__(self, db: Database):
        self.db = db
    
    async def get_stock_data(self, symbol: str) -> StockResponse:
        # 複雑な処理...
```

### TypeScript (React)
```typescript
// 良い例：シンプルなコンポーネント
export const StockChart = ({ data }: { data: number[] }) => (
  <div>
    {data.map(price => <span key={price}>{price}</span>)}
  </div>
);

// 悪い例：過度に抽象化されたコンポーネント
interface StockChartProps<T> {
  data: T[];
  renderer: (item: T) => ReactNode;
  // 複雑な型定義...
}
```

### SQL
```sql
-- 良い例：シンプルなクエリ
SELECT symbol, close_price FROM stocks WHERE date = CURRENT_DATE;

-- 悪い例：複雑なクエリ
WITH daily_stats AS (
  SELECT symbol, 
         AVG(close_price) OVER (PARTITION BY symbol ORDER BY date ROWS 5 PRECEDING) as ma5
  FROM stocks
) SELECT * FROM daily_stats WHERE ma5 > 25000;
```

## プロジェクト構造

### 最小構成
```
dashboard-nikkei/
├── backend/
│   ├── main.py          # FastAPIアプリ（全てのエンドポイント）
│   ├── database.py      # DB接続設定
│   └── requirements.txt # 依存関係
├── frontend/
│   ├── src/
│   │   ├── App.tsx      # メインコンポーネント
│   │   ├── Chart.tsx    # チャートコンポーネント
│   │   └── index.tsx    # エントリーポイント
│   └── package.json
├── docker-compose.yml   # 環境設定
└── README.md
```

## 実装優先順位

### Phase 1: MVP（最小限の価値提供）
1. 静的な株価表示（ハードコード）
2. 基本的なReactチャート
3. PostgreSQLへの簡単なデータ保存

### Phase 2: 基本機能
1. 外部APIからの株価取得
2. 時系列データの表示
3. 簡単なフィルタリング

### Phase 3: 追加機能
1. リアルタイム更新
2. アラート機能
3. データエクスポート

## 禁止事項

### 避けるべき実装
- 複雑なデザインパターン（Factory, Builder, Observer等）
- 過度なORM抽象化（SQLAlchemyの複雑な機能）
- 複雑な状態管理ライブラリ（Redux等）
- 大量のMiddleware
- カスタムフック/デコレータの乱用

### 推奨実装
- 直接的なSQL実行
- シンプルなReact State
- 最小限のライブラリ使用
- インラインスタイル or 最小CSS

## 依存関係制限

### Backend（Python）
```txt
fastapi==0.104.1
uvicorn==0.24.0
psycopg2-binary==2.9.9
requests==2.31.0
```

### Frontend（React）
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.8.0",
    "axios": "^1.6.0"
  }
}
```

## パフォーマンス方針

### データベース
- インデックスは必要最小限
- 複雑なJOINは避ける
- キャッシュは後回し

### フロントエンド
- バンドルサイズ最小化
- 不要なre-renderを避ける
- 画像最適化は後回し

## テスト方針

### 最小限のテスト
- エンドポイントの正常系のみテスト
- UIテストは手動確認
- 単体テストは核心機能のみ

### テストファイル
```
backend/test_main.py     # APIテストのみ
frontend/src/App.test.tsx # 最小限のコンポーネントテスト
```

## デプロイ方針

### 開発環境
- Docker Compose で完結
- 環境変数は.envファイル
- ホットリロード有効

### 本番環境
- シンプルなDocker構成
- 環境変数での設定
- ログは標準出力のみ

## 品質担保

### コードレビューポイント
1. **コード行数チェック**: 規定行数を超えていないか
2. **依存関係チェック**: 不要なライブラリが追加されていないか
3. **シンプルさチェック**: より簡単な実装方法はないか

### リファクタリング基準
- ファイルが200行を超えた場合のみ分割検討
- 同じコードが3回以上出現した場合のみ共通化検討
- パフォーマンス問題が実際に発生した場合のみ最適化

## まとめ

**「動作する最小限のコード」**を目標とし、**実装はシンプルにかつコード量が少なく実装**することで、保守性と開発速度を最大化する。