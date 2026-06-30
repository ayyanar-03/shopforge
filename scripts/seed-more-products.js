// Seeds 50 more products (IDs ~101-150) across 14 categories
const BASE = 'http://localhost:3000';

const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error('Usage: node seed-more-products.js <ADMIN_TOKEN>');
  process.exit(1);
}

const img = (id) =>
  `https://images.unsplash.com/${id}?w=400&h=280&fit=crop&auto=format&q=80`;

const products = [
  // ── Pet Supplies (8) ──────────────────────────────────────────────
  {
    name: 'Premium Dry Dog Food 15kg',
    category: 'Pet Supplies',
    price: 49.99,
    stock: 80,
    imageUrl: img('photo-1587300003388-59208cc962cb'),
    description:
      'High-protein kibble formulated for large breeds with real chicken & brown rice as the first ingredients. Enriched with omega-3 fatty acids for a shiny coat, glucosamine for joint health, and probiotics for healthy digestion. No artificial colours or preservatives. Suitable for adult dogs 1–7 years. Vet-approved recipe, resealable bag.',
  },
  {
    name: 'Interactive Cat Feather Wand',
    category: 'Pet Supplies',
    price: 12.99,
    stock: 150,
    imageUrl: img('photo-1543466835-00a7907e9de1'),
    description:
      'Extendable 90cm steel rod with a detachable feather & bell lure that mimics prey movement. Encourages natural hunting instinct, reduces boredom, and provides daily exercise. Replacement attachments are sold separately. Safe non-toxic materials; durable spring-steel wire. Ideal for kittens and adult cats alike. Folds flat for easy storage.',
  },
  {
    name: 'Orthopedic Memory Foam Pet Bed',
    category: 'Pet Supplies',
    price: 64.99,
    stock: 45,
    imageUrl: img('photo-1561037914-d7dae0e05f7a'),
    description:
      'Therapeutic 4-inch memory foam base with a bolster surround relieves joint pain and supports aging or arthritic pets. Removable, machine-washable velvet cover in charcoal grey. Non-slip waterproof bottom liner. Available in S (50×40cm), M (70×60cm), and L (90×75cm). Certified free of harmful substances. Loved by dogs and cats alike.',
  },
  {
    name: 'Retractable Dog Leash 5m',
    category: 'Pet Supplies',
    price: 22.99,
    stock: 120,
    imageUrl: img('photo-1601758124510-52d02ddb7cbd'),
    description:
      'Durable nylon cord rated to 50kg extends smoothly to 5 metres with one-button brake and lock. Ergonomic non-slip handle with built-in LED torch for night walks. Reflective stitching on cord increases visibility. Compatible with dogs up to 30kg. Tangle-resistant retraction mechanism with stainless-steel swivel clip. Meets CE safety standards.',
  },
  {
    name: 'Self-Cleaning Cat Litter Box',
    category: 'Pet Supplies',
    price: 129.99,
    stock: 30,
    imageUrl: img('photo-1589883661923-6476cb0ae9f2'),
    description:
      'Motion sensor detects when your cat exits and auto-rakes clumps into the waste drawer 20 minutes later. Carbon-filter drawer controls odour for up to 30 days. Large 56cm dome fits cats up to 8kg. Includes 3-month supply of crystal litter and 30 disposable liners. App-controlled timer and waste-level alerts via Bluetooth.',
  },
  {
    name: 'Stainless Steel Dual Pet Bowl',
    category: 'Pet Supplies',
    price: 18.99,
    stock: 200,
    imageUrl: img('photo-1601758003122-53c40e686a19'),
    description:
      "Food-grade 304 stainless steel dual bowl set (300ml + 400ml) on a rubber anti-slip base. Dishwasher safe; won't harbour bacteria like plastic. Raised 15cm stand reduces neck strain for dogs and cats. Suitable for wet food, dry kibble, or water. Available in silver and matte black. Hygienic, durable, and rust-proof for years of use.",
  },
  {
    name: '60L Aquarium Tank Starter Kit',
    category: 'Pet Supplies',
    price: 149.99,
    stock: 20,
    imageUrl: img('photo-1535591273668-578e31182c4f'),
    description:
      'Complete 60-litre glass tank (60×30×35cm) with curved front panel, LED sunrise-sunset lighting strip, external canister filter (300L/h), adjustable 100W heater, thermometer, and fine-mesh net. Silicone-sealed tempered-glass panels are scratch-resistant and leak-proof. Compatible with tropical and cold-water freshwater fish.',
  },
  {
    name: 'Indoor Bird Cage with Stand',
    category: 'Pet Supplies',
    price: 89.99,
    stock: 25,
    imageUrl: img('photo-1522858547137-f1dcec554f55'),
    description:
      'Powder-coated steel flight cage (50×50×90cm) on a wheeled stand with two stainless steel cups, two wooden perches, a swing, and a pull-out waste tray. Bar spacing 1.5cm — suitable for parakeets, canaries, and finches. Dual front doors allow easy access. Non-toxic finish safe for birds. Folds partially for transport.',
  },

  // ── Garden (7) ────────────────────────────────────────────────────
  {
    name: 'Cedar Raised Garden Bed 4×8ft',
    category: 'Garden',
    price: 89.99,
    stock: 35,
    imageUrl: img('photo-1416879595882-3373a0480b5b'),
    description:
      'Untreated western red cedar naturally resists rot and insects for 10+ years without chemical preservatives. Pre-drilled interlocking boards assemble in 20 minutes with no tools required. Interior depth 30cm — deep enough for carrots and root vegetables. Ground-contact safe; drainage holes in base. Holds 280L of soil.',
  },
  {
    name: '5-Piece Stainless Garden Tool Set',
    category: 'Garden',
    price: 39.99,
    stock: 60,
    imageUrl: img('photo-1530836369250-ef72a3f5cda8'),
    description:
      'Heavy-gauge 304 stainless steel trowel, transplanter, cultivator, weeder, and hand fork with ergonomic soft-grip handles. Rust-resistant blades stay sharp season after season. Hanging storage bag included. Tools are dishwasher safe after use. Gift-boxed set ideal for balcony gardeners or raised-bed enthusiasts.',
  },
  {
    name: 'Expandable Garden Hose 50m',
    category: 'Garden',
    price: 44.99,
    stock: 75,
    imageUrl: img('photo-1558618666-fcd25c85cd64'),
    description:
      'Triple-layer latex core expands up to 50m under water pressure and contracts to 17m when empty — no tangles, no kinks. Solid brass fittings resist corrosion. Includes 8-pattern spray nozzle (jet, flat, shower, mist, cone, centre, full, soak). Pressure rated 40–100 PSI. Auto-shutoff nozzle trigger for water-saving use.',
  },
  {
    name: 'Heirloom Vegetable Seed Collection',
    category: 'Garden',
    price: 24.99,
    stock: 100,
    imageUrl: img('photo-1464226184884-fa280b87c399'),
    description:
      'Curated collection of 20 open-pollinated, non-GMO, non-hybrid vegetable varieties including beefsteak tomato, rainbow chard, butternut squash, French beans, sweet pepper, and more. Each seed packet contains 50–200 seeds with grow guides and planting calendar. Germination rate >90%. Save your own seeds year after year.',
  },
  {
    name: 'Premium Potting Mix 40L',
    category: 'Garden',
    price: 19.99,
    stock: 90,
    imageUrl: img('photo-1416879595882-3373a0480b5b'),
    description:
      'Moisture-control blend with coconut coir, perlite, aged bark, and slow-release fertiliser pellets. Feeds plants for up to 6 months. pH balanced 6.0–7.0 for most vegetables, herbs, and flowering plants. Lightweight mix drains well yet retains moisture evenly. RHS endorsed formula for containers, raised beds, and hanging baskets.',
  },
  {
    name: 'Solar LED Garden Path Lights 8-Pack',
    category: 'Garden',
    price: 29.99,
    stock: 110,
    imageUrl: img('photo-1558618047-3c8c76ca7d13'),
    description:
      'Each light harvests solar energy during the day and auto-illuminates at dusk for 8–10 hours. Cool-white 6500K LED; 30 lumen output per unit. Stainless steel stake, no wiring required. IP65 waterproof rating withstands rain and frost. Ideal for pathways, borders, and driveways. Replace batteries (AA NiMH included) after 2 years.',
  },
  {
    name: '330L Dual-Chamber Compost Tumbler',
    category: 'Garden',
    price: 119.99,
    stock: 20,
    imageUrl: img('photo-1464226184884-fa280b87c399'),
    description:
      'Twin 165-litre chambers let you fill one while the other finishes composting. Galvanised steel frame with UV-stable BPA-free black barrel traps heat for fast decomposition (4–6 weeks). Aeration holes keep oxygen flowing. Sliding door with removable screen. Rodent-proof. Mounted on ball bearings for effortless turning. Produces rich compost all year.',
  },

  // ── Music (6) ─────────────────────────────────────────────────────
  {
    name: 'Dreadnought Acoustic Guitar',
    category: 'Music',
    price: 189.99,
    stock: 30,
    imageUrl: img('photo-1510915361894-db8b60106cb1'),
    description:
      'Solid spruce top with mahogany back and sides delivers warm projection and sparkling highs. Rosewood fingerboard, 20 frets, 648mm scale length. Chrome die-cast tuners hold tuning remarkably well. Includes gig bag, picks, spare strings, and strap. Set-up at the factory for low action — ideal for beginners and intermediate players.',
  },
  {
    name: '61-Key Weighted Digital Piano',
    category: 'Music',
    price: 349.99,
    stock: 15,
    imageUrl: img('photo-1520523839897-bd0b52f945a0'),
    description:
      'Semi-weighted 61-key keyboard with touch sensitivity, 200 built-in voices, 50 rhythms, and 20 demo songs. USB-MIDI connectivity for DAW recording. Built-in stereo speakers (2×5W) with reverb and chorus effects. Sustain pedal and stand included. Layering and split functions. Recording function with 1-track sequencer. Powered via adapter or 6×AA batteries.',
  },
  {
    name: 'Electric Violin 4/4 Full Kit',
    category: 'Music',
    price: 219.99,
    stock: 18,
    imageUrl: img('photo-1465225314224-587cd83d322b'),
    description:
      'Solid maple body with ebony fingerboard and tailpiece. Built-in output jack, onboard EQ controls, and headphone amp for silent practice. Includes carbon-fibre bow, rosin cube, shoulder rest, and foam case. Available in midnight black and transparent red. 1/4" jack compatible with any amp or interface.',
  },
  {
    name: '8-Pad Electronic Drum Kit',
    category: 'Music',
    price: 149.99,
    stock: 22,
    imageUrl: img('photo-1493225457124-a3eb161ffa5f'),
    description:
      'Compact 8-pad practice kit with velocity-sensitive pads, 10 preset drum kits, 15 songs, and a built-in metronome. Headphone and aux inputs for silent practice or backing track play-along. Powered by adapter (included). Fold-flat carrying bag included. 2 drum sticks. Compatible with USB-MIDI for virtual studio software.',
  },
  {
    name: 'Concert Ukulele Koa Wood',
    category: 'Music',
    price: 79.99,
    stock: 40,
    imageUrl: img('photo-1612225330812-01a90087040e'),
    description:
      'Solid acacia koa top with laminate back and sides. Concert (38cm) scale length delivers fuller, mellower tone than soprano models. Aquila Nylgut strings produce warm, clear sound straight out of the box. Walnut fingerboard, slotted headstock with chrome tuners. Includes padded gig bag, polishing cloth, chord chart, and online lesson code.',
  },
  {
    name: 'Beginner Trumpet B-Flat Brass',
    category: 'Music',
    price: 169.99,
    stock: 15,
    imageUrl: img('photo-1511192336575-5a79af67a629'),
    description:
      'Yellow brass bell (123mm) with monel alloy pistons for smooth, fast valve action. Lacquered finish resists fingerprints and tarnish. Includes mouthpiece (7C), hard foam case, valve oil, cleaning rod, and gloves. Bore size 11.65mm. Suitable for school band beginners and recreational players. One-year manufacturer warranty.',
  },

  // ── Baby & Kids (6) ───────────────────────────────────────────────
  {
    name: 'Smart Baby Video Monitor 5"',
    category: 'Baby',
    price: 119.99,
    stock: 35,
    imageUrl: img('photo-1591128750534-00b8c6f2b965'),
    description:
      'High-resolution 720p colour display with automatic night vision switching in low light. Two-way talk, temperature and humidity alert, lullaby player with 8 songs, and zoom/pan/tilt camera. 300m range (open space); encrypted 2.4GHz FHSS signal — no Wi-Fi required, no app, no cloud. 12-hour rechargeable battery. Wall-mount kit included.',
  },
  {
    name: 'Organic Muslin Swaddle Blankets 3-Pack',
    category: 'Baby',
    price: 34.99,
    stock: 90,
    imageUrl: img('photo-1544367567-0f2fcb009e0b'),
    description:
      'GOTS-certified 100% organic cotton muslin, pre-washed for softness. 120×120cm large size allows for proper swaddle wrapping as baby grows. Breathable open weave regulates temperature to prevent overheating. Set of 3 in classic white, sage green, and dusty rose. Machine washable at 40°C. OekoTex Standard 100 certified — free from harmful dyes.',
  },
  {
    name: 'Anti-Colic Baby Bottle Set 4-Pack',
    category: 'Baby',
    price: 29.99,
    stock: 100,
    imageUrl: img('photo-1471930393938-c7785c0a1291'),
    description:
      'Clinically proven internal venting system draws air away from milk, reducing colic, gas, and reflux by up to 60%. BPA-free medical-grade polypropylene body with temperature-sensitive spoon indicator (turns yellow above 40°C). Slow-flow silicone nipple (stage 1) included; medium and fast-flow sold separately. Wide-neck design fits most breast pumps.',
  },
  {
    name: 'Lightweight Travel Stroller',
    category: 'Baby',
    price: 199.99,
    stock: 20,
    imageUrl: img('photo-1601850494422-3cf05b488a08'),
    description:
      'Ultra-light 5.8kg aluminium frame with one-click fold folds smaller than most carry-on bags. Reclining seat fits newborns (with included insert) to 22kg toddlers. UPF 50+ extendable canopy with peekaboo window. Lockable front swivel wheels, adjustable footrest, and large under-seat basket. Approved for use on most commercial flights.',
  },
  {
    name: 'Wooden Activity Cube Learning Toy',
    category: 'Baby',
    price: 44.99,
    stock: 50,
    imageUrl: img('photo-1515488042361-ee00e0ddd4e4'),
    description:
      'Five-sided wooden cube (25×25×25cm) with bead maze, shape sorter, spinning gears, clock with moveable hands, and bead sliding panel. Painted with non-toxic water-based paints. Rounded corners and smooth edges. Develops fine motor skills, colour recognition, and problem solving from 12 months. CE certified.',
  },
  {
    name: 'Ergonomic Baby Carrier Wrap',
    category: 'Baby',
    price: 59.99,
    stock: 45,
    imageUrl: img('photo-1476703993599-0035a21b17a9'),
    description:
      'One-size-fits-all ring sling in 100% linen-cotton blend. Supports newborns to 15kg in ergonomic M-position (hip-healthy design, Ergobaby certified). Adjustable aluminium ring for quick on/off. Machine washable at 30°C. Instructional video code and guide card included. Breathable, lightweight, and perfect for hot weather babywearing.',
  },

  // ── Office (6) ────────────────────────────────────────────────────
  {
    name: 'Bamboo Desk Organiser 6-Slot',
    category: 'Office',
    price: 27.99,
    stock: 80,
    imageUrl: img('photo-1497366754035-f200968a6e72'),
    description:
      'Sustainably sourced bamboo organiser with 6 compartments, integrated phone stand, rear cable management slot, and a removable sliding drawer for paper clips and stationery. Smooth sanded finish; each piece is unique due to natural bamboo grain. Dimensions: 28×15×12cm. Desk-pad compatible base. Holds notebooks, pens, scissors, and more neatly.',
  },
  {
    name: 'Silent Wireless Ergonomic Mouse',
    category: 'Office',
    price: 29.99,
    stock: 110,
    imageUrl: img('photo-1527864550417-7fd91fc51a46'),
    description:
      'Contoured right-hand ergonomic shape reduces wrist strain during extended use. Near-silent click buttons (90% quieter than standard). Nano USB receiver supports plug-and-play on Windows, macOS, and ChromeOS. Adjustable DPI (800/1200/1600). 18-month battery life on 1×AA. 3 buttons + scroll wheel. Works on most surfaces including glass.',
  },
  {
    name: 'A5 Dotted Hardcover Journal 320pg',
    category: 'Office',
    price: 19.99,
    stock: 130,
    imageUrl: img('photo-1544716278-ca5e3f4abd8c'),
    description:
      'Lay-flat 320-page dotted grid journal with a sewn-bound spine that opens completely flat. 100gsm ivory paper is fountain-pen friendly and bleed-resistant. Includes 2 ribbon bookmarks, expandable back pocket, and elastic closure band. Hard linen cover. Index pages and numbered sheets for bullet journaling. Available in 8 cover colours.',
  },
  {
    name: 'LED Desk Lamp with Wireless Charger',
    category: 'Office',
    price: 49.99,
    stock: 55,
    imageUrl: img('photo-1534972195531-d756b9bfa9f2'),
    description:
      'Touch-dimmer lamp with 3 colour temperature modes (warm 3000K / neutral 4500K / cool 6500K) and 10 brightness levels. Qi wireless charging pad integrated into the base (up to 10W). USB-A port for wired device charging. Memory function restores last setting on power. Eye-care flicker-free LEDs. Flexible swan-neck arm, 360° rotation.',
  },
  {
    name: 'Gel Ink Pen Set 12-Pack 0.5mm',
    category: 'Office',
    price: 14.99,
    stock: 200,
    imageUrl: img('photo-1583001308807-f80d0ad1ca68'),
    description:
      'Premium 0.5mm fine-tip gel ink pens with quick-dry, fade-resistant ink in 12 colours: black, blue, red, green, purple, orange, brown, pink, teal, violet, grey, and gold. Rubberised grips reduce hand fatigue. Acid-free, archival-quality ink. Suitable for note-taking, planner decorating, journaling, and calligraphy. Refillable cartridge compatible.',
  },
  {
    name: 'Anti-Fatigue Standing Desk Mat',
    category: 'Office',
    price: 54.99,
    stock: 40,
    imageUrl: img('photo-1497366754035-f200968a6e72'),
    description:
      '20×32 inch dual-layer polyurethane foam mat with beveled safety edges and a textured non-slip base. 20mm cushioning relieves pressure on feet, knees, and lower back during standing work. Waterproof and easy-wipe surface. Passes BIFMA ergonomic standards. Compatible with all standing-desk configurations. Odour-free from day one.',
  },

  // ── Automotive (6) ────────────────────────────────────────────────
  {
    name: 'USB-C Car Charger 65W Dual Port',
    category: 'Automotive',
    price: 24.99,
    stock: 150,
    imageUrl: img('photo-1606577924006-27d39b132ae2'),
    description:
      'Intelligent PD 65W USB-C port charges modern laptops and phones at full speed. Second USB-A port delivers 18W QC 3.0 for quick smartphone charging. Voltage and current display ring lights up in ambient mode. Works in 12V–24V sockets. Titanium alloy body dissipates heat efficiently. Multi-chip protection against over-voltage, over-current, and short circuits.',
  },
  {
    name: '4K Dual-Channel Dash Cam GPS',
    category: 'Automotive',
    price: 149.99,
    stock: 25,
    imageUrl: img('photo-1484557985045-edf25e08da73'),
    description:
      'Front 4K (3840×2160) + rear 1080p FHD cameras record simultaneously with wide 160° lens. Sony STARVIS night-vision sensor captures clear footage in low light. Built-in GPS logs speed and location on every frame. Loop recording with automatic overwrite. G-sensor locks clips on impact. 32GB card included; supports up to 256GB. Parking mode via hardwire kit (sold separately).',
  },
  {
    name: 'Leather Steering Wheel Cover 15"',
    category: 'Automotive',
    price: 22.99,
    stock: 80,
    imageUrl: img('photo-1449965408869-eaa3f722e40d'),
    description:
      'Genuine microfibre leather cover with diamond-quilted stitching for enhanced grip and heat resistance. Anti-slip inner ring holds securely on wheels 38–39cm diameter without adhesive tape. Breathable perforated panel reduces sweaty hands. Absorbs steering vibration. Includes needle and thread for a custom fit finish. Available in black, beige, and red.',
  },
  {
    name: 'Portable Car Vacuum 6000Pa',
    category: 'Automotive',
    price: 39.99,
    stock: 60,
    imageUrl: img('photo-1487260211189-670c54da558d'),
    description:
      'Corded 12V plug-in vacuum delivers 6000Pa suction power with a HEPA filter that captures 99.97% of particles. Includes crevice nozzle, brush attachment, and flat nozzle for vents and seats. 5-metre cord reaches every corner of the cabin. Washable filter reduces running costs. Compact design stores in the included carrying bag. Auto shut-off on overheat.',
  },
  {
    name: 'Emergency Roadside Safety Kit',
    category: 'Automotive',
    price: 34.99,
    stock: 70,
    imageUrl: img('photo-1488590528505-98d2b5aba04b'),
    description:
      'Complete 42-piece kit includes 4-metre booster cables (thick 4-gauge copper clad), reflective safety vest, LED flashlight, first-aid kit (30 pieces), rain poncho, tow rope (3 tonnes), window breaker, seat belt cutter, and insulated carry bag. Fits in boot without taking much space. Ideal for long-distance drivers.',
  },
  {
    name: 'Magnetic Car Phone Mount 360°',
    category: 'Automotive',
    price: 16.99,
    stock: 130,
    imageUrl: img('photo-1503376780353-7e6692767b70'),
    description:
      'Powerful N52 neodymium magnet holds phones up to 400g securely on dashboard or air vent bracket. 360° ball-joint articulation for portrait or landscape viewing. Metal plates (adhesive and snap-on) mount flush inside cases without affecting wireless charging (iPhone-compatible). One-second mounting; compatible with all Android, Apple, and GPS devices.',
  },

  // ── More Electronics (5) ──────────────────────────────────────────
  {
    name: 'TKL Mechanical Keyboard RGB',
    category: 'Electronics',
    price: 99.99,
    stock: 40,
    imageUrl: img('photo-1561883088-039e53143d73'),
    description:
      'Tenkeyless layout (87 keys) with tactile-clicky brown switches rated 50 million keystrokes. Per-key RGB backlight with 16 presets and software customisation via USB. Double-shot PBT keycaps resist fade. Detachable braided USB-C cable. Compact aluminium top plate. NKRO anti-ghosting for simultaneous key presses. Compatible with Windows and macOS.',
  },
  {
    name: '27" QHD 144Hz Curved Monitor',
    category: 'Electronics',
    price: 399.99,
    stock: 12,
    imageUrl: img('photo-1527443224154-c4a3942d3acf'),
    description:
      '2560×1440 resolution VA panel with 1800R curvature delivers immersive depth. 144Hz refresh rate and 1ms MPRT response time eliminate motion blur in fast-paced games. AMD FreeSync Premium reduces screen tearing. 95% DCI-P3 colour gamut. HDR10 support with 400-nit peak brightness. HDMI 2.0 × 2, DisplayPort 1.4, 4× USB 3.0 hub. Fully adjustable stand (height, tilt, swivel).',
  },
  {
    name: 'Portable SSD 2TB USB 3.2',
    category: 'Electronics',
    price: 129.99,
    stock: 35,
    imageUrl: img('photo-1558618666-fcd25c85cd64'),
    description:
      'Compact palm-sized drive delivers sequential reads up to 1050MB/s and writes up to 1000MB/s via USB 3.2 Gen 2. Hardware AES-256 encryption with optional password lock. Shock-resistant outer shell rated to 2m drop. Includes USB-C and USB-A cables. Works with PC, Mac, iPad Pro, Android, and PS5 (extended storage). No external power required.',
  },
  {
    name: 'True Wireless ANC Earbuds',
    category: 'Electronics',
    price: 89.99,
    stock: 50,
    imageUrl: img('photo-1606220945770-b5b6c2c55bf1'),
    description:
      'Hybrid active noise cancellation blocks up to 35dB of ambient sound. 10mm dynamic drivers with DSP tuning deliver deep bass and clear highs. 8-hour bud battery + 24-hour charging case (USB-C). IPX5 sweat and rain resistance. Transparency mode for ambient awareness. Touch controls on each bud. Multipoint Bluetooth 5.3 — connect two devices simultaneously.',
  },
  {
    name: 'Smart Home Hub Zigbee & Z-Wave',
    category: 'Electronics',
    price: 79.99,
    stock: 30,
    imageUrl: img('photo-1558002038-1055907df827'),
    description:
      'Central hub controls Zigbee, Z-Wave, and Wi-Fi devices from a single app without cloud dependency. Local processing ensures automations work even without internet. Supports 2000+ device types from 1800+ brands. Matter protocol ready. Dual-band Wi-Fi, Ethernet, Bluetooth 5. Runs Home Assistant OS; no subscription fees ever. 8-hour UPS battery backup built-in.',
  },

  // ── More Clothing (5) ─────────────────────────────────────────────
  {
    name: 'Merino Wool Crew Neck Sweater',
    category: 'Clothing',
    price: 89.99,
    stock: 55,
    imageUrl: img('photo-1434389677669-e08b4cac3105'),
    description:
      'Extra-fine 17.5-micron ZQ Merino wool is naturally temperature-regulating — warm in cold, cool in warmth. Breathable, anti-odour, and machine washable at 30°C. Classic relaxed crew-neck silhouette with ribbed collar, cuffs, and hem. Ethically sourced from certified New Zealand farms. Available in sizes XS–2XL in 10 colours. A wardrobe essential.',
  },
  {
    name: 'Technical Running Shorts 5"',
    category: 'Clothing',
    price: 44.99,
    stock: 70,
    imageUrl: img('photo-1571019614242-c5c5dee9f50b'),
    description:
      '5-inch inseam running shorts in 4-way stretch recycled polyester. Moisture-wicking DriMax fabric keeps you dry at any pace. Back zip pocket fits a key or card. Mesh inner brief for support without restriction. Reflective logo and hem stripe for low-light visibility. Machine washable. Available in sizes XS–3XL in 8 colourways.',
  },
  {
    name: 'Packable Down Puffer Vest 800-Fill',
    category: 'Clothing',
    price: 119.99,
    stock: 40,
    imageUrl: img('photo-1551488831-00ddcb6c6bd3'),
    description:
      '800-fill-power RDS-certified goose down insulation in a 20D nylon ripstop shell with DWR water-repellent finish. Packs into its own chest pocket to a size smaller than a water bottle. Zippered hand pockets, inner media pocket. Ideal as a mid-layer or standalone piece in 0–10°C conditions. Available in 9 colours; sizes XS–3XL.',
  },
  {
    name: 'High-Waist Seamless Yoga Leggings',
    category: 'Clothing',
    price: 54.99,
    stock: 85,
    imageUrl: img('photo-1506629082955-511b1aa562c8'),
    description:
      'Buttery-smooth 80% nylon / 20% spandex four-way stretch fabric feels second-skin comfortable. High-waist design with wide compression band stays in place during inversions. Squat-proof opacity tested to 280gsm. Moisture-wicking, quick-dry finish. Hidden phone pocket in waistband. Perfect for yoga, Pilates, gym, and casual wear. Sizes XS–3XL.',
  },
  {
    name: 'Oxford Button-Down Slim Shirt',
    category: 'Clothing',
    price: 59.99,
    stock: 60,
    imageUrl: img('photo-1598522325074-042db73aa4e6'),
    description:
      'Classic Oxford weave 100% wrinkle-resistant cotton shirt in a modern slim cut. Chest pocket, adjustable barrel cuffs, and sewn-in collar stays keep you looking sharp from morning to night. Machine washable — hang dry in 30 minutes. Available in white, blue, pink, and grey check. Sizes XS–3XL. Pairs with chinos, jeans, or suit trousers.',
  },
];

async function seed() {
  let ok = 0;
  let fail = 0;
  for (const p of products) {
    try {
      const res = await fetch(`${BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(p),
      });
      if (!res.ok) {
        const t = await res.text();
        console.error(`FAIL [${p.name}] ${res.status}: ${t.slice(0, 120)}`);
        fail++;
      } else {
        const d = await res.json();
        console.log(`OK   [${String(d.id).padStart(3)}] ${p.name}`);
        ok++;
      }
    } catch (e) {
      console.error(`ERR  [${p.name}]`, e.message);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} created, ${fail} failed`);
}

seed();
