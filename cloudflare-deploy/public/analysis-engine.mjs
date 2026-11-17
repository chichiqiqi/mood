// Prefer a background worker; embedded WebKit browsers may lack worker WebGL
// or classic-worker module imports. Fall back once, retaining the same pixels.
let worker=null,workerUnavailable=false,requestId=0;
const pending=new Map();
function disposeWorker(){worker?.terminate();worker=null;for(const task of pending.values()){clearTimeout(task.timer);task.reject(Error('WORKER_DISPOSED'))}pending.clear()}
function background(canvas){return new Promise(async(resolve,reject)=>{let id;try{if(typeof Worker==='undefined'||typeof createImageBitmap==='undefined')throw Error('WORKER_UNSUPPORTED');if(!worker){worker=new Worker(new URL('./inference-worker.js',import.meta.url));worker.onmessage=({data})=>{const task=pending.get(data.id);if(!task)return;clearTimeout(task.timer);pending.delete(data.id);data.error?task.reject(Error(data.error)):task.resolve(data.result)};worker.onerror=e=>{const tasks=[...pending.values()];pending.clear();worker?.terminate();worker=null;for(const task of tasks){clearTimeout(task.timer);task.reject(Error(e.message||'WORKER_FAILED'))}}}const image=await createImageBitmap(canvas);id=++requestId;const timer=setTimeout(()=>{pending.delete(id);reject(Error('WORKER_TIMEOUT'))},120000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,image},[image]);}catch(e){if(id){clearTimeout(pending.get(id)?.timer);pending.delete(id)}reject(e)}})}
function diagnostic(stage,error){console.warn(`Mood ${stage}:`,error);try{sessionStorage.setItem('mood-analysis-diagnostic',JSON.stringify({stage,message:String(error?.message||error),time:new Date().toISOString()}))}catch{}}
export async function analyzePhoto(canvas,{isCurrent=()=>true}={}){
 if(!workerUnavailable){try{return await background(canvas)}catch(error){diagnostic('worker',error);workerUnavailable=true;disposeWorker();}}
 if(!isCurrent())return null;
 // Yield a paint before the compatibility path; CSS orbit stays composited.
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 try{const {analyze}=await import('./inference.mjs');return await analyze(canvas)}catch(error){diagnostic('compatibility',error);throw error}
}
