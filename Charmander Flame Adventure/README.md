# 🔥 파이리의 불꽃 모험 — Charmander's Flame Adventure

## 파일 구조
```
pairy-rpg/
├── index.html       ← 메인 (타이틀 + 로그인 UI + 게임 캔버스)
├── game.js          ← 게임 엔진 (맵 75×60, 보스전, Firebase 연동)
├── assets_b64.js    ← 모든 스프라이트/타일 (base64 인라인)
└── README.md
```

---

## 🔥 Firebase 설정 방법 (로그인 + 저장 기능)

### 1단계 — Firebase 프로젝트 만들기
1. [https://console.firebase.google.com](https://console.firebase.google.com) 접속
2. **프로젝트 추가** → 이름 입력 (예: `pairy-rpg`) → 생성

### 2단계 — Authentication 활성화
1. 좌측 메뉴 **Build → Authentication** → **시작하기**
2. **Sign-in method** 탭에서 활성화:
   - **이메일/비밀번호** → 사용 설정 → 저장
   - **Google** → 사용 설정 → 프로젝트 지원 이메일 선택 → 저장

### 3단계 — Firestore 데이터베이스 만들기
1. 좌측 메뉴 **Build → Firestore Database** → **데이터베이스 만들기**
2. **프로덕션 모드**로 시작 → 지역 선택 (asia-northeast3 = 서울) → 완료
3. **규칙(Rules)** 탭 → 아래 규칙으로 교체 후 게시:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /saves/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4단계 — 웹 앱 등록 및 설정값 복사
1. Firebase 콘솔 **프로젝트 설정** (톱니바퀴) → **내 앱** → **웹** (`</>`) 클릭
2. 앱 닉네임 입력 후 **앱 등록**
3. 표시되는 `firebaseConfig` 객체를 복사

### 5단계 — index.html에 붙여넣기
`index.html` 파일에서 아래 부분을 찾아 교체:
```javascript
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",         // ← 여기를
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```
→ Firebase 콘솔에서 복사한 실제 값으로 교체

### 6단계 — Render 배포 시 도메인 허용
1. Firebase 콘솔 **Authentication → Settings → 승인된 도메인**
2. Render 배포 후 생성된 도메인 추가 (예: `pairy-rpg.onrender.com`)

---

## 🚀 Render 배포 방법

1. GitHub에 새 저장소 생성 후 3개 파일 업로드:
   - `index.html`, `game.js`, `assets_b64.js`
2. [render.com](https://render.com) → **New → Static Site**
3. GitHub 저장소 연결
4. 설정:
   - **Build Command**: (빈칸)
   - **Publish Directory**: `.`
5. **Create Static Site** → 자동 배포 완료

---

## 🎮 조작법
| 키 | 동작 |
|---|---|
| WASD / 방향키 | 파이리 이동 (한 칸씩) |
| 스페이스 / 엔터 | 대화 시작 / 대화 넘기기 |
| Z / 스페이스 (전투 중) | 공격 |
| X (전투 중) | 방어 |

## 📖 현재 구현 내용
- 🗺️ **75×60 대형 맵** — 불씨마을 + 잿빛숲 입구
- 🏘️ 건물: 오박사 연구소, 포켓몬 센터, 마트, 집 5채
- 🌲 잿빛숲: 타버린 나무, 어두운 잔디, 검은 불꽃 지역
- ⚔️ **보스: 아서** — 3페이즈 전투 (공격/방어/HP 시스템)
- 👥 NPC 17명 배치 (마을 13명 + 잿빛숲 4명)
- 🔥 파이리 4방향 스프라이트 (상하 반전 버그 수정 완료)
- 💬 대화창 + NPC 스프라이트 아이콘
- 🔐 **Firebase 로그인** (Google/이메일) + **진행 상황 자동 저장**
- 📷 카메라 스크롤 (플레이어 중심)
