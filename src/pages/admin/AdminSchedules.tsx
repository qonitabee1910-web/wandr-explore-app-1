import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Calendar, Clock, MapPin, Bus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/data/dummyData";

interface Schedule {
  id: string;
  route_id: string;
  vehicle_id: string;
  departure_time: string;
  arrival_time: string;
  price_regular: number;
  price_executive: number;
  price_vip: number;
  available_seats: number;
  is_active: boolean;
  route?: { name: string; origin: string; destination: string };
  vehicle?: { name: string };
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
}

interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  layout: any;
}

const blank: Partial<Schedule> = {
  route_id: "",
  vehicle_id: "",
  departure_time: "",
  arrival_time: "",
  price_regular: 80000,
  price_executive: 120000,
  price_vip: 180000,
  available_seats: 0,
  is_active: true,
};

export default function AdminSchedules() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Schedule> | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes, vRes] = await Promise.all([
        supabase.from("shuttle_schedules").select("*, route:shuttle_routes(name, origin, destination), vehicle:vehicles(name)").order("departure_time", { ascending: true }),
        supabase.from("shuttle_routes").select("*").eq("is_active", true),
        supabase.from("vehicles").select("*").eq("is_active", true)
      ]);

      if (sRes.data) setSchedules(sRes.data as Schedule[]);
      if (rRes.data) setRoutes(rRes.data as Route[]);
      if (vRes.data) setVehicles(vRes.data as Vehicle[]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const save = async () => {
    if (!editing?.route_id || !editing?.vehicle_id || !editing?.departure_time || !editing?.arrival_time) {
      toast({ title: "Mohon lengkapi data wajib", variant: "destructive" });
      return;
    }

    const payload = {
      route_id: editing.route_id,
      vehicle_id: editing.vehicle_id,
      departure_time: editing.departure_time,
      arrival_time: editing.arrival_time,
      price_regular: Number(editing.price_regular),
      price_executive: Number(editing.price_executive),
      price_vip: Number(editing.price_vip),
      available_seats: Number(editing.available_seats),
      is_active: editing.is_active ?? true,
    };

    const { error } = editing.id
      ? await supabase.from("shuttle_schedules").update(payload).eq("id", editing.id)
      : await supabase.from("shuttle_schedules").insert(payload);

    if (error) return toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    
    toast({ title: "Jadwal berhasil disimpan" });
    setEditing(null);
    loadData();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    const { error } = await supabase.from("shuttle_schedules").delete().eq("id", id);
    if (error) return toast({ title: "Gagal menghapus", variant: "destructive" });
    loadData();
  };

  const handleVehicleChange = (vId: string) => {
    const v = vehicles.find(veh => veh.id === vId);
    if (v && editing) {
      const seatCount = Array.isArray(v.layout) ? v.layout.length : 0;
      setEditing({ ...editing, vehicle_id: vId, available_seats: seatCount });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shuttle Schedules</h1>
          <p className="text-sm text-muted-foreground">{schedules.length} jadwal terdaftar</p>
        </div>
        <Button onClick={() => setEditing({ ...blank })}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Jadwal
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Kendaraan</TableHead>
                <TableHead>Harga (Reg/Exe/VIP)</TableHead>
                <TableHead>Kursi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : schedules.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Belum ada jadwal</TableCell></TableRow>
              ) : schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(s.departure_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-muted-foreground">{new Date(s.departure_time).toLocaleDateString('id-ID')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{s.route?.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{s.route?.origin} → {s.route?.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Bus className="w-3.5 h-3.5 text-muted-foreground" />
                      {s.vehicle?.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="outline" className="text-[10px] h-4">R: {formatCurrency(s.price_regular)}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4">E: {formatCurrency(s.price_executive)}</Badge>
                      <Badge variant="outline" className="text-[10px] h-4">V: {formatCurrency(s.price_vip)}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.available_seats > 0 ? "secondary" : "destructive"}>
                      {s.available_seats} Kursi
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? "default" : "secondary"}>
                      {s.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Jadwal" : "Jadwal Baru"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label>Pilih Rute</Label>
                  <Select value={editing.route_id} onValueChange={(v) => setEditing({ ...editing, route_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rute..." />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} ({r.origin} → {r.destination})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pilih Kendaraan</Label>
                  <Select value={editing.vehicle_id} onValueChange={handleVehicleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kendaraan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name} ({Array.isArray(v.layout) ? v.layout.length : 0} kursi)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Waktu Berangkat</Label>
                  <Input type="datetime-local" value={editing.departure_time?.slice(0, 16) || ""} onChange={(e) => setEditing({ ...editing, departure_time: e.target.value })} />
                </div>
                <div>
                  <Label>Waktu Tiba (Estimasi)</Label>
                  <Input type="datetime-local" value={editing.arrival_time?.slice(0, 16) || ""} onChange={(e) => setEditing({ ...editing, arrival_time: e.target.value })} />
                </div>
                <div>
                  <Label>Kapasitas Kursi</Label>
                  <Input type="number" value={editing.available_seats || 0} onChange={(e) => setEditing({ ...editing, available_seats: Number(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                  <p className="text-xs font-bold uppercase text-muted-foreground">Harga Layanan</p>
                  <div>
                    <Label className="text-xs">Regular</Label>
                    <Input type="number" value={editing.price_regular || 0} onChange={(e) => setEditing({ ...editing, price_regular: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Executive</Label>
                    <Input type="number" value={editing.price_executive || 0} onChange={(e) => setEditing({ ...editing, price_executive: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">VIP</Label>
                    <Input type="number" value={editing.price_vip || 0} onChange={(e) => setEditing({ ...editing, price_vip: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label>Status Aktif</Label>
                  <Input type="checkbox" className="w-4 h-4" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save}>Simpan Jadwal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
