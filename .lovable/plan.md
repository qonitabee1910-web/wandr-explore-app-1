
## Fix: Admin Dashboard Redirect Race Condition

### Root Cause
Di `UserAuthContext.tsx`, ketika user login dan `onAuthStateChange` jalan:
1. `setTimeout(() => loadProfile(...), 0)` — load profile & role secara async
2. `setIsLoading(false)` — langsung jalan **tanpa nunggu loadProfile selesai**

Akibatnya `AdminRoute` cek state dengan `isLoading=false` tapi `isAdmin` masih `false` (belum di-set) → admin di-redirect ke `/`. Refresh manual baru kerja karena `getSession()` path pakai `.finally()` yang nunggu profile loaded.

### Fix
**`src/context/UserAuthContext.tsx`** — Tambah state `isProfileLoading` (atau gabungkan ke `isLoading`):
- Saat `onAuthStateChange` deteksi session, set `isLoading=true` dulu
- Pakai `loadProfile(session.user).finally(() => setIsLoading(false))` di kedua jalur (sama seperti `getSession`)
- Jangan set `isLoading=false` sebelum `loadProfile` selesai saat ada session

### Hasil
Login admin → `AdminRoute` lihat `isLoading=true` (tampilkan "Memuat...") → setelah role loaded `isLoading=false` + `isAdmin=true` → masuk ke `/admin` tanpa redirect.

### File yang Disentuh
- `src/context/UserAuthContext.tsx` — fix race condition di auth state listener
