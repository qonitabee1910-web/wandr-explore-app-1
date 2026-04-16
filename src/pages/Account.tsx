import { useState } from "react";
import { User, Mail, Lock, History, LogOut } from "lucide-react";
import Layout from "@/components/Layout";
import { bookingHistory } from "@/data/bookingHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingItem } from "@/components/account/BookingItem";

const Account = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tab, setTab] = useState("login");

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Selamat Datang</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Masuk</TabsTrigger>
                  <TabsTrigger value="register">Daftar</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Email" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password" className="pl-10" />
                  </div>
                  <Button className="w-full" onClick={() => setIsLoggedIn(true)}>Masuk</Button>
                </TabsContent>
                <TabsContent value="register" className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Nama Lengkap" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Email" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password" className="pl-10" />
                  </div>
                  <Button className="w-full" onClick={() => setIsLoggedIn(true)}>Daftar</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile */}
        <Card className="mb-6">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              J
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">John Doe</h2>
              <p className="text-sm text-muted-foreground">john.doe@email.com</p>
              <p className="text-xs text-muted-foreground">Member sejak April 2026</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsLoggedIn(false)}>
              <LogOut className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>

        {/* Booking History */}
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Riwayat Booking</h2>
        </div>
        <div className="space-y-3">
          {bookingHistory.map((b) => (
            <BookingItem key={b.id} booking={b} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Account;
