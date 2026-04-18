import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/data/dummyData";
import { MapPin, Clock, Navigation, DollarSign, Plus, Edit2, Trash2, BarChart, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RayonZone, PickupPoint } from "@/types/shuttle-booking";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const AdminRayonManagement = () => {
  const [selectedRayonId, setSelectedRayonId] = useState<string | null>(null);
  const [rayonZones, setRayonZones] = useState<RayonZone[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [revenueStats, setRevenueStats] = useState<any[]>([]);
  
  // CRUD State
  const [isRayonDialogOpen, setIsRayonDialogOpen] = useState(false);
  const [isPointDialogOpen, setIsPointDialogOpen] = useState(false);
  const [isFareDialogOpen, setIsFareDialogOpen] = useState(false);
  const [editingRayon, setEditingRayon] = useState<RayonZone | null>(null);
  const [editingPoint, setEditingPoint] = useState<PickupPoint | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: zones, error: zonesError } = await supabase
        .from('rayon_zones')
        .select('*')
        .order('name');
      
      if (zonesError) throw zonesError;
      setRayonZones((zones as RayonZone[]) || []);
      
      if (zones && zones.length > 0 && !selectedRayonId) {
        setSelectedRayonId(zones[0].id);
      }

      const { data: points, error: pointsError } = await supabase
        .from('pickup_points')
        .select('*')
        .order('time_wib');
      
      if (pointsError) throw pointsError;
      setPickupPoints((points as PickupPoint[]) || []);
      
      // Fetch real revenue stats from bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('shuttle_bookings')
        .select('total_price, rayon_id');
      
      if (bookingsError) throw bookingsError;

      const stats = (zones || []).map((z, i) => {
        const rayonBookings = (bookings || []).filter(b => b.rayon_id === z.id);
        return {
          name: z.name,
          id: z.id,
          bookings: rayonBookings.length,
          revenue: rayonBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
          color: COLORS[i % COLORS.length]
        };
      });
      
      setRevenueStats(stats);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to fetch data from database.", variant: "destructive" });
    }
  };

  const handleSaveRayon = async (formData: any) => {
    try {
      if (editingRayon?.id) {
        const { error } = await supabase
          .from('rayon_zones')
          .update(formData)
          .eq('id', editingRayon.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rayon_zones')
          .insert([formData]);
        if (error) throw error;
      }
      
      toast({ title: editingRayon?.id ? "Rayon updated" : "Rayon created", description: "Changes saved to database." });
      setIsRayonDialogOpen(false);
      setEditingRayon(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSavePoint = async (formData: any) => {
    try {
      if (editingPoint?.id) {
        const { error } = await supabase
          .from('pickup_points')
          .update(formData)
          .eq('id', editingPoint.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pickup_points')
          .insert([{ ...formData, rayon_id: selectedRayonId }]);
        if (error) throw error;
      }
      
      toast({ title: editingPoint?.id ? "Point updated" : "Point created", description: "Changes saved to database." });
      setIsPointDialogOpen(false);
      setEditingPoint(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeletePoint = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pickup point?")) return;
    try {
      const { error } = await supabase.from('pickup_points').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Pickup point removed successfully." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteRayon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Rayon? All associated pickup points will also be removed if there is no restriction.")) return;
    try {
      const { error } = await supabase.from('rayon_zones').delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Deleted", description: "Rayon zone removed successfully." });
      if (selectedRayonId === id) setSelectedRayonId(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveFare = async (formData: any) => {
    try {
      const { error } = await supabase
        .from('rayon_zones')
        .update(formData)
        .eq('id', selectedRayonId);
      
      if (error) throw error;
      
      toast({ title: "Pricing updated", description: "Pricing rules have been updated globally." });
      setIsFareDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const currentRayon = rayonZones.find(r => r.id === selectedRayonId);
  const currentPoints = pickupPoints.filter(p => p.rayon_id === selectedRayonId);

  const totalRevenue = revenueStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalBookings = revenueStats.reduce((sum, s) => sum + s.bookings, 0);

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-6 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rayon & Route Management</h1>
            <p className="text-sm opacity-80">Manage pickup points, distances, and fare calculations</p>
          </div>
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => {
            setEditingRayon(null);
            setIsRayonDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add New Rayon
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="management" className="space-y-6">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="management" className="data-[state=active]:bg-background">Route Mapping</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-background">Revenue Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar - Rayon Selection */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Rayon Zones</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="flex flex-col gap-1">
                      {rayonZones.map(r => (
                        <div
                          key={r.id}
                          className={`group relative flex items-center w-full rounded-lg transition-all ${
                            selectedRayonId === r.id 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <button
                            onClick={() => setSelectedRayonId(r.id)}
                            className="flex-1 text-left px-4 py-3 text-sm font-semibold"
                          >
                            <div className="flex items-center justify-between">
                              <span>{r.name}</span>
                              <Navigation className={`w-3 h-3 ${selectedRayonId === r.id ? "opacity-100" : "opacity-0"}`} />
                            </div>
                          </button>
                          
                          <div className={`flex gap-1 pr-2 ${selectedRayonId === r.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-7 w-7 ${selectedRayonId === r.id ? "text-primary-foreground hover:bg-white/20" : "text-muted-foreground hover:text-primary"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRayon(r);
                                setIsRayonDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-7 w-7 ${selectedRayonId === r.id ? "text-primary-foreground hover:bg-white/20" : "text-muted-foreground hover:text-destructive"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRayon(r.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Fare Rules Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" /> Fare Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentRayon && (
                      <>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">REGULAR</p>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-foreground">{formatCurrency(currentRayon.base_fare_regular)}</span>
                            <span className="text-[10px] text-muted-foreground">Base Fare</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-sm font-bold text-primary">{formatCurrency(currentRayon.price_per_km_regular)}</span>
                            <span className="text-[10px] text-muted-foreground">Per KM</span>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">EXECUTIVE</p>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-foreground">{formatCurrency(currentRayon.base_fare_executive)}</span>
                            <span className="text-[10px] text-muted-foreground">Base Fare</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-sm font-bold text-primary">{formatCurrency(currentRayon.price_per_km_executive)}</span>
                            <span className="text-[10px] text-muted-foreground">Per KM</span>
                          </div>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg border border-border">
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">VIP</p>
                          <div className="flex justify-between items-baseline">
                            <span className="text-sm font-bold text-foreground">{formatCurrency(currentRayon.base_fare_vip)}</span>
                            <span className="text-[10px] text-muted-foreground">Base Fare</span>
                          </div>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-sm font-bold text-primary">{formatCurrency(currentRayon.price_per_km_vip)}</span>
                            <span className="text-[10px] text-muted-foreground">Per KM</span>
                          </div>
                        </div>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsFareDialogOpen(true)}>
                      <Edit2 className="w-3 h-3 mr-1" /> Edit Pricing
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content - Pickup Points Table */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="border-none shadow-xl">
                  <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div>
                      <CardTitle className="text-xl">Pickup Points: {currentRayon?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Total {currentPoints.length} points in this route</p>
                    </div>
                    <Button size="sm" onClick={() => setIsPointDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" /> Add Point
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="w-[80px]">Order</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Time (WIB)</TableHead>
                          <TableHead>Dist (Mtr)</TableHead>
                          <TableHead>Total to KNO</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPoints.map((p, idx) => {
                          return (
                            <TableRow key={p.id} className="hover:bg-muted/20">
                              <TableCell className="font-mono text-xs font-bold text-muted-foreground">J{idx + 1}</TableCell>
                              <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-primary" />
                                  {p.place_name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  {p.time_wib}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{p.cumulative_distance_mtr || 0} m</TableCell>
                              <TableCell className="font-bold text-primary">{p.jarak_ke_kno} km</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    onClick={() => {
                                      setEditingPoint(p);
                                      setIsPointDialogOpen(true);
                                    }}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeletePoint(p.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Summary Statistics Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Route Points</p>
                      <h3 className="text-2xl font-black text-primary">
                        {currentPoints.length} Locations
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-6">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Base Price (Reg)</p>
                      <h3 className="text-2xl font-black text-purple-600">
                        {formatCurrency(currentRayon?.base_fare_regular || 0)}
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-6">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Price / KM (Reg)</p>
                      <h3 className="text-2xl font-black text-amber-600">
                        {formatCurrency(currentRayon?.price_per_km_regular || 0)}
                      </h3>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rayon Revenue</p>
                      <p className="text-2xl font-black">{formatCurrency(totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BarChart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-black">{totalBookings} Trips</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Ticket Price</p>
                      <p className="text-2xl font-black">{formatCurrency(totalRevenue / (totalBookings || 1))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg">Revenue by Rayon</CardTitle>
                </CardHeader>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={revenueStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `Rp ${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                      />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                        {revenueStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Breakdown Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rayon Zone</TableHead>
                        <TableHead className="text-center">Bookings</TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                        <TableHead className="text-right">% Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueStats.map((s) => (
                        <TableRow key={s.name}>
                          <TableCell className="font-bold">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                              {s.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{s.bookings}</TableCell>
                          <TableCell className="text-right font-black">{formatCurrency(s.revenue)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {((s.revenue / totalRevenue) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs for CRUD */}
        <Dialog open={isRayonDialogOpen} onOpenChange={setIsRayonDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRayon ? 'Edit Rayon' : 'Add New Rayon'}</DialogTitle>
              <DialogDescription>Configure base settings for this zone.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveRayon({
                name: formData.get('name'),
                base_fare_regular: Number(formData.get('base_fare_regular')),
                price_per_km_regular: Number(formData.get('price_per_km_regular')),
                base_fare_executive: Number(formData.get('base_fare_executive')),
                price_per_km_executive: Number(formData.get('price_per_km_executive')),
                base_fare_vip: Number(formData.get('base_fare_vip')),
                price_per_km_vip: Number(formData.get('price_per_km_vip')),
              });
            }}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label>Rayon Name</Label>
                  <Input name="name" placeholder="e.g. RAYON-E" defaultValue={editingRayon?.name} required />
                </div>
                
                {['regular', 'executive', 'vip'].map(tier => (
                  <div key={tier} className="space-y-3 p-4 border rounded-xl bg-muted/30">
                    <p className="text-xs font-black uppercase text-primary">{tier} Tier Pricing</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Base Fare</Label>
                        <Input 
                          name={`base_fare_${tier}`} 
                          type="number" 
                          defaultValue={editingRayon?.[`base_fare_${tier}`] || (tier === 'regular' ? 80000 : tier === 'executive' ? 120000 : 180000)} 
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Price per KM</Label>
                        <Input 
                          name={`price_per_km_${tier}`} 
                          type="number" 
                          defaultValue={editingRayon?.[`price_per_km_${tier}`] || (tier === 'regular' ? 1500 : tier === 'executive' ? 2500 : 4000)} 
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRayonDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Rayon</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isPointDialogOpen} onOpenChange={setIsPointDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPoint ? 'Edit Pickup Point' : 'Add Pickup Point'}</DialogTitle>
              <DialogDescription>
                Fare is calculated automatically: (Base + (Dist * Price/Km)) * Seats.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSavePoint({
                place_name: formData.get('place_name'),
                time_wib: formData.get('time_wib'),
                jarak_ke_kno: Number(formData.get('jarak_ke_kno')),
                latitude: Number(formData.get('latitude')),
                longitude: Number(formData.get('longitude')),
              });
            }}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Location Name</Label>
                  <Input name="place_name" placeholder="Hotel Name / Landmark" defaultValue={editingPoint?.place_name} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Time (WIB)</Label>
                    <Input name="time_wib" type="time" defaultValue={editingPoint?.time_wib || "06:00"} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Distance to KNO (KM)</Label>
                    <Input name="jarak_ke_kno" type="number" step="0.1" placeholder="e.g. 25.5" defaultValue={editingPoint?.jarak_ke_kno} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input name="latitude" type="number" step="0.000001" defaultValue={editingPoint?.latitude} />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input name="longitude" type="number" step="0.000001" defaultValue={editingPoint?.longitude} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPointDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Point</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFareDialogOpen} onOpenChange={setIsFareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pricing Rules: {currentRayon?.name}</DialogTitle>
              <DialogDescription>Update pricing constants for all tiers in this rayon.</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveFare({
                base_fare_regular: Number(formData.get('base_fare_regular')),
                price_per_km_regular: Number(formData.get('price_per_km_regular')),
                base_fare_executive: Number(formData.get('base_fare_executive')),
                price_per_km_executive: Number(formData.get('price_per_km_executive')),
                base_fare_vip: Number(formData.get('base_fare_vip')),
                price_per_km_vip: Number(formData.get('price_per_km_vip')),
              });
            }}>
              <div className="space-y-6 py-4">
                {['regular', 'executive', 'vip'].map(tier => (
                  <div key={tier} className="space-y-3 p-4 border rounded-xl bg-muted/30">
                    <p className="text-sm font-black uppercase text-primary">{tier}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Base Fare</Label>
                        <Input 
                          name={`base_fare_${tier}`} 
                          type="number" 
                          defaultValue={currentRayon?.[`base_fare_${tier}`]} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Price per KM</Label>
                        <Input 
                          name={`price_per_km_${tier}`} 
                          type="number" 
                          defaultValue={currentRayon?.[`price_per_km_${tier}`]} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFareDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update All Tiers</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminRayonManagement;
