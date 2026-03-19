# 사이트 포털

개발된 사이트들을 한 페이지에서 관리하고 접속할 수 있는 포털입니다.

## 기능

- **포털**: 등록된 사이트 카드 클릭 시 해당 사이트로 이동
- **관리자**: 사이트 추가/수정/삭제, 이미지 업로드
- **로그인**: 관리자 인증 (admin / admin!@#)
- **비밀번호 변경**: 로그인 후 비밀번호 변경 가능

## 로컬 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인

## Replit 배포

### 1. GitHub에 푸시

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

### 2. Replit에서 프로젝트 가져오기

1. [Replit](https://replit.com) 로그인
2. **Create Repl** → **Import from GitHub**
3. GitHub 저장소 URL 입력 후 Import

### 3. 환경 변수 설정 (Replit Secrets)

Replit 좌측 **Tools** → **Secrets**에서 추가:

| 키 | 값 | 설명 |
|---|---|---|
| `AUTH_SECRET` | 랜덤 문자열 | JWT 서명용 (배포 시 필수) |

### 4. 배포

Replit 상단 **Deploy** 버튼 클릭 → **Deploy to Replit**

> ⚠️ **주의**: Replit 무료 플랜은 파일 저장소가 휘발성입니다. Repl이 sleep되면 `data/`(사이트 목록, 관리자 정보)와 `public/uploads/`(업로드 이미지)가 초기화될 수 있습니다. 영구 저장이 필요하면 Replit Database 사용을 고려하세요.
