#!/bin/sh
set -eu
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/pip install numpy==2.0.2 pillow==11.3.0 onnx==1.19.1 onnxruntime==1.19.2 opencv-python-headless==4.10.0.84
.venv/bin/pip install --no-deps emotiefflib==1.1.1
mkdir -p models
curl -fL --retry 3 https://raw.githubusercontent.com/sb-ai-lab/EmotiEffLib/main/models/affectnet_emotions/onnx/enet_b2_8.onnx -o models/enet_b2_8.onnx
