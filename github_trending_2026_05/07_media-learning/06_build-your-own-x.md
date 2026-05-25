# codecrafters-io/build-your-own-x

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [codecrafters-io/build-your-own-x](https://github.com/codecrafters-io/build-your-own-x) |
| 言語 | Markdown |
| 総スター数 | 504,340 |
| ライセンス | CC0 |
| カテゴリ | 学習 / 技術を0から自作して習得するリファレンス集 |

---

## 概要

**「使っている技術を自分で作ることで、本当に理解できる」** — その思想を体現したチュートリアル集。Git・データベース・Docker・コンパイラ・Webサーバー・シェル・ニューラルネットワーク等を各言語でゼロから実装するチュートリアルへのリンク集。

GitHub全体で504k starsを誇る定番リポジトリ。エンジニアとしての「地力」を上げたいときの出発点。

---

## カバーする技術カテゴリ

| カテゴリ | 作るもの |
|---------|---------|
| **3Dレンダラー** | レイトレーサーをゼロから実装 |
| **ブロックチェーン** | Bitcoinのような分散台帳 |
| **ボット** | チェスボット・囲碁ボット |
| **コマンドラインツール** | シェル・CLIフレームワーク |
| **データベース** | SQLiteライクなDBエンジン |
| **Docker** | Dockerのようなコンテナランタイム |
| **フロントエンド** | React・Vueライクなフレームワーク |
| **ゲーム** | Minecraft・テトリス |
| **Git** | Gitのバージョン管理システム |
| **ネットワークスタック** | TCP/IPスタック |
| **ニューラルネット** | バックプロパゲーションから実装 |
| **OS** | ブートローダー・カーネル |
| **検索エンジン** | 転置インデックスとランキング |
| **Webサーバー** | HTTP/1.1対応サーバー |

---

## あるとないとの違い

| 観点 | ドキュメントだけ読む | build-your-own-x で実装後 |
|------|-------------------|------------------------|
| Gitの理解 | コマンドを覚えている | blob/tree/commitの構造を知っている |
| DBの理解 | SQLを書ける | B-treeとWALの仕組みを知っている |
| Dockerの理解 | コマンドを知っている | namespaceとcgroupsの動作を知っている |
| デバッグ力 | ツールのバグに気づけない | 内部動作から逆算して原因を絞れる |

---

## 代表的なチュートリアル

### Git を Python で作る

```python
# .git ディレクトリの構造を理解しながら実装
import os, hashlib, zlib

def hash_object(data: bytes, obj_type: str = "blob") -> str:
    header = f"{obj_type} {len(data)}\0".encode()
    store = header + data
    sha1 = hashlib.sha1(store).hexdigest()
    
    # .git/objects/ に保存
    path = f".git/objects/{sha1[:2]}/{sha1[2:]}"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(zlib.compress(store))
    
    return sha1

# これを実装するとgit hash-objectの仕組みが分かる
sha = hash_object(b"hello world")
print(sha)  # 8c7e5a667f1b771847fe88c01c3de34413a1b220
```

### 簡易HTTPサーバーを Python で作る

```python
import socket

def handle_request(conn):
    data = conn.recv(4096).decode()
    request_line = data.split("\r\n")[0]
    method, path, version = request_line.split()
    
    body = f"<h1>Hello from my server!</h1><p>Path: {path}</p>"
    response = (
        f"HTTP/1.1 200 OK\r\n"
        f"Content-Type: text/html\r\n"
        f"Content-Length: {len(body)}\r\n"
        f"\r\n"
        f"{body}"
    )
    conn.send(response.encode())
    conn.close()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("localhost", 8080))
server.listen(1)
print("Listening on :8080")
while True:
    conn, addr = server.accept()
    handle_request(conn)
```

---

## ベストプラクティス

```
学習順序の推奨:

初級（1〜2週間）:
  → Webサーバー（HTTP理解）
  → シェル（プロセス・パイプ理解）

中級（1〜2ヶ月）:
  → Git（オブジェクトストア・DAG理解）
  → データベース（インデックス・トランザクション理解）

上級（3〜6ヶ月）:
  → コンパイラ（字句解析・構文解析・コード生成）
  → OS（カーネル・メモリ管理・スケジューラ）
  → ニューラルネット（→ nn-zero-to-hero と組み合わせる）
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| [nn-zero-to-hero](./04_nn-zero-to-hero.md) | NNを0から実装するKarpathyのコース |
| [learn-claude-code](./05_learn-claude-code.md) | Claude Codeのハーネスを0から実装 |
| [ai-engineering-from-scratch](./03_ai-engineering-from-scratch.md) | AIエンジニアリングを0から学ぶ |
| codecrafters.io | このリポジトリの運営会社の有料インタラクティブ版 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/codecrafters-io/build-your-own-x)
