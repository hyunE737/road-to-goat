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
  function applyStyle(ctx,config){
    const preset=Number(config.preset)||0;
    const hair=HEX(HAIR_COLORS[Math.max(0,Math.min(HAIR_COLORS.length-1,config.hairColor||0))]);
    const skin=HEX(SKIN_COLORS[Math.max(0,Math.min(SKIN_COLORS.length-1,config.skin||0))]);
    const shadow=shadeRgb(hair,.68),light=shadeRgb(hair,1.55);
    const shape=(color,points)=>{
      ctx.fillStyle=RGB(color);
      ctx.beginPath();
      ctx.moveTo(...points[0]);
      for(const point of points.slice(1)) ctx.lineTo(...point);
      ctx.closePath();
      ctx.fill();
    };
    // Follow the existing crown and leave the eyes and the jersey visible.
    switch(preset){
      case 1:
        shape(skin,[[69,86],[80,81],[89,81],[89,76],[96,76],[96,83],[108,83],[108,77],[115,77],[115,84],[129,86],[129,91],[69,91]]);
        shape(shadow,[[84,78],[90,75],[92,76],[90,82],[88,87],[84,87]]);
        shape(hair,[[103,78],[108,76],[111,77],[109,84],[106,88],[103,88]]);
        break;
      case 2:
        shape(skin,[[89,86],[96,81],[100,74],[102,66],[105,69],[104,77],[110,82],[122,85],[124,90],[85,90]]);
        shape(light,[[66,75],[74,68],[84,64],[95,62],[91,66],[82,69],[74,75]]);
        shape(light,[[110,64],[118,65],[126,69],[132,75],[126,74],[120,70]]);
        break;
      case 3:
        shape(skin,[[62,88],[65,82],[72,82],[72,79],[83,79],[83,76],[97,76],[97,78],[111,78],[111,80],[124,80],[124,83],[136,83],[136,91],[62,91]]);
        shape(light,[[58,69],[67,64],[79,61],[91,61],[88,64],[78,64],[67,68]]);
        break;
      case 4:
        shape(shadow,[[46,50],[49,37],[64,26],[66,13],[73,21],[81,16],[87,5],[93,17],[105,19],[114,10],[115,23],[129,33],[137,48]]);
        shape(hair,[[52,47],[60,35],[70,31],[70,23],[76,27],[86,23],[88,15],[94,24],[106,26],[112,21],[113,29],[126,38],[130,46]]);
        shape(light,[[62,38],[72,33],[77,33],[75,36],[68,39],[63,43]]);
        break;
      case 5:
        shape(shadow,[[31,71],[48,75],[48,91],[44,103],[44,111],[37,125],[30,130],[32,118],[29,108]]);
        shape(hair,[[34,76],[43,79],[43,95],[39,109],[35,115],[33,108]]);
        shape(shadow,[[138,73],[151,71],[155,88],[154,100],[150,114],[145,120],[144,109],[147,99],[139,91]]);
        shape(hair,[[143,77],[149,78],[151,89],[150,98],[146,105],[148,94],[143,87]]);
        break;
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