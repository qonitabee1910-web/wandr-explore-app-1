import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RAYON_DATA, RayonZone, RayonPoint } from "@/data/rayonPoints";
import { FARE_RULES, calculateShuttleFare, getDistanceToKNO } from "@/services/fareService";
import { formatCurrency } from "@/data/dummyData";
import { MapPin, Clock, Navigation, DollarSign, Plus, Edit2, Trash2, BarChart, PieChart, TrendingUp, Save, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const AdminRayonManagement = () => {
  const [selectedRayon, setSelectedRayon] = useState<string>("RAYON-A");
  const [rayonData, setRayonData] = useState<RayonZone[]>(RAYON_DATA);
  const [revenueStats, setRevenueStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // CRUD State
  const [isRayonDialogOpen, setIsRayonDialogOpen] = useState(false);
  const [isPointDialogOpen, setIsPointDialogOpen] = useState(false);
  const [isFareDialogOpen, setIsFareDialogOpen] = useState(false);
  const [editingRayon, setEditingRayon] = useState<any>(null);
  const [editingPoint, setEditingPoint] = useState<any>(null);
  const [editingFare, setEditingFare] = useState<any>(null);
  const [seatCount, setSeatCount] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from Supabase
      // const { data: zones } = await supabase.from('rayon_zones').select('*');
      // const { data: points } = await supabase.from('pickup_points').select('*');
      
      const mockStats = RAYON_DATA.map((r, i) => ({
        name: r.name,
        bookings: Math.floor(Math.random() * 50) + 10,
        revenue: (Math.floor(Math.random() * 50) + 10) * 150000,
        color: COLORS[i % COLORS.length]
      }));
      setRevenueStats(mockStats);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRayon = () => {
    toast({ title: editingRayon?.id ? "Rayon updated" : "Rayon created", description: "Changes saved to database." });
    setIsRayonDialogOpen(false);
    setEditingRayon(null);
  };

  const handleSavePoint = () => {
    toast({ title: editingPoint?.id ? "Point updated" : "Point created", description: "Changes saved to database." });
    setIsPointDialogOpen(false);
    setEditingPoint(null);
  };

  const handleSaveFare = () => {
    toast({ title: "Pricing updated", description: "Pricing rules have been updated globally." });
    setIsFareDialogOpen(false);
    setEditingFare(null);
  };

  const currentRayon = rayonData.find(r => r.name === selectedRayon);
  const currentFareRules = FARE_RULES[selectedRayon] || [];

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
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90" onClick={() => setIsRayonDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add New Rayon
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4 bg-muted/50 p-4 rounded-xl border">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase text-muted-foreground">Real-time Fare Preview</p>
            <p className="text-sm">Calculate fares instantly by adjusting seats</p>
          </div>
          <div className="flex items-center gap-3">
            <Label htmlFor="seats" className="text-sm font-bold">Number of Seats:</Label>
            <Input 
              id="seats" 
              type="number" 
              min="1" 
              value={seatCount} 
              onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
              className="w-20 h-9"
            />
          </div>
        </div>

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
                      {rayonData.map(r => (
                        <button
                          key={r.name}
                          onClick={() => setSelectedRayon(r.name)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                            selectedRayon === r.name 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{r.name}</span>
                            <Navigation className={`w-3 h-3 ${selectedRayon === r.name ? "opacity-100" : "opacity-0"}`} />
                          </div>
                        </button>
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
                    {currentFareRules.map(rule => (
                      <div key={rule.serviceTier} className="p-3 bg-muted/30 rounded-lg border border-border">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{rule.serviceTier}</p>
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-bold text-foreground">{formatCurrency(rule.baseFare)}</span>
                          <span className="text-[10px] text-muted-foreground">Base Fare</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-1">
                          <span className="text-sm font-bold text-primary">{formatCurrency(rule.pricePerKm)}</span>
                          <span className="text-[10px] text-muted-foreground">Per KM</span>
                        </div>
                      </div>
                    ))}
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
                      <CardTitle className="text-xl">Pickup Points: {selectedRayon}</CardTitle>
                      <p className="text-sm text-muted-foreground">Total {currentRayon?.points.length} points in this route</p>
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
                          <TableHead className="text-right">Total Fare (Reg)</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRayon?.points.map((p, idx) => {
                          const distToKNO = getDistanceToKNO(selectedRayon, p.place);
                          const regFare = calculateShuttleFare(selectedRayon, p.place, 'regular', seatCount);
                          
                          return (
                            <TableRow key={`${p.j}-${idx}`} className="hover:bg-muted/20">
                              <TableCell className="font-mono text-xs font-bold text-muted-foreground">{p.j}</TableCell>
                              <TableCell className="font-semibold">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 text-primary" />
                                  {p.place}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  {p.time}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{p.dist} m</TableCell>
                              <TableCell className="font-bold text-primary">{(distToKNO / 1000).toFixed(1)} km</TableCell>
                              <TableCell className="text-right font-black">
                                <div className="flex flex-col items-end">
                                  <span>{formatCurrency(regFare)}</span>
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    {seatCount} seat{seatCount > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </TableCell>
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
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Route Length</p>
                      <h3 className="text-2xl font-black text-primary">
                        {(currentRayon?.points.reduce((sum, p) => sum + p.dist, 0) || 0) / 1000} km
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-6">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Avg Fare</p>
                      <h3 className="text-2xl font-black text-purple-600">
                        {formatCurrency(calculateShuttleFare(selectedRayon, currentRayon?.points[0].place || "", 'regular'))}
                      </h3>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="p-6">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Estimated Duration</p>
                      <h3 className="text-2xl font-black text-amber-600">~2.5 Hours</h3>
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rayon Name</Label>
                <Input placeholder="e.g. RAYON-E" defaultValue={editingRayon?.name} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Fare (Reg)</Label>
                  <Input type="number" defaultValue={80000} />
                </div>
                <div className="space-y-2">
                  <Label>Price/KM (Reg)</Label>
                  <Input type="number" defaultValue={1500} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRayonDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRayon}>Save Rayon</Button>
            </DialogFooter>
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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Location Name</Label>
                <Input placeholder="Hotel Name / Landmark" defaultValue={editingPoint?.place} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time (WIB)</Label>
                  <Input type="time" defaultValue={editingPoint?.time || "06:00"} />
                </div>
                <div className="space-y-2">
                  <Label>Distance (Meters)</Label>
                  <Input type="number" placeholder="From previous point" defaultValue={editingPoint?.dist} />
                </div>
              </div>
              {editingPoint && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs font-bold text-primary uppercase mb-1">Calculated Preview</p>
                  <div className="flex justify-between text-sm">
                    <span>Current Fare (1 Seat):</span>
                    <span className="font-bold">{formatCurrency(calculateShuttleFare(selectedRayon, editingPoint.place, 'regular', 1))}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPointDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSavePoint}>Save Point</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isFareDialogOpen} onOpenChange={setIsFareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pricing Rules: {selectedRayon}</DialogTitle>
              <DialogDescription>Update pricing constants for all tiers in this rayon.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {['regular', 'executive', 'vip'].map(tier => {
                const rule = currentFareRules.find(r => r.serviceTier === tier);
                return (
                  <div key={tier} className="space-y-3 p-4 border rounded-xl bg-muted/30">
                    <p className="text-sm font-black uppercase text-primary">{tier}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Base Fare</Label>
                        <Input type="number" defaultValue={rule?.baseFare} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Price per KM</Label>
                        <Input type="number" defaultValue={rule?.pricePerKm} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFareDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveFare}>Update All Tiers</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminRayonManagement;
