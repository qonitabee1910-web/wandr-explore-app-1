import { ReactNode } from "react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main className="flex-1 pb-20 md:pb-0">{children}</main>
    <Footer />
    <BottomNav />
  </div>
);

export default Layout;
