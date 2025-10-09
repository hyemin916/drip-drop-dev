# Database Setup Guide

이 프로젝트는 Vercel Postgres를 사용하여 블로그 포스트를 저장합니다.

## 1. Vercel Postgres 데이터베이스 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** → **Postgres** 선택
5. 데이터베이스 이름 입력 (예: `hamlog-db`)
6. **Create** 클릭

## 2. 환경 변수 설정

데이터베이스가 생성되면 자동으로 환경 변수가 프로젝트에 추가됩니다:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 로컬 개발 환경

`.env.local` 파일에 환경 변수를 추가하세요:

```bash
# Vercel Dashboard의 Storage → 데이터베이스 → .env.local 탭에서 복사
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."
```

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

### After (Database)
- 포스트: Vercel Postgres
- 프로덕션에서 CMS처럼 작성/수정 가능
- API 호출로 즉시 반영
- ISR(Incremental Static Regeneration)로 성능 유지

## 문제 해결

### 마이그레이션 에러
```bash
# 환경 변수 확인
echo $POSTGRES_URL

# .env.local 파일이 있는지 확인
cat .env.local
```

### 데이터베이스 연결 실패
- Vercel Dashboard에서 환경 변수가 올바른지 확인
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작

### 프로덕션에서 500 에러
- Vercel Dashboard → Logs 확인
- 환경 변수가 프로덕션에 설정되었는지 확인
