# WANDR-EXPLORE-APP: COMPONENT DEPENDENCY MAP

## Component Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx (Root)                          │
│  - QueryClientProvider (TanStack React Query)                  │
│  - TooltipProvider (Shadcn UI)                                 │
│  - Toaster / Sonner (Toast Notifications)                      │
│  - BrowserRouter (React Router)                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────────┐
                  │   Layout.tsx     │
                  │  (Wrapper)       │
                  └────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    ┌────────────┐   ┌──────────┐    ┌────────────────┐
    │ Navbar.tsx │   │ Content  │    │  BottomNav.tsx │
    │            │   │ (Pages)  │    │ (Mobile only)  │
    │ - Links    │   │          │    │ - Home         │
    │ - Mobile   │   │          │    │ - Shuttle      │
    │   menu     │   │          │    │ - Ride         │
    └────────────┘   └──────────┘    │ - Promos       │
                                      │ - Account      │
                        ▲             └────────────────┘
                        │
         ┌──────────────┼──────────────┬──────────────┬──────────────┐
         │              │              │              │              │
    ┌────▼─────┐  ┌────▼────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │ Index.   │  │Shuttle. │  │Shuttle    │  │ Ride.tsx  │  │ Account.  │
    │ tsx      │  │ tsx     │  │ Booking.  │  │           │  │ tsx       │
    │          │  │         │  │ tsx       │  │           │  │           │
    │ ROUTE: / │  │ROUTE:/  │  │ROUTE:/    │  │ROUTE:/    │  │ROUTE:/    │
    │          │  │shuttle  │  │shuttle/   │  │ride       │  │account    │
    │          │  │         │  │booking    │  │           │  │           │
    └────┬─────┘  └────┬────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
         │             │             │              │              │
         │             │             │              │              │
    Components:   Components:   Components:    Components:     Components:
         │             │             │              │              │
    ┌────▼─────┐  ┌────▼────┐  ┌─────▼─────────────────────┐  ┌─────▼─────┐
    │ HotelCard │  │Shuttle  │  │ ShuttleProvider          │  │ Input     │
    │ PromoCard │  │Card     │  │   (Context)              │  │ Tabs      │
    │ Button    │  │Button   │  │                          │  │ Button    │
    └───────────┘  └─────────┘  │ Children:                │  │ Card      │
                                 │ - RayonSelection         │  │ BookingItem
                                 │ - ScheduleSelection      │  │ Button    │
                                 │ - PickupPointSelection   │  └───────────┘
                                 │ - ServiceSelection       │
                                 │ - VehicleSelection       │
                                 │ - SeatSelection          │
                                 │ - BookingConfirmation    │
                                 │ - BookingSuccess         │
                                 └─────────────────────────┘
                                          │
                                 Components used:
                                 - Motion (Framer)
                                 - Card, Button, Badge
                                 - Separator, Dialog
```

---

## Data Flow Connections

### Shuttle Module Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  RayonSelection                                                 │
│  └─ onClick setRayon() → updates context                        │
│     └─ triggers useEffect in ShuttleContext                     │
│        └─ calls FareService.getEstimate()                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ScheduleSelection                                              │
│  └─ onClick setSchedule() → updates context                     │
│     └─ no fare recalc yet (depends on distance/service/vehicle) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PickupPointSelection                                           │
│  └─ onClick setPickupPoint() → updates context                  │
│     └─ triggers useEffect (distance available now)              │
│        └─ calls FareService.getEstimate()                       │
│           └─ FareCalculator.calculateFare()                     │
│              └─ returns FareCalculationResult                   │
│                 └─ updates totalPrice & fareBreakdown           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ServiceSelection                                               │
│  └─ onClick setService() → updates context                      │
│     └─ triggers useEffect                                       │
│        └─ calls FareService.getEstimate()                       │
│           └─ applies service multiplier in FareCalculator       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  VehicleSelection                                               │
│  └─ onClick setVehicle() → updates context                      │
│     └─ triggers useEffect                                       │
│        └─ calls FareService.getEstimate()                       │
│           └─ applies vehicle multiplier in FareCalculator       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SeatSelection                                                  │
│  └─ onClick toggleSeat() → updates selectedSeats in context     │
│     └─ NO fare recalc (seat count handled in passengers logic)  │
│        but could tie to setPassengers()                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BookingConfirmation                                            │
│  └─ onClick setPaymentMethod() + finalizeBooking()              │
│     └─ sets bookingStatus: 'paid'                               │
│     └─ generates ticketId: TKT-RANDOM                           │
│     └─ moves to step 9 (success)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BookingSuccess                                                 │
│  └─ Displays ticketId, confirmation, next steps                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Layer Dependencies

```
┌──────────────────────────────────────────────────────────┐
│                   ShuttleContext                         │
│                                                          │
│  useEffect hook watches:                                │
│  - selectedRayon                                         │
│  - selectedService                                       │
│  - selectedVehicle                                       │
│  - selectedPickupPoint                                   │
│  - passengerCounts                                       │
│  - promoCode                                             │
│  - isRoundTrip                                           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   FareService              │
        │ .getEstimate(params)       │
        │                            │
        │ Returns: params → {        │
        │   rayonId                  │
        │   distance                 │
        │   serviceTier              │
        │   vehicleType              │
        │   passengers               │
        │   promoCode                │
        │   isRoundTrip              │
        │ }                          │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────────┐    ┌──────────────────────┐
   │ MOCK_FARE_RULES │    │ MOCK_PROMOS          │
   │                 │    │                      │
   │ [0]:            │    │ [0]:                 │
   │  - rayonId      │    │  - code: WELCOME     │
   │  - baseFare     │    │  - type: percentage  │
   │  - perKmRate    │    │  - value: 20         │
   │  - minCharge    │    │  - maxDiscount       │
   │  - multipliers  │    └──────────────────────┘
   └─────────────────┘
        │
        ▼
   ┌────────────────────────────────┐
   │   FareCalculator               │
   │   .calculateFare(params)       │
   │                                │
   │   1. Base + Distance           │
   │   2. Service Multiplier        │
   │   3. Vehicle Multiplier        │
   │   4. Surge Pricing (time)      │
   │   5. Passenger Breakdown       │
   │   6. Round-trip Discount       │
   │   7. Promo Application         │
   │   8. Final Total               │
   └─────────────┬──────────────────┘
                 │
                 ▼
   ┌────────────────────────────────┐
   │ FareCalculationResult           │
   │                                │
   │ {                              │
   │   baseFare                     │
   │   distanceFare                 │
   │   serviceSurcharge             │
   │   vehicleSurcharge             │
   │   surgeSurcharge               │
   │   passengerBreakdown           │
   │   promoDiscount                │
   │   totalFare                    │
   │   surgeApplied                 │
   │   promoApplied                 │
   │ }                              │
   └─────────────┬──────────────────┘
                 │
                 ▼
   ┌────────────────────────────────┐
   │ FareService.logTransaction()   │
   │                                │
   │ → localStorage('fare_logs')    │
   │ → Keep last 50 logs            │
   └────────────────────────────────┘
```

---

## Ride Module Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  RideSearch.tsx                                             │
│                                                             │
│  1. setPickupInput() → calls handleLocationSearch()         │
│     └─ MapService.searchLocation(query)                     │
│        └─ Nominatim API search                              │
│           └─ displays results dropdown                      │
│                                                             │
│  2. selectLocation(loc, 'pickup') → setPickup()             │
│                                                             │
│  3. setDestInput() → handleLocationSearch('dest')           │
│     └─ MapService.searchLocation(query)                     │
│                                                             │
│  4. selectLocation(loc, 'dest') → setDestination()          │
│                                                             │
│  5. handleSearch() → calls MapService.getRoute()            │
│     └─ OSRM API for distance/duration                       │
│        └─ AdvancedRouteService for traffic factors          │
│           └─ calculates adjusted travel time                │
│              └─ moves to "estimating" step                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  RideSelection.tsx                                          │
│                                                             │
│  1. Displays available ride types                           │
│  2. onClick selectRide(rideId)                              │
│  3. Shows estimated fare & time                             │
│  4. handleConfirm() → moves to "active" step                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  RideActive.tsx                                             │
│                                                             │
│  1. Shows driver info (simulated)                           │
│  2. Displays pickup/destination markers on MapView          │
│  3. Simulates status updates:                               │
│     - "Driver sedang menuju lokasi..."                      │
│     - "Driver sudah sampai!"                                │
│     - "Perjalanan dimulai..."                               │
│     - "Tiba di tujuan" → moves to "completed"               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  RideCompleted.tsx                                          │
│                                                             │
│  1. Shows trip summary                                      │
│  2. Displays total cost                                     │
│  3. Option to rate driver                                   │
│  4. Can return to home                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## External API Dependencies

```
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
└──────────────────────────────────────────────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
    ┌────────────────┐  ┌─────────────────┐  ┌──────────────────┐
    │ OSRM Routing   │  │ Nominatim (OSM) │  │ Leaflet Maps     │
    │                │  │                 │  │                  │
    │ Endpoint:      │  │ Endpoint:       │  │ CDN: Leaflet.js  │
    │ router.project │  │ nominatim.      │  │                  │
    │ -osrm.org      │  │ openstreetmap   │  │ Usage:           │
    │                │  │ .org            │  │ - Map display    │
    │ Used by:       │  │                 │  │ - Marker placing │
    │ - MapService   │  │ Used by:        │  │ - Route drawing  │
    │ - RideSearch   │  │ - MapService    │  │                  │
    │ - Advanced     │  │ - RideSearch    │  │ Used by:         │
    │   RouteService │  │ (autocomplete)  │  │ - MapView.tsx    │
    │                │  │                 │  │ - RideActive.tsx │
    │ Returns:       │  │ Returns:        │  │                  │
    │ - distance     │  │ - address text  │  │ Package:         │
    │ - duration     │  │ - lat/lng       │  │ react-leaflet    │
    │ - polyline     │  │ - details       │  │                  │
    └────────────────┘  └─────────────────┘  └──────────────────┘
```

---

## State Management Locations

```
┌──────────────────────────────────────────────────────────────────┐
│                  STATE MANAGEMENT SUMMARY                        │
└──────────────────────────────────────────────────────────────────┘

Global/Context State:
┌────────────────────────────────────────────────────────────────┐
│ ShuttleContext (ShuttleBooking page only)                      │
│                                                                │
│ const [state, setState] = useState<ShuttleBookingState> {      │
│   step: 1-9                                                    │
│   selectedRayon: Rayon | null                                  │
│   selectedSchedule: ShuttleSchedule | null                     │
│   selectedPickupPoint: PickupPoint | null                      │
│   selectedService: ShuttleService | null                       │
│   selectedVehicle: ShuttleVehicle | null                       │
│   selectedSeats: string[]                                      │
│   passengerCounts: PassengerCount[]                            │
│   totalPrice: number                                           │
│   fareBreakdown: FareCalculationResult | null                  │
│   bookingStatus: 'draft' | 'validating' | 'confirmed' | 'paid' │
│   paymentMethod: string | null                                 │
│   ticketId: string | null                                      │
│   isRoundTrip: boolean                                         │
│   promoCode: string | null                                     │
│ }                                                              │
└────────────────────────────────────────────────────────────────┘

Local/Page State:
┌────────────────────────────────────────────────────────────────┐
│ Index.tsx:                                                     │
│   - currentBanner: number (for carousel)                       │
│                                                                │
│ Shuttle.tsx:                                                   │
│   - search: string (filter input)                              │
│                                                                │
│ Ride.tsx:                                                      │
│   - pickup: GeoLocation | null                                 │
│   - destination: GeoLocation | null                            │
│   - route: RouteInfo | null                                    │
│   - selectedRide: string (ride ID)                             │
│   - step: 'search'|'estimating'|'finding'|'active'|'completed' │
│   - rideType: 'instant' | 'scheduled'                          │
│   - status: string (driver status message)                     │
│                                                                │
│ Account.tsx:                                                   │
│   - isLoggedIn: boolean                                        │
│   - tab: 'login' | 'register'                                  │
│                                                                │
│ Booking.tsx:                                                   │
│   - step: 'form' | 'confirm' (controlled by state)             │
│                                                                │
│ RideSearch.tsx:                                                │
│   - pickupInput: string                                        │
│   - destInput: string                                          │
│   - results: GeoLocation[]                                     │
│   - searching: 'pickup' | 'dest' | null                        │
│                                                                │
│ Shuttle/components:                                            │
│   - Each component reads from useShuttle() context             │
└────────────────────────────────────────────────────────────────┘

External API Calls (Real-time):
┌────────────────────────────────────────────────────────────────┐
│ MapService.getRoute()                                          │
│   └─ Calls OSRM API (https://router.project-osrm.org/)         │
│                                                                │
│ MapService.reverseGeocode()                                    │
│   └─ Calls Nominatim API (reverse lookup)                      │
│                                                                │
│ MapService.searchLocation()                                    │
│   └─ Calls Nominatim API (search)                              │
└────────────────────────────────────────────────────────────────┘

Persistent Storage (localStorage):
┌────────────────────────────────────────────────────────────────┐
│ fare_logs (JSON array)                                         │
│   └─ Last 50 fare calculation transactions                     │
│      Format: [{                                                │
│        id, timestamp, requestedPath,                           │
│        calculation: FareCalculationResult,                     │
│        metadata                                                │
│      }]                                                        │
└────────────────────────────────────────────────────────────────┘
```

---

## Component Props & Communication

```
Layout.tsx
├── Props: { children: React.ReactNode }
├── Children: 
│   ├── Navbar.tsx
│   │   └── Props: {} (uses useLocation hook)
│   ├── Routes/Pages
│   ├── Footer.tsx
│   │   └── Props: {}
│   └── BottomNav.tsx
│       └── Props: {} (uses useLocation hook)

Shuttle.tsx
├── Props: {}
├── State:
│   └── search: string
├── Children:
│   └── ShuttleCard.tsx (props: rayon)
│       ├── Props: { key, to, rayon }
│       └── Uses:
│           ├── Card, CardContent
│           ├── Badge
│           ├── MapPin, ArrowRight icons

ShuttleBooking.tsx
├── Wrapper: ShuttleProvider
├── Props: {} 
└── Children (based on state.step):
    ├── RayonSelection.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks: onClick → setRayon(rayon)
    │   └── Data: shuttleRayons from data/
    │
    ├── ScheduleSelection.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks: onClick → setSchedule(schedule)
    │   └── Data: (generated from selectedRayon)
    │
    ├── PickupPointSelection.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks: onClick → setPickupPoint(point)
    │   └── Data: selectedRayon.pickupPoints
    │
    ├── ServiceSelection.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks: onClick → setService(service)
    │   └── Data: ShuttleService[]
    │
    ├── VehicleSelection.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks: onClick → setVehicle(vehicle)
    │   └── Data: ShuttleVehicle[]
    │
    ├── SeatSelection.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks: 
    │   │   ├── onClick toggleSeat(seatId)
    │   │   ├── onClick prevStep()
    │   │   └── onClick nextStep()
    │   └── Uses: state.selectedVehicle.layout
    │
    ├── BookingConfirmation.tsx
    │   ├── Props: {} (uses useShuttle)
    │   ├── Callbacks:
    │   │   ├── onClick prevStep()
    │   │   ├── onClick setPaymentMethod(method)
    │   │   └── onClick finalizeBooking()
    │   └── Displays: Order summary with all selections
    │
    └── BookingSuccess.tsx
        ├── Props: {} (uses useShuttle)
        ├── Data: state.ticketId
        └── Actions: Can reset booking

Ride.tsx
├── Props: {}
├── State:
│   ├── pickup: GeoLocation | null
│   ├── destination: GeoLocation | null
│   ├── route: RouteInfo | null
│   ├── selectedRide: string
│   ├── step: 'search'|'estimating'|'finding'|'active'|'completed'
│   ├── rideType: 'instant' | 'scheduled'
│   └── status: string
├── Services:
│   └── MapService.getRoute(), searchLocation()
└── Children (based on step):
    ├── RideSearch.tsx (step: 'search')
    │   ├── Props: {
    │   │   pickup, setPickup,
    │   │   destination, setDestination,
    │   │   rideType, setRideType,
    │   │   handleSearch
    │   │ }
    │   └── Services: MapService for location search
    │
    ├── Loading spinner (step: 'estimating')
    │
    ├── RideSelection.tsx (step: 'finding')
    │   ├── Props: {
    │   │   selectedRide, setSelectedRide,
    │   │   handleConfirm
    │   │ }
    │   └── Data: rides from data/rides.ts
    │
    ├── RideActive.tsx (step: 'active')
    │   ├── Props: { route, status, selectedRide }
    │   └── Children: MapView.tsx
    │
    └── RideCompleted.tsx (step: 'completed')
        └── Props: { route, selectedRide }

Account.tsx
├── Props: {}
├── State:
│   ├── isLoggedIn: boolean
│   └── tab: 'login' | 'register'
├── Mock Data: bookingHistory from data/
└── If logged in:
    ├── Profile card (user info)
    ├── Booking history
    │   └── Children: BookingItem.tsx (for each booking)
    │       ├── Props: { booking: Booking }
    │       └── Data: booking type, status, total
    └── Tabs:
        ├── History tab
        ├── Settings tab
        └── Logout button
```

---

## Data File Organization

```
src/data/
│
├── dummyData.ts (Exports utility function)
│   └── formatCurrency(amount: number): string
│
├── shuttleModule.ts (Shuttle configuration)
│   ├── SHUTTLE_FARE_RULES: FareRule[]
│   │   └── 4 rules (one per rayon)
│   ├── SHUTTLE_SURGE_RULES: SurgeRule[]
│   │   └── 3 rules (morning, evening, weekend)
│   ├── SHUTTLE_PROMOS: PromoCode[]
│   │   └── 3 promo codes
│   └── shuttleRayons: Rayon[]
│       └── 4 rayons with ~45 total pickup points
│
├── hotels.ts (Hotel mock data)
│   └── hotels: Hotel[]
│       └── 6 hotels
│
├── rides.ts (Ride mock data)
│   └── rides: Ride[]
│       └── 3 ride types
│
├── promos.ts (Promotional mock data)
│   └── promos: Promo[]
│       └── 6 promos
│
└── bookingHistory.ts (Booking history mock)
    └── bookingHistory: Booking[]
        └── 4 sample bookings
```

---

## API Integration Points (For Supabase)

```
POST /auth/register
    ↓ (creates user)
    └─→ INSERT users table

POST /auth/login
    ↓ (validates credentials)
    └─→ SELECT users table

POST /bookings (Shuttle)
    ├─ INPUT: ShuttleBookingState
    ├─ INSERT bookings table
    └─ INSERT shuttle_bookings table

POST /bookings (Ride)
    ├─ INPUT: ride pickup, destination, vehicle
    ├─ INSERT bookings table
    └─ INSERT ride_bookings table

GET /bookings
    ├─ FILTER: user_id = auth.uid()
    └─ SELECT from bookings + related details

POST /fares/calculate
    ├─ INPUT: rayon, distance, service, vehicle, passengers
    ├─ SELECT fare_rules
    ├─ CALL FareCalculator
    └─ RETURN FareCalculationResult

POST /fares/logs
    ├─ INPUT: FareCalculationResult
    └─ INSERT transaction_logs

GET /promos
    ├─ FILTER: is_active = true AND valid_until >= now()
    └─ SELECT all active promos

POST /promos/validate
    ├─ INPUT: code
    └─ VALIDATE against promo_codes table
```

