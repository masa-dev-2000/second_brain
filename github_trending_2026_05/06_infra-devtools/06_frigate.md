# blakeblackshear/frigate

## 基本情報

| 項目 | 内容 |
|------|------|
| リポジトリ | [blakeblackshear/frigate](https://github.com/blakeblackshear/frigate) |
| 言語 | TypeScript |
| 総スター数 | 32,895 |
| ライセンス | MIT |
| カテゴリ | インフラ・開発ツール / ローカルAI物体検知NVR |

---

## 概要

**IPカメラのリアルタイムローカル物体検知NVR（Network Video Recorder）**。クラウドに映像を送らず、自宅・オフィスのハードウェアで人・車・動物等を検知して録画・通知する。

Home Assistantとの統合が充実しており、**プライバシーを守りながらスマートホームセキュリティを構築できる**唯一の本格的OSSソリューション。Google CoralやNVIDIA GPU・Intel QSVに対応し、低消費電力での24時間稼働が可能。

---

## 主な機能

| 機能 | 詳細 |
|------|------|
| **リアルタイム物体検知** | 人・車・犬・猫等をリアルタイムで検知 |
| **24時間録画** | 検知イベントのみ保存してストレージを節約 |
| **Home Assistant連携** | 検知時にライト・アラーム・通知をトリガー |
| **複数カメラ対応** | IPカメラ・RTSP対応カメラを何台でも |
| **Coral TPU対応** | Google Coral EdgeTPUで省電力・高速推論 |
| **WebUI** | ライブビュー・録画再生・イベント検索 |
| **MQTT** | 検知結果をMQTTで他システムに連携 |

---

## あるとないとの違い

| 観点 | クラウドカメラ（Nest等） | Frigate |
|------|----------------------|---------|
| プライバシー | 映像がクラウドに送信される | 完全ローカル処理 |
| 月額費用 | $6〜$20/月/カメラ | 無料（ハードウェアのみ） |
| 検知精度のカスタマイズ | 不可 | モデル・閾値を自由に調整 |
| 録画保存先 | クラウドストレージ | 自前のNAS・HDD |
| インターネット障害時 | 機能停止 | 継続動作 |

---

## 環境構築方法

### Docker Composeで起動（推奨）

```yaml
# docker-compose.yml
version: "3.9"
services:
  frigate:
    image: ghcr.io/blakeblackshear/frigate:stable
    privileged: true
    shm_size: "256mb"
    devices:
      - /dev/bus/usb:/dev/bus/usb  # Coral USB TPU
      - /dev/dri/renderD128        # Intel GPU
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - ./config.yml:/config/config.yml
      - ./storage:/media/frigate
    ports:
      - "5000:5000"   # WebUI
      - "8554:8554"   # RTSPリレー
    environment:
      FRIGATE_RTSP_PASSWORD: "your-password"
```

### カメラ設定

```yaml
# config.yml
mqtt:
  host: 192.168.1.100  # MQTTブローカー

cameras:
  front_door:
    ffmpeg:
      inputs:
        - path: rtsp://user:pass@192.168.1.10:554/stream
          roles:
            - detect
            - record

    detect:
      width: 1920
      height: 1080
      fps: 5

    objects:
      track:
        - person
        - car
        - dog
      filters:
        person:
          min_area: 5000    # 小さすぎる検知を除外
          min_score: 0.7    # 信頼度70%以上

    record:
      enabled: true
      retain:
        days: 7            # 7日間録画を保持
      events:
        retain:
          default: 14      # イベントは14日保持
```

---

## ベストプラクティス

1. **Google Coral TPUで消費電力を最小化:**
```yaml
# config.yml に追加
detectors:
  coral:
    type: edgetpu
    device: usb  # USB接続のCoral

# Raspberry Pi 4 + Coral USB: 約5W で4カメラのリアルタイム検知
# vs GPU: 50〜200W
```

2. **Home Assistantとの連携:**
```yaml
# Home Assistant の configuration.yaml
camera:
  - platform: frigate
    name: Front Door
    frigate_url: http://frigate:5000

binary_sensor:
  - platform: mqtt
    name: "Front Door Person"
    state_topic: "frigate/front_door/person"
    device_class: motion
    # → 人を検知したら玄関ライトを自動点灯
```

3. **ゾーン設定で誤検知を減らす:**
```yaml
cameras:
  front_door:
    zones:
      driveway:
        coordinates: 100,200,400,200,400,500,100,500  # 多角形
        objects:
          - car  # この領域では車のみ検知
```

---

## セキュリティ観点

```yaml
# WebUIへのアクセス制限
auth:
  enabled: true
  reset_admin_password: false  # デフォルトパスワードを必ず変更

# ローカルネットワーク外からのアクセスを遮断
# → Tailscale / WireGuardでVPN経由のみアクセス許可
# → ポートを外部に直接公開しない
```

---

## 周辺情報

| ツール | 特徴 |
|--------|------|
| Home Assistant | スマートホーム自動化プラットフォーム |
| Double Take | 顔認識をFrigateに追加するアドオン |
| [openwa](./01_openwa.md) | WhatsApp通知をFrigateのアラートに使う |
| Scrypted | 同系のNVRソフト（Apple HomeKit特化） |

---

## 参考リンク

- [公式リポジトリ](https://github.com/blakeblackshear/frigate)
- [公式ドキュメント](https://docs.frigate.video/)
