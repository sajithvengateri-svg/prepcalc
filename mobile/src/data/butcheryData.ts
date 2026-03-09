// PC-28: Butchery chart data — all 5 animals with primal zones, sub-cuts, pricing, yields, methods

export interface Cut {
  name: string;
  costPerKg: number;
  yieldPct: number;
  methods: string[];
}

export interface PrimalZone {
  id: string;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
  cuts: Cut[];
}

export interface AnimalChart {
  id: string;
  name: string;
  image: any;
  zones: PrimalZone[];
}

const BEEF_ZONES: PrimalZone[] = [
  {
    id: "chuck",
    label: "Chuck",
    left: "3%", top: "8%", width: "22%", height: "45%",
    cuts: [
      { name: "Chuck Roast", costPerKg: 16, yieldPct: 75, methods: ["Braise", "Slow cook"] },
      { name: "Blade Steak", costPerKg: 22, yieldPct: 72, methods: ["Grill", "Pan-fry"] },
      { name: "Flat Iron", costPerKg: 28, yieldPct: 68, methods: ["Grill", "Pan-sear"] },
      { name: "Chuck Short Ribs", costPerKg: 24, yieldPct: 55, methods: ["Braise", "BBQ"] },
    ],
  },
  {
    id: "rib",
    label: "Rib",
    left: "25%", top: "8%", width: "15%", height: "38%",
    cuts: [
      { name: "Ribeye Steak", costPerKg: 52, yieldPct: 82, methods: ["Grill", "Pan-sear"] },
      { name: "Standing Rib Roast", costPerKg: 48, yieldPct: 80, methods: ["Roast"] },
      { name: "Back Ribs", costPerKg: 22, yieldPct: 55, methods: ["BBQ", "Smoke"] },
      { name: "Tomahawk", costPerKg: 58, yieldPct: 70, methods: ["Grill", "Roast"] },
    ],
  },
  {
    id: "shortloin",
    label: "Short Loin",
    left: "40%", top: "8%", width: "14%", height: "38%",
    cuts: [
      { name: "T-Bone", costPerKg: 48, yieldPct: 75, methods: ["Grill", "Pan-sear"] },
      { name: "Porterhouse", costPerKg: 52, yieldPct: 78, methods: ["Grill", "Pan-sear"] },
      { name: "Strip Steak", costPerKg: 46, yieldPct: 85, methods: ["Grill", "Pan-fry"] },
      { name: "Tenderloin", costPerKg: 65, yieldPct: 90, methods: ["Grill", "Pan-sear", "Roast"] },
    ],
  },
  {
    id: "sirloin",
    label: "Sirloin",
    left: "54%", top: "8%", width: "14%", height: "38%",
    cuts: [
      { name: "Top Sirloin", costPerKg: 38, yieldPct: 82, methods: ["Grill", "Pan-fry"] },
      { name: "Tri-Tip", costPerKg: 32, yieldPct: 78, methods: ["Grill", "Roast"] },
      { name: "Sirloin Cap", costPerKg: 36, yieldPct: 80, methods: ["Grill", "Pan-sear"] },
    ],
  },
  {
    id: "round",
    label: "Round",
    left: "68%", top: "5%", width: "28%", height: "55%",
    cuts: [
      { name: "Top Round", costPerKg: 22, yieldPct: 80, methods: ["Roast", "Braise"] },
      { name: "Bottom Round", costPerKg: 18, yieldPct: 78, methods: ["Braise", "Slow cook"] },
      { name: "Eye Round", costPerKg: 20, yieldPct: 82, methods: ["Roast", "Slice thin"] },
      { name: "Rump Roast", costPerKg: 16, yieldPct: 75, methods: ["Braise", "Slow cook"] },
    ],
  },
  {
    id: "brisket",
    label: "Brisket",
    left: "5%", top: "52%", width: "22%", height: "25%",
    cuts: [
      { name: "Whole Brisket", costPerKg: 18, yieldPct: 55, methods: ["Smoke", "Braise"] },
      { name: "Flat Cut", costPerKg: 22, yieldPct: 60, methods: ["Braise", "Smoke"] },
      { name: "Point Cut", costPerKg: 16, yieldPct: 50, methods: ["Smoke", "BBQ"] },
    ],
  },
  {
    id: "plate",
    label: "Plate",
    left: "27%", top: "48%", width: "22%", height: "28%",
    cuts: [
      { name: "Short Ribs", costPerKg: 26, yieldPct: 55, methods: ["Braise", "BBQ"] },
      { name: "Skirt Steak", costPerKg: 32, yieldPct: 70, methods: ["Grill", "Pan-sear"] },
      { name: "Hanger Steak", costPerKg: 34, yieldPct: 72, methods: ["Grill", "Pan-sear"] },
    ],
  },
  {
    id: "flank",
    label: "Flank",
    left: "49%", top: "48%", width: "19%", height: "28%",
    cuts: [
      { name: "Flank Steak", costPerKg: 28, yieldPct: 78, methods: ["Grill", "Stir-fry"] },
      { name: "London Broil", costPerKg: 24, yieldPct: 75, methods: ["Grill", "Braise"] },
    ],
  },
  {
    id: "shank",
    label: "Shank",
    left: "2%", top: "75%", width: "16%", height: "22%",
    cuts: [
      { name: "Osso Buco", costPerKg: 20, yieldPct: 55, methods: ["Braise"] },
      { name: "Shank Cross-Cut", costPerKg: 16, yieldPct: 50, methods: ["Braise", "Stew"] },
    ],
  },
];

const LAMB_ZONES: PrimalZone[] = [
  {
    id: "shoulder",
    label: "Shoulder",
    left: "3%", top: "10%", width: "22%", height: "42%",
    cuts: [
      { name: "Shoulder Roast", costPerKg: 18, yieldPct: 75, methods: ["Roast", "Braise"] },
      { name: "Blade Chop", costPerKg: 22, yieldPct: 70, methods: ["Grill", "Pan-fry"] },
      { name: "Arm Chop", costPerKg: 20, yieldPct: 72, methods: ["Grill", "Braise"] },
    ],
  },
  {
    id: "neck",
    label: "Neck",
    left: "5%", top: "3%", width: "15%", height: "15%",
    cuts: [
      { name: "Neck Fillet", costPerKg: 16, yieldPct: 65, methods: ["Braise", "Slow cook"] },
      { name: "Neck Rosettes", costPerKg: 14, yieldPct: 60, methods: ["Braise", "Stew"] },
    ],
  },
  {
    id: "rack",
    label: "Rack",
    left: "25%", top: "8%", width: "18%", height: "35%",
    cuts: [
      { name: "Rack of Lamb", costPerKg: 55, yieldPct: 80, methods: ["Roast", "Grill"] },
      { name: "Cutlets", costPerKg: 58, yieldPct: 75, methods: ["Grill", "Pan-sear"] },
      { name: "Rib Chops", costPerKg: 52, yieldPct: 78, methods: ["Grill", "Pan-fry"] },
    ],
  },
  {
    id: "loin",
    label: "Loin",
    left: "43%", top: "8%", width: "18%", height: "35%",
    cuts: [
      { name: "Loin Chops", costPerKg: 48, yieldPct: 82, methods: ["Grill", "Pan-fry"] },
      { name: "Backstrap", costPerKg: 52, yieldPct: 85, methods: ["Grill", "Pan-sear"] },
      { name: "Noisettes", costPerKg: 50, yieldPct: 78, methods: ["Pan-sear"] },
    ],
  },
  {
    id: "leg",
    label: "Leg",
    left: "62%", top: "5%", width: "32%", height: "55%",
    cuts: [
      { name: "Leg Roast", costPerKg: 22, yieldPct: 80, methods: ["Roast"] },
      { name: "Leg Steaks", costPerKg: 28, yieldPct: 75, methods: ["Grill", "Pan-fry"] },
      { name: "Butterflied Leg", costPerKg: 24, yieldPct: 82, methods: ["Grill", "BBQ"] },
    ],
  },
  {
    id: "breast",
    label: "Breast",
    left: "18%", top: "48%", width: "22%", height: "25%",
    cuts: [
      { name: "Breast", costPerKg: 12, yieldPct: 60, methods: ["Braise", "Slow cook"] },
      { name: "Riblets", costPerKg: 14, yieldPct: 55, methods: ["BBQ", "Braise"] },
    ],
  },
  {
    id: "flank",
    label: "Flank",
    left: "40%", top: "48%", width: "22%", height: "25%",
    cuts: [
      { name: "Flank", costPerKg: 14, yieldPct: 70, methods: ["Braise", "Stew"] },
    ],
  },
  {
    id: "foreshank",
    label: "Fore Shank",
    left: "2%", top: "60%", width: "16%", height: "35%",
    cuts: [
      { name: "Shanks", costPerKg: 18, yieldPct: 65, methods: ["Braise"] },
    ],
  },
  {
    id: "hindshank",
    label: "Hind Shank",
    left: "75%", top: "60%", width: "16%", height: "35%",
    cuts: [
      { name: "Shanks", costPerKg: 18, yieldPct: 65, methods: ["Braise"] },
    ],
  },
];

const PORK_ZONES: PrimalZone[] = [
  {
    id: "head",
    label: "Head",
    left: "0%", top: "5%", width: "12%", height: "40%",
    cuts: [
      { name: "Head", costPerKg: 8, yieldPct: 50, methods: ["Braise", "Roast"] },
    ],
  },
  {
    id: "neck",
    label: "Neck",
    left: "12%", top: "5%", width: "14%", height: "35%",
    cuts: [
      { name: "Collar", costPerKg: 18, yieldPct: 75, methods: ["Roast", "Grill", "Slow cook"] },
      { name: "Scotch Fillet", costPerKg: 22, yieldPct: 80, methods: ["Grill", "Pan-sear"] },
    ],
  },
  {
    id: "loin",
    label: "Loin",
    left: "26%", top: "5%", width: "30%", height: "35%",
    cuts: [
      { name: "Loin Chops", costPerKg: 24, yieldPct: 82, methods: ["Grill", "Pan-fry"] },
      { name: "Loin Roast", costPerKg: 22, yieldPct: 85, methods: ["Roast"] },
      { name: "Tenderloin", costPerKg: 28, yieldPct: 90, methods: ["Grill", "Pan-sear", "Roast"] },
    ],
  },
  {
    id: "legham",
    label: "Leg / Ham",
    left: "60%", top: "5%", width: "32%", height: "50%",
    cuts: [
      { name: "Leg Roast", costPerKg: 16, yieldPct: 80, methods: ["Roast"] },
      { name: "Leg Steaks", costPerKg: 20, yieldPct: 75, methods: ["Grill", "Pan-fry"] },
      { name: "Ham", costPerKg: 14, yieldPct: 85, methods: ["Roast", "Smoke"] },
    ],
  },
  {
    id: "belly",
    label: "Belly",
    left: "26%", top: "42%", width: "20%", height: "30%",
    cuts: [
      { name: "Pork Belly", costPerKg: 18, yieldPct: 75, methods: ["Roast", "Braise", "BBQ"] },
      { name: "Streaky Bacon", costPerKg: 22, yieldPct: 70, methods: ["Pan-fry", "Grill"] },
    ],
  },
  {
    id: "spareribs",
    label: "Spare Ribs",
    left: "16%", top: "42%", width: "12%", height: "30%",
    cuts: [
      { name: "Spare Ribs", costPerKg: 20, yieldPct: 60, methods: ["BBQ", "Smoke", "Braise"] },
      { name: "St Louis Ribs", costPerKg: 22, yieldPct: 58, methods: ["BBQ", "Smoke"] },
    ],
  },
  {
    id: "shoulder",
    label: "Shoulder",
    left: "3%", top: "40%", width: "15%", height: "30%",
    cuts: [
      { name: "Shoulder Roast", costPerKg: 14, yieldPct: 75, methods: ["Roast", "Slow cook"] },
      { name: "Pulled Pork", costPerKg: 14, yieldPct: 70, methods: ["Smoke", "Slow cook"] },
      { name: "Boston Butt", costPerKg: 16, yieldPct: 72, methods: ["Smoke", "BBQ"] },
    ],
  },
  {
    id: "hock",
    label: "Hock",
    left: "72%", top: "58%", width: "15%", height: "38%",
    cuts: [
      { name: "Hock", costPerKg: 10, yieldPct: 55, methods: ["Braise", "Smoke"] },
    ],
  },
];

const CHICKEN_ZONES: PrimalZone[] = [
  {
    id: "breast",
    label: "Breast",
    left: "15%", top: "20%", width: "30%", height: "35%",
    cuts: [
      { name: "Breast Fillet", costPerKg: 12, yieldPct: 70, methods: ["Grill", "Pan-fry", "Roast"] },
      { name: "Supreme", costPerKg: 14, yieldPct: 75, methods: ["Pan-sear", "Roast"] },
      { name: "Tenderloin", costPerKg: 15, yieldPct: 85, methods: ["Grill", "Stir-fry"] },
    ],
  },
  {
    id: "wing",
    label: "Wing",
    left: "5%", top: "30%", width: "15%", height: "25%",
    cuts: [
      { name: "Wingettes", costPerKg: 8, yieldPct: 55, methods: ["Grill", "BBQ", "Fry"] },
      { name: "Drumettes", costPerKg: 9, yieldPct: 58, methods: ["BBQ", "Fry"] },
    ],
  },
  {
    id: "thigh",
    label: "Thigh",
    left: "50%", top: "35%", width: "25%", height: "25%",
    cuts: [
      { name: "Thigh Fillet", costPerKg: 10, yieldPct: 72, methods: ["Grill", "Braise", "Stir-fry"] },
      { name: "Bone-in Thigh", costPerKg: 8, yieldPct: 68, methods: ["Roast", "Braise"] },
    ],
  },
  {
    id: "drumstick",
    label: "Drumstick",
    left: "60%", top: "60%", width: "20%", height: "35%",
    cuts: [
      { name: "Drumstick", costPerKg: 7, yieldPct: 65, methods: ["Roast", "Grill", "Braise"] },
    ],
  },
  {
    id: "back",
    label: "Back",
    left: "35%", top: "10%", width: "25%", height: "25%",
    cuts: [
      { name: "Carcass / Back", costPerKg: 4, yieldPct: 40, methods: ["Stock", "Braise"] },
    ],
  },
  {
    id: "neck",
    label: "Neck",
    left: "10%", top: "5%", width: "15%", height: "20%",
    cuts: [
      { name: "Neck", costPerKg: 3, yieldPct: 35, methods: ["Stock"] },
    ],
  },
];

const FISH_ZONES: PrimalZone[] = [
  {
    id: "head",
    label: "Head",
    left: "0%", top: "15%", width: "18%", height: "55%",
    cuts: [
      { name: "Head", costPerKg: 6, yieldPct: 30, methods: ["Stock", "Roast"] },
    ],
  },
  {
    id: "collar",
    label: "Collar",
    left: "18%", top: "15%", width: "12%", height: "55%",
    cuts: [
      { name: "Collar", costPerKg: 18, yieldPct: 60, methods: ["Grill", "Braise"] },
    ],
  },
  {
    id: "belly",
    label: "Belly",
    left: "30%", top: "55%", width: "25%", height: "25%",
    cuts: [
      { name: "Belly", costPerKg: 22, yieldPct: 70, methods: ["Grill", "Sashimi", "Pan-sear"] },
    ],
  },
  {
    id: "loin",
    label: "Loin",
    left: "30%", top: "15%", width: "25%", height: "40%",
    cuts: [
      { name: "Loin Fillet", costPerKg: 38, yieldPct: 85, methods: ["Pan-sear", "Grill", "Roast"] },
    ],
  },
  {
    id: "fillet",
    label: "Fillet",
    left: "55%", top: "15%", width: "25%", height: "55%",
    cuts: [
      { name: "Side Fillet", costPerKg: 32, yieldPct: 80, methods: ["Pan-sear", "Poach", "Bake"] },
      { name: "Portions", costPerKg: 35, yieldPct: 90, methods: ["Pan-sear", "Grill"] },
    ],
  },
  {
    id: "tail",
    label: "Tail",
    left: "80%", top: "20%", width: "18%", height: "45%",
    cuts: [
      { name: "Tail Fillet", costPerKg: 28, yieldPct: 75, methods: ["Grill", "Pan-sear"] },
    ],
  },
];

export const ANIMAL_CHARTS: AnimalChart[] = [
  {
    id: "beef",
    name: "Beef",
    image: require("../../assets/images/butchery/beef-chart.png"),
    zones: BEEF_ZONES,
  },
  {
    id: "lamb",
    name: "Lamb",
    image: require("../../assets/images/butchery/lamb-chart.png"),
    zones: LAMB_ZONES,
  },
  {
    id: "pork",
    name: "Pork",
    image: require("../../assets/images/butchery/pork-chart.png"),
    zones: PORK_ZONES,
  },
  {
    id: "chicken",
    name: "Chicken",
    image: require("../../assets/images/butchery/chicken-chart.png"),
    zones: CHICKEN_ZONES,
  },
  {
    id: "fish",
    name: "Fish (Coral Trout)",
    image: require("../../assets/images/butchery/fish-chart.png"),
    zones: FISH_ZONES,
  },
];
