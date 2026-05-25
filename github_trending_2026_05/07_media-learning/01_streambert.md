# streambert/streambert

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [streambert/streambert](https://github.com/streambert/streambert) |
| 言語 | TypeScript / Electron |
| 総スター数 | 12,847 |
| 本日のスター | +673 |
| ライセンス | MIT |
| トレンド順位 | #16相当（2026/05/22） |
| カテゴリ | メディア・学習 / クロスプラットフォームメディアプレーヤー |

---

## 概要

YouTube・Twitch・Bilibili・Niconico等の主要動画プラットフォームを1つのアプリで視聴・管理できるElectronベースのクロスプラットフォームデスクトップアプリ。

複数プラットフォームのサブスクリプション（チャンネル登録）を統合して「あなた専用のフィード」を作成し、プラットフォームを横断した推奨アルゴリズムの影響を受けずにコンテンツを整理できる。広告ブロック・ダウンロード機能も内蔵。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **マルチプラットフォーム** | YouTube・Twitch・Bilibili・Niconico・Vimeo等に対応 |
| **統合フィード** | 複数プラットフォームのチャンネル登録を1つのフィードに集約 |
| **広告ブロック** | プラットフォームの広告をブロック（yt-dlpエンジン使用） |
| **動画ダウンロード** | yt-dlpで高画質ダウンロード（MP4/MP3） |
| **再生キュー** | プラットフォーム横断の再生キューを作成 |
| **プライバシーモード** | ログインなしで動画を視聴（プラットフォームにログが残らない） |

---

## あるとないとの違い

| 観点 | 公式アプリ/ブラウザ | Streambert |
|------|-------------------|------------|
| 複数プラットフォーム | タブを行き来する | 1アプリで全プラットフォーム |
| フィード管理 | 各プラットフォームのアルゴリズムに従う | 自分でカスタマイズした統合フィード |
| 広告 | スキップボタン待ち or AdBlock | 広告なしで即座に再生 |
| 動画の保存 | 非公式ツールを別途インストール | アプリ内で右クリック > ダウンロード |
| 視聴履歴 | プラットフォームのサーバーに記録 | ローカルのみに保存可能 |

---

## 環境構築方法

### インストール（Mac/Windows/Linux）
```bash
# Mac（Homebrew）
brew install --cask streambert

# または公式リリースページからダウンロード
# https://github.com/streambert/streambert/releases

# Linux（AppImage）
chmod +x Streambert-*.AppImage
./Streambert-*.AppImage

# Linux（パッケージマネージャー）
# Debian/Ubuntu
sudo dpkg -i streambert_*.deb

# Arch Linux
yay -S streambert-bin
```

### ソースからビルド（開発者向け）
```bash
git clone https://github.com/streambert/streambert
cd streambert

npm install
npm run build

# アプリを起動
npm start

# パッケージングしてインストール
npm run package
```

### 初期設定
```
1. アプリを起動
2. プラットフォームを追加:
   設定 > プラットフォーム > YouTube/Twitch等を選択
3. チャンネルを登録:
   - プラットフォームにログイン（オプション）
   - または手動でチャンネルURLを追加
4. 統合フィードが自動で作成される
```

### 動作確認
```bash
# アプリを起動してYouTubeの動画が再生できれば成功
# ダウンロードテスト: 動画を右クリック > ダウンロード
```

---

## ベストプラクティス

1. **プラットフォーム横断のプレイリストを作成:**
```
フィード管理 > 新しいプレイリスト > "AI学習"
→ YouTube: 3Blue1Brownのチャンネル
→ YouTube: Andrej Karpathyの動画
→ Twitch: AI関連のライブストリーム

→ 全プラットフォームの新着が1か所で見られる
```

2. **ダウンロード設定を最適化:**
```json
// 設定 > ダウンロード
{
    "default_quality": "1080p",
    "default_format": "mp4",
    "audio_only_format": "mp3",
    "download_path": "~/Downloads/StreamBert",
    "organize_by": "channel",
    "subtitle_language": ["ja", "en"]  // 字幕も自動ダウンロード
}
```

3. **プライバシー設定:**
```json
// 設定 > プライバシー
{
    "local_history_only": true,   // 視聴履歴をローカルのみ保存
    "no_platform_login": true,    // ログインなし視聴
    "block_tracking": true,       // トラッキングスクリプトをブロック
    "clear_history_on_exit": false
}
```

4. **キーボードショートカット:**
```
Space: 再生/一時停止
J/L: -10s/+10s
←/→: -5s/+5s
M: ミュート
T: ミニプレーヤー
D: ダウンロード開始
Q: 再生キューに追加
```

---

## セキュリティ観点

### 著作権の注意
- **ダウンロード機能:** 著作権で保護されたコンテンツのダウンロードは、個人視聴目的であっても国によって違法な場合がある
- 日本では著作権法第30条（私的使用のための複製）の範囲内での使用は合法だが、有料コンテンツのダウンロードは違法
- 商業目的・再配布は国際的に禁止

### プラットフォームの利用規約
- YouTubeの利用規約は技術的手段によるコンテンツのダウンロードを禁止している
- プラットフォームによってアカウントが凍結される可能性がある

### Electronのセキュリティ
```javascript
// 開発者向け: Electronのセキュリティ設定を確認
// electron-builder.config.js
module.exports = {
    mac: {
        hardenedRuntime: true,   // macOS App Sandbox有効
        gatekeeperAssess: true
    }
};
```

---

## ペルソナ設定と使い方

### ペルソナ：吉田 花（27歳・独学エンジニア・YouTubeとTwitchで技術学習）

吉田さんはBootcamp卒業後、独学でスキルアップしている。フロントエンドはYouTubeでTraversy Mediaを、バックエンドはTwitchのコーディングライブを、機械学習はBilibiliの中国語動画（英語字幕あり）を使っている。3つのブラウザタブを行き来しながら管理するのが面倒で、動画のブックマーク管理も煩雑だった。

```
# Streambertの設定:

# プレイリスト「フロントエンド学習」
→ YouTube: Traversy Media
→ YouTube: Kevin Powell（CSS）
→ YouTube: Fireship（ショート動画）

# プレイリスト「バックエンド・インフラ」
→ Twitch: ThePrimeagen（Rust/VimライブコーディングTop10登録）
→ YouTube: TechWorldWithNana（Kubernetes）

# プレイリスト「機械学習」
→ Bilibili: 李宏毅（機械学習講義・中国語+英語字幕）
→ YouTube: Andrej Karpathy

# 毎日の学習ルーティン:
# 起動 > 「今日の学習キュー」に自動で積まれた動画を視聴
# 未視聴の新着 > ダウンロードして通勤中にオフライン視聴
# 良かった動画 > 「復習リスト」に追加

# 3ヶ月後の変化:
# - プラットフォームを行き来する手間: ゼロ
# - 積ん読動画の視聴率: 20% → 60%（キューに並べると見る動機ができた）
# - 通勤時間（往復1時間）が全て学習時間に
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| FreeTube | YouTube専用プライバシー重視プレーヤー |
| Stremio | メディアセンター（ストリーミング特化） |
| mpv | 高機能動画プレーヤー（GUI統合なし） |
| yt-dlp | コマンドラインダウンローダー（Streambertの基盤） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/streambert/streambert)
