import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MoreVertical, ChevronRight, QrCode, Calendar, DollarSign, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useUserAuth } from '@/context/UserAuthContext';
import { ShuttleBooking } from '@/types/shuttle-booking';
import { formatCurrency } from '@/data/dummyData';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const ShuttleBookingHistory = () => {
  const { user, isAuthenticated } = useUserAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ShuttleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ShuttleBooking | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Load user's bookings
  useEffect(() => {
    if (!user?.id) return;

    const loadBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('shuttle_bookings')
          .select(`
            *,
            schedule:shuttle_schedules (
              *,
              route:shuttle_routes (*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings((data ?? []) as ShuttleBooking[]);
      } catch (err) {
        console.error('Error loading bookings:', err);
        toast({
          title: 'Gagal memuat booking',
          description: 'Terjadi kesalahan saat memuat data booking Anda',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user?.id]);

  // Generate QR code when booking selected
  useEffect(() => {
    if (!selectedBooking) return;

    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          bookingCode: selectedBooking.booking_code,
          passengerName: selectedBooking.passenger_name,
          seats: selectedBooking.seats,
          scheduleId: selectedBooking.schedule_id,
        });
        const qr = await QRCode.toDataURL(qrData, {
          width: 250,
          margin: 2,
          color: { dark: '#000', light: '#fff' },
        });
        setQrCode(qr);
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };
    generateQR();
  }, [selectedBooking]);

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('shuttle_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh bookings
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      setShowDetailDialog(false);

      toast({
        title: 'Booking dibatalkan',
        description: 'Booking Anda telah dibatalkan',
      });
    } catch (err) {
      toast({
        title: 'Gagal membatalkan booking',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      'confirmed': { label: 'Confirmed', variant: 'default' },
      'pending': { label: 'Pending', variant: 'secondary' },
      'cancelled': { label: 'Cancelled', variant: 'destructive' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      'unpaid': { label: 'Unpaid', variant: 'outline' },
      'paid': { label: 'Paid', variant: 'default' },
      'refunded': { label: 'Refunded', variant: 'secondary' },
    };
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to="/" aria-label="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight">Riwayat Booking Shuttle</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl pb-40">
        {/* User Info Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Akun Anda</p>
                <p className="text-xl font-bold">{user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Booking</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'cancelled').length}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{bookings.filter(b => b.payment_status === 'paid').length}</div>
              <p className="text-xs text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(bookings.reduce((sum, b) => sum + (b.total_price || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">Anda belum memiliki booking</p>
                <Link to="/shuttle-booking">
                  <Button>Pesan Tiket Shuttle</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Booking Code & Status */}
                      <div className="flex items-center gap-2 mb-3">
                        <p className="font-mono font-bold text-sm">{booking.booking_code}</p>
                        <div className="flex gap-1">
                          {getStatusBadge(booking.status)}
                          {getPaymentStatusBadge(booking.payment_status)}
                        </div>
                      </div>

                      {/* Route Info */}
                      <div className="mb-2">
                        <p className="font-semibold">
                          {booking.schedule?.route?.origin} → {booking.schedule?.route?.destination}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {booking.schedule?.departure_time
                            ? new Date(booking.schedule.departure_time).toLocaleDateString('id-ID')
                            : 'N/A'}
                        </div>
                      </div>

                      {/* Passenger & Seats */}
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Penumpang:</strong> {booking.passenger_name}</p>
                        <p><strong>Kursi:</strong> {booking.seats.join(', ')}</p>
                      </div>
                    </div>

                    {/* Price & Menu */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold text-primary">{formatCurrency(booking.total_price)}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailDialog(true);
                            }}
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Lihat QR Code
                          </DropdownMenuItem>
                          {booking.status !== 'cancelled' && (
                            <DropdownMenuItem
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-destructive"
                            >
                              Batalkan
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* QR Code */}
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 border-4 border-primary rounded" />
                </div>
              )}

              {/* Booking Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-3 border-b">
                  <strong>Kode Booking</strong>
                  <span className="font-mono">{selectedBooking.booking_code}</span>
                </div>

                <div>
                  <strong>Rute</strong>
                  <p className="text-muted-foreground">
                    {selectedBooking.schedule?.route?.origin} → {selectedBooking.schedule?.route?.destination}
                  </p>
                </div>

                <div>
                  <strong>Tanggal & Waktu</strong>
                  <p className="text-muted-foreground">
                    {selectedBooking.schedule?.departure_time
                      ? new Date(selectedBooking.schedule.departure_time).toLocaleString('id-ID')
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <strong>Penumpang</strong>
                  <p className="text-muted-foreground">{selectedBooking.passenger_name}</p>
                </div>

                <div>
                  <strong>Kursi</strong>
                  <p className="text-muted-foreground">{selectedBooking.seats.join(', ')}</p>
                </div>

                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(selectedBooking.total_price)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Download Tiket
                </Button>
                {selectedBooking.status !== 'cancelled' && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      handleCancelBooking(selectedBooking.id);
                    }}
                  >
                    Batalkan Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ShuttleBookingHistory;
