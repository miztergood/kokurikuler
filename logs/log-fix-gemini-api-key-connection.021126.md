# Log & Context Update: Perbaikan Koneksi Gemini API Key & Penanganan Test Koneksi

- **Document:** `logs/log-fix-gemini-api-key-connection.021126.md`
- **Date:** 2 November 2026
- **Project:** Kokurikuler Online (`kokurikuler.web.id`)
- **Repository:** `miztergood/kokurikuler` (Branch: `main`)
- **Commit:** `ec691ea`

---

## 1. Ringkasan Kasus

Pengguna melaporkan bahwa saat memasukkan API Key Gemini di halaman **Pengaturan Akun** (`/settings`) dan menekan tombol **"Test Koneksi"**, selalu muncul notifikasi error merah:
> *"Gagal menghubungi server"*

Hal ini menyebabkan pengguna tidak dapat menggunakan fitur AI Kokurikuler karena menduga server mengalami gangguan.

---

## 2. Akar Masalah (Root Causes)

1. **Query Database Mengakses Kolom Non-Eksisten:**
   Backend serverless function ([`hello.ts`](file:///e:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/46.%20kokurikuler/codebase%20kokurikuler/hello.ts)) mencoba mengambil API key dengan `SELECT api_key FROM public.profiles WHERE user_id = ...`. Tabel `profiles` tidak memiliki kolom `api_key`. PostgreSQL memicu error fatal `column "api_key" does not exist` (HTTP 500).
   Kunci pengguna yang sebenarnya disimpan di tabel `public.user_api_keys` dan kunci cadangan di `public.demo_api_keys`.

2. **Daftar Model AI Kedaluwarsa:**
   Backend sebelumnya mengunci pemanggilan ke model `gemini-2.5-flash`, `gemini-2.5-flash-lite`, dan `gemini-3-flash`. Google telah menonaktifkan model-model lama ini untuk akun/API key baru dan mengembalikan HTTP 404.

3. **Masking Error di Frontend:**
   Di [`src/pages/UserSettings.tsx`](file:///e:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/46.%20kokurikuler/codebase%20kokurikuler/src/pages/UserSettings.tsx), ketika backend mengembalikan response non-200, frontend mengabaikan pesan error dari server dan selalu menggantinya dengan teks statis `"Gagal menghubungi server"`.

4. **Lonjakan Beban Model (503 High Demand):**
   Model Gemini dapat mengalami lonjakan sesaat (HTTP 503). Sebelumnya status ini tidak ditandai `recoverable: true` sehingga server langsung berhenti tanpa mencoba model cadangan berikutnya.

---

## 3. Solusi yang Diterapkan

1. **[`hello.ts`](file:///e:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/46.%20kokurikuler/codebase%20kokurikuler/hello.ts) (Neon Serverless Functions):**
   - Mengambil kunci aktif pengguna langsung dari `public.user_api_keys WHERE user_id = ${userId} AND is_active = true`.
   - Menambahkan fallback otomatis ke `public.demo_api_keys` dan environment variable `GEMINI_API_KEY`.
   - Memperbarui daftar model menjadi: `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-flash-latest`, dan `gemini-flash-lite-latest`.
   - Menambahkan timeout per-request (`AbortSignal.timeout(12000)`).
   - Menandai status 503 / 500 / 429 sebagai `recoverable: true` agar otomatis beralih ke model berikutnya secara seamless.
   - Mengembalikan status 200 dengan payload detail `{ success, text, model, error, errorCode }` agar response dapat diolah dengan baik oleh frontend.
   - Dideploy ke live compute Neon dengan `bunx neon deploy -y --env .env`.

2. **[`src/pages/UserSettings.tsx`](file:///e:/3.%20PRODUK%20DIGITAL/05%20-%20Aplikasi%20dan%20Pengembangan/App/46.%20kokurikuler/codebase%20kokurikuler/src/pages/UserSettings.tsx) (Frontend):**
   - Memperbaiki `handleTestConnection` untuk menampilkan pesan kesalahan yang sebenarnya dari backend (`error.message` atau `ERROR_MESSAGES[errorCode]`).
   - Menambahkan pemetaan kode error `missing_api_key`, `rate_limit_exceeded`, dan `unauthorized`.

---

## 4. Hasil Verifikasi

- **Pengujian Endpoint Live:** Pemanggilan langsung ke `https://br-sparkling-sunset-b3wggorc-api.compute.c-4.ap-southeast-1.aws.neon.tech/generate-content` menggunakan token dan API key pengguna yang bermasalah (`AQ.Ab8RN6JMw...`) berhasil dengan status 200:
  ```json
  { "success": true, "text": "BERHASIL", "model": "gemini-3.5-flash-lite" }
  ```
- **Waktu Respons:** ~3 detik.
