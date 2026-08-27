// =============================================
//   Charmander's Flame Adventure
//   파이리의 불꽃 모험 - game.js  v2
// =============================================

const TILE = 32;
const MAP_COLS = 75;
const MAP_ROWS = 60;

const DIR = { DOWN:3, LEFT:1, RIGHT:2, UP:0 };
// 파이리 스프라이트: row0=뒤(UP), row1=왼, row2=오른, row3=앞(DOWN) → 이전에 반전돼 있던 거 수정
const DIR_ROW     = { [DIR.UP]:0, [DIR.LEFT]:1, [DIR.RIGHT]:2, [DIR.DOWN]:3 };
// NPC 스프라이트: row0=앞(DOWN), row1=왼, row2=오른, row3=뒤(UP)
const NPC_DIR_ROW = { [DIR.DOWN]:0, [DIR.LEFT]:1, [DIR.RIGHT]:2, [DIR.UP]:3 };

const T = {
  GRASS:0, PATH:1, TREE:2, FLOWER:3, FOUNTAIN:4,
  HOUSE_R:5, HOUSE_G:6, HOUSE_B:7, LAB:8, POKE:9, MART:10,
  WALK:99,
  // 잿빛숲 전용
  DARK_GRASS:11, BURNT_TREE:12, CAVE_WALL:13, CAVE_FLOOR:14,
};
const SOLID = new Set([
  T.TREE, T.BURNT_TREE, T.CAVE_WALL,
  T.HOUSE_R, T.HOUSE_G, T.HOUSE_B,
  T.LAB, T.POKE, T.MART, T.FOUNTAIN,
]);

const DIR_DELTA = {
  [DIR.UP]:{dx:0,dy:-1}, [DIR.DOWN]:{dx:0,dy:1},
  [DIR.LEFT]:{dx:-1,dy:0}, [DIR.RIGHT]:{dx:1,dy:0},
};

// =============================================
//   맵 생성 헬퍼
// =============================================
function makeRow(len, fill) { return Array(len).fill(fill); }
function makeMap() {
  const m = [];
  for (let r = 0; r < MAP_ROWS; r++) m.push(makeRow(MAP_COLS, T.GRASS));
  return m;
}

// =============================================
//   맵 — 75×60
//   [0..24] 불씨마을 서쪽 숲 경계
//   [0..49] 불씨마을 (col 1~48)
//   [50..74] 잿빛숲 입구 (동쪽)
//   row 0..39: 마을 본체
//   row 40..59: 남쪽 확장 / 잿빛숲 초입
// =============================================
function buildMap() {
  const m = makeMap();

  const set = (col,row,t) => { if(row>=0&&row<MAP_ROWS&&col>=0&&col<MAP_COLS) m[row][col]=t; };
  const fill = (c1,r1,c2,r2,t) => {
    for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) set(c,r,t);
  };
  const hline = (r,c1,c2,t) => { for(let c=c1;c<=c2;c++) set(c,r,t); };
  const vline = (c,r1,r2,t) => { for(let r=r1;r<=r2;r++) set(c,r,t); };

  // ── 외벽 나무 ──
  hline(0, 0, MAP_COLS-1, T.TREE);
  hline(MAP_ROWS-1, 0, MAP_COLS-1, T.TREE);
  vline(0, 0, MAP_ROWS-1, T.TREE);
  vline(MAP_COLS-1, 0, MAP_ROWS-1, T.TREE);

  // ── 마을/숲 경계 나무 (col 49) ──
  vline(49, 1, MAP_ROWS-2, T.TREE);
  // 숲 입구 통로 (row 18~22)
  for(let r=18;r<=22;r++) set(49,r,T.PATH);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  불씨마을 (col 1~48)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━

  // 북쪽 나무 장식
  for(let c=1;c<=48;c+=4) set(c,1,T.TREE);

  // 메인 가로 도로 3개
  hline(8,  1, 48, T.PATH);   // 1번 도로
  hline(20, 1, 48, T.PATH);   // 2번 도로
  hline(32, 1, 48, T.PATH);   // 3번 도로
  hline(44, 1, 48, T.PATH);   // 4번 도로 (남쪽)

  // 세로 도로 2개
  vline(12, 1, MAP_ROWS-2, T.PATH);
  vline(36, 1, MAP_ROWS-2, T.PATH);

  // ── 오박사 연구소 구역 (col 2~11, row 2~7) ──
  set(6, 3, T.LAB); set(7,3,T.WALK); set(8,3,T.WALK);
  set(6, 4, T.WALK); set(7,4,T.WALK); set(8,4,T.WALK);
  hline(5, 6, 10, T.PATH);

  // ── 포켓몬 센터 (col 38~47, row 2~7) ──
  set(42, 3, T.POKE); set(43,3,T.WALK); set(44,3,T.WALK);
  set(42, 4, T.WALK); set(43,4,T.WALK); set(44,4,T.WALK);
  hline(37, 6, 47, T.PATH);

  // ── 광장 / 분수 (col 20~30, row 10~18) ──
  fill(18, 10, 32, 18, T.GRASS);
  set(24, 13, T.FOUNTAIN);
  for(let c=20;c<=28;c+=2) set(c,11,T.FLOWER);
  for(let c=20;c<=28;c+=2) set(c,16,T.FLOWER);
  hline(9,  18, 32, T.PATH);
  hline(19, 18, 32, T.PATH);
  vline(18, 9, 19, T.PATH);
  vline(32, 9, 19, T.PATH);

  // ── 집들 (좌측 구역) ──
  // row 10~19, col 2~11
  set(3, 10, T.HOUSE_R); set(4,10,T.WALK);
  set(3, 11, T.WALK);    set(4,11,T.WALK);
  hline(12, 3, 11, T.PATH);

  set(3, 22, T.HOUSE_B); set(4,22,T.WALK);
  set(3, 23, T.WALK);    set(4,23,T.WALK);
  hline(24, 3, 11, T.PATH);

  set(3, 34, T.HOUSE_G); set(4,34,T.WALK);
  set(3, 35, T.WALK);    set(4,35,T.WALK);
  hline(36, 3, 11, T.PATH);

  // ── 집들 (우측 구역) ──
  set(39, 22, T.HOUSE_R); set(40,22,T.WALK);
  set(39, 23, T.WALK);    set(40,23,T.WALK);
  hline(24, 37, 47, T.PATH);

  set(39, 34, T.HOUSE_B); set(40,34,T.WALK);
  set(39, 35, T.WALK);    set(40,35,T.WALK);
  hline(36, 37, 47, T.PATH);

  // ── 마트 (col 38~47, row 26~31) ──
  set(42, 26, T.MART); set(43,26,T.WALK); set(44,26,T.WALK);
  set(42, 27, T.WALK); set(43,27,T.WALK); set(44,27,T.WALK);
  hline(28, 40, 47, T.PATH);

  // ── 꽃밭 장식 ──
  for(let c=14;c<=34;c+=3) set(c,1,T.FLOWER);
  for(let c=14;c<=34;c+=3) set(c,MAP_ROWS-2,T.FLOWER);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  잿빛숲 (col 50~73)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 기본: 어두운 잔디
  fill(50, 1, 73, MAP_ROWS-2, T.DARK_GRASS);

  // 타버린 나무들 랜덤 배치 (고정 시드로 결정론적)
  const burntPositions = [
    [51,2],[53,4],[55,2],[58,3],[60,5],[62,2],[64,4],[66,3],[68,2],[70,4],[72,3],
    [51,7],[54,8],[57,6],[59,9],[61,7],[63,8],[65,6],[67,9],[69,7],[71,8],[73,6],
    [51,25],[53,27],[56,24],[58,26],[61,25],[63,27],[66,24],[68,26],[71,25],[73,24],
    [51,30],[54,32],[57,30],[60,31],[63,30],[66,32],[69,31],[72,30],
    [51,40],[54,42],[57,40],[60,41],[63,40],[65,42],[68,41],[71,40],[73,41],
    [51,50],[54,52],[57,50],[60,51],[63,50],[65,52],[68,51],[71,52],[73,50],
  ];
  for(const [c,r] of burntPositions) set(c,r,T.BURNT_TREE);

  // 숲 내부 미로형 통로 (PATH)
  hline(18, 50, 73, T.PATH);  // 메인 숲길
  hline(28, 50, 73, T.PATH);  // 숲 2번길
  hline(40, 50, 73, T.PATH);  // 숲 3번길
  vline(55, 15, 45, T.PATH);
  vline(65, 15, 45, T.PATH);

  // 숲 깊은 곳 — 검은 불꽃 지역 (col 62~72, row 45~57)
  fill(62, 45, 72, 57, T.CAVE_FLOOR);
  // 동굴벽으로 테두리
  hline(45, 62, 72, T.CAVE_WALL);
  hline(57, 62, 72, T.CAVE_WALL);
  vline(62, 45, 57, T.CAVE_WALL);
  vline(72, 45, 57, T.CAVE_WALL);
  // 입구 (아래쪽 통로)
  set(67, 57, T.CAVE_FLOOR);
  set(68, 57, T.CAVE_FLOOR);

  return m;
}

const BASE_MAP = buildMap();

// =============================================
//   NPC 정의 — 스토리 대사 반영
// =============================================
const NPCS = [
  // ── 불씨마을 ──
  { id:'elder',   tx:24, ty:15, dir:DIR.DOWN, name:'할라 장로',   sprite:'npc_할라',   fw:32, wander:false,
    lines:["파이리야... 네 꼬리불꽃이 작아진 것을 알고 있느냐.",
           "태초의 불씨가 약해지기 시작했어. 세계 곳곳에서 불꽃이 꺼지고 있지.",
           "이상하게도... 네 불꽃은 작아졌지만 꺼지지 않았구나.",
           "저 분수 아래에 태초의 불씨로 가는 길이 있다고 전해진다.",
           "네가 그 불꽃을 되살릴 자일지도 모르겠어."]},

  { id:'ryuong',  tx:21, ty:12, dir:DIR.LEFT, name:'류옹',        sprite:'npc_류옹',   fw:32, wander:true,
    lines:["저 분수... 예전엔 태초의 불씨로 빛났는데.",
           "불꽃이 꺼진 날 밤, 동쪽 숲에서 이상한 소리가 들렸어.",
           "검은 연기 같은 게 숲 위로 피어올랐고..."]},

  { id:'mari',    tx:28, ty:12, dir:DIR.LEFT, name:'마리',        sprite:'npc_마리',   fw:32, wander:true,
    lines:["밤이 점점 길어지고 있어요.",
           "야생 포켓몬들도 눈빛이 달라졌고...",
           "할라 장로님이 걱정하시는 게 느껴져요."]},

  { id:'scholar', tx:7,  ty:7,  dir:DIR.DOWN, name:'포플러',      sprite:'npc_포플러', fw:32, wander:false,
    lines:["파이리의 불꽃 반응이 특이해요.",
           "태초의 불씨와 연결된 파이리 계열 포켓몬만 불꽃이 꺼지지 않고 있어요.",
           "동쪽 잿빛숲에서 검은 불꽃이 목격됐어요. 조심해야 할 거예요."]},

  { id:'mamane',  tx:9,  ty:5,  dir:DIR.LEFT, name:'마마네',      sprite:'npc_마마네', fw:32, wander:true,
    lines:["박사님이 말씀하셨어! 불꽃 에너지가 지하에서 흐른다고!",
           "근데 최근에 그 흐름이 완전히 끊겼대.",
           "박사님 얼굴이 많이 어두웠어..."]},

  { id:'trainer', tx:4,  ty:20, dir:DIR.RIGHT,name:'플린',        sprite:'npc_플린',   fw:32, wander:false,
    lines:["...",
           "새로운 여행자군.",
           "불꽃이 꺼지는 게 자연현상이라고 생각하는 사람들이 있어.",
           "틀렸어. 누군가 의도적으로 꺼뜨리고 있어.",
           "서두르는 게 좋을걸."]},

  { id:'hex',     tx:45, ty:20, dir:DIR.LEFT, name:'헥스',        sprite:'npc_헥스',   fw:32, wander:true,
    lines:["어두운 불꽃을 본 적 있어?",
           "불을 꺼뜨리는 불꽃이야. 망화(亡火)라고 부르지.",
           "그걸 사용하는 자가 있다면... 태초의 불씨도 위험해."]},

  { id:'heoil',   tx:25, ty:25, dir:DIR.DOWN, name:'호일',        sprite:'npc_호일',   fw:32, wander:true,
    lines:["안녕! 불씨마을에 온 걸 환영해!",
           "여기 광장 분수가 예전엔 엄청 빛났는데...",
           "요즘은 꺼져 있어서 좀 쓸쓸하다."]},

  { id:'hau',     tx:43, ty:5,  dir:DIR.DOWN, name:'하우',        sprite:'npc_하우',   fw:32, wander:true,
    lines:["야! 파이리다!",
           "우리 아버지가 저 포켓몬 센터에서 일해.",
           "불꽃이 꺼지기 시작한 뒤로 아버지 얼굴이 어두워졌어.",
           "파이리, 꼭 뭔가 해줘!"]},

  { id:'rutia',   tx:46, ty:25, dir:DIR.LEFT, name:'루티아',      sprite:'npc_루티아', fw:32, wander:true,
    lines:["포켓몬 센터에서 쉬다 가세요.",
           "불꽃이 약해진 포켓몬들이 많이 와요...",
           "파이리는 꼬리불꽃이 살아있군요. 다행이에요."]},

  { id:'heily',   tx:43, ty:28, dir:DIR.UP,   name:'헤일리',      sprite:'npc_헤일리', fw:32, wander:false,
    lines:["어서 오세요, 불씨마을 마트입니다!",
           "요즘 여행자가 늘었어요. 불꽃 관련 소문 때문인지...",
           "몸조심하고 떠나세요."]},

  { id:'lira',    tx:10, ty:35, dir:DIR.RIGHT,name:'리라',        sprite:'npc_리라',   fw:32, wander:true,
    lines:["이 마을... 예전엔 불꽃 축제가 열렸어.",
           "태초의 불씨 아래서 모두 함께 춤을 췄지.",
           "파이리, 그 불꽃을 반드시 되찾아줘."]},

  { id:'salaryman',tx:45,ty:44,dir:DIR.DOWN,  name:'회사원',      sprite:'npc_회사원', fw:32, wander:true,
    lines:["아, 바빠 바빠...",
           "불꽃이 꺼졌다고요? 야근이 더 길어지겠네.",
           "...사실 무서워요. 밤이 너무 길어지고 있잖아요."]},

  // ── 잿빛숲 입구 ──
  { id:'saido',   tx:51, ty:18, dir:DIR.LEFT, name:'사도',        sprite:'npc_사도',   fw:32, wander:false,
    lines:["거기 들어가려는 건가?",
           "잿빛숲이야. 예전엔 따뜻한 불꽃나무 가득했는데...",
           "지금은 전부 타버린 상태야. 검은 불꽃 때문이지.",
           "조심해. 숲 깊은 곳에 뭔가 있어."]},

  { id:'benji',   tx:52, ty:22, dir:DIR.RIGHT,name:'벤지',        sprite:'npc_벤지',   fw:32, wander:true,
    lines:["숲에서 이상한 사람을 봤어.",
           "검은 망토... 얼굴이 안 보였어.",
           "숲 깊은 곳에서 걸어 나왔는데 순식간에 사라졌어."]},

  { id:'suho',    tx:54, ty:28, dir:DIR.DOWN, name:'수호',        sprite:'npc_수호',   fw:32, wander:false,
    lines:["나는 이 숲을 지키는 자야.",
           "하지만 검은 불꽃 앞에서 아무것도 할 수 없었어.",
           "숲 안쪽으로 들어가면 아서라는 자가 있어.",
           "그 자가 검은 불꽃을 다루고 있는 것 같아."]},

  { id:'silver',  tx:65, ty:18, dir:DIR.DOWN, name:'실버',        sprite:'npc_실버',   fw:32, wander:true,
    lines:["이 숲... 뭔가 이상해.",
           "나무들이 전부 검게 타있어.",
           "저 안쪽에서 검은 불꽃 소리가 들려. 조심해."]},

  // ── 보스: 아서 (잿빛숲 깊은 곳) ──
  { id:'boss_arthur', tx:67, ty:51, dir:DIR.DOWN, name:'아서', sprite:'npc_아서', fw:32, wander:false, isBoss:true,
    lines:["……멈춰.",
           "파이리. 이 숲까지 왔군.",
           "불꽃은 결국 모든 것을 태워버려.",
           "소중한 것도, 기억도, 미래도.",
           "그러니 내가 먼저 꺼뜨려 주겠어.",
           "…네 꼬리불꽃도.",
           "【 아서와의 전투가 시작된다! 】"]},
];

// =============================================
//   프롤로그 인트로
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
  player: { tx:24, ty:22, dir:DIR.DOWN, frame:0, animTimer:0 },
  npcs:   NPCS.map(n => ({...n, frame:0, animTimer:0, moveTimer:0})),
  camera: { x:0, y:0 },
  keys:   {},
  moveQueue: [],
  dialog: { active:false, lines:[], index:0, speaker:'', sprite:'', fw:32, isBoss:false },
  intro:  { active:true,  lines:INTRO_STORY, index:0 },
  battle: { active:false, phase:0, playerHP:50, bossHP:80, log:[], turn:'player', animTimer:0 },
  images: {},
  lastTime: 0,
  saveData: null,   // Firebase에서 불러온 저장 데이터
};

// =============================================
//   Firebase 저장/불러오기 인터페이스
//   실제 Firebase 초기화는 index.html에서 수행
// =============================================
function saveGame(userId) {
  const data = {
    playerTx: state.player.tx,
    playerTy: state.player.ty,
    playerDir: state.player.dir,
    timestamp: Date.now(),
  };
  if (window.firebaseSave) window.firebaseSave(userId, data);
}

function loadGame(data) {
  if (!data) return;
  state.player.tx  = data.playerTx  ?? state.player.tx;
  state.player.ty  = data.playerTy  ?? state.player.ty;
  state.player.dir = data.playerDir ?? state.player.dir;
  state.intro.active = false;
  updateCamera(window._canvas);
}

// =============================================
//   이미지 로딩
// =============================================
function loadImages(cb) {
  const names = Object.keys(ASSETS_B64);
  let done = 0;
  names.forEach(name => {
    const img = new Image();
    img.onload = () => { state.images[name] = img; if (++done === names.length) cb(); };
    img.onerror = () => { done++; if (done === names.length) cb(); };
    img.src = ASSETS_B64[name];
  });
}

// =============================================
//   유틸
// =============================================
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
  if(!canvas) return;
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

    if(state.battle.active){ handleBattleInput(e.code); return; }

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
  if(state.dialog.active||state.intro.active||state.battle.active) return;
  if(!state.moveQueue.length) return;
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
    if(npc.moveTimer>2200+Math.random()*1500){
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
//   대화 / 보스 트리거
// =============================================
function tryTalk(){
  const p=state.player;
  const {dx,dy}=DIR_DELTA[p.dir];
  const fx=p.tx+dx, fy=p.ty+dy;
  for(const npc of state.npcs){
    if(npc.tx===fx&&npc.ty===fy){
      npc.dir=opposite(p.dir);
      state.dialog={
        active:true, lines:npc.lines, index:0,
        speaker:npc.name, sprite:npc.sprite,
        fw: npc.fw||32, isBoss: !!npc.isBoss,
      };
      return;
    }
  }
}

function advanceDialog(){
  const d=state.dialog;
  d.index++;
  if(d.index>=d.lines.length){
    if(d.isBoss){
      // 대화 끝 → 전투 시작
      state.dialog={active:false,lines:[],index:0,speaker:'',sprite:'',fw:32,isBoss:false};
      startBattle();
    } else {
      state.dialog={active:false,lines:[],index:0,speaker:'',sprite:'',fw:32,isBoss:false};
    }
  }
}

function advanceIntro(){
  if(++state.intro.index>=state.intro.lines.length) state.intro.active=false;
}

// =============================================
//   전투 시스템 (아서 보스전)
// =============================================
function startBattle(){
  state.battle={
    active:true, phase:1,
    playerHP:50, playerMaxHP:50,
    bossHP:80,   bossMaxHP:80,
    log:['아서가 검은 불꽃을 내뿜는다!'],
    turn:'player', animTimer:0,
    bossName:'아서', bossSprite:'npc_아서',
  };
}

function handleBattleInput(code){
  const b=state.battle;
  if(!b.active||b.turn!=='player') return;
  if(code==='KeyZ'||code==='Space'||code==='Enter'){
    // 플레이어 공격
    const dmg=8+Math.floor(Math.random()*8);
    b.bossHP=Math.max(0,b.bossHP-dmg);
    b.log=[`파이리의 불꽃이 ${dmg}의 데미지!`];
    if(b.bossHP<=0){ endBattle(true); return; }
    // 페이즈 전환
    if(b.phase===1&&b.bossHP<b.bossMaxHP*0.6){
      b.phase=2; b.log.push('아서가 망화를 두른다! 2페이즈!');
    }
    if(b.phase===2&&b.bossHP<b.bossMaxHP*0.3){
      b.phase=3; b.log.push('태초의 불씨를 흡수한다! 3페이즈!');
    }
    b.turn='boss';
    b.animTimer=800;
  }
  if(code==='KeyX'){
    // 방어 (데미지 절반)
    b.log=['파이리가 불꽃을 응집해 방어한다!'];
    b.turn='boss';
    b.animTimer=600;
    b._defending=true;
  }
}

function updateBattle(dt){
  const b=state.battle;
  if(!b.active||b.turn!=='boss') return;
  b.animTimer-=dt;
  if(b.animTimer>0) return;
  // 보스 공격
  const base=b.phase===3?18:b.phase===2?13:8;
  let dmg=base+Math.floor(Math.random()*6);
  if(b._defending){ dmg=Math.floor(dmg/2); b._defending=false; }
  b.playerHP=Math.max(0,b.playerHP-dmg);
  b.log.push(`아서의 망화! ${dmg}의 데미지!`);
  if(b.playerHP<=0){ endBattle(false); return; }
  b.turn='player';
}

function endBattle(won){
  const b=state.battle;
  if(won){
    b.active=false;
    state.dialog={
      active:true,
      lines:["……패배했군.", "불꽃은… 아직 꺼지지 않았어.", "…왜.", "나중에 다시 만나자, 파이리."],
      speaker:'아서', sprite:'npc_아서', fw:32, isBoss:false,
    };
    // 보스 NPC 제거
    const idx=state.npcs.findIndex(n=>n.id==='boss_arthur');
    if(idx!==-1) state.npcs.splice(idx,1);
  } else {
    b.active=false;
    state.dialog={
      active:true,
      lines:["파이리는 쓰러졌다...", "하지만 꼬리의 불꽃은 꺼지지 않았다.", "기운을 차리고 다시 일어섰다."],
      speaker:'나레이션', sprite:'npc_할라', fw:32, isBoss:false,
    };
    // 플레이어 위치를 마을로 리셋
    state.player.tx=24; state.player.ty=22;
    state.battle.playerHP=50;
  }
}

// =============================================
//   렌더링
// =============================================
function render(canvas,ctx){
  const imgs=state.images, cam=state.camera;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.imageSmoothingEnabled=false;

  // ── 바닥 레이어 ──
  for(let row=0;row<MAP_ROWS;row++){
    for(let col=0;col<MAP_COLS;col++){
      const sx=col*TILE-cam.x, sy=row*TILE-cam.y;
      if(sx+TILE<0||sx>canvas.width||sy+TILE<0||sy>canvas.height) continue;
      const t=BASE_MAP[row][col];
      if(t===T.DARK_GRASS||t===T.BURNT_TREE){
        ctx.fillStyle='#1a1f10'; ctx.fillRect(sx,sy,TILE,TILE);
      } else if(t===T.CAVE_FLOOR){
        ctx.fillStyle='#2a2030'; ctx.fillRect(sx,sy,TILE,TILE);
      } else if(t===T.CAVE_WALL){
        ctx.fillStyle='#150e20'; ctx.fillRect(sx,sy,TILE,TILE);
      } else {
        drawTile(ctx,imgs.grass,sx,sy,TILE,TILE);
        if(t===T.PATH) drawTile(ctx,imgs.path,sx,sy,TILE,TILE);
      }
    }
  }

  // ── 오브젝트 + 캐릭터 Y-sort ──
  for(let row=0;row<MAP_ROWS;row++){
    for(let col=0;col<MAP_COLS;col++){
      const sx=col*TILE-cam.x, sy=row*TILE-cam.y;
      if(sx+TILE<0||sx>canvas.width||sy+TILE<0||sy>canvas.height) continue;
      const t=BASE_MAP[row][col];
      switch(t){
        case T.TREE:     if(imgs.tree)     ctx.drawImage(imgs.tree,    sx-4, sy-32,60,64);  break;
        case T.BURNT_TREE:
          ctx.fillStyle='#333'; ctx.fillRect(sx+6,sy-20,20,32);
          ctx.fillStyle='#222'; ctx.fillRect(sx+4,sy-24,24,12);
          break;
        case T.FLOWER:   if(imgs.flower)   ctx.drawImage(imgs.flower,  sx-8, sy-8, 48,48);  break;
        case T.FOUNTAIN: if(imgs.fountain) ctx.drawImage(imgs.fountain,sx-8, sy-66,80,96);  break;
        case T.HOUSE_R:  if(imgs.house_red)   ctx.drawImage(imgs.house_red,  sx-4,sy-86,140,150); break;
        case T.HOUSE_G:  if(imgs.house_green) ctx.drawImage(imgs.house_green,sx-4,sy-86,116,150); break;
        case T.HOUSE_B:  if(imgs.house_blue)  ctx.drawImage(imgs.house_blue, sx-4,sy-86,140,150); break;
        case T.LAB:      if(imgs.lab)         ctx.drawImage(imgs.lab,  sx-8,sy-128,180,195); break;
        case T.POKE:     if(imgs.pokecenter)  ctx.drawImage(imgs.pokecenter,sx-8,sy-80,176,145); break;
        case T.MART:     if(imgs.mart)        ctx.drawImage(imgs.mart, sx-8,sy-84,161,150);  break;
      }
    }
    // NPC
    for(const npc of state.npcs){
      if(npc.ty!==row) continue;
      const sx=npc.tx*TILE-cam.x, sy=npc.ty*TILE-cam.y;
      if(sx+TILE<-60||sx>canvas.width+60) continue;
      drawNPC(ctx,imgs,npc,sx,sy);
    }
    // 플레이어
    if(state.player.ty===row){
      const p=state.player;
      drawPlayer(ctx,imgs.charmander,p,p.tx*TILE-cam.x,p.ty*TILE-cam.y);
    }
  }

  // ── UI ──
  if(state.battle.active)       drawBattle(ctx,canvas);
  else if(state.intro.active)   drawIntro(ctx,canvas);
  else if(state.dialog.active)  drawDialog(ctx,canvas);
  else                          drawHUD(ctx,canvas);
}

// ── 지형 타일 ──
function drawTile(ctx,img,x,y,w,h){
  if(!img){ctx.fillStyle='#6ab04c';ctx.fillRect(x,y,w,h);return;}
  ctx.drawImage(img,x,y,w,h);
}

// ── 파이리 (버그 수정: DIR_ROW 반전 수정) ──
function drawPlayer(ctx,img,p,sx,sy){
  if(!img){ctx.fillStyle='#f0a030';ctx.fillRect(sx+4,sy+4,TILE-8,TILE-8);return;}
  const row=DIR_ROW[p.dir];   // UP→0, LEFT→1, RIGHT→2, DOWN→3
  ctx.drawImage(img, p.frame*64,row*64,64,64, sx-8,sy-16,48,48);
}

// ── NPC ──
function drawNPC(ctx,imgs,npc,sx,sy){
  const img=imgs[npc.sprite];
  const fw=npc.fw||32, fh=48;
  const row=NPC_DIR_ROW[npc.dir], col=npc.frame%4;
  if(img){
    // 보스 NPC는 약간 크게
    const scale=npc.isBoss?1.8:1.5;
    ctx.drawImage(img, col*fw,row*fh,fw,fh, sx-8,sy-22,fw*scale,fh*scale);
  } else {
    ctx.fillStyle=npc.isBoss?'#cc2222':'#5566bb';
    ctx.fillRect(sx+3,sy+2,TILE-6,TILE-6);
  }
  // 이름표
  const nw=npc.name.length*7+(npc.isBoss?16:8);
  ctx.fillStyle=npc.isBoss?'rgba(80,0,0,0.85)':'rgba(0,0,0,0.65)';
  ctx.fillRect(sx+TILE/2-8-nw/2,sy-20,nw,14);
  ctx.fillStyle=npc.isBoss?'#ff6060':'#fff';
  ctx.font=`bold ${npc.isBoss?11:9}px "Courier New",monospace`;
  ctx.textAlign='center';
  ctx.fillText((npc.isBoss?'⚔ ':'')+npc.name,sx+TILE/2-8,sy-9);
  ctx.textAlign='left';
}

// ── 인트로 ──
function drawIntro(ctx,canvas){
  ctx.fillStyle='rgba(0,0,0,0.88)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  const {lines,index}=state.intro;
  const isTitle=index===lines.length-2, isGuide=index===lines.length-1;
  ctx.save();
  ctx.shadowColor='#f08000'; ctx.shadowBlur=isTitle?30:0;
  ctx.fillStyle=isTitle?'#f0c040':isGuide?'#aaa':'#fff8e7';
  ctx.font=`${isTitle?20:isGuide?13:16}px "Courier New",monospace`;
  ctx.textAlign='center';
  wrapText(ctx,lines[index],canvas.width/2,canvas.height/2,canvas.width-100,26);
  ctx.restore();
  ctx.fillStyle='rgba(240,192,64,0.7)';
  ctx.font='11px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText('[ 스페이스 / 엔터 ]',canvas.width/2,canvas.height-44);
  for(let i=0;i<lines.length;i++){
    ctx.fillStyle=i===index?'#f0c040':'#444';
    ctx.fillRect(canvas.width/2-lines.length*6+i*12,canvas.height-22,8,8);
  }
  ctx.textAlign='left';
}

// ── 대화창 ──
function drawDialog(ctx,canvas){
  const d=state.dialog;
  const bh=128, bx=16, by=canvas.height-bh-16, bw=canvas.width-32;
  ctx.fillStyle='rgba(8,8,24,0.96)';
  roundRect(ctx,bx,by,bw,bh,10); ctx.fill();
  const borderColor=d.isBoss?'#cc4444':'#f0c040';
  ctx.strokeStyle=borderColor; ctx.lineWidth=2;
  roundRect(ctx,bx,by,bw,bh,10); ctx.stroke();
  const spr=state.images[d.sprite];
  const fw=d.fw||32;
  if(spr) ctx.drawImage(spr,0,0,fw,48,bx+12,by+10,48,72);
  const tx2=bx+12+48+14, tw=bw-48-36;
  ctx.fillStyle=d.isBoss?'#ff6060':'#f0c040';
  ctx.font='bold 13px "Courier New",monospace';
  ctx.fillText(`▸ ${d.speaker}`,tx2,by+24);
  ctx.fillStyle='#fff8e7'; ctx.font='13px "Courier New",monospace';
  wrapText(ctx,d.lines[d.index],tx2,by+48,tw,22);
  ctx.fillStyle='rgba(240,192,64,0.8)';
  ctx.font='11px "Courier New",monospace';
  ctx.textAlign='right';
  ctx.fillText(`${d.index+1}/${d.lines.length}  ▼ 스페이스`,bx+bw-10,by+bh-10);
  ctx.textAlign='left';
}

// ── 전투 화면 ──
function drawBattle(ctx,canvas){
  const b=state.battle;
  const W=canvas.width, H=canvas.height;

  // 배경
  ctx.fillStyle='#0d0820';
  ctx.fillRect(0,0,W,H);

  // 숲 그림자 효과
  ctx.fillStyle='rgba(40,0,60,0.4)';
  for(let i=0;i<5;i++) ctx.fillRect(i*160-b.animTimer%160*0.05,0,80,H);

  // 보스 스프라이트
  const bossImg=state.images[b.bossSprite];
  if(bossImg){
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    // 3페이즈면 붉게
    if(b.phase===3){ ctx.filter='hue-rotate(180deg) saturate(2)'; }
    ctx.drawImage(bossImg,0,0,32,48, W*0.6-48,H*0.1,128,192);
    ctx.restore();
  } else {
    ctx.fillStyle='#cc2222'; ctx.fillRect(W*0.6-48,H*0.1,128,192);
  }
  // 보스 이름 + 페이즈
  ctx.fillStyle='#ff6060'; ctx.font='bold 16px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText(`⚔ ${b.bossName} — ${b.phase}페이즈`,W*0.65,H*0.08);

  // 파이리 스프라이트
  const charImg=state.images['charmander'];
  if(charImg){
    ctx.save(); ctx.imageSmoothingEnabled=false;
    ctx.drawImage(charImg,0,DIR_ROW[DIR.DOWN]*64,64,64, W*0.15,H*0.45,96,96);
    ctx.restore();
  }

  // HP 바
  drawHPBar(ctx, W*0.05, H*0.35, 200, 16, b.playerHP, b.playerMaxHP, '파이리', '#f0a030');
  drawHPBar(ctx, W*0.55, H*0.35, 200, 16, b.bossHP,   b.bossMaxHP,   b.bossName,'#cc4444');

  // 전투 로그
  ctx.fillStyle='rgba(0,0,0,0.75)';
  roundRect(ctx,W*0.05,H*0.65,W*0.9,H*0.28,8); ctx.fill();
  ctx.strokeStyle='#f0c040'; ctx.lineWidth=1.5;
  roundRect(ctx,W*0.05,H*0.65,W*0.9,H*0.28,8); ctx.stroke();
  ctx.fillStyle='#fff8e7'; ctx.font='13px "Courier New",monospace';
  ctx.textAlign='left';
  b.log.slice(-3).forEach((l,i)=> ctx.fillText(l, W*0.07, H*0.68+i*22+16));

  // 행동 버튼
  if(b.turn==='player'){
    ctx.fillStyle='rgba(240,192,64,0.9)';
    ctx.font='bold 13px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('[스페이스/Z] 공격',W*0.3,H*0.96);
    ctx.fillText('[X] 방어',W*0.7,H*0.96);
  } else {
    ctx.fillStyle='#999'; ctx.font='13px "Courier New",monospace';
    ctx.textAlign='center';
    ctx.fillText('아서의 차례...',W*0.5,H*0.96);
  }
  ctx.textAlign='left';
}

function drawHPBar(ctx,x,y,w,h,hp,maxHP,name,color){
  ctx.fillStyle='#222'; ctx.fillRect(x,y,w,h);
  const ratio=Math.max(0,hp/maxHP);
  ctx.fillStyle=ratio>0.5?color:ratio>0.25?'#f0a030':'#cc2222';
  ctx.fillRect(x,y,w*ratio,h);
  ctx.strokeStyle='#555'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
  ctx.fillStyle='#fff'; ctx.font='bold 11px "Courier New",monospace';
  ctx.fillText(`${name}  HP: ${hp}/${maxHP}`,x,y-4);
}

// ── HUD ──
function drawHUD(ctx,canvas){
  // 영역 표시
  const p=state.player;
  const inForest=p.tx>=50;
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(8,8,240,28);
  ctx.fillStyle='#f0c040'; ctx.font='bold 13px "Courier New",monospace';
  ctx.fillText('🔥 파이리의 불꽃 모험',16,27);
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(8,40,130,20);
  ctx.fillStyle=inForest?'#aaffaa':'#aaddff';
  ctx.font='11px "Courier New",monospace';
  ctx.fillText(inForest?'🌲 잿빛숲':'📍 불씨마을',14,54);
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(8,canvas.height-28,300,22);
  ctx.fillStyle='#bbb'; ctx.font='10px "Courier New",monospace';
  ctx.fillText('WASD/방향키: 이동   스페이스: 대화',14,canvas.height-12);

  // 로그인 상태
  const user=window._currentUser;
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(canvas.width-180,8,172,28);
  ctx.fillStyle=user?'#88ffaa':'#888';
  ctx.font='11px "Courier New",monospace';
  ctx.textAlign='right';
  ctx.fillText(user?`👤 ${user.displayName||user.email||'로그인됨'}`:'👤 로그인되지 않음',canvas.width-10,27);
  ctx.textAlign='left';
}

// ── 텍스트 줄바꿈 ──
function wrapText(ctx,text,x,y,maxW,lh){
  const chars=text.split('');
  let line='',cy=y;
  for(const ch of chars){
    const test=line+ch;
    if(ctx.measureText(test).width>maxW&&line!==''){
      ctx.fillText(line,x,cy); line=ch; cy+=lh;
    } else line=test;
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
  if(state.battle.active) updateBattle(dt);
  else { processMove(); updateNPCs(dt); }
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
    canvas.width =Math.min(window.innerWidth,800);
    canvas.height=Math.min(window.innerHeight,600);
    updateCamera(canvas);
  }
  resize();
  window.addEventListener('resize',resize);
  setupInput();
  loadImages(()=>{ if(window._showTitle) window._showTitle(); });
  window._startGame=()=>{ resize(); requestAnimationFrame(loop); };
  // Firebase에서 저장 데이터를 받으면 호출
  window._onSaveLoaded=(data)=>{ loadGame(data); };
});
