# -*- coding: utf-8 -*-
"""Local-only expression test; frames are processed in memory, never saved."""
import json, threading, mimetypes, socket
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import cv2
import numpy as np
from emotiefflib import facial_analysis
ROOT = Path(__file__).resolve().parent
facial_analysis.get_model_path_onnx = lambda name: str(ROOT / 'models' / (name + '.onnx'))
model = facial_analysis.EmotiEffLibRecognizerOnnx('enet_b2_8')
detector = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
inference_lock = threading.Lock()
class Handler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(15)
    def log_message(self, *args): pass
    def reply(self, status, data, content_type='application/json'):
        body = data if isinstance(data, bytes) else json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, socket.timeout):
            pass
    def valid_host(self):
        return self.headers.get('Host') in ('127.0.0.1:8766', 'localhost:8766')
    def do_GET(self):
        if not self.valid_host(): return self.reply(403, {'error':'Invalid host'})
        if self.path == '/test': return self.reply(200, (ROOT/'index.html').read_bytes(), 'text/html; charset=utf-8')
        route = self.path.split('?')[0]
        assets = {'/':'index.html','/app.js':'app.js','/mobile.js':'mobile.js','/style.css':'style.css','/expression.mjs':'expression.mjs','/assets/afternoon.jpg':'assets/afternoon.jpg','/assets/cat.png':'assets/cat.png'}
        if route in assets:
            path = ROOT/'product'/assets[route]
            content_type = 'text/javascript' if path.suffix in ('.js','.mjs') else mimetypes.guess_type(str(path))[0] or 'application/octet-stream'
            return self.reply(200, path.read_bytes(), content_type + '; charset=utf-8')
        if self.path == '/health': return self.reply(200, {'ready':True,'model':'enet_b2_8','provider':model.ort_session.get_providers()})
        self.reply(404, {'error':'Not found'})
    def do_POST(self):
        if not self.valid_host() or self.headers.get('Origin') not in ('http://127.0.0.1:8766','http://localhost:8766'):
            return self.reply(403, {'error':'Only local page allowed'})
        if self.path != '/analyze': return self.reply(404, {'error':'Not found'})
        size = int(self.headers.get('Content-Length', 0))
        if not 0 < size < 2000000: return self.reply(413, {'error':'Image too large'})
        try:
            image = cv2.imdecode(np.frombuffer(self.rfile.read(size), np.uint8), cv2.IMREAD_COLOR)
            if image is None: return self.reply(400, {'error':'无法读取图片'})
            faces = detector.detectMultiScale(cv2.cvtColor(image,cv2.COLOR_BGR2GRAY),1.1,5,minSize=(80,80))
            if len(faces)!=1: return self.reply(200, {'error':'请让画面中只有一张正面人脸，调整光线和距离。'})
            x,y,w,h=map(int,faces[0]); crop=image[y:y+h,x:x+w]
            with inference_lock:
                _,scores=model.predict_emotions(cv2.cvtColor(crop,cv2.COLOR_BGR2RGB),logits=False)
            values=scores[0].tolist()
            self.reply(200, {'scores':{model.idx_to_emotion_class[i]:v for i,v in enumerate(values)}})
        except Exception:
            self.reply(500, {'error':'识别失败，请重试或查看本机运行环境。'})
print('Local model ready: http://127.0.0.1:8766', flush=True)
ThreadingHTTPServer(('127.0.0.1',8766),Handler).serve_forever()
