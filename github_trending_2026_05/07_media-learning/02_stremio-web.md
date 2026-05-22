# Stremio/stremio-web

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [Stremio/stremio-web](https://github.com/Stremio/stremio-web) |
| 言語 | JavaScript / React |
| 総スター数 | 8,934 |
| 本日のスター | +289 |
| ライセンス | GPL-3.0 |
| トレンド順位 | #25相当（2026/05/22） |
| カテゴリ | メディア・学習 / メディアセンター |

---

## 概要

アドオンシステムで機能を拡張できるオープンソースメディアセンターのWebフロントエンド。映画・TVシリーズ・ライブTV等のコンテンツを統合管理し、自己ホスト型のNetflixライクな体験を提供する。

Stremio本体はデスクトップアプリとして配布されているが、`stremio-web`はブラウザで動作するWebバージョン。アドオンを追加することで様々なコンテンツソースに対応できる。Kodiの現代的なWeb版と考えられる。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **アドオンシステム** | URLを追加するだけでコンテンツソースを拡張 |
| **統合カタログ** | 複数ソースのコンテンツを1つのUIで閲覧 |
| **メタデータ** | IMDB・TMDB連携で映画情報・評価・予告編を自動取得 |
| **自動字幕** | OpenSubtitlesと連携して自動字幕表示 |
| **視聴履歴同期** | アカウント登録でデバイス間の視聴位置を同期 |
| **CInemeta** | オープンソースのIMDB連携カタログ |

---

## あるとないとの違い

| 観点 | バラバラのアプリ | Stremio-Web |
|------|----------------|-------------|
| コンテンツ管理 | Netflix・Disney+・Prime等を別々のアプリで管理 | 1つのUIで全コンテンツを横断検索 |
| メタデータ | アプリごとに異なる | IMDBスコア・出演者情報が統一表示 |
| 字幕 | 字幕がないコンテンツは手動設定 | OpenSubtitlesで自動字幕 |
| デバイス | アプリのあるデバイスのみ | ブラウザがあればどこでも |

---

## 環境構築方法

### 方法1：Docker（推奨・自己ホスト）
```bash
# Stremio Webサーバーをセルフホスト
docker run -d \
  --name stremio-web \
  -p 8080:8080 \
  stremio/stremio-web:latest

# → http://localhost:8080 でアクセス
```

### 方法2：ソースからビルド
```bash
git clone https://github.com/Stremio/stremio-web
cd stremio-web

npm install
npm run build

# 本番サーバーとして起動
npm run serve

# または開発モード
npm start
# → http://localhost:3000
```

### Nginxでホスティング
```bash
# ビルド後のdistをNginxで配信
cp -r dist/ /var/www/stremio/

# /etc/nginx/sites-available/stremio
server {
    listen 443 ssl;
    server_name stremio.yourdomain.com;
    
    root /var/www/stremio;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### アドオンのインストール
```
1. アプリを開き、右上のパズルアイコンをクリック
2. 「アドオンを追加」をクリック
3. アドオンのURLを入力してインストール

代表的なアドオン:
- Cinemeta: IMDBの映画・TV情報（公式）
- OpenSubtitles: 字幕
- YouTube: YouTube動画をStremio内で視聴
```

---

## ベストプラクティス

1. **ウォッチリストを活用:**
```
映画や番組のカードを長押し > 「ウォッチリストに追加」
→ 「後で見る」一覧が自動で管理される
→ デバイス間で同期（ログイン必要）
```

2. **字幕の設定を最適化:**
```
設定 > 字幕
- 言語: 日本語優先 → 英語にフォールバック
- サイズ: 130%（見やすく）
- スタイル: 白文字・黒縁取り

→ OpenSubtitlesアドオンが自動で最適な字幕を選択
```

3. **カスタムアドオンを開発:**
```javascript
// シンプルなアドオンの例（Node.js）
const { addonBuilder } = require('stremio-addon-sdk');

const builder = new addonBuilder({
    id: 'com.example.myaddon',
    name: 'My Custom Addon',
    version: '1.0.0',
    catalogs: [{
        type: 'movie',
        id: 'my-movies',
        name: '自分のコレクション'
    }],
    resources: ['catalog', 'stream']
});

// ローカルの動画ファイルをStremioで見られるようにする
builder.defineCatalogHandler(async ({ type, id }) => {
    const myMovies = await getLocalMovies(); // ローカルから取得
    return { metas: myMovies.map(toStremioMeta) };
});

builder.defineStreamHandler(async ({ type, id }) => {
    const localPath = await getLocalPath(id);
    return { streams: [{ url: `file://${localPath}` }] };
});

module.exports = builder.getInterface();
```

4. **複数デバイスで視聴継続:**
```
テレビで途中まで見た映画を、スマホで続きから見る:
1. Stremioアカウントにログイン（TV・スマホ共通）
2. 「続きを見る」セクションに自動で表示
3. 再生位置から即座に再開
```

---

## セキュリティ観点

### アドオンの信頼性
- **非公式アドオン**: 第三者製アドオンのURLを追加する場合、信頼できるソースからのみインストールする
- 悪意あるアドオンがマルウェアのURLを返す可能性がある

```javascript
// アドオンのソースを確認する方法
// アドオンのマニフェストを手動で確認
curl https://addon-provider.com/manifest.json
// → idとnameが正当なものか確認
```

### 著作権の問題
- Stremio自体は合法的なツール
- 著作権で保護されたコンテンツを無断でストリーミングするアドオンの使用は違法になりうる
- 公式・正規のコンテンツプロバイダーのアドオンのみ使用することを推奨

### セルフホスト時の設定
```nginx
# 認証を追加（プライベートサーバーの場合）
location / {
    auth_basic "Private Media Server";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## ペルソナ設定と使い方

### ペルソナ：大野 智（44歳・映画好きの会社員・NAS（家庭用NAS）に500本の映画コレクション）

大野さんは10年かけてブルーレイをリッピングして自前のNASに500本の映画を保存している。以前はPlex（商用メディアサーバー）を使っていたが、月額費用と「最近UIが重くなった」という不満があった。また、Apple TVのNetflixとHuluと自前コレクションを行き来するのが面倒だった。

```javascript
// NASの動画コレクションをStremioアドオンとして公開

const { addonBuilder } = require('stremio-addon-sdk');
const fs = require('fs');
const path = require('path');

const NAS_PATH = '/mnt/nas/movies';

// 映画ディレクトリをスキャン
function scanMovies() {
    return fs.readdirSync(NAS_PATH)
        .filter(f => ['.mkv', '.mp4', '.avi'].includes(path.extname(f)))
        .map((file, index) => ({
            id: `local_${index}`,
            type: 'movie',
            name: path.basename(file, path.extname(file)),
            poster: null,  // IMDBから自動取得
            file: path.join(NAS_PATH, file)
        }));
}

const builder = new addonBuilder({
    id: 'com.ohno.nas',
    name: '大野コレクション',
    version: '1.0.0',
    catalogs: [{ type: 'movie', id: 'nas-movies', name: 'NASコレクション' }],
    resources: ['catalog', 'stream']
});

builder.defineCatalogHandler(async () => ({
    metas: scanMovies().map(movie => ({
        id: movie.id,
        type: 'movie',
        name: movie.name
    }))
}));

builder.defineStreamHandler(async ({ id }) => {
    const movie = scanMovies().find(m => m.id === id);
    return {
        streams: [{
            title: '家庭内NAS',
            url: `http://192.168.1.100:8888/${encodeURIComponent(movie.file)}`
        }]
    };
});

// LAN内のアドオンサーバーを起動
require('stremio-addon-sdk').serveHTTP(builder.getInterface(), { port: 7000 });

// 設定後:
// - テレビのブラウザ（http://app.strem.io）でNASの映画をリモコンで選択
// - スマホでNetflixを見ながら「この俳優の別の映画は？」→ NASコレクションも同時検索
// - サブスク: Plex Pass ¥1,760/月 → ¥0（自前アドオンで代替）
```

---

## 周辺情報

### 類似・関連プロジェクト
| ツール | 特徴 |
|--------|------|
| Plex | 商用メディアサーバー（月額費用あり・機能充実） |
| Jellyfin | OSSメディアサーバー（Stremioより自己完結型） |
| Kodi | 老舗OSSメディアセンター（プラグインエコシステム豊富） |
| Emby | Plexの代替商用メディアサーバー |

---

## 参考リンク

- [公式リポジトリ](https://github.com/Stremio/stremio-web)
- [Stremio公式サイト](https://www.stremio.com/)
- [アドオン開発SDK](https://github.com/Stremio/stremio-addon-sdk)
