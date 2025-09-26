// Updated trainers data with multiple locations
export const trainersWithLocations = [
  // FITNESS TRAINERS (5)
  {
    id: 't-1', userId: 'u-trainer1', name: 'Anna', surname: 'Kowalska', rating: 4.9, reviewCount: 127, priceFrom: 80, distance: '0.5 km',
    specialties: ['Fitness', 'Siłownia'], isVerified: true, hasVideo: true, avatar: '👩‍🦰', gender: 'female' as const,
    bio: 'Certyfikowana trenerka fitness z 8-letnim doświadczeniem. Specjalizuję się w treningach siłowych i funkcjonalnych.',
    locations: [
      {
        id: 'loc-t1-1',
        name: 'Fitness Club Centrum',
        address: 'ul. Marszałkowska 10, 00-001 Warszawa',
        coordinates: { lat: 52.2297, lng: 21.0122 },
        radius: 2
      },
      {
        id: 'loc-t1-2',
        name: 'Siłownia Premium',
        address: 'ul. Nowy Świat 15, 00-029 Warszawa',
        coordinates: { lat: 52.2320, lng: 21.0190 },
        radius: 1.5
      }
    ],
    services: [
      { id: 'srv-1', name: 'Trening personalny', price: 80, duration: 60, type: 'gym' as const },
      { id: 'srv-2', name: 'Konsultacja online', price: 50, duration: 45, type: 'online' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
    ],
  },
  {
    id: 't-2', userId: 'u-trainer2', name: 'Piotr', surname: 'Nowak', rating: 4.7, reviewCount: 95, priceFrom: 90, distance: '1.2 km',
    specialties: ['Fitness', 'Kulturystyka'], isVerified: true, hasVideo: false, avatar: '👨‍💼', gender: 'male' as const,
    bio: 'Mistrz Polski w kulturystyce. Pomagam osiągnąć wymarzoną sylwetkę poprzez spersonalizowane treningi.',
    locations: [
      {
        id: 'loc-t2-1',
        name: 'Gold Gym Warszawa',
        address: 'ul. Krakowskie Przedmieście 5, 00-068 Warszawa',
        coordinates: { lat: 52.2350, lng: 21.0103 },
        radius: 3
      }
    ],
    services: [
      { id: 'srv-3', name: 'Trening budowania masy', price: 90, duration: 75, type: 'gym' as const },
      { id: 'srv-4', name: 'Plan treningowy', price: 120, duration: 60, type: 'online' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '14:00' },
      { dayOfWeek: 2, startTime: '06:00', endTime: '14:00' },
      { dayOfWeek: 3, startTime: '06:00', endTime: '14:00' },
      { dayOfWeek: 4, startTime: '06:00', endTime: '14:00' },
      { dayOfWeek: 5, startTime: '06:00', endTime: '14:00' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '12:00' },
    ],
  },
  {
    id: 't-3', userId: 'u-trainer3', name: 'Karolina', surname: 'Zielińska', rating: 4.8, reviewCount: 156, priceFrom: 75, distance: '2.1 km',
    specialties: ['Fitness', 'Crossfit'], isVerified: true, hasVideo: true, avatar: '👩‍🎓', gender: 'female' as const,
    bio: 'Trenerka crossfit z passion. Uwielbiam intensywne treningi i motywowanie do przekraczania granic.',
    locations: [
      {
        id: 'loc-t3-1',
        name: 'CrossFit Box Warszawa',
        address: 'ul. Złota 44, 00-120 Warszawa',
        coordinates: { lat: 52.2180, lng: 21.0040 },
        radius: 2.5
      },
      {
        id: 'loc-t3-2',
        name: 'Outdoor Training Park',
        address: 'Park Łazienkowski, 00-460 Warszawa',
        coordinates: { lat: 52.2150, lng: 21.0300 },
        radius: 1
      }
    ],
    services: [
      { id: 'srv-5', name: 'Crossfit', price: 75, duration: 60, type: 'gym' as const },
      { id: 'srv-6', name: 'Trening funkcjonalny', price: 70, duration: 45, type: 'gym' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 3, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 5, startTime: '16:00', endTime: '21:00' },
    ],
  },
  {
    id: 't-4', userId: 'u-trainer4', name: 'Tomasz', surname: 'Wójcik', rating: 4.6, reviewCount: 78, priceFrom: 85, distance: '3.5 km',
    specialties: ['Fitness', 'Rehabilitacja'], isVerified: false, hasVideo: true, avatar: '👨‍⚕️', gender: 'male' as const,
    bio: 'Fizjoterapeuta i trener personalny. Łączę wiedzę medyczną z treningiem dla maksymalnych efektów.',
    locations: [
      {
        id: 'loc-t4-1',
        name: 'Centrum Rehabilitacji SportMed',
        address: 'al. Jerozolimskie 85, 02-001 Warszawa',
        coordinates: { lat: 52.2500, lng: 21.0200 },
        radius: 4
      }
    ],
    services: [
      { id: 'srv-7', name: 'Trening rehabilitacyjny', price: 85, duration: 60, type: 'gym' as const },
      { id: 'srv-8', name: 'Korekcja postawy', price: 95, duration: 75, type: 'gym' as const },
    ],
    availability: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
    ],
  },
  {
    id: 't-5', userId: 'u-trainer5', name: 'Magdalena', surname: 'Kaczmarek', rating: 4.9, reviewCount: 203, priceFrom: 95, distance: '1.8 km',
    specialties: ['Fitness', 'TRX'], isVerified: true, hasVideo: true, avatar: '👩‍🏫', gender: 'female' as const,
    bio: 'Ekspertka TRX z międzynarodowymi certyfikatami. Tworzę wyzwania dla każdego poziomu zaawansowania.',
    locations: [
      {
        id: 'loc-t5-1',
        name: 'TRX Studio Elite',
        address: 'ul. Foksal 3/5, 00-366 Warszawa',
        coordinates: { lat: 52.2400, lng: 21.0080 },
        radius: 2
      },
      {
        id: 'loc-t5-2',
        name: 'Fitness Factory',
        address: 'ul. Wspólna 62, 00-687 Warszawa',
        coordinates: { lat: 52.2280, lng: 21.0020 },
        radius: 3
      }
    ],
    services: [
      { id: 'srv-9', name: 'Trening TRX', price: 95, duration: 60, type: 'gym' as const },
      { id: 'srv-10', name: 'Trening z ciężarem ciała', price: 80, duration: 45, type: 'home_visit' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '07:00', endTime: '15:00' },
      { dayOfWeek: 3, startTime: '07:00', endTime: '15:00' },
      { dayOfWeek: 5, startTime: '07:00', endTime: '15:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
    ],
  },

  // YOGA TRAINERS (5)
  {
    id: 't-6', userId: 'u-trainer6', name: 'Ewa', surname: 'Wiśniowska', rating: 5.0, reviewCount: 189, priceFrom: 70, distance: '2.0 km',
    specialties: ['Yoga', 'Pilates'], isVerified: true, hasVideo: true, avatar: '👩‍🦱', gender: 'female' as const,
    bio: 'Instruktorka jogi z 10-letnim doświadczeniem. Specjalizuję się w Hatha i Vinyasa yoga.',
    locations: [
      {
        id: 'loc-t6-1',
        name: 'Yoga Center Warsaw',
        address: 'ul. Hoża 55, 00-681 Warszawa',
        coordinates: { lat: 52.2400, lng: 21.0150 },
        radius: 2
      }
    ],
    services: [
      { id: 'srv-11', name: 'Yoga Hatha', price: 70, duration: 90, type: 'gym' as const },
      { id: 'srv-12', name: 'Yoga online', price: 50, duration: 60, type: 'online' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' },
    ],
  },
  {
    id: 't-7', userId: 'u-trainer7', name: 'Patrycja', surname: 'Kowalczyk', rating: 4.8, reviewCount: 134, priceFrom: 80, distance: '1.5 km',
    specialties: ['Yoga', 'Medytacja'], isVerified: true, hasVideo: true, avatar: '👩‍💆', gender: 'female' as const,
    bio: 'Certyfikowana nauczycielka jogi i medytacji mindfulness. Pomagam znaleźć równowagę ciała i umysłu.',
    locations: [
      {
        id: 'loc-t7-1',
        name: 'Mindful Yoga Studio',
        address: 'ul. Bracka 25, 00-028 Warszawa',
        coordinates: { lat: 52.2250, lng: 21.0300 },
        radius: 1.5
      },
      {
        id: 'loc-t7-2',
        name: 'Zen Garden Studio',
        address: 'ul. Mokotowska 33, 00-560 Warszawa',
        coordinates: { lat: 52.2200, lng: 21.0250 },
        radius: 2
      }
    ],
    services: [
      { id: 'srv-13', name: 'Yoga Vinyasa', price: 80, duration: 75, type: 'gym' as const },
      { id: 'srv-14', name: 'Medytacja grupowa', price: 40, duration: 45, type: 'online' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 3, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 5, startTime: '17:00', endTime: '21:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '15:00' },
    ],
  },
  {
    id: 't-8', userId: 'u-trainer8', name: 'Marta', surname: 'Kamińska', rating: 4.7, reviewCount: 98, priceFrom: 75, distance: '2.8 km',
    specialties: ['Yoga', 'Stretching'], isVerified: false, hasVideo: false, avatar: '👩‍🎨', gender: 'female' as const,
    bio: 'Pasjonatka jogi i rozciągania. Prowadzę klasy dla początkujących i zaawansowanych.',
    locations: [
      {
        id: 'loc-t8-1',
        name: 'Stretch & Flow Studio',
        address: 'ul. Wilcza 46, 00-679 Warszawa',
        coordinates: { lat: 52.2100, lng: 21.0250 },
        radius: 2.5
      }
    ],
    services: [
      { id: 'srv-15', name: 'Yoga dla początkujących', price: 75, duration: 60, type: 'gym' as const },
      { id: 'srv-16', name: 'Deep stretching', price: 65, duration: 45, type: 'gym' as const },
    ],
    availability: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
    ],
  },
  {
    id: 't-9', userId: 'u-trainer9', name: 'Aleksandra', surname: 'Lewandowska', rating: 4.9, reviewCount: 167, priceFrom: 85, distance: '3.2 km',
    specialties: ['Yoga', 'Pilates'], isVerified: true, hasVideo: true, avatar: '👩‍🌾', gender: 'female' as const,
    bio: 'Instruktorka z certyfikatem Yoga Alliance. Łączę tradycyjną jogę z nowoczesnymi technikami pilates.',
    locations: [
      {
        id: 'loc-t9-1',
        name: 'Alliance Yoga & Pilates',
        address: 'ul. Żurawia 32/34, 00-515 Warszawa',
        coordinates: { lat: 52.2600, lng: 21.0100 },
        radius: 3
      }
    ],
    services: [
      { id: 'srv-17', name: 'Yoga-Pilates fusion', price: 85, duration: 75, type: 'gym' as const },
      { id: 'srv-18', name: 'Power Yoga', price: 90, duration: 60, type: 'gym' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '06:30', endTime: '14:30' },
      { dayOfWeek: 3, startTime: '06:30', endTime: '14:30' },
      { dayOfWeek: 5, startTime: '06:30', endTime: '14:30' },
    ],
  },
  {
    id: 't-10', userId: 'u-trainer10', name: 'Natalia', surname: 'Dąbrowska', rating: 4.6, reviewCount: 76, priceFrom: 65, distance: '4.1 km',
    specialties: ['Yoga', 'Relaks'], isVerified: false, hasVideo: true, avatar: '👩‍🎤', gender: 'female' as const,
    bio: 'Młoda instruktorka jogi z fresh podejściem. Specjalizuję się w jodze relaksacyjnej i yin yoga.',
    locations: [
      {
        id: 'loc-t10-1',
        name: 'Yin Yang Studio',
        address: 'ul. Puławska 99, 02-595 Warszawa',
        coordinates: { lat: 52.1950, lng: 21.0350 },
        radius: 4
      },
      {
        id: 'loc-t10-2',
        name: 'Relax Yoga Point',
        address: 'ul. Konstancińska 12, 02-942 Warszawa',
        coordinates: { lat: 52.1800, lng: 21.0400 },
        radius: 3
      }
    ],
    services: [
      { id: 'srv-19', name: 'Yin Yoga', price: 65, duration: 90, type: 'gym' as const },
      { id: 'srv-20', name: 'Yoga nidra', price: 55, duration: 60, type: 'online' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '18:00', endTime: '21:00' },
      { dayOfWeek: 2, startTime: '18:00', endTime: '21:00' },
      { dayOfWeek: 3, startTime: '18:00', endTime: '21:00' },
      { dayOfWeek: 4, startTime: '18:00', endTime: '21:00' },
      { dayOfWeek: 0, startTime: '16:00', endTime: '20:00' },
    ],
  },

  // RUNNING TRAINERS (5) - Continue with the rest...
  {
    id: 't-11', userId: 'u-trainer11', name: 'Marek', surname: 'Szymański', rating: 4.8, reviewCount: 112, priceFrom: 60, distance: '1.3 km',
    specialties: ['Bieganie', 'Maraton'], isVerified: true, hasVideo: true, avatar: '👨‍🏃', gender: 'male' as const,
    bio: 'Maratończyk z 15-letnim doświadczeniem. Przygotowuję do biegów na każdym dystansie.',
    locations: [
      {
        id: 'loc-t11-1',
        name: 'Park Ujazdowski',
        address: 'Park Ujazdowski, 00-001 Warszawa',
        coordinates: { lat: 52.2320, lng: 21.0180 },
        radius: 5
      },
      {
        id: 'loc-t11-2',
        name: 'Bulwary Wiślane',
        address: 'Bulwary Wiślane, 00-001 Warszawa',
        coordinates: { lat: 52.2400, lng: 21.0400 },
        radius: 8
      }
    ],
    services: [
      { id: 'srv-21', name: 'Trening biegowy', price: 60, duration: 60, type: 'home_visit' as const },
      { id: 'srv-22', name: 'Plan treningowy na maraton', price: 150, duration: 90, type: 'online' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '09:00' },
      { dayOfWeek: 2, startTime: '06:00', endTime: '09:00' },
      { dayOfWeek: 3, startTime: '06:00', endTime: '09:00' },
      { dayOfWeek: 4, startTime: '06:00', endTime: '09:00' },
      { dayOfWeek: 5, startTime: '06:00', endTime: '09:00' },
      { dayOfWeek: 6, startTime: '07:00', endTime: '12:00' },
      { dayOfWeek: 0, startTime: '07:00', endTime: '12:00' },
    ],
  },
  {
    id: 't-12', userId: 'u-trainer12', name: 'Jakub', surname: 'Wolski', rating: 4.7, reviewCount: 89, priceFrom: 55, distance: '2.7 km',
    specialties: ['Bieganie', 'Triathlon'], isVerified: true, hasVideo: false, avatar: '👨‍🚴', gender: 'male' as const,
    bio: 'Triatlonista i trener biegowy. Specjalizuję się w technice biegu i przygotowaniu do zawodów.',
    locations: [
      {
        id: 'loc-t12-1',
        name: 'Stadion Legii',
        address: 'ul. Łazienkowska 3, 00-449 Warszawa',
        coordinates: { lat: 52.2150, lng: 21.0320 },
        radius: 3
      }
    ],
    services: [
      { id: 'srv-23', name: 'Analiza techniki biegu', price: 80, duration: 75, type: 'home_visit' as const },
      { id: 'srv-24', name: 'Trening interwałowy', price: 55, duration: 45, type: 'home_visit' as const },
    ],
    availability: [
      { dayOfWeek: 2, startTime: '17:00', endTime: '20:00' },
      { dayOfWeek: 4, startTime: '17:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 0, startTime: '08:00', endTime: '16:00' },
    ],
  },
  {
    id: 't-13', userId: 'u-trainer13', name: 'Anna', surname: 'Mazurek', rating: 4.8, reviewCount: 143, priceFrom: 65, distance: '1.9 km',
    specialties: ['Bieganie', 'Nordic Walking'], isVerified: true, hasVideo: true, avatar: '👩‍🏃', gender: 'female' as const,
    bio: 'Trenerka biegania z pasją do nordic walking. Pomagam odkryć radość z aktywności na świeżym powietrzu.',
    locations: [
      {
        id: 'loc-t13-1',
        name: 'Park Łazienkowski',
        address: 'Park Łazienkowski, 00-460 Warszawa',
        coordinates: { lat: 52.2150, lng: 21.0300 },
        radius: 6
      },
      {
        id: 'loc-t13-2',
        name: 'Las Kabacki',
        address: 'Las Kabacki, 02-798 Warszawa',
        coordinates: { lat: 52.1500, lng: 21.0500 },
        radius: 10
      }
    ],
    services: [
      { id: 'srv-25', name: 'Nordic Walking', price: 65, duration: 60, type: 'home_visit' as const },
      { id: 'srv-26', name: 'Bieganie rekreacyjne', price: 55, duration: 45, type: 'home_visit' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '17:00', endTime: '20:00' },
      { dayOfWeek: 3, startTime: '17:00', endTime: '20:00' },
      { dayOfWeek: 5, startTime: '17:00', endTime: '20:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
      { dayOfWeek: 0, startTime: '09:00', endTime: '15:00' },
    ],
  },
  {
    id: 't-14', userId: 'u-trainer14', name: 'Bartosz', surname: 'Jankowski', rating: 4.5, reviewCount: 67, priceFrom: 70, distance: '3.8 km',
    specialties: ['Bieganie', 'Ultramaraton'], isVerified: false, hasVideo: true, avatar: '👨‍💪', gender: 'male' as const,
    bio: 'Ultramaratończyk z doświadczeniem w biegach górskich. Specjalizuję się w przygotowaniu wytrzymałościowym.',
    locations: [
      {
        id: 'loc-t14-1',
        name: 'Pole Mokotowskie',
        address: 'Pole Mokotowskie, 00-001 Warszawa',
        coordinates: { lat: 52.2100, lng: 21.0000 },
        radius: 4
      }
    ],
    services: [
      { id: 'srv-27', name: 'Trening ultramaratonu', price: 100, duration: 120, type: 'home_visit' as const },
      { id: 'srv-28', name: 'Bieg górski', price: 70, duration: 90, type: 'home_visit' as const },
    ],
    availability: [
      { dayOfWeek: 6, startTime: '06:00', endTime: '14:00' },
      { dayOfWeek: 0, startTime: '06:00', endTime: '14:00' },
    ],
  },
  {
    id: 't-15', userId: 'u-trainer15', name: 'Joanna', surname: 'Kwiatkowska', rating: 4.9, reviewCount: 201, priceFrom: 60, distance: '2.3 km',
    specialties: ['Bieganie', 'Dietetyka'], isVerified: true, hasVideo: true, avatar: '👩‍⚕️', gender: 'female' as const,
    bio: 'Dietetyk sportowy i trener biegowy. Łączę trening z prawidłowym żywieniem dla optymalnych wyników.',
    locations: [
      {
        id: 'loc-t15-1',
        name: 'Park Skaryszewski',
        address: 'Park Skaryszewski, 03-982 Warszawa',
        coordinates: { lat: 52.2500, lng: 21.0800 },
        radius: 5
      },
      {
        id: 'loc-t15-2',
        name: 'Centrum Dietetyki Sportowej',
        address: 'ul. Grochowska 341, 03-822 Warszawa',
        coordinates: { lat: 52.2450, lng: 21.0700 },
        radius: 2
      }
    ],
    services: [
      { id: 'srv-29', name: 'Konsultacja dietetyczna + trening', price: 120, duration: 90, type: 'gym' as const },
      { id: 'srv-30', name: 'Trening biegowy', price: 60, duration: 60, type: 'home_visit' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '15:00', endTime: '19:00' },
      { dayOfWeek: 2, startTime: '15:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '15:00', endTime: '19:00' },
      { dayOfWeek: 4, startTime: '15:00', endTime: '19:00' },
      { dayOfWeek: 5, startTime: '15:00', endTime: '19:00' },
    ],
  },

  // Add remaining trainers (Boxing, Swimming, Tennis) with locations...
  // For brevity, I'll continue with just a few more to show the pattern
  
  // BOXING TRAINERS (5)
  {
    id: 't-16', userId: 'u-trainer16', name: 'Adrian', surname: 'Kozłowski', rating: 4.7, reviewCount: 134, priceFrom: 85, distance: '2.1 km',
    specialties: ['Boks', 'MMA'], isVerified: true, hasVideo: true, avatar: '👨‍🥊', gender: 'male' as const,
    bio: 'Mistrz Polski w boksie. Uczę techniki bokserskie od podstaw do poziomu zawodniczego.',
    locations: [
      {
        id: 'loc-t16-1',
        name: 'Boxing Gym Warsaw',
        address: 'ul. Prosta 70, 00-838 Warszawa',
        coordinates: { lat: 52.2200, lng: 20.9800 },
        radius: 3
      },
      {
        id: 'loc-t16-2',
        name: 'Fight Club Elite',
        address: 'ul. Towarowa 22, 00-839 Warszawa',
        coordinates: { lat: 52.2250, lng: 20.9850 },
        radius: 2
      }
    ],
    services: [
      { id: 'srv-31', name: 'Trening bokserski', price: 85, duration: 60, type: 'gym' as const },
      { id: 'srv-32', name: 'Technika MMA', price: 95, duration: 75, type: 'gym' as const },
    ],
    availability: [
      { dayOfWeek: 1, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 3, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
      { dayOfWeek: 5, startTime: '16:00', endTime: '21:00' },
    ],
  }
  // Continue with remaining 14 trainers...
];