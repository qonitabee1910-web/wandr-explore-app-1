import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, RotateCcw, Code, Save, Trash2, Copy, Cloud } from "lucide-react";
import Layout from "@/components/Layout";
import SeatEditor from "@/components/shuttle/SeatEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_HIACE_SEATS,
  exportSeatsToCode,
  getStoredSeats,
  saveSeatsToStorage,
  clearSeatsStorage,
  type Seat,
  type SeatStatus,
} from "@/data/seatLayout";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/context/UserAuthContext";

const SeatLayoutEditor = () => {
  const { toast } = useToast();
  const { isAdmin } = useUserAuth();
  const [params] = useSearchParams();
  const vehicleId = params.get("vehicle");

  const [seats, setSeats] = useState<Seat[]>(() => getStoredSeats());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [vehicleName, setVehicleName] = useState<string>("");
  const [savingDb, setSavingDb] = useState(false);

  // Load vehicle layout from DB when ?vehicle=ID is present
  useEffect(() => {
    if (!vehicleId) return;
    (async () => {
      const { data } = await supabase
        .from("vehicles")
        .select("name, layout")
        .eq("id", vehicleId)
        .maybeSingle();
      if (data) {
        setVehicleName(data.name);
        const layout = Array.isArray(data.layout) ? (data.layout as unknown as Seat[]) : [];
        if (layout.length > 0) setSeats(layout);
      }
    })();
  }, [vehicleId]);

  const selected = useMemo(
    () => seats.find((s) => s.id === selectedId) ?? null,
    [seats, selectedId],
  );

  const handleMove = (id: string, x: number, y: number) => {
    setSeats((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  };

  const handleAdd = () => {
    let n = seats.length + 1;
    let newId = `S${n}`;
    while (seats.some((s) => s.id === newId)) {
      n += 1;
      newId = `S${n}`;
    }
    const newSeat: Seat = { id: newId, label: newId, x: 50, y: 50, status: "available" };
    setSeats((prev) => [...prev, newSeat]);
    setSelectedId(newId);
  };

  const handleReset = () => {
    if (!confirm("Reset ke layout default? Perubahan lokal akan hilang.")) return;
    if (vehicleId) {
      setSeats([]);
    } else {
      clearSeatsStorage();
      setSeats(DEFAULT_HIACE_SEATS);
    }
    setSelectedId(null);
    toast({ title: "Layout direset" });
  };

  const handleSave = () => {
    saveSeatsToStorage(seats);
    toast({ title: "Tersimpan lokal", description: "Layout disimpan di browser." });
  };

  const handleSaveToDb = async () => {
    if (!vehicleId) return;
    setSavingDb(true);
    const { error } = await supabase
      .from("vehicles")
      .update({ layout: seats as any })
      .eq("id", vehicleId);
    setSavingDb(false);
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tersimpan ke database", description: vehicleName });
  };

  const handleDelete = () => {
    if (!selected) return;
    setSeats((prev) => prev.filter((s) => s.id !== selected.id));
    setSelectedId(null);
  };

  const updateSelected = (patch: Partial<Seat>) => {
    if (!selected) return;
    setSeats((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
  };

  const exportedCode = useMemo(() => exportSeatsToCode(seats), [seats]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(exportedCode);
      toast({ title: "Tersalin" });
    } catch {
      toast({ title: "Gagal menyalin", variant: "destructive" });
    }
  };

  const backLink = isAdmin ? "/admin/vehicles" : "/shuttle";

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20 shadow-md">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to={backLink} aria-label="Kembali">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">Editor Layout Kursi</h1>
            {vehicleName && <p className="text-xs opacity-90 truncate">{vehicleName}</p>}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 max-w-xl pb-40">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> Tambah
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowExport(true)}>
            <Code className="w-4 h-4" /> Export
          </Button>
        </div>

        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-center text-muted-foreground mb-3">
              Tahan & geser kursi untuk mengatur posisi
            </p>
            <SeatEditor
              seats={seats}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onMove={handleMove}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {!selected ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Pilih kursi untuk mengedit
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-semibold">
                  Edit kursi: <span className="text-primary">{selected.label}</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="seat-id" className="text-xs">ID</Label>
                    <Input
                      id="seat-id"
                      value={selected.id}
                      onChange={(e) => {
                        const newId = e.target.value;
                        if (!newId || seats.some((s) => s.id === newId && s.id !== selected.id)) return;
                        setSeats((prev) => prev.map((s) => (s.id === selected.id ? { ...s, id: newId } : s)));
                        setSelectedId(newId);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seat-label" className="text-xs">Label</Label>
                    <Input
                      id="seat-label"
                      value={selected.label}
                      onChange={(e) => updateSelected({ label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seat-x" className="text-xs">X (%)</Label>
                    <Input id="seat-x" type="number" step="0.1" min="0" max="100" value={selected.x}
                      onChange={(e) => updateSelected({ x: Math.max(0, Math.min(100, Number(e.target.value))) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seat-y" className="text-xs">Y (%)</Label>
                    <Input id="seat-y" type="number" step="0.1" min="0" max="100" value={selected.y}
                      onChange={(e) => updateSelected({ y: Math.max(0, Math.min(100, Number(e.target.value))) })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Status</Label>
                  <div className="flex gap-2 mt-1">
                    {(["available", "occupied"] as SeatStatus[]).map((st) => (
                      <Button key={st} type="button" size="sm"
                        variant={selected.status === st ? "default" : "outline"}
                        onClick={() => updateSelected({ status: st })}
                      >
                        {st === "available" ? "Tersedia" : "Terisi"}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full">
                  <Trash2 className="w-4 h-4" /> Hapus Kursi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-background border-t shadow-lg">
        <div className="container mx-auto px-4 py-3 max-w-xl flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{seats.length} kursi</p>
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outline" size="lg">
              <Save className="w-4 h-4" /> Lokal
            </Button>
            {vehicleId && (
              <Button onClick={handleSaveToDb} size="lg" disabled={savingDb}>
                <Cloud className="w-4 h-4" /> {savingDb ? "..." : "Database"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Layout</DialogTitle>
            <DialogDescription>
              Salin kode di bawah dan tempel ke <code className="text-xs">src/data/seatLayout.ts</code>.
            </DialogDescription>
          </DialogHeader>
          <Textarea readOnly value={exportedCode} className="font-mono text-xs h-64" />
          <Button onClick={copyCode} className="w-full">
            <Copy className="w-4 h-4" /> Salin ke Clipboard
          </Button>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SeatLayoutEditor;
