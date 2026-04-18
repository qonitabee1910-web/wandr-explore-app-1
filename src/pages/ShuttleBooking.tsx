import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Copy, Check, Zap } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useShuttleBooking } from '@/context/ShuttleBookingContext';
import { useUserAuth } from '@/context/UserAuthContext';
import { ShuttleRoute, ShuttleSchedule, SERVICE_DESCRIPTIONS, Vehicle } from '@/types/shuttle-booking';
import { formatCurrency } from '@/data/dummyData';
import SeatSelector from '@/components/shuttle/SeatSelector';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const ShuttleBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useUserAuth();
  const {
    session,
    setSelectedRoute,
    setSelectedSchedule,
    setSelectedService,
    setSelectedCar,
    toggleSeat,
    setPassengerInfo,
    calculateTotal,
    goToStep,
    resetBooking,
    setBookingData,
  } = useShuttleBooking();

  const [routes, setRoutes] = useState<ShuttleRoute[]>([]);
  const [schedules, setSchedules] = useState<ShuttleSchedule[]>([]);
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');

  const currentStep = session.step;
  const totalPrice = useMemo(() => calculateTotal(), [calculateTotal]);

  // Calculate progress
  const stepIndex = {
    route: 1,
    schedule: 2,
    service: 3,
    car: 4,
    seats: 5,
    passenger: 6,
    confirm: 7,
    payment: 8,
    ticket: 9,
  }[currentStep] || 1;
  const progress = (stepIndex / 9) * 100;

  // Load routes on mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const { data } = await supabase
          .from('shuttle_routes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });
        setRoutes((data ?? []) as ShuttleRoute[]);
      } catch (err) {
        console.error('Error loading routes:', err);
      }
      setLoading(false);
    };
    loadRoutes();
  }, []);

  // Load schedules when route is selected
  useEffect(() => {
    if (!session.selectedRoute) return;
    const loadSchedules = async () => {
      try {
        const { data } = await supabase
          .from('shuttle_schedules')
          .select('*, route:shuttle_routes(*), vehicle:vehicles(*)')
          .eq('route_id', session.selectedRoute!.id)
          .eq('is_active', true)
          .gte('departure_time', new Date().toISOString())
          .order('departure_time', { ascending: true });
        setSchedules((data ?? []) as ShuttleSchedule[]);
      } catch (err) {
        console.error('Error loading schedules:', err);
      }
    };
    loadSchedules();
  }, [session.selectedRoute]);

  // Load cars when schedule is selected
  useEffect(() => {
    if (!session.selectedSchedule) return;
    const loadCars = async () => {
      try {
        const vehicleId = session.selectedSchedule!.vehicle_id;
        const { data } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', vehicleId)
          .eq('is_active', true)
          .maybeSingle();

        if (data) {
          setCars([data] as Vehicle[]);
        } else {
          const { data: allVehicles } = await supabase
            .from('vehicles')
            .select('*')
            .eq('is_active', true);
          setCars((allVehicles ?? []) as Vehicle[]);
        }
      } catch (err) {
        console.error('Error loading vehicles:', err);
      }
    };
    loadCars();
  }, [session.selectedSchedule]);

  // Load seats when car is selected
  useEffect(() => {
    if (!session.selectedCar) return;
    const loadSeats = async () => {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select('layout')
          .eq('id', session.selectedCar!.id)
          .maybeSingle();
        if (data && Array.isArray(data.layout)) {
          setSeats(data.layout);
        }
      } catch (err) {
        console.error('Error loading seats:', err);
      }
    };
    loadSeats();
  }, [session.selectedCar]);

  // Generate QR Code
  useEffect(() => {
    if (!session.booking) return;
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          bookingCode: session.booking.booking_code,
          passengerName: session.booking.passenger_name,
          seats: session.booking.seats,
          scheduleId: session.booking.schedule_id,
        });
        const qr = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#000', light: '#fff' },
        });
        setQrCode(qr);
      } catch (err) {
        console.error('QR Code generation failed:', err);
      }
    };
    generateQR();
  }, [session.booking]);

  const renderProgressBar = () => (
    <div className="bg-primary text-primary-foreground py-3 sticky top-0 z-20 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Pesan Tiket Shuttle - Step {stepIndex}/9</h1>
          <span className="text-sm opacity-75">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );

  // ===== STEP 1: SELECT ROUTE =====
  if (currentStep === 'route') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Pilih Rute Perjalanan</h2>
            <p className="text-sm text-muted-foreground mb-4">Silakan pilih rute yang Anda inginkan</p>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : routes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Tidak ada rute tersedia saat ini
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {routes.map((route) => (
                  <Card key={route.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-2">{route.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{route.origin}</span>
                            <span className="text-xs">→</span>
                            <span>{route.destination}</span>
                          </div>
                          {route.description && (
                            <p className="text-xs text-muted-foreground">{route.description}</p>
                          )}
                        </div>
                        <Button onClick={() => setSelectedRoute(route)} size="sm">
                          Pilih
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // ===== STEP 2: SELECT SCHEDULE =====
  if (currentStep === 'schedule') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <div className="mb-4">
            <button onClick={() => goToStep('route')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Rute
            </button>
            <p className="text-sm text-muted-foreground">
              {session.selectedRoute?.origin} → {session.selectedRoute?.destination}
            </p>
          </div>

          <h2 className="text-xl font-bold mb-4">Pilih Jadwal Keberangkatan</h2>

          <div className="space-y-3">
            {schedules.map((schedule) => {
              const depTime = new Date(schedule.departure_time);
              const arrTime = new Date(schedule.arrival_time);
              const depHour = depTime.getHours().toString().padStart(2, '0');
              const depMin = depTime.getMinutes().toString().padStart(2, '0');
              const arrHour = arrTime.getHours().toString().padStart(2, '0');
              const arrMin = arrTime.getMinutes().toString().padStart(2, '0');

              return (
                <Card key={schedule.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <p className="text-lg font-bold">{depHour}:{depMin}</p>
                          <p className="text-xs text-muted-foreground">Berangkat</p>
                        </div>
                        <div className="flex-1 border-t border-dashed"></div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{arrHour}:{arrMin}</p>
                          <p className="text-xs text-muted-foreground">Tiba</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{schedule.available_seats} kursi</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{schedule.vehicle?.name || 'Kendaraan'}</p>
                      <Button onClick={() => setSelectedSchedule(schedule)} size="sm">
                        Pilih
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // ===== STEP 3: SELECT SERVICE =====
  if (currentStep === 'service') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <button onClick={() => goToStep('schedule')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Jadwal
          </button>

          <h2 className="text-xl font-bold mb-4">Pilih Kelas Layanan</h2>
          <p className="text-sm text-muted-foreground mb-4">Pilih kelas layanan sesuai kenyamanan Anda</p>

          <div className="space-y-4">
            {(['regular', 'executive', 'vip'] as const).map((serviceType) => {
              const service = SERVICE_DESCRIPTIONS[serviceType];
              const priceKey = `price_${serviceType}` as keyof ShuttleSchedule;
              const price = session.selectedSchedule?.[priceKey] || 0;

              return (
                <Card
                  key={serviceType}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => setSelectedService(serviceType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <p className="text-lg font-bold text-primary shrink-0">{formatCurrency(price)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // ===== STEP 4: SELECT CAR =====
  if (currentStep === 'car') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <button onClick={() => goToStep('service')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Layanan
          </button>

          <h2 className="text-xl font-bold mb-4">Pilih Kendaraan</h2>
          <p className="text-sm text-muted-foreground mb-4">Pilih kendaraan yang tersedia untuk perjalanan ini</p>

          <div className="space-y-3">
            {cars.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Tidak ada kendaraan tersedia
                </CardContent>
              </Card>
            ) : (
              cars.map((car) => (
                <Card
                  key={car.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => setSelectedCar(car)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{car.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {car.plate_number && (
                            <>
                              <span>📋 {car.plate_number}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>👥 Kapasitas: {car.capacity} kursi</span>
                        </div>
                      </div>
                      <Button size="sm">Pilih</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // ===== STEP 5: SELECT SEATS =====
  if (currentStep === 'seats') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <button onClick={() => goToStep('car')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kendaraan
          </button>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Kelas: {SERVICE_DESCRIPTIONS[session.selectedService!].name}</p>
                  <p className="text-lg font-bold">{formatCurrency(totalPrice)}</p>
                </div>
                <Badge>{session.selectedSeats.length} kursi dipilih</Badge>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold mb-4">Pilih Kursi</h2>

          <div className="flex flex-col items-center gap-6 mb-6">
            <SeatSelector
              seats={seats}
              selectedSeats={session.selectedSeats}
              onToggleSeat={toggleSeat}
            />
          </div>

          {session.selectedSeats.length > 0 && (
            <Card className="mb-6 border-primary/30">
              <CardContent className="p-4">
                <p className="text-sm font-semibold mb-2">Kursi Terpilih:</p>
                <div className="flex flex-wrap gap-2">
                  {session.selectedSeats.map((seatId) => (
                    <Badge key={seatId} variant="secondary">
                      {seatId}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => goToStep('passenger')}
            disabled={session.selectedSeats.length === 0}
            className="w-full"
            size="lg"
          >
            Lanjut ke Data Penumpang ({session.selectedSeats.length} kursi)
          </Button>
        </div>
      </Layout>
    );
  }

  // ===== STEP 6: PASSENGER INFO =====
  if (currentStep === 'passenger') {
    const [name, setName] = useState(session.passengerName);
    const [phone, setPhone] = useState(session.passengerPhone);
    const [email, setEmail] = useState(session.passengerEmail || '');

    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <button onClick={() => goToStep('seats')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kursi
          </button>

          <h2 className="text-xl font-bold mb-4">Data Penumpang</h2>
          <p className="text-sm text-muted-foreground mb-4">Masukkan informasi penumpang</p>

          <Card className="mb-6">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => setPassengerInfo(name, phone, email)}
            disabled={!name || !phone}
            className="w-full"
            size="lg"
          >
            Lanjut ke Konfirmasi
          </Button>
        </div>
      </Layout>
    );
  }

  // ===== STEP 7: CONFIRMATION =====
  if (currentStep === 'confirm') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <button onClick={() => goToStep('passenger')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Data
          </button>

          <h2 className="text-xl font-bold mb-4">Konfirmasi Pemesanan</h2>
          <p className="text-sm text-muted-foreground mb-6">Periksa kembali data booking Anda sebelum melanjutkan</p>

          {/* Route & Schedule */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">✈️ Rute & Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Rute:</strong> {session.selectedRoute?.origin} → {session.selectedRoute?.destination}</p>
              <p><strong>Tanggal & Waktu:</strong> {new Date(session.selectedSchedule!.departure_time).toLocaleString('id-ID')}</p>
              <p><strong>Kendaraan:</strong> {session.selectedCar?.name || session.selectedSchedule?.vehicle?.name}</p>
            </CardContent>
          </Card>

          {/* Service & Seats */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">🛋️ Layanan & Kursi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Kelas:</strong> {SERVICE_DESCRIPTIONS[session.selectedService!].name}</p>
              <p><strong>Kursi:</strong> {session.selectedSeats.join(', ')}</p>
              <p><strong>Jumlah Kursi:</strong> {session.selectedSeats.length}</p>
            </CardContent>
          </Card>

          {/* Passenger Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">👤 Data Penumpang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Nama:</strong> {session.passengerName}</p>
              <p><strong>Telepon:</strong> {session.passengerPhone}</p>
              {session.passengerEmail && <p><strong>Email:</strong> {session.passengerEmail}</p>}
            </CardContent>
          </Card>

          {/* Total Price */}
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total Harga:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={async () => {
              goToStep('payment');
            }}
            className="w-full mb-2"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            Lanjut ke Pembayaran
          </Button>

          <Button onClick={() => goToStep('passenger')} variant="outline" className="w-full" size="lg">
            Kembali Edit
          </Button>
        </div>
      </Layout>
    );
  }

  // ===== STEP 8: PAYMENT =====
  if (currentStep === 'payment') {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <button onClick={() => goToStep('confirm')} className="text-primary hover:underline text-sm mb-4 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Konfirmasi
          </button>

          <h2 className="text-xl font-bold mb-4">Pembayaran</h2>
          <p className="text-sm text-muted-foreground mb-6">Pilih metode pembayaran Anda</p>

          {/* Order Summary */}
          <Card className="mb-6 bg-muted/30">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({session.selectedSeats.length} kursi)</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Admin</span>
                <span>Gratis</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total Pembayaran</span>
                <span className="text-lg text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold">Metode Pembayaran</h3>

            <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💳</div>
                  <div className="flex-1">
                    <p className="font-semibold">Transfer Bank</p>
                    <p className="text-xs text-muted-foreground">Kirim ke rekening kami</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📱</div>
                  <div className="flex-1">
                    <p className="font-semibold">E-Wallet (Midtrans)</p>
                    <p className="text-xs text-muted-foreground">GCash, Grabpay, OVO, Dana</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🏪</div>
                  <div className="flex-1">
                    <p className="font-semibold">Toko/Kantor</p>
                    <p className="text-xs text-muted-foreground">Bayar langsung di lokasi kami</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={async () => {
              setSubmitting(true);
              try {
                const bookingCode = 'BK' + Date.now();

                const { data: booking, error } = await supabase
                  .from('shuttle_bookings')
                  .insert({
                    booking_code: bookingCode,
                    user_id: user?.id || null,
                    user_email: user?.email || null,
                    schedule_id: session.selectedSchedule!.id,
                    service_type: session.selectedService,
                    passenger_name: session.passengerName,
                    passenger_phone: session.passengerPhone,
                    passenger_email: session.passengerEmail,
                    seats: session.selectedSeats,
                    total_price: totalPrice,
                    status: 'confirmed',
                    payment_status: 'unpaid',
                  })
                  .select()
                  .single();

                if (error) throw error;

                toast({ title: 'Booking berhasil dibuat!', description: `Kode booking: ${bookingCode}` });
                setBookingData(booking);
              } catch (err) {
                toast({
                  title: 'Gagal membuat booking',
                  description: err instanceof Error ? err.message : 'Terjadi kesalahan',
                  variant: 'destructive',
                });
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
            className="w-full mb-2"
            size="lg"
          >
            {submitting ? 'Memproses...' : 'Selesaikan Booking'}
          </Button>

          <Button onClick={() => goToStep('confirm')} variant="outline" className="w-full" size="lg">
            Kembali
          </Button>
        </div>
      </Layout>
    );
  }

  // ===== STEP 9: TICKET =====
  if (currentStep === 'ticket' && session.booking) {
    return (
      <Layout>
        {renderProgressBar()}

        <div className="container mx-auto px-4 py-6 max-w-2xl pb-40">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-green-600">✅ Booking Berhasil!</h2>
            <p className="text-muted-foreground">Tiket perjalanan Anda telah siap</p>
          </div>

          {/* Ticket Card */}
          <Card className="mb-6 border-2 border-primary">
            <CardContent className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-primary mb-2">🎫 TIKET SHUTTLE</h2>
                <p className="text-lg font-mono font-bold">{session.booking.booking_code}</p>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 border-4 border-primary rounded" />
                </div>
              )}

              {/* Route Info */}
              <div className="space-y-2 text-sm">
                <h3 className="font-bold text-base">🚌 Informasi Perjalanan</h3>
                <p><strong>Rute:</strong> {session.selectedRoute?.origin} → {session.selectedRoute?.destination}</p>
                <p><strong>Kendaraan:</strong> {session.selectedCar?.name || session.selectedSchedule?.vehicle?.name}</p>
                <p><strong>Tanggal:</strong> {new Date(session.selectedSchedule!.departure_time).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Waktu Berangkat:</strong> {new Date(session.selectedSchedule!.departure_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
              </div>

              {/* Passenger Info */}
              <div className="space-y-2 text-sm border-t pt-4">
                <h3 className="font-bold text-base">👤 Data Penumpang</h3>
                <p><strong>Nama:</strong> {session.booking.passenger_name}</p>
                <p><strong>Telepon:</strong> {session.booking.passenger_phone}</p>
              </div>

              {/* Seats */}
              <div className="space-y-2 text-sm border-t pt-4">
                <h3 className="font-bold text-base">🪑 Kursi</h3>
                <div className="flex gap-2 flex-wrap">
                  {session.booking.seats.map((seat, idx) => (
                    <Badge key={idx} className="text-base py-1">{seat}</Badge>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 text-sm border-t pt-4 bg-muted p-3 rounded">
                <div className="flex justify-between font-bold text-base">
                  <span>💰 Total Harga</span>
                  <span className="text-primary">{formatCurrency(session.booking.total_price)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(session.booking!.booking_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              variant="outline"
              className="w-full"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Kode Disalin' : 'Salin Kode Booking'}
            </Button>

            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Tiket
            </Button>

            <Button
              onClick={() => {
                resetBooking();
                navigate('/');
              }}
              variant="ghost"
              className="w-full"
            >
              Kembali ke Beranda
            </Button>
          </div>

          {/* Terms */}
          <div className="mt-6 p-4 bg-muted/50 rounded text-xs text-muted-foreground space-y-1">
            <p>⚠️ <strong>Catatan Penting:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Datang 15 menit sebelum jadwal keberangkatan</li>
              <li>Bawa identitas asli pada saat boarding</li>
              <li>QR Code ini berlaku sebagai bukti pembayaran</li>
              <li>Tidak dapat dipindahkan ke orang lain</li>
            </ul>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default ShuttleBooking;
