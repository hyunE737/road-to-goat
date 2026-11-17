/* ROAD TO GOAT v1.6 — player-career experience layer. Original save key unchanged. */
'use strict';
let rtgIntroReady=false;
// 이 화면은 업적이나 선택지가 아니라 한 선수의 커리어가 흘러가는 순서다.
const rtgJourney=[
 ['벤치에서 시작','고1 농구부에서 출전 기회를 기다립니다.'],
 ['첫 공식 경기','마침내 코트에 들어서는 순간.'],
 ['첫 득점','처음으로 자신의 이름을 점수판에 올립니다.'],
 ['첫 승리','동료들과 첫 승리를 함께합니다.'],
 ['첫 우승','한 시즌의 끝에서 트로피에 도전합니다.'],
 ['MVP와 우승 경쟁','프로 무대에서 최고의 선수가 되기 위해 싸웁니다.'],
 ['GOAT를 향한 여정','긴 선수 생활 끝에 농구 역사에 도전합니다.']
];
function rtgJourneyMarkup(){
 return '<aside class="rtg-journey-panel" aria-label="농구선수 커리어 진행 흐름">'
 +'<div class="rtg-section-label">THE JOURNEY / CAREER STORY</div>'
 +'<h2>한 선수의 이야기는 이렇게 흘러갑니다.</h2>'
 +'<p>처음부터 모든 것이 주어지지는 않습니다. 벤치에서 시작해 더 큰 무대로 나아갑니다.</p>'
 +'<ol class="rtg-journey-list">'+rtgJourney.map((step,i)=>'<li class="rtg-journey-item"><span class="rtg-journey-number">'+String(i+1).padStart(2,'0')+'</span><div><strong>'+step[0]+'</strong><small>'+step[1]+'</small></div></li>').join('')+'</ol>'
 +'<p class="rtg-journey-note">정해진 업적 체크리스트가 아닙니다. 경기 결과와 선택에 따라 각 순간을 맞는 시기는 달라집니다.</p>'
 +'</aside>';
}
function rtgCareerChapter(s){
 if(!s||s.history.length===0)return '고교 벤치에서 시작하는 첫 시즌';
 if(s.retired)return '선수 생활의 마지막 장';
 if(s.stage==='HIGH')return '첫 출전과 득점, 첫 승리를 만들어 가는 시기';
 if(s.stage==='COLLEGE')return '대학 무대에서 프로 진출을 준비하는 시기';
 if(s.stage==='PRO'&&s.league!=='NBA')return '프로 무대에서 첫 트로피를 향한 도전';
 if(goatRank(s)===1)return '농구 역사의 정점, 그리고 계속되는 이야기';
 if(s.awards.mvp>0)return 'MVP를 쌓으며 GOAT에 도전하는 시기';
 return 'NBA에서 첫 우승과 MVP를 노리는 시기';
}
function rtgWelcome(){document.getElementById('app').innerHTML=`<main class="rtg-welcome"><div class="rtg-welcome-shell"><div class="rtg-topline"><span class="rtg-wordmark">RTG<span class="rtg-dot">.</span> ROAD TO GOAT</span><button class="rtg-help-link" onclick="rtgGuideModal()">게임 가이드 ↗</button></div><div class="rtg-welcome-body"><div class="rtg-brief"><div class="rtg-section-label">BASKETBALL CAREER / SEASON SIMULATOR</div><h1>코트 위 첫 경기부터<br><em>역대 최고의 선수</em>까지.</h1><p>고등학교 1학년부터 시작해 한 시즌씩 성장하세요. 경기는 자동으로 진행되고, 훈련·계약·국가대표 소집은 직접 결정합니다.</p><div class="rtg-route"><span>벤치</span><b>→</b><span>첫 경기</span><b>→</b><span>첫 득점</span><b>→</b><span>첫 우승</span><b>→</b><span>GOAT</span></div><div class="rtg-start-actions"><button class="btn rtg-primary" id="rtgBegin" onclick="rtgBeginJourney()">내 커리어 시작하기 <span>↗</span></button><span class="rtg-footnote">원할 때 은퇴 가능</span></div></div>${rtgJourneyMarkup()}</div><div class="rtg-welcome-bottom"><span>MY CAREER · v${GAME_VERSION}</span><span>시즌 자동 시뮬레이션 / 픽셀 결승 관전</span></div></div></main><div id="rtgIntroLoad" class="rtg-load hidden" aria-live="polite"><div class="rtg-load-content"><span class="rtg-wordmark">ROAD TO GOAT</span><strong>선수의 첫 페이지를 여는 중</strong><p id="rtgLoadLabel">고교 리그를 준비하고 있어요</p><div class="rtg-load-track"><div></div></div><small>NEW CAREER · HIGH SCHOOL YEAR 1</small></div></div>`}
function rtgBeginJourney(){const b=document.getElementById('rtgBegin');if(b)b.disabled=true;const o=document.getElementById('rtgIntroLoad');if(o)o.classList.remove('hidden');setTimeout(()=>{const n=document.getElementById('rtgLoadLabel');if(n)n.textContent='나만의 선수 정보를 준비하고 있어요'},430);setTimeout(()=>{rtgIntroReady=true;renderIntro()},1000)}
const rtgOriginalIntro=renderIntro;
renderIntro=function(restoreDraft=false){if(!rtgIntroReady&&!state){rtgWelcome();return;}rtgOriginalIntro(restoreDraft)};
function rtgGuideMarkup(){return `<div class="rtg-guide-list"><div><b>01</b><section><strong>선수 생성</strong><p>국적과 학교, 포지션을 고르고 픽셀 외형을 꾸며 고1 커리어를 시작하세요.</p></section></div><div><b>02</b><section><strong>훈련 방향 설정</strong><p>시즌을 돌리기 전에 슈팅·수비·패스 등 키울 능력치를 지정하세요.</p></section></div><div><b>03</b><section><strong>한 시즌 자동 진행</strong><p>버튼 한 번으로 정규 시즌과 플레이오프가 계산됩니다. 결승은 5대5 관전 화면에서 볼 수 있어요.</p></section></div><div><b>04</b><section><strong>중요한 제안에 답장</strong><p>국가대표 소집은 수락 또는 거절하세요. FA 계약·학교 졸업 후 진로는 직접 결정해야 합니다.</p></section></div><div><b>05</b><section><strong>MVP와 GOAT 랭킹</strong><p>시즌 누적 기록, 뉴스·팬 반응, 트로피 수를 확인하세요. 계약이 끝난 뒤 새 제안이 없으면 은퇴합니다.</p></section></div></div><p class="rtg-guide-note">저장 정보는 현재 브라우저에 보관됩니다. 중요한 커리어는 설정에서 백업 파일을 내려받아 주세요.</p>`}
function rtgGuideModal(){showModal('게임 가이드',rtgGuideMarkup())}
function rtgGuidePage(){return `${panelTitle('게임 가이드','<span class="pill">처음 플레이한다면 여기부터</span>')}<section class="card rtg-guide-page"><h3>5분 만에 플레이 방법 이해하기</h3>${rtgGuideMarkup()}<div class="rtg-action-bar"><button class="btn" onclick="switchTab('home')">대시보드로 돌아가기</button><button class="btn secondary" onclick="switchTab('training')">훈련 선택하기</button></div></section>`}
function rtgNewsInit(s){if(!s)return;s.news??=[];s.story??=[];}
if(state){rtgNewsInit(state);save()}
const rtgOldEnsure=ensureV13;
ensureV13=function(s){const x=rtgOldEnsure(s);rtgNewsInit(x);return x};
function rtgRival(a,b){const pairs=[['Los Angeles Lakers','Boston Celtics'],['Golden State Warriors','Cleveland Cavaliers'],['Chicago Bulls','Detroit Pistons'],['New York Knicks','Boston Celtics'],['Los Angeles Lakers','Golden State Warriors']];return !!a&&!!b&&pairs.some(([x,y])=>(a===x&&b===y)||(a===y&&b===x))}
function rtgPublish(s,type,from='',to=''){if(!s)return;rtgNewsInit(s);const p=s.player.name;let title='',summary='',comments=[];const rival=rtgRival(from,to),a=koTeam(from),b=koTeam(to);
 if(type==='interest'){title=`${b}, ${p} 영입에 관심`;summary=`${s.year}시즌 이후 ${b}가 선수의 최근 성적을 지켜보고 있다는 소식. 아직 확정된 계약은 없다.`;comments=['팬 A · 우리 팀에도 이런 유형의 선수가 필요해.','팬 B · 소문보다는 공식 제안을 기다려 보자.'];}
 else if(type==='transfer'||type==='trade'){title=rival?`라이벌 구단행! ${p}, ${b} 유니폼 입는다`:`${p}, ${a} 떠나 ${b}로 이동`;summary=type==='trade'?`${a}와 ${b}의 거래로 이적이 확정됐다. 계약과 역할은 새로운 소속팀에서 이어진다.`:`새로운 도전을 선택한 ${p}. 다음 시즌의 출전 시간과 성적에 관심이 모인다.`;comments=rival?['전 소속팀 팬 · 하필 라이벌팀이라니, 다음 맞대결이 기다려진다.','새 팀 팬 · 코트에서 실력으로 보여주길!','중립 팬 · 올 시즌 가장 뜨거운 이적 소식.']:['전 소속팀 팬 · 함께한 시즌은 오래 기억할 거야.','새 팀 팬 · 새로운 출발을 응원한다.','기자 · 다음 시즌 역할 변화가 관전 포인트다.'];}
 else if(type==='retire'){title=`${p}, ${s.age}세에 코트를 떠나다`;summary=`고등학교 시절부터 이어진 긴 여정의 마지막 장. NBA 정규 시즌 MVP ${s.awards.mvp}회, 파이널 MVP ${s.awards.fmvp}회, 우승 ${s.awards.rings}회를 남겼다.`;comments=['팬 A · 수많은 경기보다 함께한 시간이 더 오래 기억날 것 같아.','팬 B · 명예의 전당에 남을 커리어를 축하한다.','해설 · 기록은 남고, 새로운 선수들이 그 기록에 도전할 것이다.'];}
 else return;
 s.news.unshift({id:`${s.year}-${type}-${s.news.length}`,year:s.year,type:title.includes('라이벌')?'rival':type,title,summary,comments});s.news=s.news.slice(0,80);}
function rtgNewsPage(s){rtgNewsInit(s);return `${panelTitle('코트 밖 뉴스룸','<span class="pill">게임 속 가상 기사 · 팬 반응</span>')}<div class="rtg-editor-note">실제 기사나 실제 팬 발언이 아닌, 게임 진행 상황에 따라 만들어지는 가상의 스토리입니다.</div>${s.news.length?s.news.map(n=>`<article class="card rtg-article"><div class="rtg-article-top"><span>${n.type==='rival'?'HOT ISSUE':n.type==='retire'?'CAREER FINALE':n.type==='interest'?'TRANSFER WATCH':'BREAKING NEWS'}</span><time>${n.year} 시즌</time></div><h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p><div class="rtg-comments"><strong>팬 반응</strong>${n.comments.map(c=>`<div>${esc(c)}</div>`).join('')}</div></article>`).join(''):`<div class="card rtg-empty-news"><h3>아직 기사 없음</h3><p>프로 계약·이적·트레이드·은퇴처럼 중요한 사건이 생기면 이곳에 기사와 팬 반응이 쌓여요.</p><button class="btn secondary" onclick="switchTab('home')">커리어로 돌아가기</button></div>`}`}
function rtgStoryLine(s){if(s.retired)return '모든 시즌이 끝났습니다. 당신의 이름과 기록은 커리어 역사에 남았습니다.';if(s.stage==='HIGH'){if(s.age===16)return '새 학기, 체육관 문을 열었습니다. 벤치에서 시작하는 하루도 언젠가 전설의 첫 페이지가 될 수 있습니다.';if(s.age===17)return '첫 시즌을 치른 뒤, 더 많은 기회가 찾아오고 있습니다. 이제는 같은 학년의 라이벌도 당신을 지켜봅니다.';return '마지막 고교 시즌. 졸업 후 어떤 무대에서 뛰게 될지 스카우트들의 시선이 쏠립니다.'}if(s.stage==='COLLEGE')return '대학 코트의 조명이 더 밝아졌습니다. 프로 구단들은 경기력과 잠재력을 함께 평가합니다.';if(s.stage==='PRO'&&s.league!=='NBA')return '프로 유니폼을 입었지만 여정은 끝이 아닙니다. 이제 더 큰 무대의 문을 두드릴 차례입니다.';if(s.age>=35)return '전성기는 영원하지 않지만, 경험은 또 다른 무기입니다. 남은 시즌마다 역사를 새로 씁니다.';return '매년 더 어려운 승부가 펼쳐집니다. 팬들은 당신이 또 한 번 MVP 경쟁에 나설지 궁금해합니다.'}
function rtgContextStrip(s){const action=s.pendingIntl?'국가대표 소집에 답장하기':s.market.required?'계약과 진로 결정하기':'다음 시즌 시작하기';const where=s.pendingIntl?'messages':s.market.required?'market':'home';return '<div class="rtg-next-step"><span class="rtg-kicker">CURRENT CHAPTER / 지금의 이야기</span><div><strong>'+rtgCareerChapter(s)+'</strong><span>다음 행동: '+action+'</span></div><button class="btn secondary small" onclick="'+(s.pendingIntl?'showInternationalInvite()':"switchTab('"+where+"')")+'">'+(s.pendingIntl?'메시지 확인':s.market.required?'제안 확인':'시즌 진행')+' →</button></div>'}
const rtgOldHome=home;
home=function(s){let html=rtgOldHome(s);html=html.replace('<section class="hero">',rtgContextStrip(s)+'<section class="hero">');return html+`<section class="card rtg-story"><span class="rtg-kicker">COURTSIDE STORY / ${s.year}</span><h3>지금, 당신의 이야기</h3><p>${esc(rtgStoryLine(s))}</p><div class="rtg-action-bar"><button class="btn secondary small" onclick="switchTab('news')">기사와 팬 반응 보기 →</button><button class="btn ghost small" onclick="switchTab('guide')">플레이 가이드</button></div></section>`};
function rtgCareerFinal(s){const histories=s.history||[];const totals=histories.reduce((acc,r)=>{acc.points+=(r.pts||0);acc.rebounds+=(r.reb||0);acc.assists+=(r.ast||0);acc.games+=(r.games||0);return acc},{points:0,rebounds:0,assists:0,games:0});return `${panelTitle('커리어 엔딩','<span class="pill gold">CAREER LEGACY</span>')}<div class="rtg-legacy-cover"><span class="rtg-kicker">THE LAST DANCE</span><h1>${esc(s.player.name)}</h1><p>${s.retired?`은퇴 ${s.age}세 · ${histories.length}시즌의 기록`:`현재까지의 커리어 · ${histories.length}시즌 진행`}</p><strong>ALL-TIME GOAT RANK #${goatRank(s)}</strong></div><div class="grid four rtg-legacy-stats">${[['NBA MVP',s.awards.mvp+'회'],['파이널 MVP',s.awards.fmvp+'회'],['NBA 우승',s.awards.rings+'회'],['올스타',s.awards.allstar+'회'],['전체 득점',fmt(totals.points)],['전체 리바운드',fmt(totals.rebounds)],['전체 어시스트',fmt(totals.assists)],['전체 경기',fmt(totals.games)]].map(([k,v])=>statbox(k,v)).join('')}</div><div class="card"><h3>마지막 커리어 기사</h3><p class="desc">${s.retired?`${esc(s.player.name)} 선수의 농구 인생이 마무리되었습니다. MVP와 우승, 수많은 시즌의 기록이 남았습니다.`:'은퇴 이후 이 페이지가 최종 커리어 성적표가 됩니다.'}</p><div class="rtg-action-bar"><button class="btn secondary" onclick="switchTab('history')">연도별 기록 보기</button><button class="btn secondary" onclick="switchTab('news')">마지막 기사 보기</button><button class="btn secondary" onclick="switchTab('settings')">백업 및 설정</button></div></div>`}
const rtgOldRenderTab=renderTab;
renderTab=function(){if(!state)return;if(tab==='news'||tab==='guide'||tab==='legacy'){document.getElementById('pageContent').innerHTML=tab==='news'?rtgNewsPage(state):tab==='guide'?rtgGuidePage():rtgCareerFinal(state);drawAllAvatars();return;}rtgOldRenderTab()};
navItems.splice(4,0,['news','▣','기사·팬 반응']);navItems.splice(navItems.length-2,0,['guide','?','게임 가이드'],['legacy','♜','커리어 엔딩']);
const rtgOldOpenMenu=openGameMenu;
openGameMenu=function(){rtgOldOpenMenu();const grid=document.querySelector('.menu-grid');if(!grid)return;const more=`<button class="menu-tile" onclick="${state?"goMenuTab('news')":"closeModal();rtgGuideModal()"}"><span class="tile-icon">▣</span><strong>${state?'뉴스·팬 반응':'플레이 안내'}</strong><small>${state?'이적·라이벌·은퇴 기사':'목표와 게임 진행 방법'}</small></button><button class="menu-tile" onclick="${state?"goMenuTab('guide')":"closeModal();rtgGuideModal()"}"><span class="tile-icon">?</span><strong>게임 가이드</strong><small>처음부터 차근차근</small></button>`;grid.insertAdjacentHTML('beforeend',more)};
const rtgOldSignOffer=signOffer;
signOffer=function(id){if(!state)return;const from=state.team;const league=state.league;rtgOldSignOffer(id);const proceed=modalAction;if(typeof proceed==='function'){modalAction=function(){proceed();if(state&&from!==state.team){rtgPublish(state,'transfer',from,state.team);save();render();toast(rtgRival(from,state.team)?'라이벌팀 이적! 뉴스룸에서 팬 반응을 확인해 봐.':'이적 기사가 뉴스룸에 올라왔어.')}}}};
const rtgOldRequestTrade=requestTrade;
requestTrade=function(){const from=state?.team;rtgOldRequestTrade();if(state&&from&&from!==state.team){rtgPublish(state,'trade',from,state.team);save();render()}};
const rtgOldSeasonCalculate=seasonCalculate;
seasonCalculate=function(s){rtgNewsInit(s);const from=s.team;const r=rtgOldSeasonCalculate(s);if(r.trade&&from!==s.team)rtgPublish(s,'trade',from,s.team);if(s.market?.offers?.length&&s.market.kind!=='graduate'&&s.market.kind!=='collegeEnd'){const offer=s.market.offers[0];if(offer?.team)rtgPublish(s,'interest',s.team,offer.team)}if(s.retired&&!s.news.some(n=>n.type==='retire'))rtgPublish(s,'retire');s.story.unshift({year:r.year,text:rtgStoryLine(s)});s.story=s.story.slice(0,45);return r};
const rtgOldRetire=retireNow;
retireNow=function(reason){if(state){rtgPublish(state,'retire');save()}rtgOldRetire(reason);tab='legacy';render();toast('최종 커리어 기록을 확인해 봐.')};
const rtgOldSeasonResult=seasonResultModal;
seasonResultModal=function(r){if(state?.retired){tab='legacy';render();showModal('커리어 마지막 장',`<p class="desc">${esc(state.player.name)} 선수의 커리어가 끝났습니다. 최종 기록과 GOAT 순위를 확인해 보세요.</p><div class="mini-grid"><div class="mini-box"><span class="label">NBA 정규 MVP</span><strong>${state.awards.mvp}회</strong></div><div class="mini-box"><span class="label">NBA 우승</span><strong>${state.awards.rings}회</strong></div></div>`);return;}rtgOldSeasonResult(r)};
function rtgCourtFive(){const pos=[['PG',14,23],['SG',25,72],['SF',33,38],['PF',43,76],['C',43,24]];const make=(side,i)=>{const p=pos[i];const isHome=side==='a';const x=isHome?p[1]:100-p[1],y=isHome?p[2]:100-p[2];return `<div id="${i===0?(isHome?'simPlayerA':'simPlayerB'):`sim-${side}-${i}`}" class="rtg-athlete ${isHome?'rtg-home':'rtg-away'}" style="left:${x}%;top:${y}%;--jersey-num:${i+1}"><span class="rtg-shadow"></span><span class="rtg-legs"></span><span class="rtg-torso"><b>${i+1}</b></span><span class="rtg-arms"></span><span class="rtg-head"></span><span class="rtg-hair"></span><small>${p[0]}</small></div>`};return `<div class="rtg-court-label">HOME · 5 VS 5 · AWAY</div><span class="sim-hoop left"></span><span class="sim-hoop right"></span>${pos.map((_,i)=>make('a',i)).join('')}${pos.map((_,i)=>make('b',i)).join('')}<span id="simBall" class="sim-ball"></span>`}
const rtgOldStartReplay=startReplaySeries;
startReplaySeries=function(){rtgOldStartReplay();const court=document.querySelector('.sim-court');if(court){court.classList.add('rtg-full-court');court.innerHTML=rtgCourtFive()}};
const rtgOldReplayTick=replayTick;
replayTick=function(){rtgOldReplayTick();const court=document.querySelector('.rtg-full-court');if(!court)return;const n=replayStep+replayGame*39;court.querySelectorAll('.rtg-athlete').forEach((p,i)=>{if(i===0||i===5)return;p.style.transform=`translate(${Math.sin(n*.43+i*1.7)*8}px,${Math.cos(n*.37+i)*7}px)`})};
const rtgOldPixelDraw=pixelDraw;
pixelDraw=function(canvas,config){rtgOldPixelDraw(canvas,config);if(!canvas||!canvas.getContext)return;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;const skin=SKIN_COLORS[config.skin??0]||SKIN_COLORS[0],uni=(JERSEYS[config.jersey??0]||JERSEYS[0])[1];const dot=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};dot(12,25,2,6,'#f2f5f8');dot(26,25,2,6,'#f2f5f8');dot(12,39,5,1,'#ebeffa');dot(23,39,5,1,'#ebeffa');dot(12,46,6,1,'#ccd5de');dot(22,46,6,1,'#ccd5de');dot(5,33,5,2,'#ffffff');dot(30,33,5,2,'#ffffff');dot(16,17,2,1,'#835c45');dot(22,17,2,1,'#835c45');dot(18,21,4,1,'#f7f7ed');dot(20,33,1,2,shade(uni,.55));};
const rtgOldRender=render;
render=function(){rtgOldRender();document.body.classList.toggle('rtg-retired',!!state?.retired)};
render();