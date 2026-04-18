
## Review & Refinement: Seat Layout Editor + Upload

### Status: Working ✅
- Storage bucket `vehicle-layouts` exists & is public
- RLS policies untuk admin upload/delete sudah ada
- Upload UI di `SeatLayoutEditor` jalan
- `Shuttle.tsx` user fetch vehicle aktif & tampilkan denah + layout

### Issues Ditemukan

**1. Stale image cache setelah upload ulang** (medium)
`upsert: true` dengan path baru `{timestamp}.ext` artinya file lama tetap nyangkut di storage (orphan). Plus URL baru selalu unique jadi cache bukan masalah, tapi storage jadi penuh sampah.
→ **Fix**: hapus file lama sebelum upload baru (list bucket folder `{vehicleId}/`, delete semua, lalu upload).

**2. Image aspect ratio fixed `1/2` (portrait sempit)** (high)
`SeatEditor` & `SeatMap` pakai `aspect-[1/2]` (lebar 280, tinggi 560). Foto denah Hiace yang user upload bisa landscape atau aspect lain → image jadi kekecilan + banyak whitespace, posisi kursi tidak match.
→ **Fix**: Ubah container ke `aspect-auto` dengan tinggi natural dari image, atau biarkan image set aspect via `onLoad` baca naturalWidth/Height. Container & kursi tetap pakai % positioning jadi otomatis fit.

**3. `HIACE_SEATS` masih dipakai sebagai initial state di `Shuttle.tsx`** (low)
`useState(HIACE_SEATS)` membaca dari localStorage sebelum DB fetch. Ini legacy dari versi lama, bisa jadi flicker. Mending initial `[]` lalu show skeleton sampai DB load.

**4. Tidak ada loading state saat fetch vehicle di `/shuttle`** (low)
User lihat layar kosong sebentar. Tambah skeleton/spinner.

**5. Image preview di header editor kepotong** (low)
Thumbnail 14x14 dengan `object-contain` ok, tapi di full editor canvas, image jangan di-`object-contain` ke aspect 1:2 yg bikin gambar kecil. Sebaiknya `object-cover` atau auto-aspect.

**6. Uploading state tidak disable seluruh form** (cosmetic)
Saat upload, user masih bisa drag kursi / klik save. Tambah visual feedback overlay.

**7. Validasi MIME redundan dengan bucket** (cosmetic)
Bucket sudah restrict ke image/png|jpeg|webp|gif. Cek client-side `file.type.startsWith("image/")` ok tapi bisa lebih informatif.

**8. Tombol "Lokal" di editor admin membingungkan** (medium)
Admin tidak butuh save lokal — itu kebutuhan dev. Untuk admin, hanya butuh "Database". Sembunyikan tombol Lokal jika `vehicleId` ada (mode admin).

### Yang Akan Diubah

**A. `SeatEditor.tsx` & `SeatMap.tsx`**
- Ganti `aspect-[1/2]` → dynamic aspect berdasarkan natural image dimension (state `aspectRatio`, set di `<img onLoad>`)
- Fallback (no image): tetap `aspect-[1/2]`

**B. `SeatLayoutEditor.tsx`**
- `handleFileSelected`: list & delete existing files di folder `{vehicleId}/` sebelum upload baru (prevent orphan)
- Hide tombol "Lokal" saat ada `vehicleId` (admin context)
- Disable drag & buttons saat `uploading=true` (overlay loading di canvas)

**C. `Shuttle.tsx`**
- Initial `seats` = `[]`, tambah `loading` state
- Skeleton placeholder di canvas saat loading
- Hapus dependency `HIACE_SEATS` dari import (pakai DEFAULT_HIACE_SEATS sebagai true fallback jika DB kosong)

**D. (opsional) Cleanup `seatLayout.ts`**
- `HIACE_SEATS` legacy export tetap, tapi `Shuttle.tsx` tidak pakai

### File yang Disentuh
- `src/components/shuttle/SeatEditor.tsx` — dynamic aspect
- `src/components/shuttle/SeatMap.tsx` — dynamic aspect + skeleton-friendly
- `src/pages/SeatLayoutEditor.tsx` — orphan cleanup, hide local btn, upload overlay
- `src/pages/Shuttle.tsx` — loading state, hapus HIACE_SEATS init
- (no DB migration needed)

### Hasil
Upload denah dengan aspect rasio apa pun tampil pas, posisi kursi akurat, tidak ada orphan files di storage, UX admin lebih bersih (tidak ada tombol membingungkan), user lihat skeleton sebentar bukan flicker layout lama.
