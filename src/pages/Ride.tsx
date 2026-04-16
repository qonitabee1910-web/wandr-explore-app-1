import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { rides } from "@/data/rides";
import { RideSearch } from "@/components/ride/RideSearch";
import { RideSelection } from "@/components/ride/RideSelection";
import { RideActive } from "@/components/ride/RideActive";
import { RideCompleted } from "@/components/ride/RideCompleted";

const Ride = () => {
  const [pickup, setPickup] = useState("Lokasi Saya (Gedung Sate)");
  const [destination, setDestination] = useState("");
  const [selectedRide, setSelectedRide] = useState(rides[0].id);
  const [step, setStep] = useState<"search" | "estimating" | "finding" | "active" | "completed">("search");
  const [rideType, setRideType] = useState<"instant" | "scheduled">("instant");
  const [status, setStatus] = useState("Driver sedang menuju lokasi...");

  const activeRide = rides.find(r => r.id === selectedRide) || rides[0];

  const handleSearch = () => {
    if (!destination) return;
    setStep("estimating");
    setTimeout(() => setStep("finding"), 1500);
  };

  const handleConfirm = () => {
    setStep("active");
    setTimeout(() => setStatus("Driver sudah sampai!"), 3000);
    setTimeout(() => setStatus("Perjalanan dimulai..."), 6000);
    setTimeout(() => {
      setStatus("Tiba di tujuan");
      setStep("completed");
    }, 10000);
  };

  return (
    <Layout>
      <div className="bg-primary text-primary-foreground py-4 sticky top-0 z-20">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Link to="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">Ride Hailing</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl min-h-[calc(100vh-140px)] flex flex-col">
        {step === "search" && (
          <RideSearch 
            pickup={pickup}
            setPickup={setPickup}
            destination={destination}
            setDestination={setDestination}
            rideType={rideType}
            setRideType={setRideType}
            handleSearch={handleSearch}
          />
        )}

        {step === "estimating" && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground animate-pulse">Menghitung estimasi biaya...</p>
          </div>
        )}

        {step === "finding" && (
          <RideSelection 
            rides={rides}
            pickup={pickup}
            destination={destination}
            selectedRide={selectedRide}
            setSelectedRide={setSelectedRide}
            activeRide={activeRide}
            handleConfirm={handleConfirm}
          />
        )}

        {step === "active" && (
          <RideActive 
            status={status}
            destination={destination}
            onCancel={() => setStep("search")}
          />
        )}

        {step === "completed" && (
          <RideCompleted 
            onFinish={() => setStep("search")}
          />
        )}
      </div>
    </Layout>
  );
};

export default Ride;
