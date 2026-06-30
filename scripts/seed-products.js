/**
 * Seed 50 diverse products with descriptions and unique images.
 * Usage: node scripts/seed-products.js <accessToken>
 *   or:  node scripts/seed-products.js  (will sign in as admin@shopforge.com)
 */
const BASE = 'http://localhost:3000';

const PRODUCTS = [
  // ── Electronics ──────────────────────────────────────────────────────────────
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    price: 349.99,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Industry-leading noise cancellation meets 30-hour battery life. The WH-1000XM5 features eight microphones and two processors for unparalleled ambient sound blocking, a lightweight foldable design, multipoint Bluetooth for two simultaneous devices, and speak-to-chat technology that pauses playback the moment you start talking.',
  },
  {
    name: 'iPad Pro 11-inch M4',
    category: 'Electronics',
    price: 999.00,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Powered by the M4 chip, this iPad Pro is thinner than a pencil at 5.1mm and lighter than ever. The Ultra Retina XDR OLED display delivers stunning colour accuracy for designers, photographers, and video editors. Apple Pencil Pro support and 16 GB RAM make it a true laptop replacement for creative professionals.',
  },
  {
    name: 'Samsung 55" 4K QLED Smart TV',
    category: 'Electronics',
    price: 799.00,
    stock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Quantum Dot technology produces over a billion colours with stunning accuracy. The Neo QLED panel with 100% colour volume eliminates colour fade even at peak brightness. Built-in Tizen OS, voice control via Alexa and Bixby, and a 120 Hz refresh rate make this the centrepiece of any home cinema setup.',
  },
  {
    name: 'Keychron Q3 Mechanical Keyboard',
    category: 'Electronics',
    price: 169.99,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Full-aluminium TKL chassis with a gasket-mounted design absorbs keystroke vibration for a premium, dampened feel. Ships with Gateron G Pro 3.0 Red switches (factory-lubed), double-shot PBT keycaps, and USB-C hot-swap sockets so you can swap switches without soldering. Compatible with Mac and Windows out of the box.',
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Electronics',
    price: 99.99,
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'The 8,000 DPI MagSpeed electromagnetic scroll wheel lets you fly through documents — and silently, too. Ergonomic thumb rest, seven programmable buttons, and Logi Options+ software mean you can tailor every gesture for Figma, Photoshop, and VS Code. Works across three devices simultaneously via Bluetooth or USB receiver.',
  },
  {
    name: 'GoPro HERO 12 Black Action Camera',
    category: 'Electronics',
    price: 349.98,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-f04d97f2a2bc?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Shoot 5.3K60 video and 27 MP photos with HyperSmooth 6.0 stabilisation that rivals a gimbal. The GP2 chip delivers 13-stop dynamic range and supports HDR video for the first time. Waterproof to 10 m without a housing, Enduro battery lasts 35% longer in cold weather, and built-in live streaming lets you broadcast straight to YouTube.',
  },
  {
    name: 'Apple AirPods Pro (2nd Generation)',
    category: 'Electronics',
    price: 249.00,
    stock: 55,
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'H2 chip drives the most advanced Active Noise Cancellation Apple has built, wiping out 2× more ambient noise than the original. Adaptive Audio blends ANC and Transparency in real time to match your environment. Personalised Spatial Audio with head tracking places sound precisely in 3D space for music, movies, and calls.',
  },
  {
    name: 'Dell UltraSharp 27" 4K USB-C Monitor',
    category: 'Electronics',
    price: 599.00,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'IPS Black panel achieves a 2000:1 contrast ratio — rare at this price point — with factory-calibrated Delta E < 2 accuracy covering 100% sRGB and 98% DCI-P3. A single 90W USB-C cable charges your laptop, carries data, and displays 4K simultaneously. Thin bezels on three sides and a fully adjustable stand make this the go-to monitor for content creators.',
  },

  // ── Clothing ──────────────────────────────────────────────────────────────────
  {
    name: "Men's Classic Oxford Shirt",
    category: 'Clothing',
    price: 59.99,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1602810319428-019d0a8c5b0d?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Woven from 100% premium Pima cotton in a basket weave that breathes beautifully in summer and layers effortlessly in winter. A button-down collar, box pleat at the back, and a slightly longer tail let you wear it tucked or untucked. Pre-washed for a lived-in softness that gets better with every wash. Available in S–3XL.',
  },
  {
    name: "Women's High-Waist Yoga Pants",
    category: 'Clothing',
    price: 54.99,
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Four-way stretch fabric with a 78% nylon / 22% spandex blend moves with you through every flow and recovers its shape instantly. A 3-inch high-rise waistband with a hidden pocket fits your phone. Flatlock seams eliminate chafing on long runs. Moisture-wicking finish keeps you dry whether you\'re at Pilates or power yoga.',
  },
  {
    name: 'Unisex Oversized Denim Jacket',
    category: 'Clothing',
    price: 89.99,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Cut from heavyweight 12 oz selvedge denim that ages beautifully into personalised fade patterns. Drop shoulders and a boxy silhouette layer over hoodies in winter or tees in spring. Four functioning pockets, copper-riveted stress points, and tonal stitching give this jacket decades of reliable wear. One size up from your usual for the ideal oversized drape.',
  },
  {
    name: "Women's Floral Maxi Wrap Dress",
    category: 'Clothing',
    price: 74.99,
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Fluid LENZING™ ECOVERO viscose drapes effortlessly and feels cool against skin in hot weather. The adjustable wrap silhouette flatters every body type, and the tiered skirt creates gentle movement as you walk. Hand-painted botanical print is exclusive to this run. Machine washable on the delicate cycle — rare for a dress this beautiful.',
  },
  {
    name: "Men's Slim-Fit Chino Trousers",
    category: 'Clothing',
    price: 64.99,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'The workhorse of the smart-casual wardrobe. Made from 98% cotton 2% elastane for easy movement without losing its clean, tailored line through the thigh. A low-profile waistband sits flat under a tucked shirt; the tapered leg hits just above the ankle for a modern break. Available in Stone, Navy, Olive, and Burgundy.',
  },
  {
    name: "Kids' Zip-Up Rainbow Hoodie",
    category: 'Clothing',
    price: 34.99,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Super-soft 280 gsm French terry cotton blend is gentle on sensitive skin. The full-length YKK zip opens easily with small fingers; a brushed fleece interior keeps kids warm at playtime and commutes alike. Reinforced kangaroo pocket, ribbed cuffs, and a fixed hood. Machine washable and certified OEKO-TEX® Standard 100. Ages 4–14.',
  },
  {
    name: "Women's Wool Blend Peacoat",
    category: 'Clothing',
    price: 149.99,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1548624313-0396a54d8101?w=400&h=280&fit=crop&auto=format&q=80',
    description: '60% wool / 40% polyester shell with a warm viscose lining. The classic double-breasted silhouette features a wide notch lapel and anchor buttons that never go out of style. Slash pockets sit at a flattering angle; a back vent allows for ease of movement. Structured shoulders and a fitted waist create an elegant hourglass line.',
  },
  {
    name: "Men's Lightweight Trail Running Shorts",
    category: 'Clothing',
    price: 44.99,
    stock: 130,
    imageUrl: 'https://images.unsplash.com/photo-1556906781-9cdb40ee6b77?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Weighs just 95 g thanks to a recycled nylon ripstop outer and a mesh brief liner — you\'ll forget you\'re wearing them. A 7-inch inseam hits at mid-thigh for a full range of motion on technical terrain. Four pockets (two zippered) hold gels and a key without bouncing. UPF 30+ protection and a DWR finish handle light drizzle.',
  },

  // ── Books ─────────────────────────────────────────────────────────────────────
  {
    name: 'Atomic Habits — James Clear',
    category: 'Books',
    price: 18.99,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'The #1 New York Times bestseller that has sold over 15 million copies worldwide. Clear distils decades of behavioural science into a practical framework: make good habits obvious, attractive, easy, and satisfying; make bad habits invisible, unattractive, hard, and unsatisfying. Each chapter closes with a concise "How to Create a Good Habit / Break a Bad One" summary card.',
  },
  {
    name: 'The Psychology of Money — Morgan Housel',
    category: 'Books',
    price: 16.99,
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Nineteen timeless stories about wealth, greed, and happiness. Housel argues that financial success has less to do with intelligence and more to do with behaviour — patience, humility, and the ability to hold your nerve when markets crash. Accessible to complete beginners yet full of insights seasoned investors miss. The best personal finance book of the decade.',
  },
  {
    name: 'Dune — Frank Herbert (Anniversary Edition)',
    category: 'Books',
    price: 22.99,
    stock: 160,
    imageUrl: 'https://images.unsplash.com/photo-1518744386442-2d48ac47a7eb?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'The greatest science fiction novel ever written returns in a deluxe anniversary edition with a new foreword by Brian Herbert and Kevin J. Anderson and stunning new cover art. Set in a future of feudal interplanetary politics and mystical ecology, Dune follows young Paul Atreides as he navigates betrayal, prophecy, and a desert planet that holds the universe\'s most precious resource.',
  },
  {
    name: 'The Design of Everyday Things — Don Norman',
    category: 'Books',
    price: 19.99,
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'The bible of human-centred design. Norman shows why bad design — doors you push when you should pull, stove knobs that don\'t tell you which burner they control — is never the user\'s fault. Through witty anecdotes and rigorous analysis he teaches discoverability, feedback, mapping, and mental models. Required reading for every product designer, engineer, and founder.',
  },
  {
    name: 'Python Crash Course, 3rd Edition',
    category: 'Books',
    price: 29.99,
    stock: 220,
    imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'The world\'s best-selling Python book for beginners, fully updated for Python 3.12. Part One builds a solid foundation in variables, lists, functions, classes, and file I/O. Part Two puts that knowledge to work in three real projects: a 2D game built with Pygame, a data visualisation dashboard, and a full Django web app. Zero programming experience required.',
  },
  {
    name: 'Thinking, Fast and Slow — Daniel Kahneman',
    category: 'Books',
    price: 17.99,
    stock: 190,
    imageUrl: 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Nobel Prize winner Daniel Kahneman maps the two systems that drive how we think: System 1 — fast, intuitive, emotional — and System 2 — slow, deliberate, logical. Through hundreds of memorable experiments he reveals the cognitive biases that distort our judgements about risk, probability, and value. Essential reading for economists, marketers, and anyone who wants to make better decisions.',
  },

  // ── Home ──────────────────────────────────────────────────────────────────────
  {
    name: 'Bamboo Cutting Board Set (3 Piece)',
    category: 'Home',
    price: 39.99,
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Three boards (small, medium, large) made from Moso bamboo — harder than maple but gentle on knife edges. Each board has a juice groove around the perimeter and non-slip rubber feet. Bamboo is naturally antimicrobial, absorbs less moisture than wood, and is sustainably harvested. Hand wash and apply the included food-grade mineral oil monthly to extend life.',
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    category: 'Home',
    price: 54.99,
    stock: 85,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Hand-thrown stoneware dripper sits on a matching 600 ml carafe — a matched set that looks as good as the coffee it makes. The wide-mouth dripper uses size 02 Hario or Melitta filters and has a ribbed inner wall that promotes even water distribution and a clean extraction. Includes a gooseneck pouring guide card printed inside the box. Dishwasher safe.',
  },
  {
    name: 'Smart Wi-Fi LED Bulbs (4-Pack, E27)',
    category: 'Home',
    price: 29.99,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=280&fit=crop&auto=format&q=80',
    description: '16 million colours and tunable white (2700K–6500K) in a standard E27 base. Schedule, dim, and group via the companion app — no hub required, works over 2.4 GHz Wi-Fi. Compatible with Amazon Alexa, Google Home, and Apple HomeKit. Each bulb replaces a 60W incandescent while drawing only 9W. Rated 25,000 hours — outlasts 20 conventional bulbs.',
  },
  {
    name: 'Linen Textured Throw Pillow Set (4-Pack)',
    category: 'Home',
    price: 49.99,
    stock: 95,
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Four 45 × 45 cm cushion covers in complementary earth tones: Terracotta, Sage, Sand, and Slate. Woven from a linen-cotton blend that softens with washing and develops a pleasingly rumpled texture over time. Concealed zip closures and a piped border finish look custom-made. Inserts not included — these covers fit standard 45 cm square cushion pads.',
  },
  {
    name: '5 L Cast-Iron Dutch Oven',
    category: 'Home',
    price: 89.99,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Enamelled cast iron distributes heat evenly from base to rim, eliminating the hot spots that burn braises and soups. The tight-fitting lid circulates steam to keep dishes moist during long slow cooks. Oven-safe to 260°C (500°F) and compatible with all hob types including induction. Chip-resistant enamel is easy to clean and never needs seasoning. A kitchen heirloom.',
  },
  {
    name: 'Bamboo Desktop Organiser with Wireless Charger',
    category: 'Home',
    price: 44.99,
    stock: 70,
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Six compartments (pen pot, two deep trays, cable channel, phone stand, sticky-note slot) plus a 15W Qi wireless charging pad recessed into the base. Constructed from natural Moso bamboo; the satin finish does not yellow with age. Measures 32 × 18 × 10 cm — fits neatly on a corner of most desks. USB-A port on the rear keeps cables tidy.',
  },
  {
    name: 'Ultrasonic Aroma Diffuser (400 ml)',
    category: 'Home',
    price: 34.99,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Ultrasonic vibrations break water and essential oils into a cool, fine mist without degrading the fragrance compounds the way heat does. Runs up to 10 hours on a full tank; auto-shuts off when dry. Seven ambient light colours cycle or hold on your chosen shade. Whisper-quiet at 25 dB — won\'t disturb a sleeping baby. Includes a 10 ml lavender oil sampler.',
  },

  // ── Sports ────────────────────────────────────────────────────────────────────
  {
    name: 'Resistance Band Set (11 Piece)',
    category: 'Sports',
    price: 29.99,
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Five stackable latex bands (10–50 lbs), two fabric ankle straps, two foam handles, a door anchor, and a carry bag — everything to replace an entire cable machine at a fraction of the cost. Natural latex is more durable than synthetic and snaps back faster. A printed exercise guide with 20 illustrated movements is included. Stack multiple bands to scale from light activation work to heavy pulls.',
  },
  {
    name: 'Alignment Yoga Mat (6 mm, Non-Slip)',
    category: 'Sports',
    price: 49.99,
    stock: 140,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Laser-printed alignment lines run the length of the mat so beginners can find Warrior I and Triangle Pose without a mirror. The closed-cell TPE surface grips hands and feet in hot conditions where PVC mats turn slippery. 183 × 61 cm; 6 mm cushioning absorbs impact on knees and hips. Latex-free, sweat-resistant, and free of harmful phthalates. Includes a carry strap.',
  },
  {
    name: 'Adjustable Dumbbell Set (5–52.5 lbs)',
    category: 'Sports',
    price: 299.00,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'A single dial adjusts weight in 2.5 lb increments from 5 to 52.5 lbs — replacing 15 pairs of traditional dumbbells. The selector dial mechanism is faster than pin-selector designs; you change weights without fumbling with loose plates. Durable overmoulded grip does not flake or crack over time. Tray included; overall footprint is smaller than a shoe box.',
  },
  {
    name: 'Running Hydration Vest (6 L)',
    category: 'Sports',
    price: 79.99,
    stock: 55,
    imageUrl: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Fits like a second skin with seven adjustment points. Two 500 ml soft flasks in front pockets are accessible without stopping; the 1.5 L bladder compartment in back holds extra water for long efforts. Eight pockets total — room for gels, a phone, a spare layer, and trekking poles. Breathable mesh panels reduce sweating. Rated by ultra runners for the Western States 100.',
  },
  {
    name: 'Speed Jump Rope (Ball Bearing)',
    category: 'Sports',
    price: 24.99,
    stock: 250,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Dual ball-bearing handles rotate with near-zero resistance so the rope turns at up to 5 revolutions per second for elite double-unders. The 4 mm steel cable is coated in PVC for durability on gym floors. Adjustable to any height: thread the cable through the handle and cut to length with scissors. Includes a travel bag and foam grips that prevent blisters on long sessions.',
  },
  {
    name: 'High-Density Foam Roller (90 cm)',
    category: 'Sports',
    price: 34.99,
    stock: 160,
    imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Extra-long 90 cm roller targets the entire spine, IT band, and upper back simultaneously — most rollers at 30 cm require repositioning mid-session. The multi-density EVA foam has a firmer core for deep trigger-point work and a softer outer layer to avoid bruising. Hollow centre means it weighs just 540 g. Holds up to 130 kg and will not flatten after years of use.',
  },

  // ── Toys ──────────────────────────────────────────────────────────────────────
  {
    name: 'STEM Robotics Building Kit (Ages 8+)',
    category: 'Toys',
    price: 69.99,
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Build three different robots from 190 components — wheeled rover, robotic arm, and humanoid walker — each controlled by the included microcontroller. Drag-and-drop block coding introduces conditionals, loops, and sensor input without prior programming experience; a second coding mode teaches real Python for older kids. Works offline; no subscription required. Designed to grow with your child.',
  },
  {
    name: 'Magnetic Tiles Building Set (60 Pieces)',
    category: 'Toys',
    price: 54.99,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Sixty translucent magnetic tiles in six shapes — square, triangle, large triangle, rectangle, pentagon, and diamond — snap together and hold firm thanks to strong embedded neodymium magnets. Open-ended play builds spatial reasoning and geometric thinking. Compatible with most major magnetic tile brands. ABS plastic meets ASTM F963 and EN71 safety standards. Ages 3+.',
  },
  {
    name: 'Professional Watercolour Paint Set (48 Colours)',
    category: 'Toys',
    price: 39.99,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Forty-eight highly pigmented pans in a tin case with a fold-out mixing palette and a re-sealable water compartment. Professional-grade pigments are lightfast and won\'t fade when framed. The range spans cadmium-free primaries, earth tones, granulating pigments, and metallic golds. Includes two watercolour brushes (round 4 and flat 10) and 12 sheets of 300 gsm cold-press paper. Ages 6+.',
  },
  {
    name: 'Wooden Train Track Mega Set (100 Pieces)',
    category: 'Toys',
    price: 59.99,
    stock: 75,
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'One hundred certified FSC birch-wood track pieces — straight, curved, bridges, switches, and ramps — connect in hundreds of layout combinations. The bevelled edges and smooth sanded surfaces make assembly intuitive for toddlers. Compatible with Thomas & Friends, Brio, and Melissa & Doug sets. Water-based paint is non-toxic. Includes a drawstring storage bag. Ages 2–7.',
  },
  {
    name: 'Young Scientist Lab Kit (20 Experiments)',
    category: 'Toys',
    price: 44.99,
    stock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Twenty guided experiments cover chemistry, biology, physics, and earth science using household materials plus the safe, clearly labelled reagents in the kit. Children grow crystals, build a mini volcano, extract DNA from strawberries, and test water pH. Every experiment comes with a printed journal page for recording observations — introducing the scientific method before school makes it formal. Ages 8–14.',
  },

  // ── Food ──────────────────────────────────────────────────────────────────────
  {
    name: 'Ceremonial Grade Matcha Powder (100 g)',
    category: 'Food',
    price: 28.99,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Stone-ground from first-flush Uji shade-grown tencha leaves. Ceremonial grade means it\'s whisked into hot (not boiling) water and drunk straight — no milk needed — with a clean umami finish and none of the bitterness you get from culinary grades. Rich in L-theanine for calm, focused energy without the coffee jitter. Resealable foil pouch keeps it fresh for three months.',
  },
  {
    name: 'Artisan Dark Chocolate Collection (12 Bars)',
    category: 'Food',
    price: 36.00,
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44b0d303ca6?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Twelve single-origin bars sourced from cooperatives in Ecuador, Peru, Madagascar, and Ghana — each 35 g and between 65% and 90% cacao. Tasting notes printed on each sleeve guide you through the flavor: fruity Malagasy, earthy Ecuadorian, nutty Ghanaian. Made with no emulsifiers, no added vanilla, and minimal sugar. A monthly subscription is available for serious chocolate lovers.',
  },
  {
    name: 'Cold Brew Coffee Concentrate (1 L, Box of 2)',
    category: 'Food',
    price: 19.99,
    stock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Steeped for 20 hours in cold filtered water so there\'s no heat-extracted acidity or bitterness. Each 1 L carton makes approximately 8–10 glasses when diluted 1:1 with milk, oat milk, or water. Certified organic beans sourced from Peruvian highland farms at altitude above 1500 m. 30 mg caffeine per 30 ml serving. Refrigerate after opening; keeps for two weeks.',
  },
  {
    name: 'Himalayan Pink Salt Refillable Grinder',
    category: 'Food',
    price: 12.99,
    stock: 300,
    imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f17a3bf4da1?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Coarse pink salt crystals from the Khewra mines of Punjab — the world\'s most ancient salt deposit — ground to your preferred coarseness by an adjustable ceramic mechanism that will never rust or corrode. The glass body lets you see your salt level at a glance. Refillable via the wide-mouth base; a 500 g refill bag is sold separately. Adds a subtle mineral complexity to steaks, salads, and cocktail rims.',
  },
  {
    name: 'Raw Wildflower Honey with Comb (400 g)',
    category: 'Food',
    price: 16.99,
    stock: 160,
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Unpasteurised and unfiltered — never heated above 35°C — so naturally occurring enzymes, pollen, and antioxidants remain intact. Each batch is harvested from hives surrounded by meadow wildflowers and clover; the flavour changes slightly season to season. A piece of genuine honeycomb sits on top of the crystallised honey for an authentic tasting experience. Crystallisation is natural and does not affect quality.',
  },

  // ── Beauty ────────────────────────────────────────────────────────────────────
  {
    name: 'Vitamin C + Hyaluronic Acid Serum (30 ml)',
    category: 'Beauty',
    price: 34.99,
    stock: 130,
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=280&fit=crop&auto=format&q=80',
    description: '20% L-ascorbic acid (the most bioavailable form of Vitamin C) stabilised with ferulic acid and Vitamin E to prevent oxidation and boost efficacy. Two molecular weights of hyaluronic acid penetrate at different depths to plump fine lines and restore a dewy surface glow. Clinically tested: 89% of participants saw a visible reduction in dark spots after 8 weeks. Fragrance-free, vegan, cruelty-free.',
  },
  {
    name: 'Bamboo Charcoal Sheet Face Mask Set (12 Pack)',
    category: 'Beauty',
    price: 18.99,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Each mask is soaked in a serum blend of bamboo charcoal, tea tree oil, and niacinamide that draws out impurities, minimises pores, and brightens uneven skin tone in a 20-minute session. The TENCEL™ sheet moulds closely to the contours of the face for full contact with no slipping. 100% biodegradable packaging; no plastic pouches. Suitable for sensitive, oily, and combination skin.',
  },
  {
    name: 'Rose Quartz Gua Sha + Face Roller Set',
    category: 'Beauty',
    price: 26.99,
    stock: 110,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Genuine rose quartz stays naturally cool at room temperature to reduce puffiness and encourage lymphatic drainage. The gua sha has three sculpted edges — a curved side for jawline and cheekbones, a straight side for forehead and neck, and a notched side for brow bone. The dual-head roller fits the contour above the eye and is best used with a facial oil or serum. Includes a velvet storage pouch.',
  },
  {
    name: 'Organic Shea & Mango Body Butter (200 ml)',
    category: 'Beauty',
    price: 21.99,
    stock: 175,
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Whipped blend of unrefined shea butter, mango seed butter, jojoba oil, and aloe vera absorbs without the greasy residue most body butters leave behind. Lightweight enough to use on the face as an overnight moisture mask; rich enough to soften cracked heels. Infused with a subtle bergamot and sandalwood fragrance. No mineral oil, no silicones, no parabens. Vegan-certified and cruelty-free.',
  },
  {
    name: 'Refillable Glass Perfume Atomiser Set (3 × 10 ml)',
    category: 'Beauty',
    price: 22.99,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=280&fit=crop&auto=format&q=80',
    description: 'Three travel-sized perfume atomisers in a polished brass, matte black, and rose gold finish — each holds 10 ml (approx. 130 sprays) and fits a carry-on bag\'s liquid allowance. Fill via the funnel-free bottom-fill valve: just press the bottle of your full-sized fragrance onto the valve and it transfers in seconds without spillage. The fine-mist pump delivers a consistent, even cloud every time.',
  },
];

async function getToken() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shopforge.com', password: 'Admin123!' }),
  });
  if (!res.ok) {
    // Try signup
    const s = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin', email: 'admin@shopforge.com', password: 'Admin123!', role: 'admin' }),
    });
    const d = await s.json();
    return d.accessToken;
  }
  const d = await res.json();
  return d.accessToken;
}

async function createProduct(product, token) {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  const token = process.argv[2] || await getToken();
  console.log('Using token:', token.slice(0, 30) + '...');
  let ok = 0, fail = 0;
  for (const p of PRODUCTS) {
    try {
      const created = await createProduct(p, token);
      console.log(`✓ [${created.id}] ${created.name}`);
      ok++;
    } catch (e) {
      console.error(`✗ ${p.name}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} created, ${fail} failed`);
}

main().catch(console.error);
