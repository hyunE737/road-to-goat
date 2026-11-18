/* ROAD TO GOAT player illustration + customization. Uses the image provided by the player. */
'use strict';
(() => {
  if(typeof RTG_ART === 'undefined') return;
  const styleNames=['내추럴','시스루','가르마','스포츠컷','스파이크','장발'];
  if(typeof PIXEL_STYLES !== 'undefined' && PIXEL_STYLES.splice) PIXEL_STYLES.splice(0,PIXEL_STYLES.length,...styleNames);
  const lineupArt=new Image();
  let lineupReady=false;
  const transparentLineup=document.createElement('canvas');
  function prepareLineup(){
    const w=lineupArt.naturalWidth,h=lineupArt.naturalHeight;
    transparentLineup.width=w;transparentLineup.height=h;
    const ctx=transparentLineup.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(lineupArt,0,0);
    const pixels=ctx.getImageData(0,0,w,h),data=pixels.data;
    const visited=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
    // Only erase pale neutral background connected to the outside. Character RGB stays untouched.
    const add=(n)=>{if(n<0||n>=w*h||visited[n])return;visited[n]=1;const i=n*4;
      const lo=Math.min(data[i],data[i+1],data[i+2]),hi=Math.max(data[i],data[i+1],data[i+2]);
      if(data[i+3]===0||(lo>=225&&hi-lo<=24)){data[i+3]=0;queue[tail++]=n;}};
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x)}
    for(let y=0;y<h;y++){add(y*w);add(y*w+w-1)}
    while(head<tail){const n=queue[head++],x=n%w;if(x)add(n-1);if(x<w-1)add(n+1);if(n>=w)add(n-w);if(n<w*(h-1))add(n+w)}
    ctx.putImageData(pixels,0,0);
  }
  const mainArt=new Image();
  const colorMask=new Image();
  let baseReady=false,maskReady=false,maskImage=null;
  const HEX=(hex)=>{const n=parseInt(hex.replace('#',''),16);return [(n>>16)&255,(n>>8)&255,n&255]};
  function renderFromReference(canvas, config){
    if(Number.isInteger(config.lineupVersion)&&config.lineupVersion>=0&&config.lineupVersion<6){
      const width=362,height=724;
      if(canvas.width!==width)canvas.width=width;
      if(canvas.height!==height)canvas.height=height;
      const context=canvas.getContext('2d');
      if(!context)return false;
      context.clearRect(0,0,width,height);
      context.imageSmoothingEnabled=false;
      if(lineupReady)context.drawImage(transparentLineup,config.lineupVersion*width,0,width,height,0,0,width,height);
      return true;
    }
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
    const hair=HEX(HAIR_COLORS[config.variant!=null?config.hairColor||0:0]||HAIR_COLORS[0]);
    const baseHair=HEX(HAIR_COLORS[0]);
    for(let i=0;i<a.length;i+=4){
      if(!a[i+3])continue;
      if(b[i]>125){
        const weight=(b[i]/255)*Math.min(1,(a[i]+a[i+1]+a[i+2])/125)*.7;
        for(let ch=0;ch<3;ch++)a[i+ch]+=(hair[ch]-baseHair[ch])*weight;
        continue;
      }
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
  lineupArt.onload=()=>{prepareLineup();lineupReady=true;redraw();if(typeof drawConversationActors==='function')drawConversationActors()};
  lineupArt.src='player-lineup.png';
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
      if(explanation)explanation.textContent='보내준 원본 캐릭터 6명 중 한 명을 선택해.';
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
