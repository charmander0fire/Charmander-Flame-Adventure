// =============================================
//   Charmander's Flame Adventure
//   파이리의 불꽃 모험 - game.js
// =============================================

const TILE = 32;
const MAP_COLS = 25;
const MAP_ROWS = 20;

const DIR = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
const DIR_ROW  = { [0/*DOWN*/]: 3, [1/*LEFT*/]: 1, [2/*RIGHT*/]: 2, [3/*UP*/]: 0 }; // 파이리 시트
const NPC_DIR_ROW = { [0]: 0, [1]: 1, [2]: 2, [3]: 3 };                              // NPC 시트

const T = {
  GRASS:0, PATH:1, TREE:2, FLOWER:3, FOUNTAIN:4,
  HOUSE_R:5, HOUSE_G:6, HOUSE_B:7, LAB:8, POKE:9, MART:10, WALK:99
};
const SOLID = new Set([T.TREE,T.HOUSE_R,T.HOUSE_G,T.HOUSE_B,T.LAB,T.POKE,T.MART,T.FOUNTAIN]);

// =============================================
//   맵 — 불씨마을 (25×20)
// =============================================
const BASE_MAP = [
//  0          1          2          3          4          5          6          7          8          9          10         11         12         13         14         15         16         17         18         19         20         21         22         23         24
  [T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS],  // 0
  [T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE],   // 1
  [T.TREE,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 2
  [T.TREE,    T.GRASS,   T.HOUSE_B, T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.LAB,     T.WALK,    T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 3
  [T.TREE,    T.GRASS,   T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.WALK,    T.WALK,    T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.POKE,    T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 4
  [T.TREE,    T.GRASS,   T.PATH,    T.PATH,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.WALK,    T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 5
  [T.TREE,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.TREE],   // 6 (메인 도로)
  [T.TREE,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.FLOWER,  T.FLOWER,  T.FOUNTAIN,T.FLOWER,  T.FLOWER,  T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 7 (광장)
  [T.TREE,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 8
  [T.TREE,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.TREE],   // 9 (2번 도로)
  [T.TREE,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 10
  [T.TREE,    T.GRASS,   T.HOUSE_R, T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.MART,    T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 11
  [T.TREE,    T.GRASS,   T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.FLOWER,  T.FLOWER,  T.GRASS,   T.FLOWER,  T.FLOWER,  T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.WALK,    T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 12
  [T.TREE,    T.GRASS,   T.PATH,    T.PATH,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.PATH,    T.PATH,    T.PATH,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 13
  [T.TREE,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.PATH,    T.TREE],   // 14 (3번 도로)
  [T.TREE,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 15
  [T.TREE,    T.GRASS,   T.HOUSE_G, T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 16
  [T.TREE,    T.GRASS,   T.WALK,    T.WALK,    T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.TREE],   // 17
  [T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE,    T.TREE],   // 18
  [T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS,   T.GRASS],  // 19
];

// =============================================
//   NPC 정의 — 스토리 대사 반영
// =============================================
const NPCS = [
  // ── 광장 (태초의 불씨 분수 주변) ──
  { id:'elder',   tx:8,  ty:8,  dir:DIR.DOWN,  name:'할라 장로',  sprite:'npc_할라',   wander:false,
    lines:["파이리야... 네 꼬리불꽃이 작아진 것을 알고 있느냐.",
           "태초의 불씨가 약해지기 시작했어. 세계 곳곳에서 불꽃이 꺼지고 있지.",
           "이상하게도... 네 불꽃은 작아졌지만 꺼지지 않았구나.",
           "저 분수 아래에 태초의 불씨로 가는 길이 있다고 전해진다.",
           "네가 그 불꽃을 되살릴 자일지도 모르겠어."]},

  { id:'ryuong',  tx:11, ty:7,  dir:DIR.LEFT,  name:'류옹',       sprite:'npc_류옹',   wander:true,
    lines:["저 분수... 예전엔 태초의 불씨로 빛났는데.",
           "불꽃이 꺼진 날 밤, 동쪽 숲에서 이상한 소리가 들렸어.",
           "검은 연기 같은 게 숲 위로 피어올랐고..."]},

  { id:'mari',    tx:6,  ty:7,  dir:DIR.RIGHT, name:'마리',       sprite:'npc_마리',   wander:true,
    lines:["밤이 점점 길어지고 있어요.",
           "야생 포켓몬들도 눈빛이 달라졌고...",
           "할라 장로님이 걱정하시는 게 느껴져요."]},

  // ── 연구소 구역 ──
  { id:'scholar', tx:11, ty:5,  dir:DIR.DOWN,  name:'포플러',     sprite:'npc_포플러', wander:false,
    lines:["파이리의 불꽃 반응이 특이해요.",
           "태초의 불씨와 연결된 파이리 계열 포켓몬만 불꽃이 꺼지지 않고 있어요.",
           "연구소 박사님이 그 이유를 분석 중이에요.",
           "잿빛숲에서도 이상한 불꽃이 목격됐어요... 조심해야 할 거예요."]},

  { id:'mamane',  tx:13, ty:4,  dir:DIR.LEFT,  name:'마마네',     sprite:'npc_마마네', wander:true,
    lines:["박사님이 말씀하셨어! 불꽃 에너지가 지하에서 흐른다고!",
           "근데 최근에 그 흐름이 완전히 끊겼대.",
           "박사님 얼굴이 많이 어두웠어..."]},

  // ── 메인 도로 (row 6) ──
  { id:'trainer', tx:4,  ty:6,  dir:DIR.RIGHT, name:'플린',       sprite:'npc_플린',   wander:false,
    lines:["...",
           "새로운 여행자군.",
           "불꽃이 꺼지는 게 자연현상이라고 생각하는 사람들이 있어.",
           "틀렸어. 누군가 의도적으로 꺼뜨리고 있어.",
           "서두르는 게 좋을걸."]},

  { id:'hex',     tx:20, ty:6,  dir:DIR.LEFT,  name:'헥스',       sprite:'npc_헥스',   wander:true,
    lines:["어두운 불꽃을 본 적 있어?",
           "불을 꺼뜨리는 불꽃이야. 망화(亡火)라고 부르지.",
           "그걸 사용하는 자가 있다면... 태초의 불씨도 위험해."]},

  { id:'heoil',   tx:16, ty:9,  dir:DIR.DOWN,  name:'호일',       sprite:'npc_호일',   wander:true,
    lines:["안녕! 불씨마을에 온 걸 환영해!",
           "여기 광장 분수가 예전엔 엄청 빛났는데...",
           "요즘은 꺼져 있어서 좀 쓸쓸하다."]},

  // ── 포켓몬 센터 구역 ──
  { id:'kid',     tx:19, ty:5,  dir:DIR.DOWN,  name:'하우',       sprite:'npc_하우',   wander:true,
    lines:["야! 파이리다!",
           "우리 아버지가 저 포켓몬 센터에서 일해.",
           "불꽃이 꺼지기 시작한 뒤로 아버지 얼굴이 어두워졌어.",
           "파이리, 꼭 뭔가 해줘!"]},

  { id:'rutia',   tx:21, ty:8,  dir:DIR.LEFT,  name:'루티아',     sprite:'npc_루티아', wander:true,
    lines:["포켓몬 센터에서 쉬다 가세요.",
           "불꽃이 약해진 포켓몬들이 많이 와요...",
           "파이리는 꼬리불꽃이 살아있군요. 다행이에요."]},

  // ── 하단 구역 ──
  { id:'shopkeeper', tx:16, ty:13, dir:DIR.UP, name:'헤일리',   sprite:'npc_헤일리', wander:false,
    lines:["어서 오세요, 불씨마을 마트입니다!",
           "요즘 여행자가 늘었어요. 불꽃 관련 소문 때문인지...",
           "몸조심하고 떠나세요."]},

  { id:'lira',    tx:5,  ty:12, dir:DIR.RIGHT, name:'리라',       sprite:'npc_리라',   wander:true,
    lines:["이 마을... 예전엔 불꽃 축제가 열렸어.",
           "태초의 불씨 아래서 모두 함께 춤을 췄지.",
           "파이리, 그 불꽃을 반드시 되찾아줘."]},

  { id:'salaryman', tx:20, ty:14, dir:DIR.DOWN, name:'회사원',  sprite:'npc_회사원', wander:true,
    lines:["아, 바빠 바빠...",
           "불꽃이 꺼졌다고요? 야근이 더 길어지겠네.",
           "...사실 무서워요. 밤이 너무 길어지고 있잖아요."]},
];

// =============================================
//   프롤로그 인트로 — 실제 스토리 반영
// =============================================
const INTRO_STORY = [
  "불꽃을 생명의 상징으로 여기는 작은 마을 — 불씨마을.",
  "어느 날, 마을의 수호신 「태초의 불씨」가 갑자기 약해지기 시작했다.",
  "세계 곳곳에서 불꽃이 이유 없이 꺼졌다.",
  "밤이 지나치게 길어졌다.",
  "야생 포켓몬들이 흉포해졌다.",
  "그리고 파이리의 꼬리불꽃도 평소보다 작아졌다.",
  "마을 장로가 조용히 말했다.",
  "「네 불꽃은 작아졌지만… 이상하게도 꺼지지는 않는구나.」",
  "파이리는 태초의 불씨를 되살리기 위해 걸음을 내딛었다.",
  "— Charmander's Flame Adventure —",
  "[ WASD · 방향키: 이동 / 스페이스: 대화 ]",
];

// =============================================
//   게임 상태
// =============================================
const state = {
  player: { tx:12, ty:10, dir:DIR.DOWN, frame:0, animTimer:0 },
  npcs:   NPCS.map(n => ({...n, frame:0, animTimer:0, moveTimer:0})),
  camera: { x:0, y:0 },
  keys:   {},
  moveQueue: [],
  dialog: { active:false, lines:[], index:0, speaker:'', sprite:'', color:'#f0c040' },
  intro:  { active:true, lines:INTRO_STORY, index:0 },
  images: {},
  lastTime: 0,
};

// =============================================
//   이미지 로딩
// =============================================
function loadImages(cb) {
  const names = Object.keys(ASSETS_B64);
  let done = 0;
  names.forEach(name => {
    const img = new Image();
    img.onload = () => { state.images[name] = img; if (++done === names.length) cb(); };
    img.src = ASSETS_B64[name];
  });
}

// =============================================
//   유틸
// =============================================
const DIR_DELTA = {
  [DIR.UP]:   {dx:0,dy:-1}, [DIR.DOWN]: {dx:0,dy:1},
  [DIR.LEFT]: {dx:-1,dy:0}, [DIR.RIGHT]:{dx:1,dy:0},
};
function getTile(tx,ty){ return (ty<0||ty>=MAP_ROWS||tx<0||tx>=MAP_COLS)?T.TREE:BASE_MAP[ty][tx]; }
function isSolid(tx,ty){
  if(SOLID.has(getTile(tx,ty))) return true;
  return state.npcs.some(n=>n.tx===tx&&n.ty===ty);
}
function isSolidForNPC(tx,ty,excludeId){
  if(tx<1||tx>=MAP_COLS-1||ty<1||ty>=MAP_ROWS-1) return true;
  if(SOLID.has(getTile(tx,ty))) return true;
  if(state.player.tx===tx&&state.player.ty===ty) return true;
  return state.npcs.some(n=>n.id!==excludeId&&n.tx===tx&&n.ty===ty);
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function opposite(d){ return {[DIR.UP]:DIR.DOWN,[DIR.DOWN]:DIR.UP,[DIR.LEFT]:DIR.RIGHT,[DIR.RIGHT]:DIR.LEFT}[d]; }

// =============================================
//   카메라
// =============================================
function updateCamera(canvas){
  const p=state.player;
  state.camera.x=clamp(p.tx*TILE-canvas.width/2+TILE/2, 0, MAP_COLS*TILE-canvas.width);
  state.camera.y=clamp(p.ty*TILE-canvas.height/2+TILE/2, 0, MAP_ROWS*TILE-canvas.height);
}

// =============================================
//   입력
// =============================================
function setupInput(){
  window.addEventListener('keydown', e=>{
    if(state.keys[e.code]) return;
    state.keys[e.code]=true;
    if(e.code==='Space'||e.code==='Enter'){
      if(state.intro.active){ advanceIntro(); return; }
      if(state.dialog.active){ advanceDialog(); return; }
      tryTalk(); return;
    }
    if(state.intro.active||state.dialog.active) return;
    const m={'KeyW':DIR.UP,'ArrowUp':DIR.UP,'KeyS':DIR.DOWN,'ArrowDown':DIR.DOWN,
             'KeyA':DIR.LEFT,'ArrowLeft':DIR.LEFT,'KeyD':DIR.RIGHT,'ArrowRight':DIR.RIGHT};
    if(m[e.code]!==undefined) state.moveQueue.push(m[e.code]);
  });
  window.addEventListener('keyup', e=>{ state.keys[e.code]=false; });
}

// =============================================
//   이동
// =============================================
function processMove(){
  if(state.dialog.active||state.intro.active||!state.moveQueue.length) return;
  const dir=state.moveQueue.shift();
  const p=state.player;
  p.dir=dir;
  const {dx,dy}=DIR_DELTA[dir];
  const nx=p.tx+dx, ny=p.ty+dy;
  if(!isSolid(nx,ny)){ p.tx=nx; p.ty=ny; p.frame=(p.frame+1)%4; }
}

// =============================================
//   NPC 업데이트
// =============================================
function updateNPCs(dt){
  for(const npc of state.npcs){
    npc.animTimer+=dt;
    if(npc.animTimer>350){ npc.animTimer=0; npc.frame=(npc.frame+1)%4; }
    if(!npc.wander) continue;
    npc.moveTimer+=dt;
    if(npc.moveTimer>2000+Math.random()*1500){
      npc.moveTimer=0;
      const dirs=[DIR.UP,DIR.DOWN,DIR.LEFT,DIR.RIGHT];
      const d=dirs[Math.floor(Math.random()*4)];
      if(Math.random()<0.3){ npc.dir=d; continue; }
      const {dx,dy}=DIR_DELTA[d];
      const nx=npc.tx+dx, ny=npc.ty+dy;
      if(!SOLID.has(getTile(nx,ny))&&!isSolidForNPC(nx,ny,npc.id)){
        npc.tx=nx; npc.ty=ny; npc.dir=d;
      }
    }
  }
}

// =============================================
//   대화
// =============================================
function tryTalk(){
  const p=state.player;
  const {dx,dy}=DIR_DELTA[p.dir];
  const fx=p.tx+dx, fy=p.ty+dy;
  for(const npc of state.npcs){
    if(npc.tx===fx&&npc.ty===fy){
      npc.dir=opposite(p.dir);
      state.dialog={active:true,lines:npc.lines,index:0,speaker:npc.name,sprite:npc.sprite,color:'#f0c040'};
      return;
    }
  }
}
function advanceDialog(){
  const d=state.dialog;
  if(++d.index>=d.lines.length) state.dialog={active:false,lines:[],index:0,speaker:'',sprite:'',color:'#f0c040'};
}
function advanceIntro(){
  if(++state.intro.index>=state.intro.lines.length) state.intro.active=false;
}

// =============================================
//   렌더링
// =============================================
function render(canvas,ctx){
  const imgs=state.images, cam=state.camera;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.imageSmoothingEnabled=false;

  // 바닥
  for(let row=0;row<MAP_ROWS;row++){
    for(let col=0;col<MAP_COLS;col++){
      const sx=col*TILE-cam.x, sy=row*TILE-cam.y;
      if(sx+TILE<0||sx>canvas.width||sy+TILE<0||sy>canvas.height) continue;
      drawTile(ctx,imgs.grass,sx,sy,TILE,TILE);
      const t=BASE_MAP[row][col];
      if(t===T.PATH) drawTile(ctx,imgs.path,sx,sy,TILE,TILE);
    }
  }

  // 오브젝트 + 캐릭터 (Y-sort)
  for(let row=0;row<MAP_ROWS;row++){
    for(let col=0;col<MAP_COLS;col++){
      const sx=col*TILE-cam.x, sy=row*TILE-cam.y;
      const t=BASE_MAP[row][col];
      switch(t){
        case T.TREE:    ctx.drawImage(imgs.tree,    sx-4,  sy-32, 60,  64);  break;
        case T.FLOWER:  ctx.drawImage(imgs.flower,  sx-8,  sy-8,  48,  48);  break;
        case T.FOUNTAIN:ctx.drawImage(imgs.fountain,sx-8,  sy-66, 80,  96);  break;
        case T.HOUSE_R: ctx.drawImage(imgs.house_red,  sx-4, sy-86,140,150); break;
        case T.HOUSE_G: ctx.drawImage(imgs.house_green, sx-4, sy-86,116,150);break;
        case T.HOUSE_B: ctx.drawImage(imgs.house_blue,  sx-4, sy-86,140,150);break;
        case T.LAB:     ctx.drawImage(imgs.lab,     sx-8, sy-128,180,195);   break;
        case T.POKE:    ctx.drawImage(imgs.pokecenter,sx-8,sy-80, 176,145);  break;
        case T.MART:    ctx.drawImage(imgs.mart,    sx-8, sy-84, 161,150);   break;
      }
    }
    // NPC
    for(const npc of state.npcs){
      if(npc.ty!==row) continue;
      const sx=npc.tx*TILE-cam.x, sy=npc.ty*TILE-cam.y;
      drawNPC(ctx,imgs,npc,sx,sy);
    }
    // 플레이어
    if(state.player.ty===row){
      const p=state.player;
      drawPlayer(ctx,imgs.charmander,p,p.tx*TILE-cam.x,p.ty*TILE-cam.y);
    }
  }

  // UI
  if(state.intro.active)        drawIntro(ctx,canvas);
  else if(state.dialog.active)  drawDialog(ctx,canvas);
  else                          drawHUD(ctx,canvas);
}

function drawTile(ctx,img,x,y,w,h){
  if(!img){ctx.fillStyle='#6ab04c';ctx.fillRect(x,y,w,h);return;}
  ctx.drawImage(img,x,y,w,h);
}

function drawPlayer(ctx,img,p,sx,sy){
  if(!img){ctx.fillStyle='#f0a030';ctx.fillRect(sx+4,sy+4,TILE-8,TILE-8);return;}
  const row=DIR_ROW[p.dir], col=p.frame;
  ctx.drawImage(img, col*64,row*64,64,64, sx-8,sy-16,48,48);
}

function drawNPC(ctx,imgs,npc,sx,sy){
  const img=imgs[npc.sprite];
  const fw=32,fh=48,row=NPC_DIR_ROW[npc.dir],col=npc.frame%4;
  if(img){
    ctx.drawImage(img, col*fw,row*fh,fw,fh, sx-8,sy-22,48,72);
  } else {
    ctx.fillStyle='#5566bb';
    ctx.fillRect(sx+3,sy+2,TILE-6,TILE-6);
  }
  // 이름표
  const nw=npc.name.length*7+8;
  ctx.fillStyle='rgba(0,0,0,0.65)';
  ctx.fillRect(sx+TILE/2-8-nw/2,sy-20,nw,13);
  ctx.fillStyle='#fff';
  ctx.font='bold 9px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText(npc.name,sx+TILE/2-8,sy-9);
  ctx.textAlign='left';
}

// =============================================
//   인트로 화면
// =============================================
function drawIntro(ctx,canvas){
  ctx.fillStyle='rgba(0,0,0,0.88)';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const {lines,index}=state.intro;
  const line=lines[index];
  const isGuide=index===lines.length-1;
  const isTitle=index===lines.length-2;

  // 불꽃 파티클 느낌 (간단한 글로우)
  ctx.save();
  ctx.shadowColor='#f08000';
  ctx.shadowBlur=isTitle?30:0;
  ctx.fillStyle= isTitle?'#f0c040': isGuide?'#aaa':'#fff8e7';
  ctx.font=`${isTitle?20:isGuide?13:16}px "Courier New",monospace`;
  ctx.textAlign='center';
  wrapText(ctx,line,canvas.width/2,canvas.height/2,canvas.width-100,26);
  ctx.restore();

  ctx.fillStyle='rgba(240,192,64,0.7)';
  ctx.font='11px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText('[ 스페이스 / 엔터 ]',canvas.width/2,canvas.height-44);

  // 진행 도트
  for(let i=0;i<lines.length;i++){
    ctx.fillStyle=i===index?'#f0c040':'#444';
    ctx.fillRect(canvas.width/2-lines.length*6+i*12,canvas.height-22,8,8);
  }
  ctx.textAlign='left';
}

// =============================================
//   대화창
// =============================================
function drawDialog(ctx,canvas){
  const d=state.dialog;
  const bh=128, bx=16, by=canvas.height-bh-16, bw=canvas.width-32;

  ctx.fillStyle='rgba(8,8,24,0.96)';
  roundRect(ctx,bx,by,bw,bh,10); ctx.fill();
  ctx.strokeStyle='#f0c040'; ctx.lineWidth=2;
  roundRect(ctx,bx,by,bw,bh,10); ctx.stroke();

  // 스프라이트 아이콘
  const iconX=bx+12, iconY=by+10, iconW=48, iconH=72;
  const spr=state.images[d.sprite];
  if(spr) ctx.drawImage(spr,0,0,32,48,iconX,iconY,iconW,iconH);

  // 텍스트 영역
  const tx2=iconX+iconW+14, tw=bw-iconW-36;
  ctx.fillStyle='#f0c040';
  ctx.font='bold 13px "Courier New",monospace';
  ctx.fillText(`▸ ${d.speaker}`,tx2,by+24);

  ctx.fillStyle='#fff8e7';
  ctx.font='13px "Courier New",monospace';
  wrapText(ctx,d.lines[d.index],tx2,by+48,tw,22);

  ctx.fillStyle='rgba(240,192,64,0.8)';
  ctx.font='11px "Courier New",monospace';
  ctx.textAlign='right';
  ctx.fillText(`${d.index+1}/${d.lines.length}  ▼ 스페이스`,bx+bw-10,by+bh-10);
  ctx.textAlign='left';
}

// =============================================
//   HUD
// =============================================
function drawHUD(ctx,canvas){
  // 게임 이름
  ctx.fillStyle='rgba(0,0,0,0.55)';
  ctx.fillRect(8,8,230,28);
  ctx.fillStyle='#f0c040';
  ctx.font='bold 13px "Courier New",monospace';
  ctx.fillText('🔥 파이리의 불꽃 모험',16,27);

  // 마을 이름
  ctx.fillStyle='rgba(0,0,0,0.45)';
  ctx.fillRect(8,40,110,20);
  ctx.fillStyle='#aaddff';
  ctx.font='11px "Courier New",monospace';
  ctx.fillText('📍 불씨마을',14,54);

  // 조작법
  ctx.fillStyle='rgba(0,0,0,0.45)';
  ctx.fillRect(8,canvas.height-28,280,22);
  ctx.fillStyle='#bbb';
  ctx.font='10px "Courier New",monospace';
  ctx.fillText('WASD/방향키: 이동   스페이스: 대화',14,canvas.height-12);
}

// =============================================
//   텍스트 / 유틸
// =============================================
function wrapText(ctx,text,x,y,maxW,lh){
  // 한글은 글자 단위로 줄바꿈
  const chars=text.split('');
  let line='', cy=y;
  for(const ch of chars){
    const test=line+ch;
    if(ctx.measureText(test).width>maxW&&line!==''){
      ctx.fillText(line,x,cy); line=ch; cy+=lh;
    } else { line=test; }
  }
  if(line) ctx.fillText(line,x,cy);
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// =============================================
//   메인 루프
// =============================================
function loop(ts){
  const dt=ts-(state.lastTime||ts); state.lastTime=ts;
  processMove();
  updateNPCs(dt);
  updateCamera(window._canvas);
  render(window._canvas,window._ctx);
  requestAnimationFrame(loop);
}

// =============================================
//   초기화
// =============================================
window.addEventListener('DOMContentLoaded',()=>{
  const canvas=document.getElementById('game');
  window._canvas=canvas;
  window._ctx=canvas.getContext('2d');

  function resize(){
    canvas.width =Math.min(window.innerWidth, 800);
    canvas.height=Math.min(window.innerHeight,600);
    updateCamera(canvas);
  }
  resize();
  window.addEventListener('resize',resize);
  setupInput();

  loadImages(()=>{ if(window._showTitle) window._showTitle(); });
  window._startGame=()=>{ resize(); requestAnimationFrame(loop); };
});
