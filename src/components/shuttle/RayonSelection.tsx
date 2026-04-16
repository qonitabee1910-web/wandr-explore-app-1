import React from 'react';
import { useShuttle } from '../../context/ShuttleContext';
import { shuttleRayons } from '../../data/shuttleModule';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const RayonSelection: React.FC = () => {
  const { setRayon } = useShuttle();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <h2 className="text-xl font-bold">Pilih Rayon Tujuan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuttleRayons.map((rayon) => (
          <Card 
            key={rayon.id} 
            className="cursor-pointer hover:border-primary transition-all border-2"
            onClick={() => setRayon(rayon)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{rayon.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Tujuan <ArrowRight className="w-3 h-3" /> {rayon.destination}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Tersedia</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};
