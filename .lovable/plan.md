
## Analisis & Rencana Integrasi Database

### Status Aplikasi Saat Ini

**Yang sudah ada:**
- Halaman publik: `/`, `/login`, `/signup`
- Halaman terproteksi: `/shuttle`, `/ride`, `/promos`, `/account`, `/booking`
- `UserAuthProvider` + `ProtectedRoute` sudah di-wire ke `App.tsx`
- Supabase client tersedia (`src/integrations/supabase/client.ts` + `src/lib/supabase.ts`)
- `authService.ts` sudah lengkap (signup/login/profile)
- Data masih dummy (`src/data/*.ts`)

**Masalah aktif:**
1. **Build error**: `src/admin/pages/Dashboard.tsx` masih ada (JSX rusak) padahal folder `src/admin` seharusnya sudah dihapus. File-file admin/seat-layout/driver lain juga masih ada (lihat `src/admin/AdminRouter.tsx`, `src/admin/services/seatLayoutService.ts`, dll).
2. **Database kosong**: tidak ada tabel sama sekali di Supabase.
3. `authService.ts` & `UserAuthContext.tsx` mereferensi tabel `users` yang belum ada → login/signup pasti gagal.
4. `src/services/databaseService.ts`, `fareService.ts`, `mapService.ts` mereferensi tabel-tabel kompleks (drivers, rides, shuttles, dll) yang tidak relevan dengan scope UI Traveloka clone.

### Rencana Eksekusi

**Fase 1 — Bersihkan sisa kode legacy (fix build error)**
- Hapus seluruh folder `src/admin/` (Dashboard.tsx, SeatLayoutEditor, Sidebar, dll)
- Hapus file legacy yang tidak dipakai routing:
  - `src/services/databaseService.ts`, `fareService.ts`, `mapService.ts`, `advancedRouteService.ts`
  - `src/lib/client.ts`, `src/lib/server.ts`, `src/lib/fareCalculation.ts`
  - `src/test/*` (test untuk modul yang dihapus)
  - `src/types/maps.ts`, `src/types/pricing.ts`, `src/types/shuttle.ts`
  - `src/context/ShuttleContext.tsx` (jika tidak dipakai pages aktif)
  - `setup-database.js`, `run-migrations.js`, `setup-storage-buckets.js`
  - File-file `.md` dokumentasi lama (opsional, tapi membersihkan project)

**Fase 2 — Skema Database (scope: Auth + Profile + Booking + Promos)**

Tabel yang akan dibuat via migration:

```text
profiles
  ├─ id (uuid, PK, FK → auth.users.id ON DELETE CASCADE)
  ├─ full_name (text)
  ├─ phone (text, nullable)
  ├─ avatar_url (text, nullable)
  ├─ created_at, updated_at

user_roles  (sesuai best practice security)
  ├─ id (uuid, PK)
  ├─ user_id (uuid, FK → auth.users)
  ├─ role (app_role enum: 'user' | 'admin')

promos
  ├─ id (uuid, PK)
  ├─ title, description, image_url
  ├─ category (text: hotel/shuttle/ride)
  ├─ discount_percent (int)
  ├─ valid_until (timestamptz)
  ├─ is_active (bool)

bookings
  ├─ id (uuid, PK)
  ├─ user_id (uuid, FK → auth.users)
  ├─ booking_type (text: shuttle/ride/hotel)
  ├─ details (jsonb)  ← fleksibel untuk semua tipe
  ├─ total_price (numeric)
  ├─ status (text: pending/confirmed/completed/cancelled)
  ├─ booking_date (timestamptz)
  ├─ created_at
```

**Triggers & Functions:**
- `handle_new_user()` trigger di `auth.users` → auto-insert ke `profiles` + assign role `'user'` ke `user_roles`
- `has_role(user_id, role)` SECURITY DEFINER function (anti-recursive RLS)
- `update_updated_at_column()` trigger untuk profiles

**RLS Policies:**
- `profiles`: user bisa SELECT/UPDATE record sendiri
- `user_roles`: user bisa SELECT role sendiri; hanya admin yang bisa modify
- `promos`: SELECT public (semua bisa lihat), modify hanya admin
- `bookings`: user CRUD record dengan `user_id = auth.uid()`

**Fase 3 — Update Kode Aplikasi**
- Ganti referensi `from('users')` → `from('profiles')` di `authService.ts` & `UserAuthContext.tsx`
- Sederhanakan `AuthUser` interface (hapus role 'driver')
- Update `src/pages/Account.tsx` → tampilkan profil real + booking history dari DB
- Update `src/pages/Booking.tsx` → simpan booking ke tabel `bookings` saat konfirmasi
- Update `src/pages/Promos.tsx` → fetch dari tabel `promos`
- Pertahankan data dummy untuk hotels/shuttles/rides catalog (tetap UI-only untuk listing)

**Fase 4 — Seed Data**
- Insert beberapa promo contoh ke tabel `promos` agar halaman `/promos` langsung terisi

### Konfigurasi Auth
- Email/password signup aktif
- Auto-confirm email **OFF** (default — user harus verifikasi email)
- Google OAuth: tidak ditambah dulu (bisa ditambah nanti jika diminta)

### Yang TIDAK Diubah
- File auto-generated: `src/integrations/supabase/client.ts`, `types.ts`, `.env`
- Halaman dummy listing (Hotels/Shuttle catalog) tetap pakai `src/data/*.ts`
- PWA manifest, layout, navbar, design tokens

### Hasil Akhir
Build clean, login/signup berfungsi nyata, profil tersimpan di DB, promo dinamis dari DB, dan riwayat booking user tersimpan per-user dengan RLS yang aman.
