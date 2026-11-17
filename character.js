/* ROAD TO GOAT player illustration + customization. Uses the image provided by the player. */
'use strict';
(() => {
  if(typeof RTG_ART === 'undefined') return;
  const styleNames=['내추럴','시스루','가르마','스포츠컷','스파이크','장발'];
  if(typeof PIXEL_STYLES !== 'undefined' && PIXEL_STYLES.splice) PIXEL_STYLES.splice(0,PIXEL_STYLES.length,...styleNames);
  const mainArt=new Image();
  const colorMask=new Image();
  let baseReady=false,maskReady=false,maskImage=null;
  const HEX=(hex)=>{const n=parseInt(hex.replace('#',''),16);return [(n>>16)&255,(n>>8)&255,n&255]};
  function renderFromReference(canvas, config){
    if(!baseReady||!maskReady||!maskImage)return false;
    const w=180,h=200;
    if(canvas.width!==w) canvas.width=w;
    if(canvas.height!==h)canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx)return false;
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(mainArt,0,0,w,h);
    const pix=ctx.getImageData(0,0,w,h);
    const a=pix.data,b=maskImage.data;
    const skinIndex=Math.max(0,Math.min(SKIN_COLORS.length-1,Number(config.skin)||0));
    const uniform=Math.max(0,Math.min(JERSEYS.length-1,Number(config.jersey)||0));
    const skin=HEX(SKIN_COLORS[skinIndex]),baseSkin=HEX(SKIN_COLORS[0]);
    const cloth=HEX(JERSEYS[uniform][1]),baseCloth=HEX(JERSEYS[0][1]);
    for(let i=0;i<a.length;i+=4){
      if(!a[i+3]||b[i]>125)continue;
      const intensity=(a[i]+a[i+1]+a[i+2])/3;
      if(b[i+1]>125&&skinIndex){
        const weight=(b[i+1]/255)*Math.min(1,intensity/100)*.9;
        for(let ch=0;ch<3;ch++)a[i+ch]+=(skin[ch]-baseSkin[ch])*weight;
      }else if(b[i+2]>125&&uniform){
        const weight=(b[i+2]/255)*Math.min(1,intensity/75)*.84;
        for(let ch=0;ch<3;ch++)a[i+ch]+=(cloth[ch]-baseCloth[ch])*weight;
      }
    }
    // Remove the pale rim only where it touches the outside of the sprite.
    const edge=new Uint8Array(w*h);
    const queue=[];
    for(let p=0;p<edge.length;p++){
      if(a[p*4+3]===0){edge[p]=1;queue.push(p);}
    }
    for(let cursor=0;cursor<queue.length;cursor++){
      const p=queue[cursor],x=p%w;
      const neighbors=[x>0?p-1:-1,x<w-1?p+1:-1,p-w,p+w];
      for(const q of neighbors){
        if(q<0||q>=edge.length||edge[q])continue;
        const i=q*4;
        const lo=Math.min(a[i],a[i+1],a[i+2]),hi=Math.max(a[i],a[i+1],a[i+2]);
        if(lo<222||hi-lo>16)continue;
        edge[q]=1;
        a[i+3]=0;
        queue.push(q);
      }
    }
    ctx.putImageData(pix,0,0);
    // Jersey number patch: user controls the number instead of being locked to #23 in the source picture.
    const clothLight=uniform===3?'#f0d6a7':'#e9edf7';
    ctx.fillStyle=JERSEYS[uniform][1];
    ctx.beginPath();ctx.roundRect(70,145,33,34,5);ctx.fill();
    ctx.fillStyle=clothLight;
    ctx.beginPath();ctx.roundRect(74,148,25,28,3);ctx.fill();
    ctx.fillStyle='#27354b';ctx.font='bold 17px monospace';ctx.textAlign='center';
    ctx.fillText(String(Math.min(99,Math.max(0,Number(config.number)||0))),87,169);
    ctx.textAlign='start';
    return true;
  }
  const originalDraw=pixelDraw;
  pixelDraw=function(canvas,config){
    if(!canvas)return;
    try { if(renderFromReference(canvas,config||avatarConfig))return; }catch(err){console.warn('Pixel renderer fallback',err)}
    originalDraw(canvas,{...(config||avatarConfig),preset:0,hairColor:0});
  };
  function redraw(){try{if(typeof drawAllAvatars==='function')drawAllAvatars()}catch(e){};}
  mainArt.onload=()=>{baseReady=true;redraw()};
  colorMask.onload=()=>{
    maskReady=true;
    const c=document.createElement('canvas');c.width=180;c.height=200;
    const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(colorMask,0,0);
    maskImage=cx.getImageData(0,0,180,200);redraw()
  };
  mainArt.src=RTG_ART.player;
  colorMask.src=RTG_ART.mask;
  function decorate(){
    // Use the versioned favicon declared in the document head; don't override it.
    document.querySelectorAll('.brandmark').forEach(el=>{
      if(el.dataset.rtgLogo)return;
      el.dataset.rtgLogo='1';el.innerHTML=`<img src="${RTG_ART.logo}" alt="ROAD TO GOAT 로고" class="rtg-brand-img">`;
    });
    document.querySelectorAll('.rtg-topline .rtg-wordmark').forEach(el=>{
      if(el.querySelector('img'))return;
      const logo=document.createElement('img');logo.src=RTG_ART.logo;logo.className='rtg-wordmark-img';logo.alt='ROAD TO GOAT 로고';el.prepend(logo)
    });
    const screen=document.querySelector('.avatar-screen');
    if(screen){
      const h=screen.querySelector('.avatar-configuration .section-top h2');if(h)h.textContent='선수 외형 설정';
      const explanation=screen.querySelector('.avatar-stage-preview p.smallnote');
      if(explanation)explanation.textContent='기본 픽셀 캐릭터의 피부색, 유니폼, 등번호를 설정할 수 있어.';
      const hint=screen.querySelector('.avatar-configuration >p.smallnote');
      if(hint)hint.textContent='선택한 외형은 시즌이 바뀌어도 저장되며, 선수 카드에도 그대로 표시돼.';
    }
  }
  const oldRender=render;
  render=function(){oldRender();decorate();redraw()};
  const oldIntro=renderIntro;
  renderIntro=function(...args){const v=oldIntro(...args);decorate();redraw();return v};
  const oldAvatar=renderAvatarSelection;
  renderAvatarSelection=function(...args){const v=oldAvatar(...args);decorate();redraw();return v};
  decorate();redraw();
})();