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
  const RGB=(rgb)=>`rgb(${rgb.map(v=>Math.max(0,Math.min(255,Math.round(v)))).join(',')})`;
  const shadeRgb=(base,f)=>base.map(v=>Math.min(255,Math.max(0,Math.round(v*f))));
  const paintBlock=(ctx,colour,x,y,w,h)=>{ctx.fillStyle=RGB(colour);ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  function applyStyle(ctx,config){
    const n=Math.max(0,Math.min(5,Number(config.preset)||0));
    const hair=HEX(HAIR_COLORS[Math.max(0,Math.min(HAIR_COLORS.length-1,config.hairColor||0))]);
    const skin=HEX(SKIN_COLORS[Math.max(0,Math.min(SKIN_COLORS.length-1,config.skin||0))]);
    const darker=shadeRgb(hair,.75),highlight=shadeRgb(hair,1.55);
    const p=(x,y,w,h,c)=>paintBlock(ctx,c,x,y,w,h);
    switch(n){
      case 1: // 시스루: lighter bangs with individual small strands
        p(61,77,79,17,skin);p(64,74,18,15,hair);p(86,74,12,19,darker);p(108,75,10,18,hair);p(127,72,12,20,darker);
        p(75,62,11,3,highlight);p(113,66,12,3,highlight);break;
      case 2: // 가르마: visible part and smooth side-swept hair
        p(93,47,6,36,skin);p(87,55,6,34,shadeRgb(skin,.88));p(100,54,8,38,hair);
        p(57,60,39,17,hair);p(62,52,44,8,highlight);p(104,60,37,16,hair);p(106,54,20,7,highlight);break;
      case 3: // 스포츠컷: shorter fringe reveals the forehead
        p(58,76,85,24,skin);p(45,66,98,15,hair);p(45,77,84,10,darker);
        p(62,66,65,6,highlight);p(78,84,10,7,hair);break;
      case 4: // 스파이크: upward angular silhouette
        p(59,15,13,29,hair);p(60,7,7,17,darker);p(77,12,14,27,hair);p(80,0,7,19,hair);
        p(98,5,12,32,hair);p(106,0,5,11,darker);p(119,11,15,30,hair);p(128,6,8,20,hair);
        p(66,21,8,6,highlight);p(104,16,8,7,highlight);break;
      case 5: // 장발: longer hair around the sides, preserves face
        p(24,81,16,49,darker);p(28,78,11,45,hair);p(30,103,6,17,highlight);
        p(147,82,13,45,darker);p(145,84,9,40,hair);p(149,108,4,13,highlight);
        p(37,110,8,22,hair);p(138,107,8,24,hair);break;
      default: break; // natural uses exact illustrated hair silhouette
    }
  }
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
    const hair=HEX(HAIR_COLORS[Math.max(0,Math.min(HAIR_COLORS.length-1,Number(config.hairColor)||0))]);
    const skin=HEX(SKIN_COLORS[Math.max(0,Math.min(SKIN_COLORS.length-1,Number(config.skin)||0))]);
    const cloth=HEX((JERSEYS[Math.max(0,Math.min(JERSEYS.length-1,Number(config.jersey)||0))]||JERSEYS[0])[1]);
    for(let i=0;i<a.length;i+=4){
      if(a[i+3]===0)continue;
      const intensity=(a[i]+a[i+1]+a[i+2])/3;
      if(b[i]>125){
        // keep original highlights, shadows and the hand-drawn texture
        let mult=Math.min(2.05,Math.max(.53,intensity/55));
        for(let ch=0;ch<3;ch++)a[i+ch]=Math.min(255,hair[ch]*mult*.91+a[i+ch]*.09);
      }else if(b[i+1]>125){
        let mult=Math.min(1.35,Math.max(.62,intensity/197));
        for(let ch=0;ch<3;ch++)a[i+ch]=Math.min(255,skin[ch]*mult);
      }else if(b[i+2]>125){
        const light=intensity>125;
        for(let ch=0;ch<3;ch++)a[i+ch]=Math.min(255,light?a[i+ch]*.37+cloth[ch]*.63:cloth[ch]*.48+a[i+ch]*.52);
      }
    }
    ctx.putImageData(pix,0,0);
    applyStyle(ctx,config);
    // Jersey number patch: user controls the number instead of being locked to #23 in the source picture.
    const uniform=Number(config.jersey)||0;
    const clothLight=uniform===3?'#f0d6a7':'#e9edf7';
    const jersey=(JERSEYS[Math.min(Math.max(uniform,0),JERSEYS.length-1)]||JERSEYS[0])[1];
    ctx.fillStyle=jersey;ctx.fillRect(70,145,33,34);
    ctx.fillStyle=clothLight;ctx.fillRect(74,148,25,28);
    ctx.fillStyle='#27354b';ctx.font='bold 17px monospace';ctx.textAlign='center';
    ctx.fillText(String(Math.min(99,Math.max(0,Number(config.number)||0))),87,169);
    ctx.textAlign='start';
    return true;
  }
  const originalDraw=pixelDraw;
  pixelDraw=function(canvas,config){
    if(!canvas)return;
    try { if(renderFromReference(canvas,config||avatarConfig))return; }catch(err){console.warn('Pixel renderer fallback',err)}
    originalDraw(canvas,config);
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
      if(explanation)explanation.textContent='제공한 픽셀 캐릭터를 바탕으로 머리·피부·유니폼 색상을 바꾸고 헤어스타일을 선택할 수 있어.';
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