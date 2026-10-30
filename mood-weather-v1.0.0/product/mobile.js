const $=id=>document.getElementById(id),mq=matchMedia('(max-width:760px)');
const nav=document.createElement('nav');nav.className='mobile-nav';nav.innerHTML='<button id="mobileNow" class="active">◡<span>此刻</span></button><button id="mobileFlow">≋<span>心流</span></button>';document.body.append(nav);
const direct=document.createElement('button');direct.className='direct-mood';direct.textContent='直接选心情';
const back=document.createElement('button');back.className='mobile-back';back.textContent='←';back.setAttribute('aria-label','返回');$('observe').prepend(back);
const next=document.createElement('button');next.className='primary mobile-next';next.textContent='记录心情';
const retry=document.createElement('button');retry.className='mobile-retry';retry.textContent='重新拍照';document.querySelector('.camera').append(retry);
const analysis=document.querySelector('.result'),details=document.createElement('div'),summary=document.createElement('summary');details.className='mobile-analysis';summary.textContent='查看表情分析';analysis.parentNode.insertBefore(details,analysis);details.append(analysis);
const photo=$('snapshot');details.before(photo);
let step='home';function view(state){if(!mq.matches)return;step=state;document.body.dataset.mobileView=state;if(state==='home'||state==='flow'){if(!$('stop').disabled)$('stop').click();$('observe').hidden=true}else $('observe').hidden=false;$('mobileNow').classList.toggle('active',state!=='flow');$('mobileFlow').classList.toggle('active',state==='flow');window.scrollTo({top:0,behavior:'instant'});}
function enter(){if(!mq.matches)return;view('observe')}
$('enter').addEventListener('click',()=>{if(mq.matches)setTimeout(enter,0)});$('navNow').addEventListener('click',()=>{if(mq.matches)setTimeout(enter,0)});
direct.onclick=()=>view('confirm');back.onclick=()=>view(step==='mood'?'analysis':'home');retry.onclick=()=>{if(!$('stop').disabled)$('stop').click();view('observe');};next.onclick=()=>view('mood');$('mobileNow').onclick=()=>view('home');$('mobileFlow').onclick=()=>view('flow');document.querySelector('.scroll-cue').addEventListener('click',e=>{if(mq.matches){e.preventDefault();view('flow')}});
new MutationObserver(()=>{if(mq.matches&&step==='observe'&&!photo.hidden){view('analysis')}}).observe(photo,{attributes:true,attributeFilter:['hidden']});
$('save').addEventListener('click',()=>{if(mq.matches&&$('saved').textContent.startsWith('心情和快照已一起保存')||mq.matches&&$('saved').textContent.startsWith('已保存心情')){view('flow');let toast=document.createElement('div');toast.className='mobile-toast';toast.textContent='已记下此刻';document.body.append(toast);setTimeout(()=>toast.remove(),2500)}});
function adapt(){if(mq.matches){view('home')}else{delete document.body.dataset.mobileView;$('observe').hidden=false;}}mq.addEventListener('change',adapt);adapt();

const start=$('start'),viewport=document.querySelector('.viewport'),actions=document.querySelector('.actions');function placeStart(){actions.prepend(start)}mq.addEventListener('change',placeStart);placeStart();
