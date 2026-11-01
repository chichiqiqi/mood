# 心情天气 · 浏览器推理部署版

保留原 v1.0.0，此目录为独立的 Cloudflare Pages 版本。

Cloudflare Pages 配置：
- Root directory: cloudflare-deploy
- Build command: npm run build
- Output directory: public
- Node version: 22

构建时下载官方 ONNX 模型并拆分为两个小于 25 MiB 的资源；浏览器加载后重新组合推理。图片与记录保存在访问者设备，照片不发送给服务器分析。

与本机版差异：同一个 enet_b2_8 分类模型，人脸定位从 OpenCV Haar 改为 MediaPipe，裁切结果可能影响分类。首次下载约 50–60 MB，性能取决于设备。已验证桌面浏览器实际推理；未完成 iPhone 实测。不同网站地址的浏览器记录互不迁移。

第三方：ONNX Runtime Web（MIT）、MediaPipe（Apache-2.0）、EmotiEffLib 代码（Apache-2.0），模型沿用官方分发；未经完整许可核对不建议直接商业化再分发。原作者项目：https://github.com/sb-ai-lab/EmotiEffLib 。
