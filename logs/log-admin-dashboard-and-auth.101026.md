# Log & Context Update: Admin Dashboard Adaptation & Auth Fix

- **Document:** `logs/log-admin-dashboard-and-auth.101026.md`
- **Date:** 10 Oktober 2026
- **Project:** Kokurikuler Online (`kokurikuler.web.id`)
- **Repository:** `miztergood/kokurikuler` (Branch: `main`)
- **Infrastructure:**
  - Frontend: Vite + React + TypeScript + Tailwind CSS (Hosted on Cloudflare Pages)
  - Database: Neon Lakebase Postgres (`ep-late-tooth-b36b62mf`)
  - Auth: Neon Managed Better Auth (`https://ep-late-tooth-b36b62mf.neonauth.c-4.ap-southeast-1.aws.neon.tech/neondb/auth`)
  - Serverless Functions: Neon Compute Functions (`https://br-sparkling-sunset-b3wggorc-api.compute.c-4.ap-southeast-1.aws.neon.tech`)

---

## 1. Ringkasan Eksekutif

Pada tanggal 10 Oktober 2026, dilakukan dua pekerjaan utama:
1. **Adaptasi Dashboard Admin Komprehensif:** Mengadopsi arsitektur dan UI dashboard admin dari referensi ModulAjar Online (`Fase 4B.1`) ke dalam Kokurikuler Online dengan penyesuaian terminologi dan styling Neo-Brutalisme.
2. **Investigasi & Perbaikan Alur Autentikasi & Reset Password:** Mengatasi kendala di mana pengguna yang di-reset password-nya diarahkan ke halaman pembuatan akun baru (`signUp`) yang memicu error 400, bukan langsung ke input password untuk login.

---

## 2. Bagian I: Adaptasi Dashboard Admin Komprehensif

### 2.1. Latar Belakang & Kebutuhan
Admin membutuhkan dashboard analitik yang komprehensif seperti pada aplikasi *ModulAjar Online* untuk memantau:
- Pertumbuhan pengguna baru dan total pengguna.
- Performa aktivitas penyusunan modul/konten kokurikuler.
- Rasio kelengkapan profil guru dan rasio klaim akun pembeli.
- Grafik tren pendaftaran (harian, kumulatif, pola hari dalam seminggu).
- Watchlist perpanjangan masa aktif langganan akun dengan tombol langsung ke WhatsApp.

### 2.2. Komponen yang Dibuat & Dimodifikasi

1. **`src/components/admin/dashboard/useDashboardAnalytics.ts`**
   - Hook analitik kustom untuk mengambil data secara paralel dari tabel: `profiles`, `teacher_profiles`, `allowed_customers`, dan `generation_logs`.
   - Menghitung metrik periode waktu aktif (*current period*) vs periode sebelumnya (*previous period*) untuk menghitung persentase tren pertumbuhan.
   - Menyediakan fungsi **`exportToCSV`** yang mengekspor metrik KPI, tren pendaftaran, serta daftar perpanjangan akun dalam format CSV siap pakai.

2. **`src/components/admin/dashboard/DashboardFilter.tsx`**
   - Filter rentang waktu bergaya Neo-Brutalisme (*pills*): `7 Hari`, `14 Hari`, `30 Hari`, `Bulan Ini`, `3 Bulan (Pekanan)`, `Tahun Ini`, `Semua`, dan `Kustom`.
   - Date picker kustom untuk rentang tanggal manual.
   - Tombol **Segarkan** (*re-fetch*) dan tombol **Ekspor CSV**.

3. **`src/components/admin/StatCard.tsx`**
   - Diperluas untuk mendukung properti: `title`, `label`, `value`, `icon`, `description`, `trend` (nilai persentase, arah kenaikan/penurunan), serta skema warna (`primary`, `success`, `info`, `warning`, `destructive`).

4. **`src/components/admin/dashboard/UserGrowthChart.tsx`**
   - Komponen visualisasi pertumbuhan berbasis Recharts.
   - Mendukung 3 mode tab:
     - **Pendaftaran Baru**: Bar Chart dengan warna gradient Neo-Brutalisme.
     - **Kumulatif**: Area Chart pertumbuhan akumulasi total pengguna.
     - **Pola Hari**: Bar Chart frekuensi pendaftaran berdasarkan hari (Senin s/d Minggu).
   - Dilengkapi kartu mini ringkasan: Total Pengguna Periode Ini, Rata-rata Harian, dan Puncak Tertinggi.

5. **`src/components/admin/dashboard/UserSegmentationCard.tsx`**
   - Bar progress persentase aktivasi profil guru.
   - Bar progress rasio klaim lisensi pelanggan (`allowed_customers`).
   - Donut Chart distribusi jenis akun/paket lisensi (Tahunan, Pro Lifetime, Trial, dll).

6. **`src/components/admin/dashboard/RecentUsersCard.tsx`**
   - Menampilkan daftar pendaftar terbaru (7 pengguna terakhir).
   - Menampilkan avatar inisial, email, badge status profil guru (`Profil Siap` vs `Belum Profil`), dan waktu relatif (`timeAgo`).

7. **`src/components/admin/dashboard/ExpiringSubscriptionsCard.tsx`**
   - Menampilkan akun langganan yang akan berakhir dalam 30 hari ke depan.
   - Dilengkapi tombol **Ingatkan WA** yang secara otomatis membuat URL WhatsApp dengan template pesan resmi *Kokurikuler.Online*.

8. **`src/components/admin/AdminLayout.tsx`**
   - Sidebar responsif dengan tombol ciutkan (`collapse`), menu mobile, penyesuaian branding Kokurikuler.Online, dan status administrator aktif.
   - Mendukung rendering fleksibel via `<Outlet />` maupun `{children}`.

9. **`src/pages/admin/Dashboard.tsx`**
   - Mengintegrasikan seluruh baris komponen dalam 4 baris terstruktur:
     - Baris 1: Header + Global Filter + 6 Kartu KPI StatCard.
     - Baris 2: Growth Chart (2 kolom) & User Segmentation (1 kolom).
     - Baris 3: Pendaftar Terbaru & Watchlist Perpanjangan Akun.
     - Baris 4: Aksi Cepat & Navigasi Modul (`/admin/users`, `/admin/customers`, `/admin/settings`, `/app`).

---

## 3. Bagian II: Investigasi & Perbaikan Autentikasi dan Reset Password

### 3.1. Masalah yang Dilaporkan
- Admin me-reset password akun (misal `demo1@gmail.com`) melalui menu `/admin/users`.
- Saat pengguna membuka `/auth` dan memasukkan emailnya, halaman tidak menampilkan field isian password untuk login, melainkan menampilkan form **"Buat Password"** (dengan tombol **"BUAT AKUN"**).
- Saat tombol "BUAT AKUN" diklik, server mengembalikan error `400: Password does not meet security requirements` atau `User already exists`.

### 3.2. Akar Masalah (Root-Cause Analysis)
1. **Fungsi SQL `public.check_customer_email`**:
   - Fungsi tersebut sebelumnya memeriksa apakah pengguna sudah memiliki record password di tabel `neon_auth.account`. Jika belum ada, fungsi mengembalikan `is_claimed = false`.
   - Karena akun-akun hasil migrasi dari Supabase belum memiliki record di `neon_auth.account`, status `is_claimed` selalu bernilai `false`.
   - `/auth` membaca `is_claimed === false` sehingga mengarahkan pengguna ke alur pembuatan akun baru (`set-password` yang mengeksekusi `signUp`).
   - Eksekusi `signUp` gagal dengan kode 400 karena email tersebut sudah terdaftar di `neon_auth.user`.

2. **Bug pada Fungsi Backend `admin-reset-password` (`hello.ts`)**:
   - Di implementasi lama `hello.ts`, endpoint `admin-reset-password` mengeksekusi:
     ```sql
     UPDATE public.allowed_customers SET is_claimed = false WHERE user_id = ${userId};
     DELETE FROM neon_auth.account WHERE "userId" = ${userId} AND "providerId" = 'credential';
     ```
   - Alih-alih menyimpan password baru, fungsi tersebut justru **menghapus** record akun pengguna dan menandainya belum klaim.
   - Selain itu, fungsi `parseJwtSub` gagal membaca token sesi Better Auth (karena token sesi Better Auth adalah string acak 32-karakter, bukan JWT yang memiliki tanda titik `.`), sehingga memicu error `401: Unauthorized`.

### 3.3. Solusi yang Diterapkan

1. **Pembaruan Fungsi Database `public.check_customer_email`**:
   - Logika diubah: Jika email sudah ada di tabel `neon_auth.user` ATAU `public.profiles`, pengguna dipastikan merupakan pengguna terdaftar.
   - Fungsi selalu mengembalikan:
     ```json
     { "found": true, "is_claimed": true, "name": "..." }
     ```
   - **Hasil:** Saat pengguna terdaftar memasukkan email di `/auth`, halaman langsung beralih ke form input password (**Masuk**).

2. **Pembaruan Fungsi Serverless `hello.ts`**:
   - **Ekstraksi Token Sesi (`getUserIdFromAuthHeader`)**:
     - Mendukung token JWT (memeriksa `payload.sub` atau `payload.userId`).
     - Mendukung token sesi Better Auth dengan mencari langsung ke tabel `neon_auth.session WHERE token = ${token} AND "expiresAt" > NOW()`.
   - **Hashing Password Sesuai Standar Better Auth**:
     - Menggunakan `crypto.scryptSync` dengan konfigurasi standar Better Auth:
       `N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2`.
     - Format hash: `${salt_hex}:${derived_key_hex}`.
   - **Upsert Kredensial di `neon_auth.account`**:
     - Memperbarui password jika sudah ada atau membuat baris baru dengan `providerId = 'credential'`.
   - **Pembaruan Status di `allowed_customers`**:
     - Menandai `is_claimed = true` dan mencatat `claimed_at = NOW()`.
   - Dideploy ke live backend menggunakan: `neon deploy -y`.

3. **Penyempurnaan `src/pages/Auth.tsx`**:
   - Menambahkan mekanisme fallback `claim-account` pada alur pembuatan password pertama kali.
   - Mengubah pesan error default bahasa Inggris menjadi bahasa Indonesia yang ramah pengguna.
   - Menambahkan petunjuk pada form login: *"Belum punya password atau lupa password? Hubungi admin untuk reset akun Anda."*

---

## 4. Hasil Verifikasi & Pengujian

| Pengujian | Metode | Hasil | Status |
|---|---|---|---|
| Kompilasi Frontend | `npm run build` | 0 Error, bundle output valid | **LULUS** |
| Deployment Neon Functions | `neon deploy -y` | Berhasil diterapkan ke branch `production` (`br-sparkling-sunset-b3wggorc`) | **LULUS** |
| RPC `check_customer_email` | Pemanggilan SQL untuk `demo1@gmail.com`, `pakhusnulid@gmail.com`, dan akun migrasi lainnya | Mengembalikan `{ found: true, is_claimed: true }` | **LULUS** |
| Endpoint `admin-reset-password` | POST request dengan token admin aktif | Status 200 OK, password tersimpan di `neon_auth.account` | **LULUS** |
| Login Neon Auth API | POST request ke `/auth/sign-in/email` dengan password baru `demo1@gmail.com` | Status 200 OK, sesi terbit dan profil terambil | **LULUS** |
| Git Deployment | Push ke `origin main` | Memicu build otomatis Cloudflare Pages untuk domain `kokurikuler.web.id` | **LULUS** |

---

## 5. File yang Berubah

- `src/components/admin/AdminLayout.tsx` (Sidebar Neo-Brutalisme, status admin, navigasi responsif)
- `src/components/admin/StatCard.tsx` (Dukungan KPI tren, label, deskripsi)
- `src/pages/admin/Dashboard.tsx` (Dashboard 4 baris komprehensif)
- `src/components/admin/dashboard/useDashboardAnalytics.ts` (Hook analitik, metrik, ekspor CSV)
- `src/components/admin/dashboard/DashboardFilter.tsx` (Pills filter rentang waktu & aksi)
- `src/components/admin/dashboard/UserGrowthChart.tsx` (Grafik Recharts multi-mode)
- `src/components/admin/dashboard/UserSegmentationCard.tsx` (Segmentasi & donut chart lisensi)
- `src/components/admin/dashboard/RecentUsersCard.tsx` (Daftar pendaftar terbaru)
- `src/components/admin/dashboard/ExpiringSubscriptionsCard.tsx` (Watchlist perpanjangan & link WA)
- `hello.ts` (Neon Compute Functions: autentikasi sesi, scrypt password reset, generator AI)
- `src/pages/Auth.tsx` (Perbaikan transisi login pengguna terdaftar & pesan error)
- `logs/log-admin-dashboard-and-auth.101026.md` (Dokumen log & rangkuman konteks saat ini)
