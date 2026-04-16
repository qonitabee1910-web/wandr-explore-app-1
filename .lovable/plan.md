
## Traveloka Clone — UI Only, PWA + Responsive Web

### Overview
Clone tampilan Traveloka dengan responsive design (otomatis menyesuaikan desktop/mobile) dan bisa di-install sebagai PWA di HP. Semua data dummy/static.

### Halaman & Fitur

**1. Homepage**
- Header/Navbar: Logo, menu navigasi (Hotel, Shuttle, Ride, Promo, Akun)
- Hero banner carousel dengan promo deals (Framer Motion)
- Quick search tabs: Hotel, Shuttle & Ride
- Promo cards grid (deals terkini)
- Footer dengan links

**2. Pencarian Hotel**
- Form: Kota tujuan, tanggal check-in/out, jumlah tamu
- Hasil pencarian dengan filter (harga, rating, bintang)
- Card hotel: foto, nama, rating, harga/malam
- Detail hotel: galeri foto, fasilitas, review, pilih kamar, tombol booking

**3. Pencarian Shuttle (Antarkota)**
- Form: Kota asal, tujuan, tanggal, penumpang
- Hasil pencarian dengan filter (operator, harga, waktu)
- Card shuttle: operator, waktu, durasi, harga
- Detail shuttle: info lengkap, bagasi, tombol booking

**4. Layanan Ride (Ride Hailing)**
- GPS-based search UI (mocked)
- Estimasi rute, biaya, dan durasi perjalanan
- Pilihan layanan: Ride Car, Ride Bike, Ride Luxury
- Status driver real-time (mocked)
- Rating dan ulasan setelah perjalanan

**5. Halaman Promo**
- Grid banner promo dengan kategori (Hotel, Shuttle, Ride, etc.)
- Detail promo dengan syarat & ketentuan

**6. Akun & Riwayat**
- Profil user dengan avatar
- Riwayat booking (dummy data) — list card dengan status (Hotel, Shuttle, Ride)

**7. Booking Flow (UI Only)**
- Form data penumpang/tamu
- Ringkasan booking
- Halaman konfirmasi sukses

### Design System
- **Warna utama**: Biru Traveloka (#0064D2), aksen biru muda, putih bersih, abu-abu netral
- **Font**: Inter untuk heading dan body (clean, modern)
- **Radius**: Rounded (8px-12px), shadow halus
- **Mobile**: Bottom navigation bar (Home, Hotel, Shuttle, Ride, Akun)
- **Desktop**: Top navbar horizontal

### Responsiveness
- Desktop (>1024px): Layout lebar, sidebar filter, grid 3-4 kolom
- Tablet (768-1024px): Grid 2 kolom, compact nav
- Mobile (<768px): Single column, bottom nav, swipeable carousel

### PWA Setup
- Manifest.json dengan icon dan display standalone
- Installable dari browser mobile

### Routing
- `/` — Homepage
- `/hotels` — Pencarian hotel
- `/hotels/:id` — Detail hotel
- `/shuttle` — Pencarian shuttle
- `/ride` — Layanan ride hailing
- `/promos` — Halaman promo
- `/account` — Profil & Riwayat
- `/booking` — Booking flow
- `/booking/confirmation` — Konfirmasi
