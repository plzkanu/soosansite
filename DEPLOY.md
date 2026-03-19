# 배포 가이드

## Vercel 배포 (권장)

### 방법 1: Vercel CLI (로컬에서 배포)

1. **Vercel 로그인** (터미널에서 실행)
   ```powershell
   npx vercel login
   ```
   - 브라우저가 열리면 Vercel 계정으로 로그인

2. **배포 실행**
   ```powershell
   npx vercel --prod
   ```

3. **SSL 인증서 오류가 발생하는 경우** (회사/학교 네트워크 등)
   ```powershell
   $env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx vercel --prod
   ```

### 방법 2: Vercel 웹사이트 (GitHub 연동)

1. [vercel.com](https://vercel.com) 접속 후 로그인
2. **Add New Project** → **Import Git Repository**
3. `plzkanu/soosansite` 저장소 선택
4. **Deploy** 클릭
5. 이후 `main` 브랜치에 푸시할 때마다 자동 배포됩니다

### 환경 변수 설정

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables에서 추가:

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `AUTH_SECRET` | JWT 서명용 시크릿 (32자 이상 랜덤 문자열) | ✅ |

생성 예시:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⚠️ 중요: 파일 저장소 제한

현재 앱은 **로컬 JSON 파일** (`data/sites.json`)과 **파일 업로드** (`public/uploads`)를 사용합니다.

**Vercel 서버리스 환경에서는:**
- 파일 쓰기가 **영구 저장되지 않습니다** (요청마다 새 인스턴스)
- 사이트 추가/수정/삭제, 이미지 업로드가 **배포 후 유지되지 않습니다**

**프로덕션용으로 사용하려면:**
- 데이터베이스(Prisma + PostgreSQL 등) 또는
- Vercel Blob / S3 등 외부 스토리지로 마이그레이션이 필요합니다
