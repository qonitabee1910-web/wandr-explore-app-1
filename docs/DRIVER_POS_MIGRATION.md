# Migration: Add Driver Position Support

## Deskripsi
Menambahkan column `driver_pos` ke table `vehicles` untuk menyimpan posisi pengemudi di layout editor.

## Untuk Menjalankan Migration

### Opsi 1: Via Supabase CLI
```bash
supabase migration up
```

### Opsi 2: Manual SQL Execution
Buka Supabase Dashboard → SQL Editor, lalu jalankan SQL berikut:

```sql
-- Add driver_pos column to vehicles table for storing driver position
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS driver_pos jsonb DEFAULT '{"x": 50, "y": 8}';

-- Add comment to explain the column
COMMENT ON COLUMN vehicles.driver_pos IS 'Driver position in percentage coordinates {x: 0-100, y: 0-100}';
```

## Struktur Data
```json
{
  "x": 50,  // Posisi horizontal dalam persen (0-100)
  "y": 8    // Posisi vertikal dalam persen (0-100)
}
```

## Nilai Default
- X: 50 (tengah)
- Y: 8 (bagian atas)

## Kompatibilitas
- Jika column belum ada, aplikasi akan otomatis fallback ke query tanpa `driver_pos`
- Data akan tetap tersimpan dengan benar
