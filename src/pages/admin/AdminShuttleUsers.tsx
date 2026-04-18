import { useEffect, useState } from 'react';
import { MoreVertical, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { ShuttleBooking } from '@/types/shuttle-booking';
import { formatCurrency } from '@/data/dummyData';
import { useToast } from '@/hooks/use-toast';

const AdminShuttleUsers = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ShuttleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<ShuttleBooking | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load all bookings
  useEffect(() => {
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
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings((data ?? []) as ShuttleBooking[]);
      } catch (err) {
        console.error('Error loading bookings:', err);
        toast({
          title: 'Gagal memuat booking',
          description: 'Terjadi kesalahan saat memuat data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger_phone.includes(searchTerm) ||
      booking.passenger_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Update booking status
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shuttle_bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));

      toast({
        title: 'Status diperbarui',
        description: `Booking status berubah menjadi ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: 'Gagal update status',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
        variant: 'destructive',
      });
    }
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shuttle_bookings')
        .update({ payment_status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, payment_status: newStatus } : b
      ));

      toast({
        title: 'Status pembayaran diperbarui',
        description: `Booking payment status berubah menjadi ${newStatus}`,
      });
    } catch (err) {
      toast({
        title: 'Gagal update payment status',
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Shuttle Bookings Management</h2>
        <p className="text-muted-foreground">Manage all user shuttle bookings and payments</p>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="search">Search Bookings</Label>
            <Input
              id="search"
              placeholder="Search by name, booking code, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="status">Filter by Status</Label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-2 w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Total: {filteredBookings.length} bookings</span>
            <span>•</span>
            <span>Revenue: {formatCurrency(filteredBookings.reduce((sum, b) => sum + (b.total_price || 0), 0))}</span>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No bookings found
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Booking Code</th>
                  <th className="px-4 py-3 text-left">Passenger</th>
                  <th className="px-4 py-3 text-left">Route</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold">{booking.booking_code}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{booking.passenger_name}</p>
                        <p className="text-xs text-muted-foreground">{booking.passenger_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">
                        {booking.schedule?.route?.origin} → {booking.schedule?.route?.destination}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold">{formatCurrency(booking.total_price)}</td>
                    <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                    <td className="px-4 py-3">{getPaymentStatusBadge(booking.payment_status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(booking.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right">
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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          >
                            Mark Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="text-destructive"
                          >
                            Cancel Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePaymentStatus(booking.id, 'paid')}
                          >
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePaymentStatus(booking.id, 'refunded')}
                            className="text-destructive"
                          >
                            Mark as Refunded
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Code</p>
                  <p className="font-mono font-bold">{selectedBooking.booking_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedBooking.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <div className="mt-1">{getPaymentStatusBadge(selectedBooking.payment_status)}</div>
                </div>
              </div>

              {/* Route Info */}
              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">Route & Schedule</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Route:</strong> {selectedBooking.schedule?.route?.origin} →{' '}
                    {selectedBooking.schedule?.route?.destination}
                  </p>
                  <p>
                    <strong>Departure:</strong>{' '}
                    {new Date(selectedBooking.schedule!.departure_time).toLocaleString('id-ID')}
                  </p>
                  <p>
                    <strong>Seats:</strong> {selectedBooking.seats.join(', ')}
                  </p>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="border-t pt-4">
                <h4 className="font-bold mb-3">Passenger Info</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Name:</strong> {selectedBooking.passenger_name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedBooking.passenger_phone}
                  </p>
                  {selectedBooking.passenger_email && (
                    <p>
                      <strong>Email:</strong> {selectedBooking.passenger_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <strong>Total Price</strong>
                  <span className="text-xl font-bold text-primary">{formatCurrency(selectedBooking.total_price)}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShuttleUsers;
