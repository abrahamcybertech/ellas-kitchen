import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import {
  Category,
  Product,
  ProductVariation,
  ProductExtra,
  Order,
  OrderItemSnapshot,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  BusinessSettings,
  StaffUser,
  AuditLogItem,
  Role,
} from '@/lib/types';

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'ellas_kitchen.db');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  dbInstance = db;

  // Initialize schema if needed
  initSchema(db);

  return db;
}

function initSchema(db: DatabaseSync) {
  const schemaFile = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql');
  if (fs.existsSync(schemaFile)) {
    const sql = fs.readFileSync(schemaFile, 'utf8');
    db.exec(sql);
  } else {
    // Fallback schema inline
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        price INTEGER NOT NULL,
        image_url TEXT,
        prep_time TEXT,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_featured INTEGER NOT NULL DEFAULT 0,
        dietary_tags TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
      );
      CREATE TABLE IF NOT EXISTS product_variations (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        price_modifier INTEGER NOT NULL DEFAULT 0,
        is_default INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS product_extras (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        max_quantity INTEGER NOT NULL DEFAULT 5,
        display_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        tracking_token TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        fulfilment_type TEXT NOT NULL,
        delivery_address TEXT,
        delivery_zone TEXT,
        preferred_time TEXT,
        customer_notes TEXT,
        subtotal INTEGER NOT NULL,
        delivery_fee INTEGER NOT NULL DEFAULT 0,
        discount_amount INTEGER NOT NULL DEFAULT 0,
        total_amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending_confirmation',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT,
        product_name TEXT NOT NULL,
        unit_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        variation_snapshot TEXT,
        extras_snapshot TEXT,
        subtotal INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS order_status_history (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        status TEXT NOT NULL,
        note TEXT,
        created_by TEXT NOT NULL DEFAULT 'System',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        reference TEXT NOT NULL UNIQUE,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        provider_metadata TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS business_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS staff_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'order_manager',
        is_active INTEGER NOT NULL DEFAULT 1,
        last_login_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_email TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        ip_address TEXT,
        details TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  // Ensure default data is seeded if categories is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (!countRow || countRow.count === 0) {
    seedInitialData(db);
  }
}

export function seedInitialData(db: DatabaseSync) {
  // 1. Business Settings
  const defaultSettings: BusinessSettings = {
    business_name: "Ella's Kitchen",
    tagline: 'Authentic Nigerian Cuisine, Pastries and Refreshments',
    phone_number: '+234 808 005 8907',
    whatsapp_number: '+234 808 005 8907',
    business_address: 'Nyanya, Abuja, Nigeria',
    opening_hours: 'Monday to Sunday: 9:00 AM to 8:00 PM',
    delivery_zones: [
      { id: 'zone_nyanya', name: 'Nyanya, Karu and Jikwoyi', fee: 1500, estimated_minutes: '25 to 40 mins' },
      { id: 'zone_wuse', name: 'Wuse II and Jabi', fee: 1500, estimated_minutes: '30 to 45 mins' },
      { id: 'zone_maitama_asokoro', name: 'Maitama and Asokoro', fee: 2000, estimated_minutes: '40 to 55 mins' },
      { id: 'zone_garki_cbd', name: 'Garki and Central Business District', fee: 2500, estimated_minutes: '45 to 60 mins' },
      { id: 'zone_gwarinpa_kubwa', name: 'Gwarinpa, Kubwa and Lugbe', fee: 3500, estimated_minutes: '60 to 80 mins' },
    ],
    pickup_instructions: 'Pickup is ready within 25 minutes of confirmation at our Nyanya kitchen counter.',
    min_order_amount: 2500,
    currency: 'NGN',
    paystack_enabled: true,
    bank_transfer_enabled: true,
    cash_on_delivery_enabled: false,
    cash_on_pickup_enabled: true,
    bank_details: {
      bank_name: 'Zenith Bank',
      account_number: '1223344556',
      account_name: "Ella's Kitchen Delicacies",
    },
    social_links: {
      instagram: 'https://instagram.com/ellaskitchen_ng',
      facebook: 'https://facebook.com/ellaskitchen_ng',
      twitter: 'https://x.com/ellaskitchen_ng',
      tiktok: 'https://tiktok.com/@ellakitchen',
    },
    announcement_banner: {
      enabled: true,
      text: 'Fresh hot batches ready daily. Order early for prompt doorstep delivery across Abuja.',
    },
  };

  const insertSetting = db.prepare(`
    INSERT INTO business_settings (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  insertSetting.run('general', JSON.stringify(defaultSettings));

  // 2. Initial Staff Users
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

  // 3. Initial Categories
  const categoriesData = [
    {
      id: 'cat_rice',
      name: 'Nigerian Rice Dishes',
      slug: 'nigerian-rice-dishes',
      description: 'Smoky party jollof, fried rice, and native village rice prepared with traditional seasonings.',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      display_order: 1,
    },
    {
      id: 'cat_mains',
      name: 'Main Meals and Soups',
      slug: 'main-meals-and-soups',
      description: 'Rich traditional soups, pounded yam, assorted meats, and hearty Nigerian home style stews.',
      image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
      display_order: 2,
    },
    {
      id: 'cat_snacks',
      name: 'Traditional Snacks',
      slug: 'traditional-snacks',
      description: 'Golden puff puff, flaky meat pies, egg rolls, and crispy chin chin prepared fresh all day.',
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
      display_order: 3,
    },
    {
      id: 'cat_cakes',
      name: 'Cakes and Pastries',
      slug: 'cakes-and-pastries',
      description: 'Moist birthday cakes, celebration pastries, and custom baked treats for every milestone.',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      display_order: 4,
    },
    {
      id: 'cat_drinks',
      name: 'Chilled Drinks',
      slug: 'chilled-drinks',
      description: 'Handcrafted zobo, signature Chapman, natural fruit juices, and chilled thirst quenchers.',
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      display_order: 5,
    },
    {
      id: 'cat_catering',
      name: 'Catering and Party Trays',
      slug: 'catering-and-party-trays',
      description: 'Generous party trays, small chops platters, and custom catering for corporate and family gatherings.',
      image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      display_order: 6,
    },
  ];

  const insertCategory = db.prepare(`
    INSERT OR REPLACE INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
  `);

  for (const cat of categoriesData) {
    insertCategory.run(cat.id, cat.name, cat.slug, cat.description, cat.image_url, cat.display_order);
  }

  // 4. Initial Products
  const productsData = [
    {
      id: 'prod_jollof_chicken',
      category_id: 'cat_rice',
      name: 'Party Jollof Rice with Crispy Fried Chicken',
      slug: 'party-jollof-rice-with-fried-chicken',
      description: 'Signature firewood party jollof rice simmered in aromatic tomato and bell pepper base, served with golden spiced fried chicken.',
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
        { id: 'var_jollof_assorted', name: 'With Assorted Meat Medley', price_modifier: 1000, is_default: 0 },
      ],
      extras: [
        { id: 'ext_plantain_1', name: 'Fried Sweet Plantain (Dodo)', price: 800, max_quantity: 4 },
        { id: 'ext_coleslaw_1', name: 'Fresh Creamy Coleslaw', price: 700, max_quantity: 3 },
        { id: 'ext_moimoi_1', name: 'Steamed Bean Cake (Moi Moi)', price: 1000, max_quantity: 3 },
        { id: 'ext_pepper_sauce_1', name: 'Extra Hot Pepper Sauce', price: 500, max_quantity: 2 },
      ],
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
        { id: 'var_fr_beef', name: 'With Peppered Tender Beef', price_modifier: 1000, is_default: 0 },
      ],
      extras: [
        { id: 'ext_plantain_2', name: 'Fried Sweet Plantain (Dodo)', price: 800, max_quantity: 4 },
        { id: 'ext_coleslaw_2', name: 'Fresh Creamy Coleslaw', price: 700, max_quantity: 3 },
      ],
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
        { id: 'var_assorted_jumbo', name: 'Jumbo Feast Portion', price_modifier: 2500, is_default: 0 },
      ],
      extras: [
        { id: 'ext_swallow_yam', name: 'Pounded Yam Portion', price: 1000, max_quantity: 3 },
        { id: 'ext_swallow_eba', name: 'Yellow Garri (Eba) Portion', price: 800, max_quantity: 3 },
      ],
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
        { id: 'var_egusi_amala', name: 'With Smooth Amala and Assorted Meat', price_modifier: 1000, is_default: 0 },
      ],
      extras: [
        { id: 'ext_extra_fish', name: 'Portion of Dried Fish', price: 1500, max_quantity: 2 },
        { id: 'ext_extra_meat', name: 'Extra Assorted Meat Piece', price: 1200, max_quantity: 4 },
      ],
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
        { id: 'var_puff_peppered', name: 'Spicy Peppered Puff Puff', price_modifier: 300, is_default: 0 },
      ],
      extras: [
        { id: 'ext_puff_sauce', name: 'Spicy Dip Pepper Sauce', price: 500, max_quantity: 2 },
      ],
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
        { id: 'var_pie_box', name: 'Baker Family Box (6 Pies)', price_modifier: 4500, is_default: 0 },
      ],
      extras: [],
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
      extras: [],
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
        { id: 'var_cake_10in', name: '10 Inch Triple Layer (Serves 18 to 22)', price_modifier: 10000, is_default: 0 },
      ],
      extras: [
        { id: 'ext_candles', name: 'Gold Celebration Birthday Candles', price: 1200, max_quantity: 2 },
        { id: 'ext_cake_topper', name: 'Custom Happy Birthday Acrylic Topper', price: 2500, max_quantity: 1 },
      ],
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
        { id: 'var_vcake_10in', name: '10 Inch Grand (Serves 18 to 22)', price_modifier: 9000, is_default: 0 },
      ],
      extras: [
        { id: 'ext_candles_2', name: 'Gold Celebration Birthday Candles', price: 1200, max_quantity: 2 },
      ],
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
        { id: 'var_zobo_4pack', name: 'Family 4 Bottle Bundle', price_modifier: 4000, is_default: 0 },
      ],
      extras: [],
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
      extras: [],
    },
    {
      id: 'prod_party_tray_jollof',
      category_id: 'cat_catering',
      name: 'Mega Party Jollof Rice Tray (Feeds 10 to 12)',
      slug: 'mega-party-jollof-rice-tray',
      description: 'Generous aluminum catering buffet tray loaded with authentic firewood party jollof rice, plantain, and 12 pieces of grilled chicken.',
      price: 42000,
      image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      prep_time: '2 hours advance order',
      is_available: 1,
      is_featured: 1,
      dietary_tags: JSON.stringify(['Catering', 'Party']),
      variations: [
        { id: 'var_tray_chicken', name: 'With 12 Fried Chicken Cuts', price_modifier: 0, is_default: 1 },
        { id: 'var_tray_beef', name: 'With 15 Peppered Beef Cuts', price_modifier: 5000, is_default: 0 },
        { id: 'var_tray_mix', name: 'Combo Chicken and Asun Goat Meat', price_modifier: 8000, is_default: 0 },
      ],
      extras: [
        { id: 'ext_tray_moimoi', name: 'Half Tray Steamed Moi Moi (12 packs)', price: 10000, max_quantity: 2 },
        { id: 'ext_tray_salad', name: 'Large Tossed Garden Coleslaw Bowl', price: 6000, max_quantity: 2 },
      ],
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
      extras: [],
    },
  ];

  const insertProduct = db.prepare(`
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

  for (const prod of productsData) {
    insertProduct.run(
      prod.id,
      prod.category_id,
      prod.name,
      prod.slug,
      prod.description,
      prod.price,
      prod.image_url,
      prod.prep_time,
      prod.is_available,
      prod.is_featured,
      prod.dietary_tags
    );

    let vIdx = 0;
    for (const v of prod.variations) {
      insertVar.run(v.id, prod.id, v.name, v.price_modifier, v.is_default, vIdx++);
    }

    let eIdx = 0;
    for (const e of prod.extras) {
      insertExt.run(e.id, prod.id, e.name, e.price, e.max_quantity, eIdx++);
    }
  }

  console.log("Seeded Ella's Kitchen initial schema, categories, products, and admin accounts.");
}

// ----------------------------------------------------
// Category Repository Methods
// ----------------------------------------------------

export function getCategories(publishedOnly = false): Category[] {
  const db = getDb();
  const where = publishedOnly ? 'WHERE c.is_active = 1' : '';
  const sql = `
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    ${where}
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `;
  const rows = db.prepare(sql).all() as any[];
  return rows.map((r) => ({
    ...r,
    is_active: Boolean(r.is_active),
    product_count: Number(r.product_count || 0),
  }));
}

export function getCategoryById(id: string): Category | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

export function getCategoryBySlug(slug: string): Category | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug) as any;
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

export function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
}): Category {
  const db = getDb();
  const id = 'cat_' + crypto.randomUUID().slice(0, 8);
  const slug =
    data.slug?.trim() ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const stmt = db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(
    id,
    data.name.trim(),
    slug,
    data.description || null,
    data.image_url || null,
    data.display_order ?? 0,
    data.is_active === false ? 0 : 1
  );

  return getCategoryById(id)!;
}

export function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    image_url?: string;
    display_order?: number;
    is_active?: boolean;
  }
): Category | null {
  const db = getDb();
  const existing = getCategoryById(id);
  if (!existing) return null;

  const name = data.name !== undefined ? data.name.trim() : existing.name;
  let slug = data.slug !== undefined ? data.slug.trim() : existing.slug;
  if (data.name && !data.slug) {
    slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  const description = data.description !== undefined ? data.description : existing.description;
  const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;
  const display_order = data.display_order !== undefined ? data.display_order : existing.display_order;
  const is_active = data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active ? 1 : 0;

  const stmt = db.prepare(`
    UPDATE categories
    SET name = ?, slug = ?, description = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(name, slug, description, image_url, display_order, is_active, id);

  return getCategoryById(id);
}

export function deleteCategory(id: string): { success: boolean; error?: string } {
  const db = getDb();

  // Safeguard: Check if category contains products
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(id) as {
    count: number;
  };

  if (productCount && productCount.count > 0) {
    return {
      success: false,
      error: `Cannot delete category because it contains ${productCount.count} existing products. Please reassign or archive the category instead.`,
    };
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return { success: true };
}

// ----------------------------------------------------
// Product Repository Methods
// ----------------------------------------------------

export function getProducts(options?: {
  categoryId?: string;
  categorySlug?: string;
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  search?: string;
}): Product[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.publishedOnly) {
    conditions.push('p.is_available = 1');
  }

  if (options?.featuredOnly) {
    conditions.push('p.is_featured = 1');
  }

  if (options?.categoryId) {
    conditions.push('p.category_id = ?');
    params.push(options.categoryId);
  }

  if (options?.categorySlug) {
    conditions.push('c.slug = ?');
    params.push(options.categorySlug);
  }

  if (options?.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${options.search}%`, `%${options.search}%`);
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const sql = `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    ${whereClause}
    ORDER BY p.is_featured DESC, p.created_at DESC
  `;

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((r) => {
    const variations = db
      .prepare('SELECT * FROM product_variations WHERE product_id = ? ORDER BY display_order ASC')
      .all(r.id) as any[];

    const extras = db
      .prepare('SELECT * FROM product_extras WHERE product_id = ? OR product_id IS NULL ORDER BY display_order ASC')
      .all(r.id) as any[];

    let dietary_tags: string[] = [];
    try {
      dietary_tags = r.dietary_tags ? JSON.parse(r.dietary_tags) : [];
    } catch {
      dietary_tags = [];
    }

    return {
      ...r,
      is_available: Boolean(r.is_available),
      is_featured: Boolean(r.is_featured),
      dietary_tags,
      variations: variations.map((v) => ({ ...v, is_default: Boolean(v.is_default) })),
      extras: extras.map((e) => ({ ...e })),
    };
  });
}

export function getProductById(id: string): Product | null {
  const db = getDb();
  const row = db
    .prepare(
      `
    SELECT p.*, c.name as category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?
  `
    )
    .get(id) as any;

  if (!row) return null;

  const variations = db
    .prepare('SELECT * FROM product_variations WHERE product_id = ? ORDER BY display_order ASC')
    .all(row.id) as any[];

  const extras = db
    .prepare('SELECT * FROM product_extras WHERE product_id = ? OR product_id IS NULL ORDER BY display_order ASC')
    .all(row.id) as any[];

  let dietary_tags: string[] = [];
  try {
    dietary_tags = row.dietary_tags ? JSON.parse(row.dietary_tags) : [];
  } catch {
    dietary_tags = [];
  }

  return {
    ...row,
    is_available: Boolean(row.is_available),
    is_featured: Boolean(row.is_featured),
    dietary_tags,
    variations: variations.map((v) => ({ ...v, is_default: Boolean(v.is_default) })),
    extras: extras.map((e) => ({ ...e })),
  };
}

export function createProduct(
  data: {
    category_id: string;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    image_url?: string;
    prep_time?: string;
    is_available?: boolean;
    is_featured?: boolean;
    dietary_tags?: string[];
  },
  variations: Array<{ name: string; price_modifier: number; is_default?: boolean }> = [],
  extras: Array<{ name: string; price: number; max_quantity?: number }> = []
): Product {
  const db = getDb();
  const id = 'prod_' + crypto.randomUUID().slice(0, 8);
  const slug =
    data.slug?.trim() ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const stmt = db.prepare(`
    INSERT INTO products (id, category_id, name, slug, description, price, image_url, prep_time, is_available, is_featured, dietary_tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(
    id,
    data.category_id,
    data.name.trim(),
    slug,
    data.description || null,
    Math.round(data.price),
    data.image_url || null,
    data.prep_time || null,
    data.is_available === false ? 0 : 1,
    data.is_featured ? 1 : 0,
    JSON.stringify(data.dietary_tags || [])
  );

  let vIdx = 0;
  const insertVar = db.prepare(
    'INSERT INTO product_variations (id, product_id, name, price_modifier, is_default, display_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const v of variations) {
    const varId = 'var_' + crypto.randomUUID().slice(0, 8);
    insertVar.run(varId, id, v.name.trim(), Math.round(v.price_modifier || 0), v.is_default ? 1 : 0, vIdx++);
  }

  let eIdx = 0;
  const insertExt = db.prepare(
    'INSERT INTO product_extras (id, product_id, name, price, max_quantity, display_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  for (const e of extras) {
    const extId = 'ext_' + crypto.randomUUID().slice(0, 8);
    insertExt.run(extId, id, e.name.trim(), Math.round(e.price || 0), e.max_quantity || 5, eIdx++);
  }

  return getProductById(id)!;
}

export function updateProduct(
  id: string,
  data: Partial<Product>,
  variations?: Array<{ id?: string; name: string; price_modifier: number; is_default?: boolean }>,
  extras?: Array<{ id?: string; name: string; price: number; max_quantity?: number }>
): Product | null {
  const db = getDb();
  const existing = getProductById(id);
  if (!existing) return null;

  const category_id = data.category_id !== undefined ? data.category_id : existing.category_id;
  const name = data.name !== undefined ? data.name.trim() : existing.name;
  let slug = data.slug !== undefined ? data.slug.trim() : existing.slug;
  if (data.name && !data.slug) {
    slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  const description = data.description !== undefined ? data.description : existing.description;
  const price = data.price !== undefined ? Math.round(data.price) : existing.price;
  const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;
  const prep_time = data.prep_time !== undefined ? data.prep_time : existing.prep_time;
  const is_available = data.is_available !== undefined ? (data.is_available ? 1 : 0) : existing.is_available ? 1 : 0;
  const is_featured = data.is_featured !== undefined ? (data.is_featured ? 1 : 0) : existing.is_featured ? 1 : 0;
  const dietary_tags = data.dietary_tags !== undefined ? JSON.stringify(data.dietary_tags) : JSON.stringify(existing.dietary_tags);

  const stmt = db.prepare(`
    UPDATE products
    SET category_id = ?, name = ?, slug = ?, description = ?, price = ?, image_url = ?, prep_time = ?, is_available = ?, is_featured = ?, dietary_tags = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(category_id, name, slug, description, price, image_url, prep_time, is_available, is_featured, dietary_tags, id);

  if (variations !== undefined) {
    db.prepare('DELETE FROM product_variations WHERE product_id = ?').run(id);
    let vIdx = 0;
    const insertVar = db.prepare(
      'INSERT INTO product_variations (id, product_id, name, price_modifier, is_default, display_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const v of variations) {
      const varId = v.id || 'var_' + crypto.randomUUID().slice(0, 8);
      insertVar.run(varId, id, v.name.trim(), Math.round(v.price_modifier || 0), v.is_default ? 1 : 0, vIdx++);
    }
  }

  if (extras !== undefined) {
    db.prepare('DELETE FROM product_extras WHERE product_id = ?').run(id);
    let eIdx = 0;
    const insertExt = db.prepare(
      'INSERT INTO product_extras (id, product_id, name, price, max_quantity, display_order) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const e of extras) {
      const extId = e.id || 'ext_' + crypto.randomUUID().slice(0, 8);
      insertExt.run(extId, id, e.name.trim(), Math.round(e.price || 0), e.max_quantity || 5, eIdx++);
    }
  }

  return getProductById(id);
}

export function deleteProduct(id: string): boolean {
  const db = getDb();
  // Safe delete: variations and extras cascade. Orders maintain immutable historical item snapshots.
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return true;
}

// ----------------------------------------------------
// Order Processing & Guest Checkout Repository
// ----------------------------------------------------

export function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EK-${year}-${randomChars}`;
}

export function generateTrackingToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 char high entropy token
}

export function createOrderWithValidation(params: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  fulfilment_type: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_zone?: string;
  preferred_time?: string;
  customer_notes?: string;
  payment_method: PaymentMethod;
  items: Array<{
    product_id: string;
    variation_id?: string;
    extras?: Array<{
      extra_id: string;
      quantity: number;
    }>;
    quantity: number;
    special_instructions?: string;
  }>;
}): { order: Order; tracking_token: string } {
  const db = getDb();
  const settings = getSettings();

  if (!params.items || params.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // Server-side recalculation of prices
  let subtotal = 0;
  const verifiedItems: OrderItemSnapshot[] = [];

  for (const requestedItem of params.items) {
    const product = getProductById(requestedItem.product_id);
    if (!product) {
      throw new Error(`Product not found: ${requestedItem.product_id}`);
    }

    if (!product.is_available) {
      throw new Error(`Product is currently unavailable: ${product.name}`);
    }

    const qty = Math.max(1, Math.min(99, Math.floor(requestedItem.quantity)));
    let unitPrice = product.price;
    let selectedVariationSnapshot: { name: string; price_modifier: number } | null = null;

    if (requestedItem.variation_id && product.variations?.length) {
      const variation = product.variations.find((v) => v.id === requestedItem.variation_id);
      if (variation) {
        unitPrice += variation.price_modifier;
        selectedVariationSnapshot = {
          name: variation.name,
          price_modifier: variation.price_modifier,
        };
      }
    }

    let extrasPriceSum = 0;
    const selectedExtrasSnapshot: Array<{ name: string; price: number; quantity: number }> = [];

    if (requestedItem.extras && requestedItem.extras.length > 0 && product.extras) {
      for (const extraReq of requestedItem.extras) {
        const extraDef = product.extras.find((e) => e.id === extraReq.extra_id);
        if (extraDef && extraReq.quantity > 0) {
          const extraQty = Math.min(extraDef.max_quantity || 5, extraReq.quantity);
          extrasPriceSum += extraDef.price * extraQty;
          selectedExtrasSnapshot.push({
            name: extraDef.name,
            price: extraDef.price,
            quantity: extraQty,
          });
        }
      }
    }

    const itemSubtotal = (unitPrice + extrasPriceSum) * qty;
    subtotal += itemSubtotal;

    verifiedItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: unitPrice,
      quantity: qty,
      variation_snapshot: selectedVariationSnapshot,
      extras_snapshot: selectedExtrasSnapshot.length ? selectedExtrasSnapshot : null,
      subtotal: itemSubtotal,
    });
  }

  // Delivery fee calculation
  let deliveryFee = 0;
  if (params.fulfilment_type === 'delivery') {
    if (params.delivery_zone) {
      const zone = settings.delivery_zones.find((z) => z.name === params.delivery_zone || z.id === params.delivery_zone);
      deliveryFee = zone ? zone.fee : 2000;
    } else {
      deliveryFee = 2000;
    }
  }

  const discountAmount = 0;
  const totalAmount = subtotal + deliveryFee - discountAmount;

  if (subtotal < (settings.min_order_amount || 0)) {
    throw new Error(`Minimum order amount is ₦${(settings.min_order_amount || 0).toLocaleString()}`);
  }

  const orderId = 'ord_' + crypto.randomUUID().slice(0, 10);
  const reference = generateOrderReference();
  const trackingToken = generateTrackingToken();

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, reference, tracking_token, customer_name, customer_phone, customer_email,
      fulfilment_type, delivery_address, delivery_zone, preferred_time, customer_notes,
      subtotal, delivery_fee, discount_amount, total_amount, status, payment_status,
      payment_method, metadata, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, 'pending_confirmation', 'pending',
      ?, ?, datetime('now'), datetime('now')
    )
  `);

  insertOrder.run(
    orderId,
    reference,
    trackingToken,
    params.customer_name.trim(),
    params.customer_phone.trim(),
    params.customer_email?.trim() || null,
    params.fulfilment_type,
    params.delivery_address?.trim() || null,
    params.delivery_zone || null,
    params.preferred_time || null,
    params.customer_notes?.trim() || null,
    subtotal,
    deliveryFee,
    discountAmount,
    totalAmount,
    params.payment_method,
    JSON.stringify({ created_via: 'guest_checkout' })
  );

  // Insert items with immutable snapshot
  const insertItem = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name, unit_price, quantity,
      variation_snapshot, extras_snapshot, subtotal, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const item of verifiedItems) {
    const itemId = 'item_' + crypto.randomUUID().slice(0, 8);
    insertItem.run(
      itemId,
      orderId,
      item.product_id,
      item.product_name,
      item.unit_price,
      item.quantity,
      item.variation_snapshot ? JSON.stringify(item.variation_snapshot) : null,
      item.extras_snapshot ? JSON.stringify(item.extras_snapshot) : null,
      item.subtotal
    );
  }

  // Insert initial status history
  db.prepare(`
    INSERT INTO order_status_history (id, order_id, status, note, created_by, created_at)
    VALUES (?, ?, 'pending_confirmation', 'Order placed by customer via guest checkout', 'Customer', datetime('now'))
  `).run('osh_' + crypto.randomUUID().slice(0, 8), orderId);

  const fullOrder = getOrderById(orderId)!;
  return { order: fullOrder, tracking_token: trackingToken };
}

export function getOrderByReferenceAndToken(reference: string, token: string): Order | null {
  const db = getDb();
  const row = db
    .prepare('SELECT id FROM orders WHERE reference = ? AND tracking_token = ?')
    .get(reference.toUpperCase().trim(), token.trim()) as any;

  if (!row) return null;
  return getOrderById(row.id);
}

export function getOrderByReferenceAndPhone(reference: string, phone: string): Order | null {
  const db = getDb();
  // Clean phone matching last 7 digits to tolerate formatting variations
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 5) return null;
  const searchPattern = '%' + cleanPhone.slice(-7);

  const row = db
    .prepare("SELECT id FROM orders WHERE reference = ? AND REPLACE(REPLACE(customer_phone, ' ', ''), '-', '') LIKE ?")
    .get(reference.toUpperCase().trim(), searchPattern) as any;

  if (!row) return null;
  return getOrderById(row.id);
}

export function getOrderById(id: string): Order | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
  if (!row) return null;

  const itemRows = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id) as any[];
  const items: OrderItemSnapshot[] = itemRows.map((it) => ({
    id: it.id,
    order_id: it.order_id,
    product_id: it.product_id,
    product_name: it.product_name,
    unit_price: it.unit_price,
    quantity: it.quantity,
    variation_snapshot: it.variation_snapshot ? JSON.parse(it.variation_snapshot) : null,
    extras_snapshot: it.extras_snapshot ? JSON.parse(it.extras_snapshot) : null,
    subtotal: it.subtotal,
  }));

  const historyRows = db
    .prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC')
    .all(id) as any[];

  const paymentRows = db.prepare('SELECT * FROM payments WHERE order_id = ?').all(id) as any[];

  return {
    ...row,
    items,
    status_history: historyRows.map((h) => ({ ...h })),
    payments: paymentRows.map((p) => ({
      ...p,
      provider_metadata: p.provider_metadata ? JSON.parse(p.provider_metadata) : null,
    })),
  };
}

export function getOrders(options?: {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
}): { orders: Order[]; totalCount: number } {
  const db = getDb();
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.status) {
    conditions.push('status = ?');
    params.push(options.status);
  }

  if (options?.paymentStatus) {
    conditions.push('payment_status = ?');
    params.push(options.paymentStatus);
  }

  if (options?.paymentMethod) {
    conditions.push('payment_method = ?');
    params.push(options.paymentMethod);
  }

  if (options?.search) {
    conditions.push('(reference LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
    params.push(`%${options.search}%`, `%${options.search}%`, `%${options.search}%`);
  }

  if (options?.dateFrom) {
    conditions.push("created_at >= datetime(?, 'start of day')");
    params.push(options.dateFrom);
  }

  if (options?.dateTo) {
    conditions.push("created_at <= datetime(?, '+1 day', 'start of day')");
    params.push(options.dateTo);
  }

  const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM orders ${whereClause}`).get(...params) as {
    count: number;
  };
  const totalCount = countRow ? countRow.count : 0;

  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const orderRows = db
    .prepare(
      `
    SELECT * FROM orders
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `
    )
    .all(...params, limit, offset) as any[];

  const orders = orderRows.map((o) => getOrderById(o.id)!);
  return { orders, totalCount };
}

export function updateOrderStatus(orderId: string, status: OrderStatus, note?: string, updatedBy = 'Staff'): Order | null {
  const db = getDb();
  const existing = getOrderById(orderId);
  if (!existing) return null;

  db.prepare(`
    UPDATE orders
    SET status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(status, orderId);

  db.prepare(`
    INSERT INTO order_status_history (id, order_id, status, note, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run('osh_' + crypto.randomUUID().slice(0, 8), orderId, status, note || `Status updated to ${status}`, updatedBy);

  return getOrderById(orderId);
}

export function updateOrderPaymentStatus(orderId: string, paymentStatus: PaymentStatus, providerMeta?: any): Order | null {
  const db = getDb();
  const existing = getOrderById(orderId);
  if (!existing) return null;

  db.prepare(`
    UPDATE orders
    SET payment_status = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(paymentStatus, orderId);

  // If status is still pending confirmation and payment succeeds, automatically advance status to confirmed
  if (paymentStatus === 'paid' && existing.status === 'pending_confirmation') {
    updateOrderStatus(orderId, 'confirmed', 'Payment verified successfully; order confirmed for preparation', 'Payment System');
  }

  return getOrderById(orderId);
}

export function getOrderMetrics(rangeDays = 30) {
  const db = getDb();

  const totalOrders = (db.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
  const todayOrders = (
    db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = date('now')").get() as any
  ).c;
  const awaitingOrders = (
    db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending_confirmation'").get() as any
  ).c;
  const preparingOrders = (
    db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'preparing'").get() as any
  ).c;
  const completedOrders = (
    db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'completed'").get() as any
  ).c;
  const cancelledOrders = (
    db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'cancelled'").get() as any
  ).c;

  // Financial calculations from actual orders and payments
  const grossSalesRow = db
    .prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE status != 'cancelled'")
    .get() as any;
  const grossSales = grossSalesRow.s;

  const collectedRow = db
    .prepare(
      "SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE payment_status IN ('paid', 'manually_verified') AND status != 'cancelled'"
    )
    .get() as any;
  const collectedPayments = collectedRow.s;

  const pendingRow = db
    .prepare(
      "SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE payment_status = 'pending' AND status != 'cancelled'"
    )
    .get() as any;
  const pendingPayments = pendingRow.s;

  const refundRow = db
    .prepare("SELECT COALESCE(SUM(total_amount), 0) as s FROM orders WHERE payment_status = 'refunded'")
    .get() as any;
  const refundsTotal = refundRow.s;

  const avgOrderValue = totalOrders > 0 ? Math.round(grossSales / (totalOrders - cancelledOrders || 1)) : 0;

  // Best selling products
  const topProducts = db
    .prepare(
      `
    SELECT oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.subtotal) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status != 'cancelled'
    GROUP BY oi.product_name
    ORDER BY total_qty DESC
    LIMIT 5
  `
    )
    .all() as any[];

  // Recent 5 orders
  const recentOrders = db
    .prepare('SELECT id, reference, customer_name, total_amount, status, payment_status, created_at FROM orders ORDER BY created_at DESC LIMIT 5')
    .all() as any[];

  return {
    totalOrders,
    todayOrders,
    awaitingOrders,
    preparingOrders,
    completedOrders,
    cancelledOrders,
    grossSales,
    collectedPayments,
    pendingPayments,
    refundsTotal,
    avgOrderValue,
    topProducts,
    recentOrders,
  };
}

// ----------------------------------------------------
// Payments Repository Methods
// ----------------------------------------------------

export function recordPayment(data: {
  order_id: string;
  provider: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  provider_metadata?: any;
}) {
  const db = getDb();
  const id = 'pay_' + crypto.randomUUID().slice(0, 8);

  const stmt = db.prepare(`
    INSERT INTO payments (id, order_id, provider, reference, amount, status, provider_metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(reference) DO UPDATE SET
      status = excluded.status,
      provider_metadata = excluded.provider_metadata,
      updated_at = datetime('now')
  `);

  stmt.run(
    id,
    data.order_id,
    data.provider,
    data.reference,
    data.amount,
    data.status,
    data.provider_metadata ? JSON.stringify(data.provider_metadata) : null
  );

  return data;
}

export function getPaymentByReference(reference: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM payments WHERE reference = ?').get(reference);
}

// ----------------------------------------------------
// Business Settings Repository Methods
// ----------------------------------------------------

export function getSettings(): BusinessSettings {
  const db = getDb();
  const row = db.prepare("SELECT value FROM business_settings WHERE key = 'general'").get() as any;
  if (!row) {
    initSchema(db);
    return getSettings();
  }
  return JSON.parse(row.value);
}

export function updateSettings(partial: Partial<BusinessSettings>): BusinessSettings {
  const db = getDb();
  const current = getSettings();
  const updated = { ...current, ...partial };

  db.prepare(`
    INSERT INTO business_settings (key, value, updated_at)
    VALUES ('general', ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(JSON.stringify(updated));

  return updated;
}

// ----------------------------------------------------
// Staff & RBAC Authentication Repository Methods
// ----------------------------------------------------

export function getStaffByEmail(email: string): (StaffUser & { password_hash: string }) | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM staff_users WHERE email = ? AND is_active = 1').get(email.toLowerCase().trim()) as any;
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

export function getStaffById(id: string): StaffUser | null {
  const db = getDb();
  const row = db.prepare('SELECT id, name, email, role, is_active, last_login_at, created_at FROM staff_users WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    ...row,
    is_active: Boolean(row.is_active),
  };
}

export function getAllStaff(): StaffUser[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, email, role, is_active, last_login_at, created_at FROM staff_users ORDER BY created_at ASC').all() as any[];
  return rows.map((r) => ({ ...r, is_active: Boolean(r.is_active) }));
}

export function updateStaffLoginTimestamp(id: string) {
  const db = getDb();
  db.prepare("UPDATE staff_users SET last_login_at = datetime('now') WHERE id = ?").run(id);
}

export function createStaffMember(data: { name: string; email: string; password: string; role: Role }): StaffUser {
  const db = getDb();
  const id = 'staff_' + crypto.randomUUID().slice(0, 8);
  const passwordHash = bcrypt.hashSync(data.password, 10);

  db.prepare(`
    INSERT INTO staff_users (id, name, email, password_hash, role, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
  `).run(id, data.name.trim(), data.email.toLowerCase().trim(), passwordHash, data.role);

  return getStaffById(id)!;
}

export function updateStaffMember(
  id: string,
  data: { name?: string; role?: Role; is_active?: boolean; password?: string }
): StaffUser | null {
  const db = getDb();
  const existing = getStaffById(id);
  if (!existing) return null;

  const name = data.name !== undefined ? data.name.trim() : existing.name;
  const role = data.role !== undefined ? data.role : existing.role;
  const is_active = data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active ? 1 : 0;

  if (data.password && data.password.trim().length >= 6) {
    const passwordHash = bcrypt.hashSync(data.password, 10);
    db.prepare('UPDATE staff_users SET name = ?, role = ?, is_active = ?, password_hash = ? WHERE id = ?').run(
      name,
      role,
      is_active,
      passwordHash,
      id
    );
  } else {
    db.prepare('UPDATE staff_users SET name = ?, role = ?, is_active = ? WHERE id = ?').run(name, role, is_active, id);
  }

  return getStaffById(id);
}

// ----------------------------------------------------
// Security Audit Logs
// ----------------------------------------------------

export function logAuditEvent(params: {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  details?: any;
}) {
  try {
    const db = getDb();
    const id = 'aud_' + crypto.randomUUID().slice(0, 8);
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_email, action, entity_type, entity_id, ip_address, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      id,
      params.userId || null,
      params.userEmail || null,
      params.action,
      params.entityType,
      params.entityId || null,
      params.ipAddress || null,
      params.details ? JSON.stringify(params.details) : null
    );
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

export function getAuditLogs(limit = 100): AuditLogItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit) as any[];
  return rows.map((r) => ({
    ...r,
    details: r.details ? JSON.parse(r.details) : null,
  }));
}
