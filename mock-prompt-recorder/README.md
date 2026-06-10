# 🎙️ MockPrompt Recorder

会議・ブレストをリアルタイム録音し、ボタンひとつで「プロダクトモック作成プロンプト」を生成するChrome拡張。
出力されたプロンプトは v0 / Figma Make / Claude などにそのまま貼り付けてモックを作れる。

## 仕組み

```
録音(タブ音声+マイク) → Whisper APIで文字起こし → Claude APIで要件抽出&プロンプト整形 → コピーして貼るだけ
```

- **タブ音声**: Google Meet等のタブをキャプチャして相手の声も録音(`chrome.tabCapture`)
- **マイク**: 自分の声を録音し、タブ音声とミックス
- **文字起こし**: OpenAI Whisper API(`whisper-1`)
- **プロンプト生成**: Claude API(`claude-opus-4-8`、adaptive thinking)
- **BYOK方式**: ユーザー自身のAPIキーを使用。キーは `chrome.storage.local` にのみ保存

## 開発版のインストール

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」→ この `mock-prompt-recorder/` フォルダを選択
4. 拡張アイコンをクリック → サイドパネルが開く
5. サイドパネル下部の「APIキー設定」から Anthropic / OpenAI のキーを保存

## 使い方

1. Google Meet等の会議タブを開いた状態で拡張アイコンをクリック
2. 「録音開始」→ 会議・ブレストを録音(タブ音声が取れないページではマイクのみ)
3. 「録音停止」→「⚡ モックプロンプト生成」
4. 出力をコピーして v0 / Figma Make / Claude に貼り付け

## ファイル構成

| ファイル | 役割 |
|---|---|
| `manifest.json` | MV3マニフェスト(tabCapture / offscreen / sidePanel) |
| `background.js` | サービスワーカー。タブのstreamId取得とメッセージ中継 |
| `offscreen.html/js` | タブ音声+マイクのミックス録音(MediaRecorder) |
| `sidepanel.html/js/css` | メインUI(録音・生成・コピー) |
| `lib/api.js` | Whisper文字起こし+Claudeプロンプト生成 |
| `options.html/js` | APIキー設定画面 |

## 販売ロードマップ

1. **v0.1 (現在)**: BYOK・無料配布でフィードバック収集。Chrome Web Store登録(開発者登録 $5)
2. **v0.2**: プロンプトテンプレート複数化(Webアプリ/モバイル/LP)、履歴保存、リアルタイム文字起こし表示
3. **v1.0 有料化**: Web Storeに決済機能はないため外部決済を利用
   - 案A: [ExtensionPay](https://extensionpay.com/)(Stripe連携、拡張内課金の定番)
   - 案B: Gumroad / Lemon Squeezy でライセンスキー販売
4. **v2.0 サブスク**: APIキー不要のプロキシサーバー提供(キー管理が不要になりライト層に売れる)+ 月額課金

## 既知の制約(v0.1)

- 長時間録音はWhisper APIのファイルサイズ上限(25MB)に当たる可能性 → 将来チャンク分割
- 文字起こしはバッチ処理(停止後に一括)。リアルタイム表示はv0.2で対応予定
- Chrome内部ページ(chrome://等)ではタブ音声を取得できずマイクのみになる
