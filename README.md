# H3 Works Creative

Website company profile H3 Works Creative dan aplikasi ORDERLY.

## Technology Stack
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite

## Requirements
- Node.js 20 atau kompatibel
- npm

## Installation
```bash
npm install
npx prisma generate
```

## Environment Configuration
Buat file .env berdasarkan konfigurasi deployment. Aplikasi memerlukan DATABASE_URL untuk koneksi database. Variabel integrasi eksternal harus disesuaikan dengan source code.

Jangan unggah .env, API keys, password, atau token ke GitHub.

## Database
Project menggunakan SQLite dengan Prisma. Schema berada di prisma/schema.prisma dan migration di prisma/migrations.

Gunakan persistent storage untuk database pada server hosting. Siapkan backup sebelum migration.

## Development
```bash
npm run dev
```

## Production
```bash
npx prisma generate
npx tsc --noEmit
npm run build
npm start
```

## Important Notes
- ORDERLY masih dalam tahap beta/pengembangan.
- Pastikan konfigurasi database dan environment variables sesuai dengan hosting.
- Build berhasil tidak otomatis berarti aplikasi siap produksi.
- Jangan menyimpan database lokal atau file rahasia di repository.

## Deployment
Sesuaikan konfigurasi deployment dan persistent storage dengan platform hosting yang dipilih.
