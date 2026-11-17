# Mood · 小猫心情记录

移动端拍照记录原型。使用 EmotiEffLib `enet_b2_8` 预训练表情模型，将识别结果转成小猫表情；用户可以采用前三项中的一项，或选择其余五种表情。模型类别不代表对真实心理状态的判断。

## 交互

首页 → 拍照 → 分析 → 三只小猫与相对比例 → 保存 → 猫咪日历。
「不太准哦」进入其余五类的选择页。日历使用当天最近一次的小猫作为封面；点日期可浏览当天照片并删除单条记录。单张照片隐藏切换按钮。

照片与记录仅存于当前浏览器，使用原有 `mood-notes-v1` 存储键兼容旧记录。不同网址和浏览器之间不自动同步，清除浏览器数据会删除记录。照片不上传服务器进行识别。

## 本地预览

在本目录安装依赖并构建：

```sh
npm ci
npm run build
python3 -m http.server 8772 --bind 127.0.0.1 --directory public
```

打开 http://127.0.0.1:8772/ 。摄像头需要 HTTPS 或本机安全地址。

## Cloudflare Pages

- Root directory: `cloudflare-deploy`
- Build command: `npm run build`
- Output directory: `public`
- Node version: `22`

构建时下载官方 ONNX 模型，拆成两个小于25MiB的资源；浏览器重新组合后推理。模型、运行时、node_modules 和本机测试页面不提交 GitHub。

## 实现

- `public/mood.mjs`：拍照、表情选择、日历、照片回顾和本机存储。
- `public/mood.css`：手机布局、选中状态和加载动效。
- `public/analysis-engine.mjs`：后台识别与兼容回退；失败后保留照片重试。
- `public/inference-worker.js`：优先使用后台 Worker 运行识别。
- `public/inference.mjs`：MediaPipe 人脸定位、裁切及 ONNX 分类。使用与本机版相同的模型；人脸裁切方式不同，可能影响结果。
- `public/assets/cats.png`、`home-cat.png`：按项目确认的黑猫设定生成的透明插画素材。

验证覆盖模型实际输出、Worker失败后的真实照片兼容推理、两条保存路径、同日浏览、删除、旧记录和手机尺寸布局。设备摄像头表现与首次加载速度取决于浏览器及设备。

旧 `mood-weather-v1.0.0` 快照保持不变。

第三方：ONNX Runtime Web（MIT）、MediaPipe（Apache-2.0）、EmotiEffLib 代码（Apache-2.0）。模型沿用官方分发，代码与预训练权重的适用许可需分别核对。原项目：https://github.com/sb-ai-lab/EmotiEffLib 。
