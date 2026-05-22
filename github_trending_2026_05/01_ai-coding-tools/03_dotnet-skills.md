# dotnet/skills

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [dotnet/skills](https://github.com/dotnet/skills) |
| 言語 | C# |
| 総スター数 | 2,182 |
| 本日のスター | +179 |
| ライセンス | MIT |
| トレンド順位 | #4（2026/05/22） |
| カテゴリ | AIコーディングツール / ドメイン専門スキル |

---

## 概要

Microsoft .NETチームが公式提供するAIコーディングエージェント向けの.NET専門知識プラグイン集。11カテゴリにわたる専門スキルを収録し、Claude Code・GitHub Copilot CLI・Cursor・VS Codeなどで使用できる。

汎用AIモデルが苦手とする「.NETの慣習・ベストプラクティス・特定バージョンの構文」を補完し、.NET開発での精度と速度を向上させる。

---

## 収録スキルカテゴリ（11種）

| カテゴリ | 主な用途 |
|---------|---------|
| **Core** | プロジェクト作成・ビルド・基本的なC#パターン |
| **Entity Framework** | EF Coreマイグレーション・クエリ最適化 |
| **ASP.NET Core** | Web API・Minimalウ API・ミドルウェア設定 |
| **Testing** | xUnit・NUnit・Moqを使ったテスト作成 |
| **NuGet** | パッケージ管理・アップグレード |
| **MSBuild** | ビルドスクリプト・プロジェクトファイル最適化 |
| **Performance** | パフォーマンス診断・最適化パターン |
| **Migrations** | フレームワークバージョンアップ（.NET 6→8→9） |
| **MAUI** | クロスプラットフォームモバイル開発 |
| **AI/ML** | ML.NET・Semantic Kernel統合 |
| **Diagnostics** | デバッグ・ログ・トレーシング |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| EF Core マイグレーション | 一般的なSQLが返ってくる場合がある | .NET公式の `dotnet ef migrations add` 形式で生成 |
| .NET バージョン移行 | 古い構文が混在する | バージョン固有の変更点を把握した上でコードを生成 |
| ASP.NET Core API作成 | Controller形式かMinimal API形式か迷う | プロジェクトの既存パターンに合わせて選択 |
| NuGet依存の更新 | 手動で互換性確認 | 破壊的変更を考慮したアップグレード提案 |

---

## 環境構築方法

### 前提条件
- .NET SDK 6.0以上インストール済み（`dotnet --version` で確認）
- Claude Code / GitHub Copilot CLI / Cursor のいずれか

### インストール手順
```bash
# Claude Codeの場合
/plugin install dotnet/skills@claude-plugins-official

# Copilot CLIの場合
gh copilot skill add dotnet-skills

# Cursorの場合: Settings > Plugins でdotnet-skillsを検索
```

### 動作確認
```bash
# .NETプロジェクトディレクトリで
/skills list    # インストール済みスキルを確認
dotnet build    # プロジェクトが正常にビルドできることを確認
```

---

## ベストプラクティス

### インストール
```bash
# Claude Codeで
/plugin install dotnet-core@claude-plugins-official
/plugin install dotnet-ef@claude-plugins-official

# または .claude/settings.json に直接追加
{
  "plugins": ["dotnet/skills@latest"]
}
```

### 効果的な使い方
1. **バージョンを明示する:** 「.NET 9でASP.NET Core Web APIを作って」と常にバージョンを指定
2. **既存パターンを提示する:** 「このプロジェクトではRepository Patternを使っています」とコンテキストを渡す
3. **Migrations前に確認を入れる:** 「マイグレーションファイルを作る前に変更内容を確認させて」

```bash
# 効果的なプロンプト例
"UserエンティティにEmailプロパティ（必須・最大256文字・一意制約）を追加して、
EF Core 8のマイグレーションを生成して"

# →スキルなし: 一般的なSQL DDLや不完全なC#が返ることも
# →スキルあり: Data Annotations、Fluent API、マイグレーションファイルが正確に生成
```

4. **フレームワーク移行には段階的なアプローチを取る:**
```
"このプロジェクトを.NET 6から.NET 9に移行する。まず破壊的変更のリストを出して、
優先度順に一つずつ対処していこう"
```

---

## セキュリティ観点

### .NETセキュリティの主要チェックポイント
AIが生成したコードでも以下を必ず確認する：

#### 1. SQLインジェクション対策
```csharp
// NG: 文字列結合（スキルがあっても稀に生成される）
var users = db.Users.FromSqlRaw($"SELECT * FROM Users WHERE Name = '{name}'");

// OK: パラメータ化クエリ
var users = db.Users.FromSqlRaw("SELECT * FROM Users WHERE Name = {0}", name);
// または LINQ（EFが自動でパラメータ化）
var users = db.Users.Where(u => u.Name == name);
```

#### 2. シリアライズの脆弱性
```csharp
// NG: 型情報を含むJSONデシリアライズ（リモートコード実行の恐れ）
JsonSerializer.Deserialize<object>(json, new JsonSerializerOptions 
  { TypeInfoResolver = ... });

// OK: 型を明示
JsonSerializer.Deserialize<UserDto>(json);
```

#### 3. 機密情報の管理
```bash
# NG: appsettings.jsonに直書き
# OK: Secret Manager（開発）またはAzure Key Vault（本番）
dotnet user-secrets set "ConnectionStrings:Default" "Server=..."
```

### スキルが生成するコードのレビュー観点
- `[Authorize]` 属性が必要なエンドポイントに付いているか
- CORS設定が過度に緩くないか（`AllowAnyOrigin` の乱用）
- ログに機密情報が出力されていないか

---

## ペルソナ設定と使い方

### ペルソナ：中川 俊介（42歳・エンタープライズSIerのテックリード・.NET歴15年）

中川さんのチームは.NET 6で動いている大規模社内システムを.NET 9に移行するプロジェクトを抱えている。AIツールを使いたいが、「Copilotが古い書き方のコードを出してくる」「EF CoreのMigrationコードが間違ってる」というミスが続き、レビューコストが増えていた。

#### dotnet/skills導入後の変化

```bash
# プロジェクトに .NET移行スキルをインストール
/plugin install dotnet-migrations@claude-plugins-official

# 移行作業の依頼
"UserControllerをASP.NET Core 6のController形式から
.NET 9のMinimal API形式に移行して。
既存のエラーハンドリングパターンは維持すること"

# スキルなし（以前）：
# → Minimal APIの書き方が古い、またはControllerと混在したコードを生成
# → 中川さんが30分かけてレビュー・修正

# スキルあり（以後）：
# → .NET 9の最新パターン、IExceptionHandler利用のエラーハンドリングで正確に生成
# → レビュー時間：30分 → 5分

# 1ヶ月後：PR修正コメント数 -60%、移行スピード2倍
```

#### .NET 6→9 破壊的変更チェック
```
"このソリューション全体で.NET 9の破壊的変更に引っかかる箇所を
すべてリストアップして、影響度順に並べて"
→ dotnet-migrationsスキルが既知の破壊的変更リストと照合して提示
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| dotnet CLI | .NET公式CLIツール（AIとの統合はなし） |
| Semantic Kernel | MicrosoftのAIオーケストレーションフレームワーク |
| CopilotKit | .NET特化ではないがAI統合ライブラリ |

### .NETバージョン別のスキル対応状況
- .NET 6 LTS: フルサポート
- .NET 8 LTS: フルサポート（最推奨）
- .NET 9: サポート
- .NET Framework（旧来版）: 部分サポート

---

## 参考リンク

- [公式リポジトリ](https://github.com/dotnet/skills)
- [.NET公式ドキュメント](https://docs.microsoft.com/dotnet/)
- [EF Core公式ドキュメント](https://docs.microsoft.com/ef/core/)
