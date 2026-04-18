import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MapPin, Navigation, Clock, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_km: number | null;
  estimated_duration_mins: number | null;
  is_active: boolean;
  slug: string;
}

const blank: Partial<Route> = {
  name: "",
  origin: "",
  destination: "",
  distance_km: 0,
  estimated_duration_mins: 0,
  is_active: true,
};

export default function AdminRoutes() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Route> | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shuttle_routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      toast({ title: "Gagal memuat rute", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const save = async () => {
    if (!editing?.name || !editing?.origin || !editing?.destination) {
      toast({ title: "Mohon lengkapi data wajib", variant: "destructive" });
      return;
    }

    const slug = editing.name.toLowerCase().replace(/ /g, "-");
    const payload = {
      name: editing.name,
      origin: editing.origin,
      destination: editing.destination,
      distance_km: Number(editing.distance_km),
      estimated_duration_mins: Number(editing.estimated_duration_mins),
      is_active: editing.is_active ?? true,
      slug: slug
    };

    const { error } = editing.id
      ? await supabase.from("shuttle_routes").update(payload).eq("id", editing.id)
      : await supabase.from("shuttle_routes").insert(payload);

    if (error) return toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    
    toast({ title: "Rute berhasil disimpan" });
    setEditing(null);
    loadData();
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus rute ini? Jadwal yang menggunakan rute ini mungkin akan terdampak.")) return;
    const { error } = await supabase.from("shuttle_routes").delete().eq("id", id);
    if (error) return toast({ title: "Gagal menghapus", description: "Pastikan rute tidak sedang digunakan di jadwal aktif.", variant: "destructive" });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shuttle Routes</h1>
          <p className="text-sm text-muted-foreground">{routes.length} rute terdaftar</p>
        </div>
        <Button onClick={() => setEditing({ ...blank })}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Rute
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Rute</TableHead>
                <TableHead>Asal & Tujuan</TableHead>
                <TableHead>Jarak (KM)</TableHead>
                <TableHead>Durasi (Min)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
              ) : routes.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Belum ada rute</TableCell></TableRow>
              ) : routes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3 text-primary" /> {r.origin}</span>
                      <span className="flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-destructive" /> {r.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.distance_km || '-'} km</TableCell>
                  <TableCell>{r.estimated_duration_mins || '-'} min</TableCell>
                  <TableCell>
                    <Badge variant={r.is_active ? "default" : "secondary"}>
                      {r.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(r)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Rute" : "Rute Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Rute</Label>
              <Input placeholder="e.g. Medan - Kualanamu" value={editing?.name || ""} onChange={(e) => setEditing({ ...editing!, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Titik Asal</Label>
                <Input placeholder="e.g. Medan City" value={editing?.origin || ""} onChange={(e) => setEditing({ ...editing!, origin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Titik Tujuan</Label>
                <Input placeholder="e.g. Kualanamu Airport" value={editing?.destination || ""} onChange={(e) => setEditing({ ...editing!, destination: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jarak (KM)</Label>
                <Input type="number" value={editing?.distance_km || 0} onChange={(e) => setEditing({ ...editing!, distance_km: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Estimasi Durasi (Menit)</Label>
                <Input type="number" value={editing?.estimated_duration_mins || 0} onChange={(e) => setEditing({ ...editing!, estimated_duration_mins: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="route-active" checked={editing?.is_active ?? true} onChange={(e) => setEditing({ ...editing!, is_active: e.target.checked })} />
              <Label htmlFor="route-active">Rute Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Batal</Button>
            <Button onClick={save}>Simpan Rute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
