# 🎙️ MockPrompt Recorder

会議・ブレストをリアルタイム録音し、ボタンひとつで「プロダクトモック作成プロンプト」を生成するChrome拡張。
出力されたプロンプトは v0 / Figma Make / Claude などにそのまま貼り付けてモックを作れる。

## 2つの動作モード

| | 🆓 ローカル無料モード(デフォルト) | ☁️ クラウド高品質モード |
|---|---|---|
| 文字起こし | Web Speech API オンデバイス認識(Chrome 139+) | OpenAI Whisper API |
| プロンプト生成 | Chrome内蔵 Gemini Nano(Prompt API) | Claude API(`claude-opus-4-8`) |
| コスト | **完全無料** | API従量課金 |
| APIキー | 不要 | Anthropic + OpenAI のキーが必要 |
| 通信 | なし(全て端末内で処理) | 音声・テキストをAPIに送信 |
| 品質 | 実用レベル(Nanoは軽量モデル) | 高品質 |
| 動作要件 | Chrome 139+、空きディスク約22GB、対応GPU | 特になし |

モードは設定画面(⚙️)でいつでも切り替え可能。

## 仕組み

```
ローカル: 録音(タブ音声+マイク) ──┬→ オンデバイス音声認識(リアルタイム) → Gemini Nano → プロンプト
クラウド:                        └→ 録音ファイル → Whisper API → Claude API → プロンプト
```

- **タブ音声**: Google Meet等のタブをキャプチャして相手の声も録音(`chrome.tabCapture`)
- **マイク**: 自分の声を録音し、タブ音声とミックス
- **ローカル文字起こし**: ミックス音声のMediaStreamTrackを `SpeechRecognition`(`processLocally: true`)に直接渡してリアルタイム認識
- **ローカル生成**: `LanguageModel`(Prompt API / Gemini Nano)を端末内で実行
- **BYOK方式(クラウド時)**: ユーザー自身のAPIキーを使用。キーは `chrome.storage.local` にのみ保存

## 開発版のインストール

1. Chromeで `chrome://extensions` を開く
2. 右上の「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」→ この `mock-prompt-recorder/` フォルダを選択
4. 拡張アイコンをクリック → サイドパネルが開く
5. (クラウドモードを使う場合のみ)設定から Anthropic / OpenAI のキーを保存

## 使い方

1. Google Meet等の会議タブを開いた状態で拡張アイコンをクリック
2. 「録音開始」→ 会議・ブレストを録音(タブ音声が取れないページではマイクのみ)
3. 「録音停止」→「⚡ モックプロンプト生成」
4. 出力をコピーして v0 / Figma Make / Claude に貼り付け

※ ローカルモードの初回利用時は、音声認識の言語パックとGemini Nano本体のダウンロードが自動で走る(数分かかることがある)。2回目以降はオフラインでも動く。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `manifest.json` | MV3マニフェスト(tabCapture / offscreen / sidePanel) |
| `background.js` | サービスワーカー。タブのstreamId取得とメッセージ中継 |
| `offscreen.html/js` | タブ音声+マイクのミックス録音 + オンデバイス文字起こし |
| `sidepanel.html/js/css` | メインUI(録音・生成・コピー・モード表示) |
| `lib/api.js` | クラウドモード: Whisper文字起こし + Claudeプロンプト生成 |
| `lib/local.js` | ローカルモード: Gemini Nano(Prompt API)でプロンプト生成 |
| `options.html/js` | 設定画面(モード切替・認識言語・APIキー) |

## 販売ロードマップ

1. **v0.2 (現在)**: 無料モード搭載で配布ハードル激減。Chrome Web Store登録(開発者登録 $5)して無料配布、フィードバック収集
2. **v0.3**: プロンプトテンプレート複数化(Webアプリ/モバイル/LP)、履歴保存、リアルタイム文字起こし表示
3. **v1.0 有料化**: 無料モードはそのまま、クラウド高品質モードや追加テンプレートをPro機能に
   - 案A: [ExtensionPay](https://extensionpay.com/)(Stripe連携、拡張内課金の定番)
   - 案B: Gumroad / Lemon Squeezy でライセンスキー販売
4. **v2.0 サブスク**: Googleログイン + プロキシサーバー提供(APIキー不要でクラウド品質)+ 月額課金

## 既知の制約(v0.2)

- ローカルモードはChrome 139以降 + 対応ハードウェア(空きディスク約22GB、4GB+ VRAM目安)が必要。非対応環境では自動的にエラーメッセージでクラウドモードを案内
- Gemini Nanoは軽量モデルのため、長く複雑な会議では生成品質がClaudeに劣る
- クラウドモードの長時間録音はWhisper APIのファイルサイズ上限(25MB)に当たる可能性 → 将来チャンク分割
- Chrome内部ページ(chrome://等)ではタブ音声を取得できずマイクのみになる
