/**
 * ÉLÉGANCE Atelier - API Service Layer
 * Integrates with DummyJSON Products API (https://dummyjson.com/docs/products)
 * Implements fetch with async/await, timeout handling, and graceful offline fallback.
 */

const API_CONFIG = {
  BASE_URL: 'https://dummyjson.com/products',
  TIMEOUT_MS: 7000,
  FASHION_CATEGORIES: [
    'womens-dresses',
    'womens-shoes',
    'womens-bags',
    'womens-jewellery',
    'womens-watches',
    'mens-shirts',
    'mens-shoes',
    'mens-watches',
    'sunglasses',
    'fragrances',
    'beauty',
    'tops'
  ]
};

// Fallback high-fashion catalog data (ensures 100% reliability offline or in restricted environments)
const FALLBACK_PRODUCTS = [
  {
    id: 101,
    title: "Silk Chiffon Evening Gown",
    description: "An ethereal floor-length evening gown tailored in pure mulberry silk chiffon with hand-pleated bodice, delicate sweetheart neckline, and sweeping cathedral drape.",
    category: "womens-dresses",
    price: 349.99,
    discountPercentage: 15.0,
    rating: 4.88,
    stock: 14,
    brand: "Élégance Couture",
    sku: "ELG-DR-101",
    warrantyInformation: "2 years designer warranty",
    shippingInformation: "Ships in 24 hours. Express courier.",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Breathtaking silhouette and opulent fabric.", reviewerName: "Claire Dupont", date: "2026-02-14" },
      { rating: 5, comment: "Wore this to a black-tie gala and received endless compliments.", reviewerName: "Victoria Sterling", date: "2026-03-02" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["evening", "silk", "couture", "dress"],
    thumbnail: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 102,
    title: "Italian Tailored Oxford Shirt",
    description: "Crisp two-ply Egyptian cotton dress shirt woven in Lombardy. Features Mother-of-pearl buttons, structured spread collar, and French cuffs.",
    category: "mens-shirts",
    price: 189.50,
    discountPercentage: 10.0,
    rating: 4.75,
    stock: 28,
    brand: "Sartoria Milano",
    sku: "ELG-SH-102",
    warrantyInformation: "Lifetime collar stitching guarantee",
    shippingInformation: "Complimentary priority shipping",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Finest cotton I have ever worn. Flawless stitch density.", reviewerName: "Julian Vance", date: "2026-01-20" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["formal", "cotton", "menswear", "luxury"],
    thumbnail: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15c429f66bf?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 103,
    title: "Monogram Leather Structured Tote",
    description: "Handcrafted calfskin leather tote bag accented with 24k gold-plated brass hardware, suede interior lining, and dual structured top handles.",
    category: "womens-bags",
    price: 495.00,
    discountPercentage: 20.0,
    rating: 4.95,
    stock: 9,
    brand: "Atelier Saint-Honoré",
    sku: "ELG-BG-103",
    warrantyInformation: "3-year leather artisan warranty",
    shippingInformation: "Hand-packaged in signature gift box",
    availabilityStatus: "Low Stock",
    reviews: [
      { rating: 5, comment: "Pure artisan luxury. The hardware luster is gorgeous.", reviewerName: "Eleanor Hayes", date: "2026-02-28" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["handbag", "leather", "accessories", "tote"],
    thumbnail: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 104,
    title: "Pointed Toe Stiletto Pumps",
    description: "Iconic 105mm stiletto heels sculpted in Italian patent calf leather with cushioned memory foam arch support and lacquered leather soles.",
    category: "womens-shoes",
    price: 275.00,
    discountPercentage: 12.0,
    rating: 4.82,
    stock: 19,
    brand: "Élégance Couture",
    sku: "ELG-SH-104",
    warrantyInformation: "1-year heel replacement service",
    shippingInformation: "Ships in 24 hours with satin dust bags",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Amazingly comfortable for a high stiletto. Striking look.", reviewerName: "Sophie Martin", date: "2026-03-05" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["shoes", "heels", "formal", "patent"],
    thumbnail: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 105,
    title: "Santorini Aviator Titanium Sunglasses",
    description: "Ultra-lightweight Japanese beta-titanium frames engineered with polarized Zeiss lenses offering 100% UV400 solar protection and anti-reflective coating.",
    category: "sunglasses",
    price: 220.00,
    discountPercentage: 15.0,
    rating: 4.70,
    stock: 22,
    brand: "Solstice Optique",
    sku: "ELG-SG-105",
    warrantyInformation: "2-year frame & lens protection",
    shippingInformation: "Hard leather case & cleaning cloth included",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Super lightweight, no nose-pad pressure. Crystal clarity.", reviewerName: "Marcus Sterling", date: "2026-01-18" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["eyewear", "titanium", "accessories", "sunglasses"],
    thumbnail: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 106,
    title: "Velvet Amber & Bergamot Eau de Parfum",
    description: "An intoxicating master perfume formulated in Grasse, France. Opening with sunlit Calabrian bergamot and blooming into Moroccan amber and smoked cedarwood.",
    category: "fragrances",
    price: 165.00,
    discountPercentage: 8.0,
    rating: 4.92,
    stock: 31,
    brand: "Parfums d'Hiver",
    sku: "ELG-FR-106",
    warrantyInformation: "Authenticity certified from Grasse",
    shippingInformation: "Secure climate-controlled courier",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Rich, sensual, and lingers for over 14 hours. Sublime.", reviewerName: "Camille Laurent", date: "2026-02-19" }
    ],
    returnPolicy: "Sealed box 30-day returns",
    tags: ["parfum", "fragrance", "luxury", "beauty"],
    thumbnail: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 107,
    title: "Pleated Silk Jacquard Cocktail Dress",
    description: "Dramatic emerald jewel-toned midi dress woven with metallic jacquard botanicals, asymmetric neckline, and waist-cinching sash.",
    category: "womens-dresses",
    price: 310.00,
    discountPercentage: 18.0,
    rating: 4.80,
    stock: 11,
    brand: "Élégance Couture",
    sku: "ELG-DR-107",
    warrantyInformation: "2 years boutique warranty",
    shippingInformation: "Ships in 24 hours",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "The emerald hue glows in evening light. Incredible cut!", reviewerName: "Amara Davies", date: "2026-03-01" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["cocktail", "emerald", "jacquard", "dress"],
    thumbnail: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 108,
    title: "Cashmere & Merino Ribbed Knit Sweater",
    description: "Sustainably sourced Grade-A Mongolian cashmere blended with ultrafine merino wool. Seamless circular knit for unparalleled warmth and drape.",
    category: "tops",
    price: 240.00,
    discountPercentage: 10.0,
    rating: 4.89,
    stock: 25,
    brand: "Sartoria Milano",
    sku: "ELG-TP-108",
    warrantyInformation: "Anti-pilling satisfaction promise",
    shippingInformation: "Complimentary standard shipping",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Like wearing a warm cloud. Zero scratchiness.", reviewerName: "David Thornton", date: "2026-02-11" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["cashmere", "sweater", "knitwear", "winter"],
    thumbnail: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 109,
    title: "18k Gold Pavé Diamond Huggie Earrings",
    description: "Solid 18-karat yellow gold earrings encrusted with 0.45 carats of conflict-free VS-clarity brilliant cut natural diamonds.",
    category: "womens-jewellery",
    price: 520.00,
    discountPercentage: 15.0,
    rating: 4.97,
    stock: 6,
    brand: "Maison Joaillerie",
    sku: "ELG-JW-109",
    warrantyInformation: "Lifetime diamond authenticity certificate",
    shippingInformation: "Insured courier with signature confirmation",
    availabilityStatus: "Low Stock",
    reviews: [
      { rating: 5, comment: "Sparkle is breathtaking in person. Clasp is very secure.", reviewerName: "Helena Rostova", date: "2026-03-08" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["jewellery", "gold", "diamonds", "earrings"],
    thumbnail: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 110,
    title: "Chronographe Royal Automatic Watch",
    description: "Swiss mechanical chronograph movement with 48-hour power reserve, sapphire crystal exhibition caseback, and hand-stitched alligator strap.",
    category: "mens-watches",
    price: 890.00,
    discountPercentage: 10.0,
    rating: 4.94,
    stock: 8,
    brand: "Horlogerie Genève",
    sku: "ELG-WT-110",
    warrantyInformation: "5-year Swiss manufacture warranty",
    shippingInformation: "High-value insured white-glove transport",
    availabilityStatus: "Low Stock",
    reviews: [
      { rating: 5, comment: "Spectacular finishing on the movement bridge. Heirloom piece.", reviewerName: "Arthur Pendelton", date: "2026-02-05" }
    ],
    returnPolicy: "14-day unworn luxury return policy",
    tags: ["watch", "horology", "chronograph", "luxury"],
    thumbnail: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 111,
    title: "Hand-Burnished Leather Derby Brogues",
    description: "Goodyear welted men's dress brogues in full-grain French box calf leather, individually antiqued and burnished by master shoemakers in Northamptonshire.",
    category: "mens-shoes",
    price: 360.00,
    discountPercentage: 15.0,
    rating: 4.79,
    stock: 16,
    brand: "Lord & Heritage",
    sku: "ELG-MS-111",
    warrantyInformation: "Recraftable welt construction guarantee",
    shippingInformation: "Free cedar shoe trees included",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Remarkable fit and rich leather patina.", reviewerName: "Sebastian Croft", date: "2026-01-30" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["derby", "brogues", "shoes", "menswear"],
    thumbnail: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 112,
    title: "Double-Breasted Wool & Cashmere Trench",
    description: "Impeccably structured winter trench coat crafted from heavy double-faced wool-cashmere blend with horn buttons, storm flap, and belted waist.",
    category: "womens-dresses",
    price: 480.00,
    discountPercentage: 25.0,
    rating: 4.91,
    stock: 12,
    brand: "Élégance Couture",
    sku: "ELG-TR-112",
    warrantyInformation: "3-year boutique garment care",
    shippingInformation: "Protective garment bag included",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "The silhouette is timeless and regal. Worth every penny.", reviewerName: "Genevieve Moreau", date: "2026-02-18" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["coat", "trench", "outerwear", "cashmere"],
    thumbnail: "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 113,
    title: "Structured Saffiano Envelope Clutch",
    description: "Minimalist evening clutch in scratch-resistant Saffiano leather featuring magnetic flap closure, interior card slots, and detachable gold chain strap.",
    category: "womens-bags",
    price: 195.00,
    discountPercentage: 10.0,
    rating: 4.74,
    stock: 20,
    brand: "Atelier Saint-Honoré",
    sku: "ELG-BG-113",
    warrantyInformation: "2 years leather warranty",
    shippingInformation: "Ships in 24 hours",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Fits an iPhone Pro Max, lip gloss, and cards neatly. Very chic.", reviewerName: "Naomi Chen", date: "2026-01-25" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["clutch", "bag", "evening", "leather"],
    thumbnail: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 114,
    title: "Linen Camp-Collar Summer Shirt",
    description: "Breezy French Normandy linen shirt with relaxed retro camp collar, mother-of-pearl buttons, and straight hem with side slits.",
    category: "mens-shirts",
    price: 135.00,
    discountPercentage: 15.0,
    rating: 4.67,
    stock: 35,
    brand: "Sartoria Milano",
    sku: "ELG-SH-114",
    warrantyInformation: "1-year fabric warranty",
    shippingInformation: "Ships next day",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Airy, breathable, and looks effortlessly refined.", reviewerName: "Lucas Vance", date: "2026-03-04" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["linen", "shirt", "summer", "casual"],
    thumbnail: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 115,
    title: "Rose Gold Celestial Diamond Necklace",
    description: "Delicate 14k rose gold chain suspending a crescent moon pendant paved with handset brilliant diamonds and a bezel-set sapphire star.",
    category: "womens-jewellery",
    price: 450.00,
    discountPercentage: 20.0,
    rating: 4.93,
    stock: 10,
    brand: "Maison Joaillerie",
    sku: "ELG-JW-115",
    warrantyInformation: "Lifetime jewelry warranty",
    shippingInformation: "Insured luxury gift box delivery",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Delicate yet catches every ray of light. A dream necklace.", reviewerName: "Gemma Ross", date: "2026-02-22" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["necklace", "diamonds", "gold", "jewellery"],
    thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 116,
    title: "Silk Charmeuse Bias-Cut Slip Dress",
    description: "Fluid pure silk charmeuse cut on the bias to gently skim the body. Features adjustable criss-cross back straps and side slit.",
    category: "womens-dresses",
    price: 230.00,
    discountPercentage: 10.0,
    rating: 4.86,
    stock: 18,
    brand: "Élégance Couture",
    sku: "ELG-DR-116",
    warrantyInformation: "2 years boutique warranty",
    shippingInformation: "Ships in 24 hours",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "The silk drape is sensational. Pure luxury feel.", reviewerName: "Zoe Kravitz", date: "2026-02-27" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["slip", "silk", "minimalist", "dress"],
    thumbnail: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 117,
    title: "Rose & Oud Botanical Glow Elixir",
    description: "Potent cold-pressed facial oil infused with 24k gold leaf flakes, organic Damascus rose absolute, and antioxidant squalane.",
    category: "beauty",
    price: 92.00,
    discountPercentage: 5.0,
    rating: 4.84,
    stock: 40,
    brand: "Atelier Botanique",
    sku: "ELG-BT-117",
    warrantyInformation: "100% organic certification guarantee",
    shippingInformation: "Ships next day",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Leaves my skin dewy and radiant without being greasy.", reviewerName: "Lydia Grant", date: "2026-01-19" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["skincare", "beauty", "organic", "glow"],
    thumbnail: "https://images.unsplash.com/photo-1608248597359-5099351e2335?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1608248597359-5099351e2335?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 118,
    title: "Sculptural Ankle Strap Leather Sandals",
    description: "Square-toe architectural sandals handcrafted with supple Nappa leather, gold cylindrical heels, and delicate ankle wraps.",
    category: "womens-shoes",
    price: 290.00,
    discountPercentage: 15.0,
    rating: 4.77,
    stock: 14,
    brand: "Élégance Couture",
    sku: "ELG-SH-118",
    warrantyInformation: "1-year heel warranty",
    shippingInformation: "Ships in 24 hours",
    availabilityStatus: "In Stock",
    reviews: [
      { rating: 5, comment: "Like wearable architecture. Modern and incredibly flattering.", reviewerName: "Charlotte Dubois", date: "2026-03-06" }
    ],
    returnPolicy: "30-day complimentary boutique returns",
    tags: ["sandals", "shoes", "summer", "heels"],
    thumbnail: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&auto=format&fit=crop&q=80"
    ]
  }
];

class BoutiqueAPI {
  constructor() {
    this.cache = new Map();
    this.allFetchedProducts = [];
    this.isUsingFallback = false;
  }

  /**
   * Helper to execute fetch with timeout
   */
  async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Normalize DummyJSON product data to boutique standard format
   */
  _normalizeProduct(item) {
    // If discount percentage is missing, compute realistic one or default
    const discount = item.discountPercentage || 0;
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const originalPrice = discount > 0 ? (price / (1 - (discount / 100))) : price;

    return {
      id: item.id,
      title: item.title || "Curated Fashion Piece",
      description: item.description || "Expertly crafted contemporary apparel with tailored detailing and premium fabric.",
      category: item.category || "womens-dresses",
      price: price,
      originalPrice: parseFloat(originalPrice.toFixed(2)),
      discountPercentage: Math.round(discount),
      rating: parseFloat(item.rating || 4.5).toFixed(1),
      stock: item.stock !== undefined ? item.stock : 15,
      brand: item.brand || "ÉLÉGANCE Atelier",
      sku: item.sku || `ELG-${item.id}`,
      warrantyInformation: item.warrantyInformation || "2 years boutique warranty",
      shippingInformation: item.shippingInformation || "Complimentary express shipping",
      availabilityStatus: item.availabilityStatus || (item.stock < 5 ? "Low Stock" : "In Stock"),
      reviews: item.reviews || [
        { rating: 5, comment: "Exquisite craftsmanship and flawless finish.", reviewerName: "Verified Client", date: "2026-03-01" }
      ],
      tags: item.tags || [item.category, "fashion", "luxury"],
      thumbnail: item.thumbnail || (item.images && item.images[0]) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      images: (item.images && item.images.length > 0) 
        ? item.images 
        : [item.thumbnail || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"]
    };
  }

  /**
   * Fetch all fashion products from DummyJSON or fallback
   */
  async getAllFashionProducts() {
    if (this.allFetchedProducts.length > 0) {
      return this.allFetchedProducts;
    }

    try {
      // DummyJSON limit=150 to get a wide pool of fashion, apparel, and accessories
      const url = `${API_CONFIG.BASE_URL}?limit=150&select=id,title,description,category,price,discountPercentage,rating,stock,brand,sku,warrantyInformation,shippingInformation,availabilityStatus,reviews,tags,thumbnail,images`;
      const data = await this._fetchWithTimeout(url);

      if (data && Array.isArray(data.products) && data.products.length > 0) {
        // Filter for fashion categories
        const fashionItems = data.products.filter(item => {
          const cat = (item.category || '').toLowerCase();
          return API_CONFIG.FASHION_CATEGORIES.some(fCat => cat.includes(fCat) || fCat.includes(cat));
        });

        // If DummyJSON returned fashion items, normalize them
        if (fashionItems.length >= 10) {
          this.allFetchedProducts = fashionItems.map(p => this._normalizeProduct(p));
          this.isUsingFallback = false;
          return this.allFetchedProducts;
        } else {
          // If category filter was too narrow in DummyJSON, merge products with our curated catalog
          const normalizedApi = data.products.slice(0, 20).map(p => this._normalizeProduct(p));
          this.allFetchedProducts = [...FALLBACK_PRODUCTS.map(p => this._normalizeProduct(p)), ...normalizedApi];
          return this.allFetchedProducts;
        }
      } else {
        throw new Error("Invalid API payload structure");
      }
    } catch (err) {
      console.warn("DummyJSON API unreachable or offline, switching smoothly to Fallback Catalog:", err.message);
      this.isUsingFallback = true;
      this.allFetchedProducts = FALLBACK_PRODUCTS.map(p => this._normalizeProduct(p));
      return this.allFetchedProducts;
    }
  }

  /**
   * Fetch products by category
   */
  async getProductsByCategory(categorySlug) {
    if (!categorySlug || categorySlug === 'all') {
      return await this.getAllFashionProducts();
    }

    try {
      // First try DummyJSON category endpoint
      const url = `${API_CONFIG.BASE_URL}/category/${categorySlug}`;
      const data = await this._fetchWithTimeout(url);

      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data.products.map(p => this._normalizeProduct(p));
      }
    } catch (err) {
      console.warn(`Category ${categorySlug} API call failed, filtering from local cache:`, err.message);
    }

    // Fallback: filter from all products
    const all = await this.getAllFashionProducts();
    return all.filter(p => p.category.toLowerCase().includes(categorySlug.toLowerCase()));
  }

  /**
   * Search products by keyword
   */
  async searchProducts(query) {
    if (!query || query.trim() === '') {
      return await this.getAllFashionProducts();
    }

    const cleanQuery = query.trim().toLowerCase();

    try {
      const url = `${API_CONFIG.BASE_URL}/search?q=${encodeURIComponent(cleanQuery)}`;
      const data = await this._fetchWithTimeout(url);

      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data.products.map(p => this._normalizeProduct(p));
      }
    } catch (err) {
      console.warn(`Search API for "${query}" failed, filtering locally:`, err.message);
    }

    // Local fuzzy search fallback
    const all = await this.getAllFashionProducts();
    return all.filter(p => {
      const titleMatch = p.title.toLowerCase().includes(cleanQuery);
      const descMatch = p.description.toLowerCase().includes(cleanQuery);
      const brandMatch = (p.brand || '').toLowerCase().includes(cleanQuery);
      const catMatch = (p.category || '').toLowerCase().includes(cleanQuery);
      const tagMatch = p.tags && p.tags.some(t => t.toLowerCase().includes(cleanQuery));
      return titleMatch || descMatch || brandMatch || catMatch || tagMatch;
    });
  }

  /**
   * Fetch single product by ID
   */
  async getProductById(id) {
    const numId = parseInt(id, 10);
    // Check local memory first
    if (this.allFetchedProducts.length > 0) {
      const found = this.allFetchedProducts.find(p => p.id === numId);
      if (found) return found;
    }

    try {
      const url = `${API_CONFIG.BASE_URL}/${numId}`;
      const data = await this._fetchWithTimeout(url);
      if (data && data.id) {
        return this._normalizeProduct(data);
      }
    } catch (err) {
      console.warn(`Fetch product ${id} failed:`, err.message);
    }

    // Fallback search
    const fallback = FALLBACK_PRODUCTS.find(p => p.id === numId);
    return fallback ? this._normalizeProduct(fallback) : null;
  }
}

// Global API singleton instance
window.boutiqueAPI = new BoutiqueAPI();
