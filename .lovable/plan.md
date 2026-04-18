
## Rencana: Editor Posisi Kursi (Visual Drag & Drop)

### Tujuan
Membuat halaman editor di mana Anda bisa **drag kursi** di atas denah Hiace untuk mengatur posisi yang realistis, lalu hasilnya bisa dipakai sebagai layout default user.

### Pendekatan: Editor Lokal (tanpa DB)
Karena scope project adalah UI Traveloka clone dan layout kursi hanya 1 jenis (Hiace), editor ini akan:
- Menyimpan hasil edit ke **localStorage** (persisten di browser Anda)
- Menyediakan tombol **"Export sebagai code"** → menghasilkan snippet TypeScript yang bisa di-paste ke `src/data/seatLayout.ts` agar jadi default permanen untuk semua user

Ini menghindari kompleksitas database/RLS untuk fitur internal.

### Halaman Baru: `/shuttle/editor`

```text
┌──────────────────────────────────┐
│ ← Editor Layout Kursi            │
├──────────────────────────────────┤
│ [+ Tambah Kursi] [Reset] [Export]│
├──────────────────────────────────┤
│   ┌────────────────────┐         │
│   │  [Denah Hiace]     │         │
│   │  ▢ ← drag aku!     │         │
│   │      ▢   ▢         │         │
│   │  ▢   ▢   ▢         │         │  ← drag kursi
│   │                    │         │     dengan mouse
│   │  Klik kursi untuk  │         │     atau touch
│   │  edit/hapus        │         │
│   └────────────────────┘         │
├──────────────────────────────────┤
│ Kursi terpilih: 3B               │
│ Label: [3B___]                   │
│ X: [50%] Y: [48%]                │
│ Status: ◉ available ○ occupied   │
│ [Hapus Kursi]                    │
├──────────────────────────────────┤
│ [Simpan Perubahan]               │
└──────────────────────────────────┘
```

### Implementasi Teknis

**1. File baru: `src/lib/seatStorage.ts`**
- Helper `loadSeats()` / `saveSeats()` ke localStorage
- Helper `exportToCode(seats)` → generate string TypeScript
- Update `src/data/seatLayout.ts` agar `HIACE_SEATS` di-load dari localStorage jika ada, fallback ke default

**2. Komponen baru: `src/components/shuttle/SeatEditor.tsx`**
- Mirip `SeatMap.tsx` tapi dengan drag handler
- Pakai pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`) — support mouse + touch
- Saat drag: update koordinat `x%, y%` berdasarkan posisi pointer relatif terhadap container (pakai `getBoundingClientRect()`)
- Highlight kursi yang sedang aktif
- Snap halus (tanpa grid, free positioning)

**3. Halaman baru: `src/pages/SeatLayoutEditor.tsx`**
- Header sticky + tombol back
- Toolbar: Tambah / Reset / Export
- `<SeatEditor>` di tengah
- Panel edit di bawah: ubah label, ubah status (available/occupied), hapus kursi
- Tombol simpan → tulis ke localStorage + toast "Tersimpan"
- Tombol export → tampilkan dialog dengan kode siap copy-paste

**4. Routing: `src/App.tsx`**
- Tambah route `/shuttle/editor` (protected, behind login)

**5. Akses dari Shuttle page**
- Tambah ikon kecil "✏️ Edit Layout" di pojok header `/shuttle` agar mudah diakses
- Atau lewat URL langsung `/shuttle/editor`

**6. Update `src/data/seatLayout.ts`**
- Pisahkan: `DEFAULT_HIACE_SEATS` (constant) + `HIACE_SEATS` (computed dari localStorage atau default)
- Halaman `/shuttle` tetap pakai `HIACE_SEATS` → otomatis ambil hasil edit

### UX Detail
- Drag dengan **delay kecil** agar single-tap = select, hold + drag = pindah
- Kursi yang sedang di-drag: scale 1.2 + shadow lebih kuat
- Koordinat ditampilkan real-time saat drag (overlay di pojok)
- Container max-width sama persis dengan `/shuttle` (280px) agar hasil edit akurat
- Tombol "Tambah Kursi" → kursi baru muncul di tengah (50%, 50%) dengan label auto-increment

### Yang TIDAK Dibuat
- Multi-vehicle support (hanya Hiace)
- Save ke database (pakai localStorage)
- Multi-user collaboration
- Undo/redo history
- Snap grid

### Hasil Akhir
Anda buka `/shuttle/editor` → drag kursi-kursi sampai posisinya pas dengan denah → klik Simpan → buka `/shuttle` → user lihat layout yang sudah Anda atur. Untuk permanen di production: klik Export → copy snippet → paste ke `src/data/seatLayout.ts`.
