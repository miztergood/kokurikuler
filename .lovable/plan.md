# Fix: Scroll Bar Independen di Panel Kiri (Form)

## Diagnosis
Perbaikan sebelumnya (`h-screen overflow-hidden` di root + `overflow-y-auto` di `aside`) secara teori sudah benar, tapi scroll bar panel kiri tidak muncul. Ada dua kemungkinan penyebab:

1. `<header>` di `AppPage.tsx` masih pakai `sticky top-0 z-20`. Padahal root sekarang `h-screen overflow-hidden` — sticky jadi tidak berguna dan bisa membuat browser menganggap header ikut alur scroll dokumen, sehingga tinggi baris `flex-1` tidak benar-benar terkunci.
2. `overflow-y-auto` hanya menampilkan scroll bar saat konten meluap. Di beberapa kasus browser tidak render track scroll — perlu dipaksa dengan `overflow-y-scroll` agar track selalu terlihat (seperti di aplikasi live user).

## Solusi
### Perubahan di `src/pages/AppPage.tsx`
1. **Header (baris ~215)**: hapus `sticky top-0 z-20` — sudah tidak diperlukan karena parent `overflow-hidden`, dan bisa mengganggu constraint tinggi.
2. **Aside panel kiri (baris ~260)**: ganti `overflow-y-auto` → `overflow-y-scroll`, dan tambah `h-full` eksplisit untuk memastikan tinggi terkunci pada baris flex.
3. **Wrapper kanan DocumentPreview (baris ~304)**: sudah `overflow-hidden`, biarkan.

### Verifikasi
Setelah edit, jalankan Playwright headless untuk:
- Buka `http://localhost:8080/app` (dengan session yang sudah di-inject),
- Screenshot viewport 1280×900,
- Konfirmasi dua scroll bar terpisah terlihat: satu di kanan panel kiri (form), satu di kanan panel dokumen.

### File yang diubah
1. `src/pages/AppPage.tsx`
