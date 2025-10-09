# Database Setup Guide

이 프로젝트는 Supabase를 사용하여 블로그 포스트를 저장합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - Name: 프로젝트 이름 (예: `hamlog`)
   - Database Password: 안전한 비밀번호 생성
   - Region: 가장 가까운 지역 선택
4. **Create new project** 클릭
5. 프로젝트 생성 완료까지 대기 (1-2분 소요)

## 2. 환경 변수 설정

Supabase 프로젝트가 생성되면 API 설정을 가져옵니다:

1. Supabase Dashboard → **Settings** → **API**
2. 다음 정보 확인:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys** → **service_role** (secret)

### 로컬 개발 환경

`.env.local` 파일에 환경 변수를 추가하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Vercel 환경 변수 설정

1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

## 3. 기존 마크다운 파일 마이그레이션

기존 `content/posts/*.md` 파일들을 데이터베이스로 이전합니다:

```bash
npm run migrate
```

이 명령어는:
- 데이터베이스 스키마 생성
- `content/posts/` 폴더의 모든 마크다운 파일 읽기
- 각 파일을 파싱하여 DB에 저장

## 4. 확인

로컬 개발 서버 실행:

```bash
npm run dev
```

브라우저에서 확인:
- http://localhost:3000 - 메인 페이지
- http://localhost:3000/api/posts - API 확인

## 5. 프로덕션 배포

1. 코드를 Git에 푸시
2. Vercel이 자동으로 배포
3. 환경 변수는 이미 설정되어 있음 (Vercel이 자동 관리)

## API 사용법

### 포스트 생성 (프로덕션에서도 가능)

```bash
curl -X POST https://your-site.com/api/posts \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Post",
    "slug": "new-post",
    "content": "Post content here",
    "excerpt": "Short excerpt",
    "category": "Dev",
    "author": "Your Name"
  }'
```

### 포스트 수정

```bash
curl -X PUT https://your-site.com/api/posts/new-post \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

### 포스트 삭제

```bash
curl -X DELETE https://your-site.com/api/posts/new-post \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

## 주요 변경사항

### Before (파일 기반)
- 포스트: `content/posts/*.md`
- 프로덕션에서 수정 불가 (읽기 전용 파일시스템)
- 로컬에서만 작성 → Git push 필요

### After (Supabase Database)
- 포스트: Supabase PostgreSQL
- 프로덕션에서 CMS처럼 작성/수정 가능
- API 호출로 즉시 반영
- ISR(Incremental Static Regeneration)로 성능 유지

## 문제 해결

### 마이그레이션 에러
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# .env.local 파일이 있는지 확인
cat .env.local
```

### 데이터베이스 연결 실패
- Supabase Dashboard에서 프로젝트가 활성화되어 있는지 확인
- 환경 변수가 올바른지 확인 (URL, Service Role Key)
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작

### 프로덕션에서 500 에러
- Vercel Dashboard → Logs 확인
- 환경 변수가 프로덕션에 설정되었는지 확인
- Supabase Dashboard에서 데이터베이스 상태 확인

### 데이터베이스 스키마 생성 필요 시
Supabase Dashboard → **SQL Editor**에서 `db/schema.sql` 파일의 내용을 실행하세요.
