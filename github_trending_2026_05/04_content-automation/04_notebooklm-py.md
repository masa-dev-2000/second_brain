# teng-lin/notebooklm-py

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py) |
| 言語 | Python |
| 総スター数 | 14,362 |
| 本日のスター | +182 |
| ライセンス | MIT |
| トレンド順位 | #10（2026/05/22） |
| カテゴリ | コンテンツ自動化 / Google NotebookLM自動化 |

---

## 概要

Google NotebookLMの非公式Python APIライブラリ。Webブラウザ経由でしか使えなかったNotebookLMを、Pythonコード・CLI・AIエージェントから自動操作可能にする。

WebUIでは不可能なバッチ処理・自動化・エクスポート機能を追加し、研究・学習・コンテンツ制作の自動パイプライン構築を可能にする。

---

## 主な機能

### コンテンツ生成
| 生成物 | CLI例 |
|--------|-------|
| ポッドキャスト（音声） | `notebooklm generate audio` |
| ビデオ | `notebooklm generate video` |
| スライドデッキ | `notebooklm generate slides` |
| クイズ | `notebooklm generate quiz` |
| フラッシュカード | `notebooklm generate flashcards` |
| インフォグラフィック | `notebooklm generate infographic` |
| マインドマップ | `notebooklm generate mindmap` |
| スタディガイド | `notebooklm generate study-guide` |

### ソース管理
- URL・PDF・YouTube動画・Google Drive・テキストを一括インポート
- ノートブックの作成・削除・複製を自動化

### エクスポート（WebUIにない機能）
- クイズをJSON形式でエクスポート
- マインドマップのhierarchy構造をJSONでエクスポート
- スライドデッキをPPTX形式でダウンロード
- 音声をMP3でダウンロード

---

## あるとないとの違い

| 観点 | WebUIのみ | notebooklm-py |
|------|----------|--------------|
| バッチ処理 | 不可（1件ずつ手動） | 100件のPDFを一括インポートして一括処理 |
| 自動化 | 不可 | cronで毎日自動実行 |
| 出力のエクスポート | 限定的 | JSON・PPTX・MP3での構造化エクスポート |
| エージェント統合 | 不可 | Claude Codeスキルとして統合可能 |

---

## 環境構築方法

### 前提条件
- Python 3.10以上
- Googleアカウント（NotebookLMのアクセス権）
- Chrome インストール済み（Seleniumを使用）

### インストール手順
```bash
# pip インストール
pip install notebooklm-py

# または開発版
git clone https://github.com/teng-lin/notebooklm-py
cd notebooklm-py
pip install -e .
```

### 認証設定
```bash
# Googleアカウントで認証（ブラウザが開く）
notebooklm login

# または環境変数で設定
export GOOGLE_EMAIL="your@gmail.com"
export GOOGLE_PASSWORD="..."  # 2FAを使っている場合は別途設定が必要
```

### 動作確認
```bash
# ノートブック一覧を確認
notebooklm list-notebooks

# 簡単なテスト
notebooklm create-notebook --name "テスト"
notebooklm add-source --notebook "テスト" --url "https://example.com"
```

---

## ベストプラクティス

1. **研究論文の一括処理:**
```bash
# arXivから50本の論文URLリストを作成
cat arxiv_papers.txt | while read url; do
    notebooklm add-source --notebook "AI研究2026Q2" --url $url
    sleep 2  # レート制限対策
done

# ポッドキャスト形式のサマリーを生成
notebooklm generate audio --notebook "AI研究2026Q2" --wait
notebooklm download audio --output weekly_research.mp3
```

2. **学習コンテンツの自動生成:**
```python
from notebooklm import NotebookLM

nlm = NotebookLM()

# 教科書PDFを追加
nlm.create_notebook("統計学基礎")
nlm.add_source("統計学基礎", path="textbook.pdf")

# 複数形式で学習コンテンツを生成
nlm.generate("統計学基礎", "quiz")
nlm.generate("統計学基礎", "flashcards")
nlm.generate("統計学基礎", "study-guide")

# 構造化データとしてエクスポート
quiz_data = nlm.export("統計学基礎", "quiz", format="json")
# → 問題・選択肢・答え・解説がJSONで取得できる
```

3. **Claude Codeスキルとして統合:**
```bash
/plugin install notebooklm@claude-plugins-official

# Claude Codeから使う
claude "この研究報告書からNotebookLMでポッドキャストを作って、
       出来上がったら research_podcast.mp3 として保存して"
```

4. **定期的な自動サマリー作成:**
```bash
# cronで毎週月曜日に実行
# 0 9 * * 1 python weekly_summary.py

# weekly_summary.py
nlm = NotebookLM()
nlm.add_source("週次ニュース", url=news_feed_url)
nlm.generate("週次ニュース", "audio", wait=True)
nlm.download("週次ニュース", "audio", output="weekly_news.mp3")
send_to_slack("weekly_news.mp3")
```

---

## セキュリティ観点

### Google認証情報の管理
```bash
# パスワードを環境変数に置かない（keyringを使用）
notebooklm login  # ブラウザで認証 → トークンがkeychainに保存

# .envファイルに書く場合も.gitignoreに追加
echo "GOOGLE_PASSWORD=..." >> .env
echo ".env" >> .gitignore
```

### 利用規約の確認
- NotebookLMは非公式APIのため、Googleの利用規約の変更によって動作しなくなる可能性がある
- 商業目的での大規模使用前にGoogleに確認することを推奨

### 認証セッションの保護
```bash
# 認証トークンファイルのパーミッションを制限
chmod 600 ~/.notebooklm/credentials.json
```

---

## ペルソナ設定と使い方

### ペルソナ：小松 真由美（35歳・教育コンテンツ制作者・オンラインコースを運営）

小松さんは自分のオンラインコース（月額¥5,000、受講者800人）で使う学習コンテンツを作っているが、1単元あたりのクイズ・フラッシュカード・スタディガイド作成に毎回3〜4時間かかっていた。

```python
# 1ヶ月分の講義スライド（PDF）を一括処理

nlm = NotebookLM()
nlm.create_notebook("データサイエンス入門2026")

# 12回分の講義スライドを一括インポート
for i in range(1, 13):
    nlm.add_source("データサイエンス入門2026", path=f"lecture_{i:02d}.pdf")
    print(f"Lecture {i} added")
    time.sleep(3)

# 各講義ごとにコンテンツ生成
for i in range(1, 13):
    # クイズ（10問）をJSON形式で生成
    quiz = nlm.generate_for_source(f"lecture_{i:02d}", "quiz", questions=10)
    quiz_json = nlm.export(quiz, format="json")
    
    # フラッシュカードを生成
    flashcards = nlm.generate_for_source(f"lecture_{i:02d}", "flashcards")
    
    # スタディガイドを生成
    study_guide = nlm.generate_for_source(f"lecture_{i:02d}", "study-guide")
    
    # コース管理システムにアップロード
    upload_to_lms(quiz_json, flashcards, study_guide, lesson=i)

# 12単元分のコンテンツを自動生成
# 以前: 12単元 × 3時間 = 36時間
# 以後: スクリプト実行2時間 + 確認レビュー4時間 = 6時間（-83%）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Google NotebookLM | 本家WebUI（notebooklm-pyの操作対象） |
| academic-research-skills (#14) | 研究論文執筆支援スキル（NotebookLMより執筆特化） |
| Elicit | AI文献調査ツール（NotebookLMと異なりAPI公式） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/teng-lin/notebooklm-py)
- [Google NotebookLM](https://notebooklm.google.com/)
