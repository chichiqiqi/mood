import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out=new URL('./public/',import.meta.url);await mkdir(new URL('models/',out),{recursive:true});await mkdir(new URL('vendor/ort/',out),{recursive:true});await mkdir(new URL('vendor/mediapipe/wasm/',out),{recursive:true});
for(const file of ['ort.wasm.min.mjs','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])await copyFile(new URL('./node_modules/onnxruntime-web/dist/'+file,import.meta.url),new URL('vendor/ort/'+file,out));
for(const file of ['vision_bundle.mjs','wasm/vision_wasm_internal.js','wasm/vision_wasm_internal.wasm','wasm/vision_wasm_nosimd_internal.js','wasm/vision_wasm_nosimd_internal.wasm'])await copyFile(new URL('./node_modules/@mediapipe/tasks-vision/'+file,import.meta.url),new URL('vendor/mediapipe/'+file,out));
async function download(url){const r=await fetch(url);if(!r.ok)throw Error(url+': '+r.status);return new Uint8Array(await r.arrayBuffer())}
const model=await download('https://raw.githubusercontent.com/sb-ai-lab/EmotiEffLib/main/models/affectnet_emotions/onnx/enet_b2_8.onnx');
for(let i=0;i<2;i++)await writeFile(new URL('models/expression.part'+i,out),model.slice(i*16000000,(i+1)*16000000));await writeFile(new URL('vendor/mediapipe/face_landmarker.task',out),await download('https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'));console.log('Browser inference assets ready');
