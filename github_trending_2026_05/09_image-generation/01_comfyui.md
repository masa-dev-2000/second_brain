# Comfy-Org/ComfyUI

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Comfy-Org/ComfyUI](https://github.com/comfyanonymous/ComfyUI) |
| 言語 | Python |
| 総スター数 | 113,901 |
| ライセンス | GPL-3.0 |
| カテゴリ | 画像生成 / 拡散モデルGUI・ノードベースワークフロー |

---

## 概要

ComfyUIは、Stable DiffusionやFLUXなどの拡散モデルを「ノード」と「ワイヤー」をドラッグ＆ドロップで繋いで画像生成パイプラインを構築するGUIツール。113,000スターを超え、画像生成AIの業界標準ツールとして確立されている。

Web UIやA1111（AUTOMATIC1111）と異なり、処理の各ステップを可視化・カスタマイズできるのが最大の特徴。テキスト → CLIPエンコード → サンプリング → VAEデコードという拡散モデルの内部プロセスをノードで表現することで、プロが求める高度なワークフロー（ControlNet・LoRA・IPAdapter等）を直感的に構築できる。ComfyUI Manager経由でカスタムノードを追加すれば機能を無限に拡張できる。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **ノードベースUI** | 処理フローをノードとワイヤーで可視化・編集 |
| **Stable Diffusion対応** | SD1.5・SDXL・SD3・Cascadeなど全バージョン対応 |
| **FLUXサポート** | Black ForestのFLUXモデルをネイティブサポート |
| **LoRA・ControlNet** | LoRA重み付け・ControlNet条件付き生成を標準搭載 |
| **インペインティング** | マスクを用いた部分編集ワークフローを構築可能 |
| **カスタムノード** | ComfyUI Managerで数百のコミュニティノードを追加 |
| **API・ヘッドレスモード** | WebSocket APIで外部アプリからワークフローを呼び出せる |
| **ワークフロー保存** | JSON形式でワークフローを保存・共有 |

---

## あるとないとの違い

| 観点 | AUTOMATIC1111 (A1111) | ComfyUI |
|------|----------------------|---------|
| 処理の可視性 | ブラックボックス的なUI | 全ステップをノードで可視化 |
| カスタマイズ | 設定項目は固定 | ノードを繋いで自由に構成 |
| 複雑なワークフロー | 難しい・スクリプトが必要 | ノードを追加するだけ |
| 再現性 | 設定の共有が手間 | JSONを共有すれば完全再現 |
| 処理速度 | 標準的 | 差分キャッシュで高速な再実行 |
| 学習コスト | 低（GUIが直感的） | やや高い（ノードの概念が必要） |

---

## 環境構築方法

### 方法1: 直接インストール（GPU環境）

```bash
# Python 3.10以上が必要
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# CUDA 12.x (NVIDIA GPU) の場合
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt

# 起動
python main.py
# → http://127.0.0.1:8188 でGUIにアクセス
```

### 方法2: ComfyUI Manager の導入

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/ltdrdata/ComfyUI-Manager.git

# ComfyUI再起動後、メニューから Manager が使えるようになる
# → カスタムノードのインストール・更新がGUIから可能に
```

### モデルの配置

```bash
# Stable Diffusionモデルを配置
cp your_model.safetensors ComfyUI/models/checkpoints/

# LoRAを配置
cp your_lora.safetensors ComfyUI/models/loras/

# ControlNetを配置
cp controlnet_model.safetensors ComfyUI/models/controlnet/
```

### API経由での自動実行（ヘッドレス）

```python
import json
import urllib.request
import urllib.parse

# ワークフローのJSONをロード
with open("workflow.json") as f:
    workflow = json.load(f)

# テキストプロンプトを書き換え
workflow["6"]["inputs"]["text"] = "a beautiful sunset over the ocean, photorealistic"

# APIに送信してキューに追加
data = json.dumps({"prompt": workflow}).encode("utf-8")
req = urllib.request.Request("http://127.0.0.1:8188/prompt", data=data)
response = urllib.request.urlopen(req)
result = json.loads(response.read())
print(f"キューID: {result['prompt_id']}")
```

---

## ベストプラクティス

1. **ワークフローをJSONで保存して再現性を確保する:**
```bash
# ComfyUI画面上で: Save → ワークフロー名.json
# 共有時はJSONファイルをそのまま送るだけで完全再現

# ワークフローJSONをGit管理する
mkdir -p ~/comfyui-workflows
cp ~/ComfyUI/user/default/workflows/*.json ~/comfyui-workflows/
cd ~/comfyui-workflows && git init && git add . && git commit -m "initial workflows"
```

2. **カスタムノードはComfyUI Manager経由でインストールし依存関係を管理する:**
```bash
# Manager の「Install Missing Custom Nodes」で
# ワークフローJSONを読み込んで必要なカスタムノードを自動検出・インストール

# 手動インストールの場合
cd ComfyUI/custom_nodes
git clone https://github.com/Fannovel16/comfyui_controlnet_aux.git
cd comfyui_controlnet_aux
pip install -r requirements.txt
```

3. **API + Pythonスクリプトでバッチ生成を自動化する:**
```python
import json
import time
import urllib.request
import websocket

SERVER = "127.0.0.1:8188"

def queue_prompt(workflow: dict) -> str:
    data = json.dumps({"prompt": workflow}).encode()
    req = urllib.request.Request(f"http://{SERVER}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())["prompt_id"]

def wait_for_completion(prompt_id: str):
    """WebSocketで完了を待機する"""
    ws = websocket.WebSocket()
    ws.connect(f"ws://{SERVER}/ws?clientId=my_client")
    while True:
        msg = json.loads(ws.recv())
        if msg["type"] == "executing" and msg["data"].get("prompt_id") == prompt_id:
            if msg["data"]["node"] is None:
                ws.close()
                return  # 完了

# 10枚のバリエーション生成
with open("base_workflow.json") as f:
    base = json.load(f)

prompts = ["red sunset", "blue ocean", "green forest", "snowy mountain", "city at night"]
for i, prompt_text in enumerate(prompts):
    base["6"]["inputs"]["text"] = prompt_text
    base["3"]["inputs"]["seed"] = i * 1000  # シードを変える
    prompt_id = queue_prompt(base)
    wait_for_completion(prompt_id)
    print(f"完了: {prompt_text}")
```

4. **VRAM不足時はメモリ最適化オプションを使う:**
```bash
# VRAM 4GB以下の環境
python main.py --lowvram

# VRAM 2GB以下またはCPU実行
python main.py --cpu
# または
python main.py --novram

# xformers でメモリ使用量を削減（NVIDIA限定）
pip install xformers
python main.py --use-xformers
```

---

## セキュリティ観点

### ネットワーク公開時の注意
```bash
# デフォルトはlocalhostのみでアクセス可能（安全）
python main.py  # → 127.0.0.1:8188

# 外部公開する場合は認証が必須（デフォルトは認証なし）
# --listen で全インターフェースにバインドされるため注意
python main.py --listen 0.0.0.0  # 危険: 認証なしで全員がアクセス可能

# 外部公開する場合はSSHトンネルやnginxリバースプロキシ+Basic認証を使用
# nginx設定例:
# auth_basic "ComfyUI";
# auth_basic_user_file /etc/nginx/.htpasswd;
```

### カスタムノードのリスク
- カスタムノードはPythonコードを直接実行するため、信頼できるソース（GitHubスター数・メンテナが明確）のみインストールする
- ComfyUI Managerの「Security Check」機能を活用して悪意あるコードを検出する
- 本番環境では検証済みのノードセットのみをDockerイメージに含め、任意インストールを禁止する

### モデルファイルの検証
```bash
# safetensors形式はpickleより安全だが、不審なソースからのモデルは使わない
# CivitAI等の公式ソースからダウンロードし、ハッシュを確認する
sha256sum your_model.safetensors
# 公開されているハッシュ値と照合する
```

---

## ペルソナ設定と使い方

### ペルソナ：山田 健太（29歳・フリーランスのゲームコンセプトアーティスト・キャラクターデザイン制作中）

山田さんはゲーム会社からキャラクターデザインの参考画像を大量生成する仕事を受注した。クライアントから「ファンタジー戦士・魔法使い・盗賊それぞれ50バリエーション」を求められている。A1111を使っていたが、ControlNetとLoRAを組み合わせた複雑なワークフローの再現が難しく、毎回設定をやり直していた。

```python
# ComfyUI API を使ったキャラクター一括生成スクリプト
import json
import urllib.request
import random
from pathlib import Path

SERVER = "127.0.0.1:8188"

# ベースワークフロー（ControlNet + LoRA + SDXL）
# GUIで一度組んでJSONエクスポートしたもの
with open("character_workflow.json") as f:
    workflow = json.load(f)

# キャラクタークラスの設定
character_classes = {
    "warrior": {
        "positive": "fantasy warrior, heavy armor, sword and shield, heroic pose, detailed armor, epic lighting",
        "lora_weight": 0.8,
    },
    "mage": {
        "positive": "fantasy mage, mystical robes, glowing staff, magical particles, arcane symbols, dynamic pose",
        "lora_weight": 0.7,
    },
    "rogue": {
        "positive": "fantasy rogue, leather armor, daggers, hooded cloak, sneaky pose, dark atmosphere",
        "lora_weight": 0.75,
    },
}

negative_prompt = "blurry, low quality, deformed, extra limbs, bad anatomy"
output_dir = Path("./character_outputs")
output_dir.mkdir(exist_ok=True)

def queue_and_wait(wf: dict) -> str:
    data = json.dumps({"prompt": wf}).encode()
    req = urllib.request.Request(f"http://{SERVER}/prompt", data=data)
    return json.loads(urllib.request.urlopen(req).read())["prompt_id"]

# 各クラス50バリエーションを生成
for class_name, config in character_classes.items():
    print(f"\n{class_name}の生成開始...")
    for i in range(50):
        wf = json.loads(json.dumps(workflow))  # ディープコピー
        # プロンプト設定
        wf["positive_prompt"]["inputs"]["text"] = config["positive"]
        wf["negative_prompt"]["inputs"]["text"] = negative_prompt
        # LoRA重みを微調整（バリエーションを出す）
        wf["lora_loader"]["inputs"]["strength_model"] = config["lora_weight"] + random.uniform(-0.1, 0.1)
        # シードをランダムに
        wf["sampler"]["inputs"]["seed"] = random.randint(0, 2**32)
        # ファイル名を設定
        wf["save_image"]["inputs"]["filename_prefix"] = f"{class_name}_{i:03d}"

        prompt_id = queue_and_wait(wf)
        print(f"  [{i+1}/50] キュー追加: {prompt_id[:8]}...")

print("\n全150枚の生成完了！")
```

**導入前後の変化:**
- 導入前: A1111で毎回ControlNet/LoRA設定をやり直し → 1バリエーション5分 × 150枚 = 12.5時間
- 導入後: ワークフローJSONを一度組んでAPIで自動実行 → スクリプト設定15分 + 自動生成2時間で完了

---

## 周辺情報

### 類似・関連プロジェクト

| ツール | 特徴 |
|--------|------|
| AUTOMATIC1111 (A1111) | 最も有名な従来型Web UI、拡張機能が豊富だが柔軟性はComfyUI以下 |
| InvokeAI | プロフェッショナル向けUI、商用利用を意識した設計 |
| Fooocus | シンプル操作に特化、初心者向け |
| jaaz (#02) | マルチモーダル創作アシスタント、ComfyUIをバックエンドに利用 |
| Forge | A1111フォーク、メモリ効率改善版 |

---

## 参考リンク

- [公式リポジトリ](https://github.com/comfyanonymous/ComfyUI)
- [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
- [ComfyUI Examples（公式サンプル）](https://comfyanonymous.github.io/ComfyUI_examples/)
- [OpenArt ワークフロー共有](https://openart.ai/workflows)
- [公式ドキュメント](https://docs.comfy.org/)
