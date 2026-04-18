

## Cara Upload Gambar Denah Mobil

### Status Saat Ini
Fitur upload denah mobil **sudah lengkap & berfungsi** di codebase. Anda sekarang berada di `/admin/seat-editor` (tanpa parameter vehicle), itu sebabnya tombol Upload **tidak muncul** — upload denah memang dirancang per-vehicle dan butuh context vehicle ID.

### Cara Pakai (sudah ada, tidak perlu ubah kode)

**Alur yang benar:**
1. Buka **Admin → Vehicles** (`/admin/vehicles`)
2. Pilih kendaraan (Hiace / Elf / Bus) → klik tombol **Edit Layout** / icon kursi
3. Editor terbuka dengan URL `/admin/seat-editor?vehicle=ID`
4. Card **"Denah Kendaraan"** akan muncul di atas canvas → klik **Upload**
5. Pilih file gambar (PNG/JPG/WebP, max 5MB)
6. Tunggu loading overlay → denah otomatis tersimpan ke DB & langsung tampil
7. Geser kursi sesuai denah → klik **Simpan ke Database**

### Kenapa Tombol Upload Tidak Muncul Sekarang
Lihat `SeatLayoutEditor.tsx` line 229: `{vehicleId && (...)}` — card upload hanya render kalau ada `?vehicle=ID` di URL. Ini disengaja agar tidak ada denah "yatim" tanpa vehicle pemilik.

### Issue Potensial yang Bisa Diperbaiki (opsional)

**A. UX bingung saat akses langsung `/admin/seat-editor`**
User (seperti sekarang) buka editor tanpa context vehicle → lihat editor kosong tanpa tombol upload, tidak ada petunjuk harus dari mana.

→ **Fix opsional**: Tampilkan banner peringatan di atas editor: *"Buka editor lewat halaman Vehicles untuk upload denah & simpan ke database"* + tombol shortcut ke `/admin/vehicles`.

**B. Tombol "Upload" terlihat kecil di card**
Card denah pakai layout horizontal — di viewport sempit (522px sekarang), label tombol "Upload"/"Ganti" bisa kepotong.

→ **Fix opsional**: Stack vertikal di mobile, full-width button.

### Yang Akan Diubah (jika setuju)
- `src/pages/SeatLayoutEditor.tsx` — tambah banner info kalau `!vehicleId`, perbaiki responsive card upload

### Yang TIDAK Diubah
- Logika upload (sudah benar)
- Storage bucket `vehicle-layouts` (sudah ada & public)
- Schema DB (kolom `image_url` sudah ada di `vehicles`)

### Hasil
User langsung paham harus akses editor dari halaman Vehicles untuk upload denah. Tombol upload lebih nyaman di layar kecil.

