# microsoft/markitdown

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [microsoft/markitdown](https://github.com/microsoft/markitdown) |
| 言語 | Python |
| 総スター数 | 124,411 |
| 本日のスター | +313 |
| ライセンス | MIT |
| トレンド順位 | #30相当（2026/05/22） |
| カテゴリ | データ・インテリジェンス / ドキュメント変換 |

---

## 概要

Microsoft製の軽量Pythonライブラリ。PDF・Word・Excel・PowerPoint・画像・音声・HTML等多様なファイル形式をMarkdownテキストに変換し、LLM処理のための前処理パイプラインとして機能する。

「Markdownはプレーンテキストに近く、LLMが大量に学習したフォーマット」という設計思想に基づき、構造（見出し・表・リスト・太字）を保持しながらLLMに最適な形式に変換する。

---

## 対応ファイル形式

| カテゴリ | フォーマット |
|---------|------------|
| **ドキュメント** | PDF, DOCX, PPTX, XLSX, ODT |
| **Web** | HTML, XHTML |
| **画像** | PNG, JPEG, GIF, WEBP（OCRまたは画像説明） |
| **音声** | MP3, WAV, M4A（Whisperで文字起こし） |
| **データ** | CSV, JSON, XML |
| **コード** | Jupyter Notebook (.ipynb) |
| **電子書籍** | EPUB |

---

## あるとないとの違い

| 観点 | ない場合 | ある場合 |
|------|----------|----------|
| PDFのLLM処理 | PyPDF2でテキスト抽出→表が崩れる→LLMに正確に伝わらない | 表・見出し構造を保持したMarkdownで高精度な分析が可能 |
| WordのLLM処理 | 書式情報が失われる | 見出し階層・太字・箇条書きがMarkdownで再現 |
| 音声のLLM処理 | 手動で文字起こし | `convert("audio.mp3")` で自動文字起こし→Markdown |
| バッチ処理 | ファイル形式ごとに別々のツール | 1つのAPIで全形式を統一処理 |

---

## 環境構築方法

### インストール
```bash
# 基本インストール
pip install markitdown

# 全機能（画像・音声対応含む）
pip install "markitdown[all]"

# 特定機能のみ
pip install "markitdown[pdf]"     # PDF専用
pip install "markitdown[pptx]"    # PowerPoint専用
pip install "markitdown[docx]"    # Word専用
pip install "markitdown[audio]"   # 音声文字起こし
```

### 音声文字起こしの追加設定（オプション）
```bash
# Whisperモデルを使用する場合
pip install openai-whisper

# または OpenAI APIを使用
export OPENAI_API_KEY=sk-...
```

### 動作確認
```bash
python -c "
import markitdown
md = markitdown.MarkItDown()
result = md.convert('test.pdf')
print(result.text_content[:500])
"
```

---

## ベストプラクティス

### 基本的な使い方
```python
import markitdown

md = markitdown.MarkItDown()

# PDFの変換
result = md.convert("contract.pdf")
print(result.text_content)

# Wordの変換
result = md.convert("report.docx")

# URLから直接変換
result = md.convert("https://example.com/article")

# 音声の文字起こし
result = md.convert("meeting.mp3")
```

### LLMとの統合パターン
```python
import markitdown
import anthropic

md = markitdown.MarkItDown()
client = anthropic.Anthropic()

def analyze_document(file_path: str, query: str) -> str:
    # 1. MarkItDownで変換
    result = md.convert(file_path)
    
    # 2. Claude APIに渡す
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": f"以下のドキュメントを分析してください:\n\n{result.text_content}\n\n質問: {query}"
        }]
    )
    return response.content[0].text

# 使用例
answer = analyze_document("annual_report.pdf", "今期の主要なリスクは何ですか？")
```

### バッチ処理（大量ファイルの処理）
```python
from pathlib import Path
import markitdown

md = markitdown.MarkItDown()

# フォルダ内の全ドキュメントを変換
input_dir = Path("documents/")
output_dir = Path("markdown/")
output_dir.mkdir(exist_ok=True)

for file_path in input_dir.glob("**/*"):
    if file_path.suffix in ['.pdf', '.docx', '.pptx', '.xlsx']:
        try:
            result = md.convert(str(file_path))
            output_path = output_dir / file_path.with_suffix('.md').name
            output_path.write_text(result.text_content)
            print(f"✓ {file_path.name}")
        except Exception as e:
            print(f"✗ {file_path.name}: {e}")
```

### 表の変換精度を上げるコツ
```python
# PDFの表が崩れる場合はpdf_use_ocr=Trueを試す
result = md.convert("table_heavy.pdf", pdf_use_ocr=True)
```

---

## セキュリティ観点

### ファイル処理のリスク
- **悪意あるファイル:** 変換するファイルが信頼できるソースからのものか確認する
- **XXE（XML External Entity）:** XMLファイルの変換時にXXE攻撃に注意する

```python
# 信頼できないソースのファイルはサンドボックスで処理
import subprocess
result = subprocess.run(
    ["python", "-c", f"import markitdown; m = markitdown.MarkItDown(); print(m.convert('{file}').text_content)"],
    capture_output=True,
    timeout=60
)
```

### 機密データの扱い
```python
# 変換後のMarkdownには元の機密情報がテキストで含まれる
# 変換結果をログに出力しない
import logging
logging.getLogger("markitdown").setLevel(logging.ERROR)

# 一時ファイルを安全に削除
import tempfile, os
with tempfile.NamedTemporaryFile(delete=False) as f:
    f.write(document_content)
    temp_path = f.name

try:
    result = md.convert(temp_path)
finally:
    os.unlink(temp_path)  # 確実に削除
```

---

## ペルソナ設定と使い方

### ペルソナ：佐藤 麻子（45歳・法務部門マネージャー・AI活用推進中）

佐藤さんの部門では毎月50〜100本の契約書・仕様書PDFを確認する。「AIに要約させたい」と思っていたが、PDFの表や条項番号がLLMに正確に伝わらず「表の内容が読み取れません」「第3条の内容が曖昧です」というエラーが続いていた。

```python
import markitdown
import anthropic
from pathlib import Path

md = markitdown.MarkItDown()
client = anthropic.Anthropic()

# 毎月の契約書レビュー自動化

contract_dir = Path("contracts/2026-05/")
report_dir = Path("reviews/2026-05/")
report_dir.mkdir(exist_ok=True)

for pdf_path in contract_dir.glob("*.pdf"):
    # 1. MarkItDownで変換（表・条項番号が正確に保持される）
    result = md.convert(str(pdf_path))
    
    # 2. Claude APIで重要条項とリスクを抽出
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=3000,
        messages=[{
            "role": "user",
            "content": f"""以下の契約書を分析してください。

{result.text_content}

以下を出力してください:
1. 重要条項の箇条書き（5〜10項目）
2. リスクのある条項（あれば）
3. 交渉が必要な条項（あれば）"""
        }]
    )
    
    # 3. レビュー結果をファイルに保存
    review_path = report_dir / pdf_path.with_suffix('.md').name
    review_path.write_text(response.content[0].text)

# 50件の契約書レビュー:
# 以前: 担当者5人が各10件を2日かけてレビュー = 2日×5人 = 10人日
# 以後: スクリプト実行1時間 + 重点確認3時間 = 4時間（-95%）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| PyPDF2 / pdfplumber | PDF特化のテキスト抽出（表の再現性はMarkItDownより劣る） |
| Apache Tika | 多形式対応の文書解析（Javaベース） |
| unstructured | AIドキュメント処理ライブラリ（より高機能・高コスト） |
| LlamaParse | PDFのLLM最適化パーサー（有料） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/microsoft/markitdown)
- [PyPI](https://pypi.org/project/markitdown/)
