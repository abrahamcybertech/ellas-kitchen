const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '../data/ellas_kitchen.db');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
const schemaFile = path.join(__dirname, '../src/lib/db/schema.sql');
const sql = fs.readFileSync(schemaFile, 'utf8');
db.exec(sql);

console.log('Schema ready. Seeding initial data...');

// Check if already seeded
const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get();
if (catCount && catCount.c > 0) {
  console.log('Database already has categories. Ready!');
  process.exit(0);
}

// 1. Business Settings
const defaultSettings = {
  business_name: "Ella's Kitchen",
  tagline: "Authentic Nigerian Cuisine, Pastries and Refreshments",
  phone_number: "+234 808 005 8907",
  whatsapp_number: "+234 808 005 8907",
  business_address: "Nyanya, Abuja, Nigeria",
  opening_hours: "Monday to Sunday: 9:00 AM to 8:00 PM",
  delivery_zones: [
    { id: "zone_nyanya", name: "Nyanya, Karu and Jikwoyi", fee: 1500, estimated_minutes: "25 to 40 mins" },
    { id: "zone_wuse", name: "Wuse II and Jabi", fee: 1500, estimated_minutes: "30 to 45 mins" },
    { id: "zone_maitama_asokoro", name: "Maitama and Asokoro", fee: 2000, estimated_minutes: "40 to 55 mins" },
    { id: "zone_garki_cbd", name: "Garki and Central Business District", fee: 2500, estimated_minutes: "45 to 60 mins" },
    { id: "zone_gwarinpa_kubwa", name: "Gwarinpa, Kubwa and Lugbe", fee: 3500, estimated_minutes: "60 to 80 mins" }
  ],
  pickup_instructions: "Pickup is ready within 25 minutes of confirmation at our Nyanya kitchen counter.",
  min_order_amount: 2500,
  currency: "NGN",
  paystack_enabled: true,
  bank_transfer_enabled: true,
  cash_on_delivery_enabled: false,
  cash_on_pickup_enabled: true,
  bank_details: {
    bank_name: "Zenith Bank",
    account_number: "1223344556",
    account_name: "Ella's Kitchen Delicacies"
  },
  social_links: {
    instagram: "https://instagram.com/ellaskitchen_ng",
    facebook: "https://facebook.com/ellaskitchen_ng",
    twitter: "https://x.com/ellaskitchen_ng",
    tiktok: "https://tiktok.com/@ellakitchen"
  },
  announcement_banner: {
    enabled: true,
    text: "Fresh hot batches ready daily. Order early for prompt doorstep delivery across Abuja."
  }
};

db.prepare(`
  INSERT INTO business_settings (key, value, updated_at)
  VALUES ('general', ?, datetime('now'))
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
`).run(JSON.stringify(defaultSettings));

// 2. Staff Users
const superAdminPasswordHash = bcrypt.hashSync('AdminPassword2026!', 10);
const orderManagerPasswordHash = bcrypt.hashSync('OrderStaff2026!', 10);
const menuManagerPasswordHash = bcrypt.hashSync('MenuStaff2026!', 10);

const insertStaff = db.prepare(`
  INSERT OR IGNORE INTO staff_users (id, name, email, password_hash, role, is_active, created_at)
  VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
`);

insertStaff.run('staff_super_admin', 'Ella Okon', 'admin@ellaskitchen.ng', superAdminPasswordHash, 'super_admin');
insertStaff.run('staff_order_mgr', 'Tunde Adeleke', 'orders@ellaskitchen.ng', orderManagerPasswordHash, 'order_manager');
insertStaff.run('staff_menu_mgr', 'Ngozi Eze', 'menu@ellaskitchen.ng', menuManagerPasswordHash, 'menu_manager');

// 3. Categories
const categories = [
  {
    id: 'cat_rice',
    name: 'Nigerian Rice Dishes',
    slug: 'nigerian-rice-dishes',
    description: 'Smoky party jollof, fried rice, and native village rice prepared with traditional seasonings.',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    display_order: 1
  },
  {
    id: 'cat_mains',
    name: 'Main Meals and Soups',
    slug: 'main-meals-and-soups',
    description: 'Rich traditional soups, pounded yam, assorted meats, and hearty Nigerian home style stews.',
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    display_order: 2
  },
  {
    id: 'cat_snacks',
    name: 'Traditional Snacks',
    slug: 'traditional-snacks',
    description: 'Golden puff puff, flaky meat pies, egg rolls, and crispy chin chin prepared fresh all day.',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
    display_order: 3
  },
  {
    id: 'cat_cakes',
    name: 'Cakes and Pastries',
    slug: 'cakes-and-pastries',
    description: 'Moist birthday cakes, celebration pastries, and custom baked treats for every milestone.',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    display_order: 4
  },
  {
    id: 'cat_drinks',
    name: 'Chilled Drinks',
    slug: 'chilled-drinks',
    description: 'Handcrafted zobo, signature Chapman, natural fruit juices, and chilled thirst quenchers.',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    display_order: 5
  },
  {
    id: 'cat_catering',
    name: 'Catering and Party Trays',
    slug: 'catering-and-party-trays',
    description: 'Generous party trays, small chops platters, and custom catering for corporate and family gatherings.',
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    display_order: 6
  }
];

const insertCat = db.prepare(`
  INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
`);

for (const c of categories) {
  insertCat.run(c.id, c.name, c.slug, c.description, c.image_url, c.display_order);
}

// 4. Products
const products = [
  {
    id: 'prod_jollof_chicken',
    category_id: 'cat_rice',
    name: 'Party Jollof Rice with Crispy Fried Chicken',
    slug: 'party-jollof-rice-with-fried-chicken',
    description: 'Signature smoky party jollof rice simmered in aromatic tomato and bell pepper base, served with golden spiced fried chicken.',
    price: 4500,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    prep_time: '20 to 25 mins',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Halal', 'Spiced']),
    variations: [
      { id: 'var_jollof_chicken', name: 'With Crispy Fried Chicken', price_modifier: 0, is_default: 1 },
      { id: 'var_jollof_goat', name: 'With Peppered Goat Meat (Asun)', price_modifier: 1200, is_default: 0 },
      { id: 'var_jollof_fish', name: 'With Fried Croaker Fish', price_modifier: 1500, is_default: 0 },
      { id: 'var_jollof_assorted', name: 'With Assorted Meat Medley', price_modifier: 1000, is_default: 0 }
    ],
    extras: [
      { id: 'ext_plantain_1', name: 'Fried Sweet Plantain (Dodo)', price: 800, max_quantity: 4 },
      { id: 'ext_coleslaw_1', name: 'Fresh Creamy Coleslaw', price: 700, max_quantity: 3 },
      { id: 'ext_moimoi_1', name: 'Steamed Bean Cake (Moi Moi)', price: 1000, max_quantity: 3 },
      { id: 'ext_pepper_sauce_1', name: 'Extra Hot Pepper Sauce', price: 500, max_quantity: 2 }
    ]
  },
  {
    id: 'prod_fried_rice_chicken',
    category_id: 'cat_rice',
    name: 'Special Fried Rice with Golden Chicken',
    slug: 'special-fried-rice-with-chicken',
    description: 'Delicately seasoned yellow rice tossed with sweet corn, carrots, runner beans, liver bits, and paired with tender chicken.',
    price: 4500,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    prep_time: '20 to 25 mins',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Halal']),
    variations: [
      { id: 'var_fr_chicken', name: 'With Crispy Fried Chicken', price_modifier: 0, is_default: 1 },
      { id: 'var_fr_beef', name: 'With Peppered Tender Beef', price_modifier: 1000, is_default: 0 }
    ],
    extras: [
      { id: 'ext_plantain_2', name: 'Fried Sweet Plantain (Dodo)', price: 800, max_quantity: 4 },
      { id: 'ext_coleslaw_2', name: 'Fresh Creamy Coleslaw', price: 700, max_quantity: 3 }
    ]
  },
  {
    id: 'prod_assorted_meat_dish',
    category_id: 'cat_mains',
    name: 'Traditional Assorted Meat Pepper Dish',
    slug: 'traditional-assorted-meat-pepper-dish',
    description: 'Hearty traditional dish featuring tender goat meat, beef shaki, cow leg, and ponmo simmered in rich aromatic peppered broth.',
    price: 5500,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    prep_time: '25 to 30 mins',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Spicy', 'Gluten Free']),
    variations: [
      { id: 'var_assorted_std', name: 'Standard Bowl', price_modifier: 0, is_default: 1 },
      { id: 'var_assorted_jumbo', name: 'Jumbo Feast Portion', price_modifier: 2500, is_default: 0 }
    ],
    extras: [
      { id: 'ext_swallow_yam', name: 'Pounded Yam Portion', price: 1000, max_quantity: 3 },
      { id: 'ext_swallow_eba', name: 'Yellow Garri (Eba) Portion', price: 800, max_quantity: 3 }
    ]
  },
  {
    id: 'prod_egusi_soup',
    category_id: 'cat_mains',
    name: 'Rich Egusi Soup with Choice of Swallow',
    slug: 'rich-egusi-soup-with-swallow',
    description: 'Thick ground melon seed soup enriched with chopped spinach, dried fish, stockfish, and your choice of swallow and meat.',
    price: 5200,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    prep_time: '25 to 30 mins',
    is_available: 1,
    is_featured: 0,
    dietary_tags: JSON.stringify(['Authentic']),
    variations: [
      { id: 'var_egusi_py', name: 'With Pounded Yam and Beef', price_modifier: 0, is_default: 1 },
      { id: 'var_egusi_eba', name: 'With Yellow Eba and Goat Meat', price_modifier: 800, is_default: 0 },
      { id: 'var_egusi_amala', name: 'With Smooth Amala and Assorted Meat', price_modifier: 1000, is_default: 0 }
    ],
    extras: [
      { id: 'ext_extra_fish', name: 'Portion of Dried Fish', price: 1500, max_quantity: 2 },
      { id: 'ext_extra_meat', name: 'Extra Assorted Meat Piece', price: 1200, max_quantity: 4 }
    ]
  },
  {
    id: 'prod_puff_puff',
    category_id: 'cat_snacks',
    name: 'Fresh Golden Puff Puff (10 Pieces)',
    slug: 'fresh-golden-puff-puff',
    description: 'Pillowy soft, warm, deep fried Nigerian dough balls with a subtle hint of nutmeg and vanilla sweetness.',
    price: 1800,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
    prep_time: '15 mins',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Vegetarian', 'Sweet']),
    variations: [
      { id: 'var_puff_classic', name: 'Classic Sweet Nutmeg', price_modifier: 0, is_default: 1 },
      { id: 'var_puff_peppered', name: 'Spicy Peppered Puff Puff', price_modifier: 300, is_default: 0 }
    ],
    extras: [
      { id: 'ext_puff_sauce', name: 'Spicy Dip Pepper Sauce', price: 500, max_quantity: 2 }
    ]
  },
  {
    id: 'prod_meat_pie',
    category_id: 'cat_snacks',
    name: 'Classic Nigerian Beef Meat Pie (2 Pieces)',
    slug: 'classic-nigerian-beef-meat-pie',
    description: 'Flaky, buttery golden pastry crust packed with seasoned minced beef, soft diced potatoes, and carrots.',
    price: 2400,
    image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    prep_time: '10 to 15 mins',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Halal', 'Savory']),
    variations: [
      { id: 'var_pie_standard', name: 'Twin Pack (2 Pies)', price_modifier: 0, is_default: 1 },
      { id: 'var_pie_box', name: 'Baker Family Box (6 Pies)', price_modifier: 4500, is_default: 0 }
    ],
    extras: []
  },
  {
    id: 'prod_chin_chin',
    category_id: 'cat_snacks',
    name: 'Ella Crunchy Sweet Chin Chin (500g Jar)',
    slug: 'ella-crunchy-sweet-chin-chin',
    description: 'Crispy, crunchy fried Nigerian snack pieces lightly sweet with butter and aromatic nutmeg in a reusable seal jar.',
    price: 3200,
    image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    prep_time: 'Immediate',
    is_available: 1,
    is_featured: 0,
    dietary_tags: JSON.stringify(['Vegetarian', 'Crunchy']),
    variations: [],
    extras: []
  },
  {
    id: 'prod_chocolate_cake',
    category_id: 'cat_cakes',
    name: 'Luxury Celebration Chocolate Fudge Cake',
    slug: 'luxury-celebration-chocolate-fudge-cake',
    description: 'Decadent moist chocolate sponge layered with rich dark chocolate ganache, finished with gold dusting for celebrations.',
    price: 22000,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    prep_time: '24 hours notice or same day express',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Celebration', 'Vegetarian']),
    variations: [
      { id: 'var_cake_8in', name: '8 Inch Double Layer (Serves 10 to 12)', price_modifier: 0, is_default: 1 },
      { id: 'var_cake_10in', name: '10 Inch Triple Layer (Serves 18 to 22)', price_modifier: 10000, is_default: 0 }
    ],
    extras: [
      { id: 'ext_candles', name: 'Gold Celebration Birthday Candles', price: 1200, max_quantity: 2 },
      { id: 'ext_cake_topper', name: 'Custom Happy Birthday Acrylic Topper', price: 2500, max_quantity: 1 }
    ]
  },
  {
    id: 'prod_vanilla_cake',
    category_id: 'cat_cakes',
    name: 'Signature Vanilla Buttercream Dream Cake',
    slug: 'signature-vanilla-buttercream-dream-cake',
    description: 'Airy Madagascar vanilla bean sponge with velvety smooth whipped buttercream and edible gold flakes.',
    price: 20000,
    image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    prep_time: '24 hours notice',
    is_available: 1,
    is_featured: 0,
    dietary_tags: JSON.stringify(['Celebration']),
    variations: [
      { id: 'var_vcake_8in', name: '8 Inch Standard (Serves 10 to 12)', price_modifier: 0, is_default: 1 },
      { id: 'var_vcake_10in', name: '10 Inch Grand (Serves 18 to 22)', price_modifier: 9000, is_default: 0 }
    ],
    extras: [
      { id: 'ext_candles_2', name: 'Gold Celebration Birthday Candles', price: 1200, max_quantity: 2 }
    ]
  },
  {
    id: 'prod_zobo_drink',
    category_id: 'cat_drinks',
    name: 'Chilled Handcrafted Zobo Elixir (500ml Bottle)',
    slug: 'chilled-handcrafted-zobo-elixir',
    description: 'Refreshing pure hibiscus tea infused with fresh ginger root, whole cloves, and crushed organic pineapple.',
    price: 1500,
    image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    prep_time: 'Chilled ready',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Vegan', 'Organic', 'Chilled']),
    variations: [
      { id: 'var_zobo_500ml', name: 'Single 500ml Bottle', price_modifier: 0, is_default: 1 },
      { id: 'var_zobo_4pack', name: 'Family 4 Bottle Bundle', price_modifier: 4000, is_default: 0 }
    ],
    extras: []
  },
  {
    id: 'prod_chapman_drink',
    category_id: 'cat_drinks',
    name: 'Ella Special Signature Nigerian Chapman (500ml)',
    slug: 'ella-special-signature-chapman',
    description: 'The definitive Abuja party cocktail mocktail. Sparkling citrus blend, aromatic bitters, cucumber, and lime slices.',
    price: 1800,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    prep_time: 'Chilled ready',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Chilled', 'Refreshing']),
    variations: [],
    extras: []
  },
  {
    id: 'prod_party_tray_jollof',
    category_id: 'cat_catering',
    name: 'Mega Party Jollof Rice Tray (Feeds 10 to 12)',
    slug: 'mega-party-jollof-rice-tray',
    description: 'Generous aluminum catering buffet tray loaded with authentic smoky party jollof rice, plantain, and 12 pieces of grilled chicken.',
    price: 42000,
    image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    prep_time: '2 hours advance order',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Catering', 'Party']),
    variations: [
      { id: 'var_tray_chicken', name: 'With 12 Fried Chicken Cuts', price_modifier: 0, is_default: 1 },
      { id: 'var_tray_beef', name: 'With 15 Peppered Beef Cuts', price_modifier: 5000, is_default: 0 },
      { id: 'var_tray_mix', name: 'Combo Chicken and Asun Goat Meat', price_modifier: 8000, is_default: 0 }
    ],
    extras: [
      { id: 'ext_tray_moimoi', name: 'Half Tray Steamed Moi Moi (12 packs)', price: 10000, max_quantity: 2 },
      { id: 'ext_tray_salad', name: 'Large Tossed Garden Coleslaw Bowl', price: 6000, max_quantity: 2 }
    ]
  },
  {
    id: 'prod_small_chops_platter',
    category_id: 'cat_catering',
    name: 'Executive Small Chops Platter (50 Pieces)',
    slug: 'executive-small-chops-platter',
    description: 'Crowd pleaser Nigerian event platter comprising 20 puff puff, 10 crispy spring rolls, 10 beef samosas, and 10 peppered gizzard bites.',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    prep_time: '90 mins notice',
    is_available: 1,
    is_featured: 1,
    dietary_tags: JSON.stringify(['Finger Food', 'Event Favorite']),
    variations: [],
    extras: []
  }
];

const insertProd = db.prepare(`
  INSERT OR REPLACE INTO products (id, category_id, name, slug, description, price, image_url, prep_time, is_available, is_featured, dietary_tags, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

const insertVar = db.prepare(`
  INSERT OR REPLACE INTO product_variations (id, product_id, name, price_modifier, is_default, display_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertExt = db.prepare(`
  INSERT OR REPLACE INTO product_extras (id, product_id, name, price, max_quantity, display_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const p of products) {
  insertProd.run(p.id, p.category_id, p.name, p.slug, p.description, p.price, p.image_url, p.prep_time, p.is_available, p.is_featured, p.dietary_tags);
  let vIdx = 0;
  for (const v of p.variations) {
    insertVar.run(v.id, p.id, v.name, v.price_modifier, v.is_default, vIdx++);
  }
  let eIdx = 0;
  for (const e of p.extras) {
    insertExt.run(e.id, p.id, e.name, e.price, e.max_quantity, eIdx++);
  }
}

console.log("Successfully seeded Ella's Kitchen production database with complete dishes, categories, and credentials.");
