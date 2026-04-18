
## Rencana: Seat Layout Editor dengan Upload Denah Mobil

### Status Saat Ini
- `/admin/seat-editor` sudah ada, sudah multi-vehicle (pakai `?vehicle=ID`), drag & drop kursi sudah jalan
- Tabel `vehicles` sudah punya kolom `image_url` (text), tapi belum ada UI upload — masih input URL manual di `AdminVehicles`
- `SeatEditor.tsx` masih hardcode pakai `hiace-layout.png` import statis, belum baca `image_url` dari vehicle
- Belum ada storage bucket di Supabase

### Yang Akan Dibuat/Diubah

**1. Storage bucket `vehicle-layouts` (PUBLIC)**
- Migration: buat bucket + RLS policy (admin bisa upload/delete, public bisa baca)
- File path: `{vehicle-id}/{timestamp}.{ext}`

**2. `SeatEditor.tsx` — terima prop `baseImageUrl`**
- Hapus import statis `hiace-layout.png`
- Render `<img src={baseImageUrl}>` jika ada, fallback ke placeholder kotak abu-abu dengan teks "Belum ada denah, upload dulu"

**3. `SeatLayoutEditor.tsx` — tambah panel upload**
- Tombol "Upload Denah Mobil" → file input (accept image/*, max 5MB)
- Handler: upload ke Storage → dapat public URL → update `vehicles.image_url` → refresh state
- Tampilkan preview thumbnail kecil + tombol "Ganti gambar"
- Validasi: hanya image, max 5MB, toast error kalau gagal
- Kirim `image_url` vehicle ke `<SeatEditor baseImageUrl={...}>`

**4. `Shuttle.tsx` (user) — pakai gambar dari vehicle aktif**
- Fetch vehicle pertama yang `is_active=true` dari DB (atau by slug yang dipilih user nanti)
- Pass `image_url` & `layout` ke `SeatMap`
- Update `SeatMap.tsx` dengan prop `baseImageUrl` (sama seperti SeatEditor)
- Fallback: kalau belum ada vehicle di DB, pakai data hardcode lama

**5. `AdminVehicles.tsx` — hapus input URL manual**
- Field "URL Gambar Denah" diganti jadi info: "Upload denah lewat editor kursi (ikon ✏️)"
- Atau biarkan field ada tapi optional (untuk URL eksternal)

### Flow Admin
```
/admin/vehicles → klik ikon kursi → /admin/seat-editor?vehicle=ID
  → klik "Upload Denah" → pilih file → otomatis tersimpan ke DB
  → drag kursi di atas denah → klik "Simpan Layout"
  → user buka /shuttle → lihat denah + kursi yang sudah diatur
```

### File yang Disentuh
- **Migration baru**: storage bucket `vehicle-layouts` + RLS
- **Edit**: `src/components/shuttle/SeatEditor.tsx` (terima `baseImageUrl` prop)
- **Edit**: `src/components/shuttle/SeatMap.tsx` (terima `baseImageUrl` prop)
- **Edit**: `src/pages/SeatLayoutEditor.tsx` (tambah upload UI + handler)
- **Edit**: `src/pages/Shuttle.tsx` (fetch vehicle dari DB)
- **Edit**: `src/pages/admin/AdminVehicles.tsx` (clean up field URL manual)

### Yang TIDAK Dibuat
- Crop/resize image di client (upload as-is)
- Multiple denah per vehicle (1 vehicle = 1 denah)
- Vehicle picker di halaman user `/shuttle` (auto pakai vehicle aktif pertama)
- Image optimization (Supabase Storage sudah cukup)

### Hasil Akhir
Admin bisa upload foto denah mobil apapun (Hiace, Elf, Bus) → drag kursi sesuai foto → user lihat denah persis sama dengan posisi kursi yang admin atur, semua tersimpan di database per-vehicle.
