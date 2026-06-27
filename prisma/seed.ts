import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Image pool gathered via image-search (OSS-hosted, stable URLs)
const IMG = {
  hero: [
    "https://sfile.chatglm.cn/images-ppt/8e30e66b1b0c.jpg",
    "https://sfile.chatglm.cn/images-ppt/dab9ab04285b.png",
    "https://sfile.chatglm.cn/images-ppt/8c1d0eb33cc3.jpg",
    "https://sfile.chatglm.cn/images-ppt/3c1d82ffa132.png",
    "https://sfile.chatglm.cn/images-ppt/436e5f5c4ddd.jpg",
    "https://sfile.chatglm.cn/images-ppt/5a0a32ed3cb4.jpg",
  ],
  cover1: [
    "https://sfile.chatglm.cn/images-ppt/37337b6c434d.jpg",
    "https://sfile.chatglm.cn/images-ppt/7819e6a18185.jpg",
    "https://sfile.chatglm.cn/images-ppt/cd7d8e92f69e.jpg",
    "https://sfile.chatglm.cn/images-ppt/70ef91804fec.jpg",
  ],
  architect: [
    "https://sfile.chatglm.cn/images-ppt/3b680d8378bc.jpg",
    "https://sfile.chatglm.cn/images-ppt/8f4e6251a18e.jpg",
    "https://sfile.chatglm.cn/images-ppt/281f06298bd3.jpg",
    "https://sfile.chatglm.cn/images-ppt/9eff3f8d589e.jpeg",
  ],
  construction: [
    "https://sfile.chatglm.cn/images-ppt/8c5d4ddc1144.jpg",
    "https://sfile.chatglm.cn/images-ppt/fa3f33583eb0.png",
    "https://sfile.chatglm.cn/images-ppt/9e20b55b55ba.jpg",
    "https://sfile.chatglm.cn/images-ppt/fecf0fc42e77.jpg",
  ],
  interior: [
    "https://sfile.chatglm.cn/images-ppt/b1ebb6d771cc.jpg",
    "https://sfile.chatglm.cn/images-ppt/fd5feaa0c8a4.jpg",
    "https://sfile.chatglm.cn/images-ppt/25377edacb11.jpg",
    "https://sfile.chatglm.cn/images-ppt/00e501dac9aa.jpg",
  ],
  electrical: [
    "https://sfile.chatglm.cn/images-ppt/1c2ab6abeda9.jpg",
    "https://sfile.chatglm.cn/images-ppt/3ac0d56fb3eb.jpeg",
    "https://sfile.chatglm.cn/images-ppt/b913c9bc1233.jpg",
  ],
  plumbing: [
    "https://sfile.chatglm.cn/images-ppt/329d4f8b9298.jpg",
    "https://sfile.chatglm.cn/images-ppt/d426e9c26ce5.jpg",
    "https://sfile.chatglm.cn/images-ppt/a6fa2e308281.jpg",
  ],
  painting: [
    "https://sfile.chatglm.cn/images-ppt/7ec16c8a5ba6.jpg",
    "https://sfile.chatglm.cn/images-ppt/61adf4a79922.jpg",
    "https://sfile.chatglm.cn/images-ppt/2ba7c31cafb2.jpeg",
  ],
  renovation: [
    "https://sfile.chatglm.cn/images-ppt/07ec9a65be68.jpg",
    "https://sfile.chatglm.cn/images-ppt/700dd92fe7dc.jpg",
    "https://sfile.chatglm.cn/images-ppt/f4b96c79156c.jpg",
  ],
  landscape: [
    "https://sfile.chatglm.cn/images-ppt/cee8e6d47ae7.jpg",
    "https://sfile.chatglm.cn/images-ppt/97addfb6ffd6.jpg",
    "https://sfile.chatglm.cn/images-ppt/a5076209fb20.jpg",
  ],
  kitchen: [
    "https://sfile.chatglm.cn/images-ppt/a8b838aa0007.jpg",
    "https://sfile.chatglm.cn/images-ppt/9d9b1929a114.jpg",
    "https://sfile.chatglm.cn/images-ppt/2569b25287dd.png",
    "https://sfile.chatglm.cn/images-ppt/2038498a8deb.jpg",
  ],
  bathroom: [
    "https://sfile.chatglm.cn/images-ppt/f0e959e55191.jpg",
    "https://sfile.chatglm.cn/images-ppt/5416ee57cd17.jpg",
    "https://sfile.chatglm.cn/images-ppt/8ecaffadf6e4.jpg",
  ],
  bedroom: [
    "https://sfile.chatglm.cn/images-ppt/18fe80c4b928.jpg",
    "https://sfile.chatglm.cn/images-ppt/690f62759a76.png",
    "https://sfile.chatglm.cn/images-ppt/6aa5a35874b9.jpg",
  ],
  stair: [
    "https://sfile.chatglm.cn/images-ppt/ce74322e3bf1.jpg",
    "https://sfile.chatglm.cn/images-ppt/8394b16c0f34.jpg",
    "https://sfile.chatglm.cn/images-ppt/ccf582470e0d.jpg",
  ],
};

const categories = [
  { name: "House Construction", slug: "house-construction", icon: "Home", description: "Build your dream home from foundation to rooftop with verified builders.", imageUrl: IMG.construction[0], keywords: "builder,construction,house,villa,building,civil", sortOrder: 1 },
  { name: "Interior Design", slug: "interior-design", icon: "Sofa", description: "Transform spaces with expert interior designers and decorators.", imageUrl: IMG.interior[0], keywords: "interior,design,decor,modular,home", sortOrder: 2 },
  { name: "Architecture", slug: "architecture", icon: "Ruler", description: "Custom house plans, 3D elevations and structural drawings.", imageUrl: IMG.architect[0], keywords: "architect,plan,elevation,design,drawing", sortOrder: 3 },
  { name: "Electrical", slug: "electrical", icon: "Zap", description: "Wiring, fittings, solar and smart home electrical solutions.", imageUrl: IMG.electrical[0], keywords: "electrician,wiring,solar,electrical,cctv", sortOrder: 4 },
  { name: "Plumbing", slug: "plumbing", icon: "Droplets", description: "Sanitary, piping, water proofing and drainage specialists.", imageUrl: IMG.plumbing[0], keywords: "plumber,piping,plumbing,sanitary,water", sortOrder: 5 },
  { name: "Painting", slug: "painting", icon: "PaintRoller", description: "Interior, exterior, texture and waterproof painting services.", imageUrl: IMG.painting[0], keywords: "painting,painter,texture,wall,color", sortOrder: 6 },
  { name: "Renovation", slug: "renovation", icon: "Hammer", description: "Full home and kitchen remodels, restoration and upgrades.", imageUrl: IMG.renovation[0], keywords: "renovation,remodel,upgrade,restore,repair", sortOrder: 7 },
  { name: "Landscaping", slug: "landscaping", icon: "Trees", description: "Gardens, patios, hardscaping and outdoor living design.", imageUrl: IMG.landscape[0], keywords: "landscape,garden,outdoor,lawn,patio", sortOrder: 8 },
];

type ProviderSeed = {
  companyName: string;
  slug: string;
  tagline: string;
  description: string;
  about: object;
  logoUrl?: string;
  coverUrl: string;
  categorySlug: string;
  services: string[];
  experience: number;
  employees: number;
  projectsCount: number;
  startingPrice: number;
  priceUnit: string;
  verified: boolean;
  premium: boolean;
  featured: boolean;
  workingAreas: string[];
  officeAddress: string;
  languages: string[];
  responseTime: string;
  email: string;
  phone: string;
  website?: string;
  certificates: string[];
  packages: object[];
  projects: { title: string; description: string; category: string; budget: number; area: string; location: string; durationWeeks: number; materials: string[]; images: string[]; clientName: string; clientReview: string; clientRating: number; tags: string[]; featured: boolean }[];
  reviews: { customerName: string; rating: number; title: string; review: string; projectType: string; verified: boolean }[];
};

const providers: ProviderSeed[] = [
  {
    companyName: "Skyline Constructions",
    slug: "skyline-constructions",
    tagline: "Building dreams, one foundation at a time",
    description: "Skyline Constructions is an award-winning residential builder delivering premium villas and apartments across South India for over 18 years. We combine modern engineering with timeless craftsmanship.",
    about: {
      mission: "To make quality home construction transparent, affordable and stress-free for every family.",
      vision: "To be the most trusted construction brand in India by 2030.",
      usp: "Fixed-price contracts, milestone-based payments, and a dedicated project manager for every home.",
      why: ["ISO 9001 certified quality process", "In-house architects & engineers", "Real-time site updates via app", "10-year structural warranty"],
    },
    coverUrl: IMG.hero[0],
    categorySlug: "house-construction",
    services: ["Villa Construction", "Apartment Construction", "G+4 Residential", "Commercial Buildings", "Turnkey Projects"],
    experience: 18,
    employees: 240,
    projectsCount: 156,
    startingPrice: 1850,
    priceUnit: "sqft",
    verified: true,
    premium: true,
    featured: true,
    workingAreas: ["Bengaluru", "Mysuru", "Hyderabad", "Chennai"],
    officeAddress: "4th Floor, Prestige Tower, MG Road, Bengaluru 560001",
    languages: ["English", "Kannada", "Hindi", "Tamil"],
    responseTime: "Under 2 hours",
    email: "hello@skylineconstructions.in",
    phone: "+91 80456 12300",
    website: "skylineconstructions.in",
    certificates: ["GST Registered", "ISO 9001:2015", "CREDAI Member", "Trade License", "₹2 Cr Insurance"],
    packages: [
      { name: "Economy", price: 1850, priceUnit: "sqft", desc: "Quality construction at a smart price", features: ["Vitrified flooring", "Standard CP & fittings", "Borewell + Cauvery water", "Basic elevation"] },
      { name: "Premium", price: 2350, priceUnit: "sqft", desc: "Most popular package for modern homes", features: ["Premium vitrified tiles", "Jaquar CP fittings", "Modular kitchen ready", "Designer elevation", "Solar water heater"] },
      { name: "Luxury", price: 3200, priceUnit: "sqft", desc: "Bespoke luxury with imported finishes", features: ["Italian marble flooring", "Imported CP & sanitaryware", "Smart home automation", "Home theatre setup", "Landscaped terrace"] },
    ],
    projects: [
      { title: "The Whitefield Villa", description: "A 4BHK contemporary villa with basement home theatre, infinity roof terrace and smart automation across 3,800 sqft.", category: "Villa Construction", budget: 12160000, area: "3800 sqft", location: "Whitefield, Bengaluru", durationWeeks: 52, materials: ["Italian marble", "UPVC windows", "Jaquar fittings", "Solar panels"], images: [IMG.hero[1], IMG.construction[1], IMG.stair[0]], clientName: "Rahul & Priya Menon", clientReview: "Skyline delivered our dream home ahead of schedule with exceptional quality. The project app kept us updated daily.", clientRating: 5, tags: ["Villa", "Smart Home", "Luxury"], featured: true },
      { title: "Jayanthi Garden Apartments", description: "G+4 residential apartment complex with 20 premium 3BHK units, amenities and rooftop pool.", category: "Apartment Construction", budget: 68000000, area: "32000 sqft", location: "HSR Layout, Bengaluru", durationWeeks: 80, materials: ["RCC frame", "Vitrified flooring", "Aluminium windows"], images: [IMG.hero[2], IMG.cover1[0]], clientName: "Jayanthi Properties", clientReview: "Professional team, transparent billing and a beautiful end product. Highly recommend for large projects.", clientRating: 5, tags: ["Apartment", "Commercial"], featured: false },
      { title: "The Lakeside Bungalow", description: "Sprawling 5BHK bungalow with courtyard, water feature and traditional-contemporary fusion architecture.", category: "Bungalow Construction", budget: 9800000, area: "4200 sqft", location: "Devanahalli, Bengaluru", durationWeeks: 64, materials: ["Stone cladding", "Wooden rafters", "Landscaped garden"], images: [IMG.cover1[1], IMG.landscape[1]], clientName: "Anil Kumar", clientReview: "Beautiful craftsmanship and attention to detail. The team understood our vision perfectly.", clientRating: 4, tags: ["Bungalow", "Heritage"], featured: false },
    ],
    reviews: [
      { customerName: "Rahul Menon", rating: 5, title: "Exceeded all expectations", review: "From design to handover, Skyline was professional and transparent. The daily site updates on their app gave us complete peace of mind. Quality of construction is top-notch.", projectType: "Villa Construction", verified: true },
      { customerName: "Sneha Reddy", rating: 5, title: "Best builder in Bangalore", review: "We compared 6 builders before choosing Skyline. Their fixed-price contract and milestone payments meant no surprises. Highly recommend!", projectType: "Home Construction", verified: true },
      { customerName: "Vikram Shetty", rating: 4, title: "Great quality, slight delay", review: "Construction quality is excellent and the team is responsive. There was a 3-week delay due to monsoon but they communicated proactively.", projectType: "Villa Construction", verified: true },
      { customerName: "Lakshmi Iyer", rating: 5, title: "Dream home delivered", review: "The luxury package was worth every rupee. Italian marble, smart automation, the works. Our home looks like a magazine cover.", projectType: "Luxury Villa", verified: true },
    ],
  },
  {
    companyName: "SpaceCraft Architects",
    slug: "spacecraft-architects",
    tagline: "Designing spaces that tell your story",
    description: "SpaceCraft is a multi-disciplinary architecture studio crafting sustainable, human-centred spaces. We blend contemporary design with vernacular wisdom to create homes that breathe.",
    about: {
      mission: "To design buildings that are beautiful, sustainable and deeply functional.",
      vision: "Lead the shift toward climate-responsive architecture in India.",
      usp: "Every project starts with a free 3D concept walkthrough before you commit.",
      why: ["COA-registered architects", "Passive design specialists", "VR walkthroughs included", "Green building certified"],
    },
    coverUrl: IMG.architect[1],
    categorySlug: "architecture",
    services: ["House Plans", "3D Elevation", "Structural Design", "Interior Concepts", "Landscape Design", "VR Walkthroughs"],
    experience: 12,
    employees: 28,
    projectsCount: 210,
    startingPrice: 35,
    priceUnit: "sqft",
    verified: true,
    premium: true,
    featured: true,
    workingAreas: ["Bengaluru", "Pune", "Coimbatore", "Kochi"],
    officeAddress: "Studio 12, Indiranagar 100ft Road, Bengaluru 560038",
    languages: ["English", "Hindi", "Tamil", "Malayalam"],
    responseTime: "Under 1 hour",
    email: "studio@spacecraftarch.in",
    phone: "+91 98453 22110",
    website: "spacecraftarch.in",
    certificates: ["COA Registered", "IGBC AP Certified", "GST Registered", "AIA Member"],
    packages: [
      { name: "Concept", price: 35, priceUnit: "sqft", desc: "2D plans + 3D elevation", features: ["Floor plans (2 options)", "3D front elevation", "2 revisions", "Basic BOQ"] },
      { name: "Complete", price: 65, priceUnit: "sqft", desc: "Full architectural set with VR", features: ["Detailed working drawings", "3D walkthrough (VR)", "Structural drawings", "MEP coordination", "5 revisions"] },
      { name: "Signature", price: 110, priceUnit: "sqft", desc: "Bespoke design + supervision", features: ["Custom signature design", "Unlimited revisions", "Site supervision visits", "Material selection support", "Landscape concept"] },
    ],
    projects: [
      { title: "The Courtyard House", description: "Climate-responsive home with central courtyard, rainwater harvesting and passive cooling. Featured in Architectural Digest India.", category: "Residential Design", budget: 850000, area: "3200 sqft", location: "Koramangala, Bengaluru", durationWeeks: 8, materials: ["Laterite stone", "Mangalore tiles", "Terrazzo"], images: [IMG.architect[2], IMG.interior[2], IMG.stair[1]], clientName: "Dr. Arjun Nair", clientReview: "SpaceCraft designed a home that stays cool without AC. Brilliant passive design and stunning aesthetics.", clientRating: 5, tags: ["Sustainable", "Passive", "Award"], featured: true },
      { title: "Riverstone Villa", description: "Modern villa inspired by river pebbles, with curved forms and natural materials blending into the landscape.", category: "Villa Design", budget: 1200000, area: "4500 sqft", location: "Coimbatore", durationWeeks: 10, materials: ["Stacked stone", "Exposed concrete", "Glass"], images: [IMG.architect[3], IMG.hero[3]], clientName: "Karthik Subramaniam", clientReview: "The VR walkthrough before construction helped us finalize every detail. Innovative and thoughtful design.", clientRating: 5, tags: ["Modern", "Villa"], featured: false },
      { title: "Urban Townhouse", description: "Compact 3-storey townhouse maximizing light and ventilation on a narrow plot.", category: "Townhouse", budget: 540000, area: "1800 sqft", location: "Pune", durationWeeks: 6, materials: ["Brick", "Steel", "Glass"], images: [IMG.cover1[2], IMG.interior[3]], clientName: "Aditya Joshi", clientReview: "They turned our tiny plot into a spacious, light-filled home. Genius space planning.", clientRating: 4, tags: ["Urban", "Compact"], featured: false },
    ],
    reviews: [
      { customerName: "Dr. Arjun Nair", rating: 5, title: "Visionary architects", review: "They truly listen. Our home is a piece of art that also happens to be the most comfortable house we've lived in. The passive cooling design saves us a fortune.", projectType: "House Design", verified: true },
      { customerName: "Meera Krishnan", rating: 5, title: "Innovative and reliable", review: "The VR walkthrough was a game-changer. We could see and feel our home before a single brick was laid. Worth every penny.", projectType: "Villa Design", verified: true },
      { customerName: "Sanjay Gupta", rating: 4, title: "Great design, premium pricing", review: "Design quality is exceptional but pricing is on the higher side. That said, you get what you pay for. No regrets.", projectType: "House Plan", verified: true },
    ],
  },
  {
    companyName: "Luxe Interiors Studio",
    slug: "luxe-interiors-studio",
    tagline: "Where luxury meets livability",
    description: "Luxe Interiors Studio creates bespoke interiors for discerning homeowners. From concept to installation, we handle everything end-to-end with a 90-day delivery promise.",
    about: {
      mission: "To make luxury interiors accessible, hassle-free and durable.",
      vision: "Become India's most loved interior design brand.",
      usp: "End-to-end execution with a single point of contact and a 10-year warranty on workmanship.",
      why: ["In-house manufacturing unit", "90-day delivery promise", "10-year warranty", "Premium brand partnerships"],
    },
    coverUrl: IMG.interior[1],
    categorySlug: "interior-design",
    services: ["Full Home Interiors", "Modular Kitchen", "Modular Wardrobes", "Living & Dining", "Master Bedroom", "False Ceiling"],
    experience: 9,
    employees: 65,
    projectsCount: 480,
    startingPrice: 1450,
    priceUnit: "sqft",
    verified: true,
    premium: true,
    featured: true,
    workingAreas: ["Bengaluru", "Hyderabad", "Mumbai", "Delhi NCR"],
    officeAddress: "2nd Floor, Phoenix Marketcity, Whitefield, Bengaluru 560048",
    languages: ["English", "Hindi", "Kannada", "Telugu"],
    responseTime: "Under 3 hours",
    email: "design@luxeinteriors.in",
    phone: "+91 90190 33445",
    website: "luxeinteriors.in",
    certificates: ["GST Registered", "ISO 9001", "Hettich Partner", "GreenPro Certified"],
    packages: [
      { name: "Essential", price: 1450, priceUnit: "sqft", desc: "Smart interiors for modern living", features: ["Modular kitchen", "2 wardrobes", "TV unit", "Master bedroom"] },
      { name: "Signature", price: 2100, priceUnit: "sqft", desc: "Designer interiors with premium finishes", features: ["Complete home interiors", "Designer false ceiling", "Premium laminates", "Ambient lighting", "Décor styling"] },
      { name: "Bespoke", price: 3200, priceUnit: "sqft", desc: "Ultra-luxury custom interiors", features: ["Italian finishes", "Smart home integration", "Custom furniture", "Art curation", "Concierge service"] },
    ],
    projects: [
      { title: "Prestige Lakeside 3BHK", description: "Complete interiors for a 3BHK apartment with Italian kitchen, statement living wall and master suite.", category: "Full Home Interiors", budget: 1850000, area: "1650 sqft", location: "Whitefield, Bengaluru", durationWeeks: 11, materials: ["Italian laminate", "Quartz countertop", "Hettich fittings", "LED lighting"], images: [IMG.kitchen[0], IMG.interior[0], IMG.bedroom[0]], clientName: "Pooja & Karthik", clientReview: "Delivered in 84 days, exactly as promised. The kitchen is a dream to cook in. Worth every rupee!", clientRating: 5, tags: ["Apartment", "Modular", "Premium"], featured: true },
      { title: "Villa Italia", description: "Ultra-luxury villa interiors with imported marble, custom furniture and full smart-home integration.", category: "Luxury Villa Interiors", budget: 5200000, area: "4200 sqft", location: "Jubilee Hills, Hyderabad", durationWeeks: 22, materials: ["Italian marble", "Veneer", "Brass accents", "Smart automation"], images: [IMG.kitchen[1], IMG.bedroom[1], IMG.stair[2]], clientName: "The Reddy Family", clientReview: "Luxe transformed our villa into a 5-star resort. The attention to detail is unmatched.", clientRating: 5, tags: ["Luxury", "Villa", "Smart Home"], featured: true },
      { title: "Urban Minimalist Loft", description: "Compact 2BHK with space-saving modular furniture and a calm Japandi aesthetic.", category: "Apartment Interiors", budget: 780000, area: "1100 sqft", location: "Indiranagar, Bengaluru", durationWeeks: 8, materials: ["Oak veneer", "Microcement", "Black steel"], images: [IMG.kitchen[2], IMG.interior[3]], clientName: "Rhea Kapoor", clientReview: "They maximized every inch of my small apartment. Looks spacious and feels luxurious.", clientRating: 4, tags: ["Minimalist", "Compact"], featured: false },
    ],
    reviews: [
      { customerName: "Pooja Sharma", rating: 5, title: "On-time, on-budget, beautiful", review: "The 90-day promise is real! They finished our 3BHK in 84 days and the quality is outstanding. Project manager was always reachable.", projectType: "Full Home Interiors", verified: true },
      { customerName: "Arjun Pillai", rating: 5, title: "Stunning modular kitchen", review: "The kitchen is the heart of our home now. Hettich fittings glide like butter. Highly recommend Luxe for modular work.", projectType: "Modular Kitchen", verified: true },
      { customerName: "Divya Raghavan", rating: 4, title: "Great work, minor delays", review: "Quality is fantastic but our project ran 2 weeks over. Communication was good throughout though. Final result is gorgeous.", projectType: "Full Home Interiors", verified: true },
      { customerName: "Nikhil Verma", rating: 5, title: "Best interior decision", review: "Compared 4 designers and Luxe won on design + price transparency. No hidden charges. The 10-year warranty gave us confidence.", projectType: "Full Home Interiors", verified: true },
    ],
  },
  {
    companyName: "Structura Civil Contractors",
    slug: "structura-civil-contractors",
    tagline: "Strong foundations, solid futures",
    description: "Structura delivers reliable civil construction services for residential and small commercial projects. We specialize in structural integrity, timely delivery and fair pricing.",
    about: {
      mission: "Provide honest, high-quality civil construction at fair prices.",
      vision: "Be the go-to civil contractor for Tier-2 cities across South India.",
      usp: "Transparent BOQ-based pricing with no cost overruns, guaranteed in writing.",
      why: ["15+ years experience", "Licensed civil engineers", "Written cost guarantee", "Quality material sourcing"],
    },
    coverUrl: IMG.construction[1],
    categorySlug: "house-construction",
    services: ["Residential Construction", "Foundation & RCC", "Compound Walls", "Rewaterproofing", "Site Development"],
    experience: 15,
    employees: 80,
    projectsCount: 95,
    startingPrice: 1650,
    priceUnit: "sqft",
    verified: true,
    premium: false,
    featured: false,
    workingAreas: ["Bengaluru", "Tumkur", "Mysuru", "Hassan"],
    officeAddress: "No. 22, Industrial Area, Peenya, Bengaluru 560058",
    languages: ["Kannada", "English", "Hindi"],
    responseTime: "Under 6 hours",
    email: "info@structura.in",
    phone: "+91 80283 99001",
    certificates: ["GST Registered", "Civil Engineer Licensed", "MSME Registered", "Labour Insurance"],
    packages: [
      { name: "Standard", price: 1650, priceUnit: "sqft", desc: "Quality civil construction", features: ["RCC frame", "Brick walls", "Cement plaster", "Basic flooring"] },
      { name: "Premium", price: 1950, priceUnit: "sqft", desc: "Upgraded finishes", features: ["Premium flooring", "Quality CP", "Waterproofing", "Painted finish"] },
    ],
    projects: [
      { title: "Sai Residency G+2", description: "Residential building with 6 apartments, built with RCC frame and premium finishes.", category: "Residential Building", budget: 5400000, area: "7200 sqft", location: "Tumkur", durationWeeks: 48, materials: ["RCC", "Red bricks", "Vitrified tiles"], images: [IMG.construction[2], IMG.hero[4]], clientName: "Sai Developers", clientReview: "Honest contractor who delivered on time and within budget. Will hire again.", clientRating: 4, tags: ["Residential", "Apartments"], featured: false },
      { title: "Green Valley Villa", description: "Independent 3BHK villa with garden and car porch.", category: "Villa Construction", budget: 3850000, area: "2200 sqft", location: "Mysuru", durationWeeks: 40, materials: ["RCC", "Solid blocks", "Marble"], images: [IMG.construction[3], IMG.cover1[3]], clientName: "Manjunath Gowda", clientReview: "Good quality construction at a fair price. Transparent billing throughout.", clientRating: 4, tags: ["Villa", "Independent"], featured: false },
    ],
    reviews: [
      { customerName: "Manjunath Gowda", rating: 4, title: "Reliable and honest", review: "Structura gave us a written cost guarantee and stuck to it. No hidden charges. Construction quality is solid.", projectType: "Villa Construction", verified: true },
      { customerName: "Venkatesh R", rating: 4, title: "Good value for money", review: "Not the fanciest, but honest work at fair prices. Delivered our apartment project on schedule.", projectType: "Residential Building", verified: true },
      { customerName: "Shashidhar B", rating: 5, title: "Trustworthy contractor", review: "After being cheated by a previous contractor, Structura restored my faith. Transparent BOQ, quality materials, no shortcuts.", projectType: "Home Construction", verified: true },
    ],
  },
  {
    companyName: "VoltPro Electrical Solutions",
    slug: "voltpro-electrical-solutions",
    tagline: "Powering your spaces, safely",
    description: "VoltPro is your licensed electrical partner for residential and commercial wiring, solar installations, smart home automation and CCTV. ESA-certified electricians at your service.",
    about: {
      mission: "Make every home electrically safe, efficient and smart.",
      vision: "Power 1 lakh homes with clean solar energy by 2028.",
      usp: "Same-day service in Bengaluru with a 1-year warranty on all installations.",
      why: ["ESA licensed electricians", "Same-day response", "Genuine brand materials", "1-year service warranty"],
    },
    coverUrl: IMG.electrical[1],
    categorySlug: "electrical",
    services: ["House Wiring", "Solar Installation", "CCTV & Security", "Smart Home Automation", "Electrical Audits", "EV Charging Setup"],
    experience: 11,
    employees: 34,
    projectsCount: 720,
    startingPrice: 45,
    priceUnit: "sqft",
    verified: true,
    premium: false,
    featured: false,
    workingAreas: ["Bengaluru", "Mysuru", "Mangaluru"],
    officeAddress: "Shop 5, Rajajinagar Industrial Estate, Bengaluru 560010",
    languages: ["Kannada", "English", "Hindi", "Tamil"],
    responseTime: "Same day",
    email: "service@voltpro.in",
    phone: "+91 90080 11223",
    certificates: ["ESA Licensed", "GST Registered", "Luminous Partner", "Hikvision Certified"],
    packages: [
      { name: "Basic Wiring", price: 45, priceUnit: "sqft", desc: "Complete house wiring", features: ["Concealed wiring", "Anchor Roma switches", "MCB & DB", "Earthing"] },
      { name: "Smart Home", price: 120, priceUnit: "sqft", desc: "Wiring + smart automation", features: ["Full wiring", "Smart switches", "App control", "Voice automation", "CCTV 4 cameras"] },
    ],
    projects: [
      { title: "5kW Rooftop Solar — Jayanagar", description: "Grid-tied 5kW solar system with net metering for a 3BHK home.", category: "Solar Installation", budget: 320000, area: "5 kW", location: "Jayanagar, Bengaluru", durationWeeks: 2, materials: ["Mono PERC panels", "Solar inverter", "Galvanized structure"], images: [IMG.electrical[0], IMG.electrical[2]], clientName: "Suresh Babu", clientReview: "My electricity bill dropped from ₹4000 to ₹200. VoltPro's team was professional and quick.", clientRating: 5, tags: ["Solar", "Green Energy"], featured: true },
      { title: "Smart Home Automation — Hebbal", description: "Full home automation with 8-zone lighting, smart curtains and 6-camera CCTV.", category: "Smart Home", budget: 280000, area: "2400 sqft", location: "Hebbal, Bengaluru", durationWeeks: 3, materials: ["Smart relays", "CCTV cameras", "Smart curtain motors"], images: [IMG.electrical[1]], clientName: "Ananya Rao", clientReview: "Controlling my entire home from my phone is magical. Installation was clean and neat.", clientRating: 5, tags: ["Smart Home", "Automation"], featured: false },
    ],
    reviews: [
      { customerName: "Suresh Babu", rating: 5, title: "Solar paid for itself", review: "VoltPro installed our 5kW solar system flawlessly. Bill went from ₹4000 to ₹200. Highly recommend for solar.", projectType: "Solar Installation", verified: true },
      { customerName: "Ananya Rao", rating: 5, title: "Smart home experts", review: "They set up our entire home automation in 3 days with zero mess. The app works flawlessly. Great team.", projectType: "Smart Home", verified: true },
      { customerName: "Girish Pai", rating: 4, title: "Quick and professional", review: "Called for a wiring emergency, they came same day. Fixed the issue and did a full safety audit free of cost.", projectType: "Electrical Wiring", verified: true },
    ],
  },
  {
    companyName: "AquaFlow Plumbing Services",
    slug: "aquaflow-plumbing-services",
    tagline: "Smooth flow, zero worries",
    description: "AquaFlow handles all your plumbing needs — from new installations to leak repairs, bathroom fitting and waterproofing. Licensed plumbers, genuine materials, fair pricing.",
    about: {
      mission: "Deliver leak-free, hygienic plumbing that lasts decades.",
      vision: "Be Bengaluru's most trusted plumbing brand.",
      usp: "30-day no-leak guarantee on all installations, free re-service if any issue.",
      why: ["Licensed plumbers", "30-day leak guarantee", "Genuine branded fittings", "Upfront rate card"],
    },
    coverUrl: IMG.plumbing[1],
    categorySlug: "plumbing",
    services: ["Bathroom Fitting", "Kitchen Plumbing", "Waterproofing", "Pipe Installation", "Leak Detection", "Sanitary Installation"],
    experience: 8,
    employees: 22,
    projectsCount: 1240,
    startingPrice: 12000,
    priceUnit: "project",
    verified: false,
    premium: false,
    featured: false,
    workingAreas: ["Bengaluru"],
    officeAddress: "No. 14, Malleshwaram 8th Cross, Bengaluru 560003",
    languages: ["Kannada", "Hindi", "English"],
    responseTime: "Under 4 hours",
    email: "care@aquaflow.in",
    phone: "+91 74066 55432",
    certificates: ["GST Registered", "Plumber Licensed", "Jaquar Authorized"],
    packages: [
      { name: "Bathroom Fitting", price: 18000, priceUnit: "bathroom", desc: "Complete bathroom plumbing", features: ["CPVC piping", "Jaquar fittings", "Geyser point", "Drainage"] },
      { name: "Waterproofing", price: 65, priceUnit: "sqft", desc: "Terrace & bathroom waterproofing", features: ["Surface prep", "2-coat waterproofing", "Tile protection", "5-year warranty"] },
    ],
    projects: [
      { title: "3BHK Bathroom Upgrade", description: "Complete plumbing retrofit for 3 bathrooms with new fittings and waterproofing.", category: "Bathroom Plumbing", budget: 64000, area: "3 bathrooms", location: "HSR Layout, Bengaluru", durationWeeks: 2, materials: ["CPVC pipes", "Jaquar fittings", "Waterproofing compound"], images: [IMG.bathroom[0], IMG.bathroom[1]], clientName: "Kavya Reddy", clientReview: "No more leaks! AquaFlow's team was tidy and professional. Bathrooms look brand new.", clientRating: 5, tags: ["Bathroom", "Waterproofing"], featured: false },
      { title: "Terrace Waterproofing", description: "Full terrace waterproofing for a 2400 sqft independent house.", category: "Waterproofing", budget: 156000, area: "2400 sqft", location: "J P Nagar, Bengaluru", durationWeeks: 1, materials: ["Dr Fixit", "Cementitious coating"], images: [IMG.bathroom[2]], clientName: "Ramesh Iyer", clientReview: "Terrace was leaking for years. AquaFlow fixed it in 7 days. Monsoon tested, bone dry!", clientRating: 5, tags: ["Waterproofing", "Terrace"], featured: false },
    ],
    reviews: [
      { customerName: "Kavya Reddy", rating: 5, title: "Finally leak-free", review: "AquaFlow fixed years of bathroom leaks. The 30-day guarantee gave us confidence. Team was clean and professional.", projectType: "Bathroom Plumbing", verified: true },
      { customerName: "Ramesh Iyer", rating: 5, title: "Monsoon tested, no leaks", review: "Our terrace leaked every monsoon. AquaFlow waterproofed it and we've had zero issues since. Excellent work.", projectType: "Waterproofing", verified: true },
      { customerName: "Fatima Begum", rating: 4, title: "Good service, fair price", review: "Fixed our kitchen plumbing issue quickly. Rate card was transparent. Slightly pricey but quality work.", projectType: "Kitchen Plumbing", verified: false },
    ],
  },
  {
    companyName: "ColorCraft Painters",
    slug: "colorcraft-painters",
    tagline: "Color your world, perfectly",
    description: "ColorCraft brings 14 years of painting expertise to your doorstep. Interior, exterior, texture and stencil painting with genuine Asian/Berger paints and skilled craftsmanship.",
    about: {
      mission: "Deliver flawless, long-lasting paint jobs that transform spaces.",
      vision: "Make professional painting affordable and hassle-free.",
      usp: "Free color consultation with a designer and 3-year warranty on exterior painting.",
      why: ["Skilled painters", "Genuine branded paints", "Free color consultation", "3-year exterior warranty"],
    },
    coverUrl: IMG.painting[1],
    categorySlug: "painting",
    services: ["Interior Painting", "Exterior Painting", "Texture Painting", "Stencil Art", "Waterproof Painting", "Wood Polish"],
    experience: 14,
    employees: 45,
    projectsCount: 2100,
    startingPrice: 18,
    priceUnit: "sqft",
    verified: true,
    premium: false,
    featured: false,
    workingAreas: ["Bengaluru", "Mysuru", "Mangaluru", "Hubli"],
    officeAddress: "No. 88, KR Market, Bengaluru 560002",
    languages: ["Kannada", "Hindi", "English"],
    responseTime: "Under 8 hours",
    email: "paint@colorcraft.in",
    phone: "+91 99860 22118",
    certificates: ["GST Registered", "Asian Paints Authorized", "Berger Certified"],
    packages: [
      { name: "Economy", price: 18, priceUnit: "sqft", desc: "1 coat putty + 2 coats paint", features: ["Wall putty", "Tractor emulsion", "2 coats", "Basic colors"] },
      { name: "Premium", price: 32, priceUnit: "sqft", desc: "Premium emulsion with warranty", features: ["Acrylic putty", "Apex/Asian emulsion", "2+1 coats", "Designer colors", "2-year warranty"] },
      { name: "Luxury", price: 55, priceUnit: "sqft", desc: "Texture & luxury finishes", features: ["Texture putty", "Royal/Nerolac luxury", "Texture feature wall", "Stencil art", "5-year warranty"] },
    ],
    projects: [
      { title: "Modern 3BHK Interior Paint", description: "Full interior repaint with a designer accent wall in the living room.", category: "Interior Painting", budget: 86000, area: "2400 sqft", location: "Bellandur, Bengaluru", durationWeeks: 1, materials: ["Asian Paints Apex", "Acrylic putty", "Stencil"], images: [IMG.painting[0], IMG.painting[2]], clientName: "Sandeep Kulkarni", clientReview: "The accent wall looks stunning! ColorCraft's color consultant helped us pick the perfect palette.", clientRating: 5, tags: ["Interior", "Designer"], featured: false },
      { title: "Villa Exterior + Texture", description: "Complete exterior repaint with texture finish and waterproof coating.", category: "Exterior Painting", budget: 142000, area: "3200 sqft", location: "Yelahanka, Bengaluru", durationWeeks: 2, materials: ["Apex Ultima", "Texture coat", "Waterproof sealer"], images: [IMG.painting[1]], clientName: "The Fernandes Family", clientReview: "Our villa looks brand new. The texture finish is gorgeous and the team was meticulous.", clientRating: 5, tags: ["Exterior", "Texture"], featured: true },
    ],
    reviews: [
      { customerName: "Sandeep Kulkarni", rating: 5, title: "Flawless finish", review: "ColorCraft transformed our flat. The accent wall is Instagram-worthy! Clean work, no spills, on time.", projectType: "Interior Painting", verified: true },
      { customerName: "Maria Fernandes", rating: 5, title: "Villa looks brand new", review: "The exterior texture work is stunning. Crew covered all plants and cleaned up daily. 5-year warranty is reassuring.", projectType: "Exterior Painting", verified: true },
      { customerName: "Pradeep Hegde", rating: 4, title: "Good work, slight overrun", review: "Painting quality is excellent. Took 2 days longer than promised but they didn't charge extra. Happy overall.", projectType: "Interior Painting", verified: true },
    ],
  },
  {
    companyName: "RenewHome Renovation Experts",
    slug: "renewhome-renovation-experts",
    tagline: "Renew, restore, fall in love again",
    description: "RenewHome specializes in full-home renovations, kitchen and bathroom remodels. We bring old spaces back to life with minimal disruption and maximum impact.",
    about: {
      mission: "Make renovation stress-free, transparent and beautiful.",
      vision: "Be India's #1 home renovation brand by 2027.",
      usp: "Single-window renovation with a dedicated manager, daily progress photos and a fixed timeline.",
      why: ["Dedicated project manager", "Daily progress photos", "Fixed timeline contract", "Dust-free work zones"],
    },
    coverUrl: IMG.renovation[1],
    categorySlug: "renovation",
    services: ["Full Home Renovation", "Kitchen Remodel", "Bathroom Remodel", "Flooring Upgrade", "False Ceiling", "Electrical Upgrade"],
    experience: 10,
    employees: 55,
    projectsCount: 680,
    startingPrice: 950,
    priceUnit: "sqft",
    verified: true,
    premium: true,
    featured: false,
    workingAreas: ["Bengaluru", "Hyderabad", "Chennai"],
    officeAddress: "3rd Floor, Brigade Tower, Brigade Road, Bengaluru 560025",
    languages: ["English", "Kannada", "Hindi", "Tamil", "Telugu"],
    responseTime: "Under 2 hours",
    email: "renew@renewhome.in",
    phone: "+91 81470 99887",
    website: "renewhome.in",
    certificates: ["GST Registered", "ISO 9001", "CREDAI Member", "₹50L Insurance"],
    packages: [
      { name: "Essential", price: 950, priceUnit: "sqft", desc: "Refresh & modernize", features: ["Fresh paint", "New flooring", "Bathroom refresh", "Electrical touch-up"] },
      { name: "Complete", price: 1850, priceUnit: "sqft", desc: "Full makeover", features: ["Complete reflooring", "Modular kitchen", "2 bathroom remodels", "False ceiling", "Full repaint", "Electrical upgrade"] },
    ],
    projects: [
      { title: "15-Year-Old Flat Makeover", description: "Complete renovation of a 3BHK flat — new flooring, modular kitchen, 2 bathroom remodels and full repaint.", category: "Full Home Renovation", budget: 1650000, area: "1450 sqft", location: "Koramangala, Bengaluru", durationWeeks: 8, materials: ["Vitrified tiles", "Modular kitchen", "Jaquar fittings", "Asian Paints"], images: [IMG.renovation[0], IMG.kitchen[3], IMG.bathroom[0]], clientName: "The Sharma Family", clientReview: "Our 15-year-old flat looks brand new! RenewHome finished in 8 weeks with minimal mess. The daily photos were a nice touch.", clientRating: 5, tags: ["Renovation", "Apartment"], featured: true },
      { title: "Heritage Bungalow Restoration", description: "Sensitive restoration of a 1960s bungalow preserving its character while modernizing systems.", category: "Restoration", budget: 3800000, area: "3200 sqft", location: "Basavanagudi, Bengaluru", durationWeeks: 20, materials: ["Restored wood", "Lime plaster", "Modern fittings"], images: [IMG.renovation[1], IMG.stair[0], IMG.bedroom[2]], clientName: "Lakshmi Narayan", clientReview: "They respected the heritage of our home while making it modern. The restored wooden staircase is a masterpiece.", clientRating: 5, tags: ["Heritage", "Restoration"], featured: true },
    ],
    reviews: [
      { customerName: "Anil Sharma", rating: 5, title: "Flat looks brand new", review: "RenewHome gave our old flat a new lease of life. The project manager sent daily photos and kept us informed. 8 weeks, no stress.", projectType: "Full Home Renovation", verified: true },
      { customerName: "Lakshmi Narayan", rating: 5, title: "Heritage saved", review: "Restoring a 60-year-old bungalow is no easy task. RenewHome preserved its soul while adding modern comforts. Exceptional.", projectType: "Heritage Restoration", verified: true },
      { customerName: "Deepa Krishnan", rating: 4, title: "Great kitchen remodel", review: "Our modular kitchen remodel came out beautiful. Slight delay due to custom counter, but they communicated well.", projectType: "Kitchen Remodel", verified: true },
    ],
  },
  {
    companyName: "GreenScape Landscaping",
    slug: "greenscape-landscaping",
    tagline: "Bringing nature home",
    description: "GreenScape designs and builds outdoor spaces — gardens, patios, vertical walls and water features. We create living landscapes that grow more beautiful every year.",
    about: {
      mission: "Transform urban spaces into thriving green havens.",
      vision: "Green a million urban homes across India.",
      usp: "1-year free maintenance with every landscape project and a plant-survival guarantee.",
      why: ["Landscape architects on staff", "Native plant specialists", "1-year free maintenance", "Drip irrigation included"],
    },
    coverUrl: IMG.landscape[1],
    categorySlug: "landscaping",
    services: ["Garden Design", "Lawn Installation", "Vertical Gardens", "Hardscaping", "Water Features", "Drip Irrigation"],
    experience: 7,
    employees: 18,
    projectsCount: 340,
    startingPrice: 150,
    priceUnit: "sqft",
    verified: false,
    premium: false,
    featured: false,
    workingAreas: ["Bengaluru", "Mysuru"],
    officeAddress: "Survey 44, Sarjapur Road, Bengaluru 560035",
    languages: ["Kannada", "English", "Hindi"],
    responseTime: "Under 24 hours",
    email: "grow@greenscape.in",
    phone: "+91 97410 88551",
    certificates: ["GST Registered", "Horticulturist Certified"],
    packages: [
      { name: "Balcony Garden", price: 18000, priceUnit: "project", desc: "Balcony green makeover", features: ["Vertical garden", "Potted plants", "Decking", "Lighting"] },
      { name: "Garden Design", price: 150, priceUnit: "sqft", desc: "Full garden landscape", features: ["Lawn", "Flower beds", "Hardscaping", "Drip irrigation", "1-year maintenance"] },
    ],
    projects: [
      { title: "Terrace Garden — Indiranagar", description: "800 sqft rooftop garden with lawn, seating and vertical green walls.", category: "Terrace Garden", budget: 240000, area: "800 sqft", location: "Indiranagar, Bengaluru", durationWeeks: 3, materials: ["Artificial lawn", "Vertical panels", "Outdoor furniture"], images: [IMG.landscape[0], IMG.landscape[2]], clientName: "Anitha Rao", clientReview: "Our terrace is now our favorite room! GreenScape created a green paradise above the city.", clientRating: 5, tags: ["Terrace", "Urban"], featured: true },
      { title: "Villa Front Garden", description: "Landscape design for villa frontage with lawn, pathway and water feature.", category: "Garden Design", budget: 185000, area: "1200 sqft", location: "Sarjapur, Bengaluru", durationWeeks: 4, materials: ["Natural lawn", "Stone pathway", "Water fountain"], images: [IMG.landscape[1]], clientName: "Gururaj Deshpande", clientReview: "Beautiful garden, well maintained for a year free. Our villa entrance looks like a resort.", clientRating: 4, tags: ["Villa", "Garden"], featured: false },
    ],
    reviews: [
      { customerName: "Anitha Rao", rating: 5, title: "Terrace paradise", review: "GreenScape turned our boring terrace into a lush garden. We host dinners there every weekend now!", projectType: "Terrace Garden", verified: true },
      { customerName: "Gururaj Deshpande", rating: 4, title: "Lovely garden", review: "Good design and execution. The free maintenance for a year was valuable. A few plants didn't survive but they replaced them.", projectType: "Garden Design", verified: true },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding BuildCraft marketplace...");

  // Wipe existing
  await db.message.deleteMany();
  await db.quoteRequest.deleteMany();
  await db.review.deleteMany();
  await db.project.deleteMany();
  await db.provider.deleteMany();
  await db.category.deleteMany();

  // Categories
  const catMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await db.category.create({ data: c });
    catMap.set(c.slug, cat.id);
  }
  console.log(`  ✓ ${categories.length} categories`);

  // Providers + projects + reviews
  let projectCount = 0;
  let reviewCount = 0;
  for (const p of providers) {
    const created = await db.provider.create({
      data: {
        companyName: p.companyName,
        slug: p.slug,
        tagline: p.tagline,
        description: p.description,
        about: JSON.stringify(p.about),
        coverUrl: p.coverUrl,
        categoryId: catMap.get(p.categorySlug)!,
        services: p.services.join(", "),
        experience: p.experience,
        employees: p.employees,
        projectsCount: p.projectsCount,
        startingPrice: p.startingPrice,
        priceUnit: p.priceUnit,
        verified: p.verified,
        premium: p.premium,
        featured: p.featured,
        workingAreas: p.workingAreas.join(", "),
        officeAddress: p.officeAddress,
        languages: p.languages.join(", "),
        responseTime: p.responseTime,
        email: p.email,
        phone: p.phone,
        website: p.website,
        certificates: p.certificates.join(", "),
        packages: JSON.stringify(p.packages),
        views: Math.floor(Math.random() * 8000) + 1000,
        profileViews: Math.floor(Math.random() * 5000) + 500,
      },
    });

    for (const pr of p.projects) {
      await db.project.create({
        data: {
          providerId: created.id,
          title: pr.title,
          description: pr.description,
          category: pr.category,
          budget: pr.budget,
          area: pr.area,
          location: pr.location,
          durationWeeks: pr.durationWeeks,
          materials: pr.materials.join(", "),
          images: pr.images.join(","),
          clientName: pr.clientName,
          clientReview: pr.clientReview,
          clientRating: pr.clientRating,
          tags: pr.tags.join(", "),
          featured: pr.featured,
        },
      });
      projectCount++;
    }

    for (const r of p.reviews) {
      await db.review.create({
        data: {
          providerId: created.id,
          customerName: r.customerName,
          rating: r.rating,
          title: r.title,
          review: r.review,
          projectType: r.projectType,
          verified: r.verified,
        },
      });
      reviewCount++;
    }

    // recompute aggregate rating & count
    const agg = await db.review.aggregate({ where: { providerId: created.id }, _avg: { rating: true }, _count: true });
    await db.provider.update({
      where: { id: created.id },
      data: { rating: Number((agg._avg.rating ?? 5).toFixed(1)), reviewsCount: agg._count },
    });
  }
  console.log(`  ✓ ${providers.length} providers, ${projectCount} projects, ${reviewCount} reviews`);
  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
