import Layout from "@/components/Layout";
import { promos } from "@/data/promos";
import { Tag } from "lucide-react";
import { PromoCard } from "@/components/promo/PromoCard";

const Promos = () => {
  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6" /> Promo & Diskon
          </h1>
          <p className="text-sm text-primary-foreground/80 mt-1">Temukan penawaran terbaik untuk perjalananmu</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promos.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Promos;
