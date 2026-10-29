import React from 'react';
import Link from 'next/link';
import { getCategories, getProducts } from '@/lib/db';
import ProductCard from '@/components/menu/ProductCard';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Flame,
  Truck,
  HeartHandshake,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering to reflect admin updates immediately

export default function HomePage() {
  const categories = getCategories(true);
  const featuredProducts = getProducts({ featuredOnly: true, publishedOnly: true });

  const testimonials = [
    {
      name: 'Chioma Adebayo',
      role: 'Nyanya Resident',
      comment:
        'The smoky aroma of Ella party jollof rice is unmatched anywhere in Abuja. It tastes exactly like traditional smoky wedding jollof. The chicken was tender and spiced to perfection.',
      dish: 'Party Jollof Rice with Crispy Chicken',
    },
    {
      name: 'Babatunde Adeleke',
      role: 'Corporate Event Organizer',
      comment:
        'We ordered fifty packs of small chops and three mega catering trays for our Maitama corporate retreat. Delivery arrived right on schedule and the food was hot and delicious.',
      dish: 'Mega Party Jollof and Small Chops Platter',
    },
    {
      name: 'Dr. Ngozi Okon',
      role: 'Family Customer',
      comment:
        'The assorted meat pepper dish reminds me of my grandmother cooking in Calabar. The goat meat and shaki are cooked until soft and the pepper broth is deeply satisfying.',
      dish: 'Traditional Assorted Meat Pepper Dish',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-brand-dark-950 pt-8 pb-16">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1920&q=80"
            alt="Ella's Kitchen Nigerian Feast"
            className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark-950 via-brand-dark-950/90 to-brand-dark-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-950 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold-500/10 border border-brand-gold-500/30 text-brand-gold-400 text-xs font-semibold uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 text-brand-gold-500 fill-current" />
                <span>Authentic Smoky Taste in Abuja</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-brand-cream-50 leading-[1.1] tracking-tight">
                Traditional Nigerian Flavours, Prepared with <span className="text-brand-gold-400 italic">Pride</span>.
              </h1>

              <p className="text-base sm:text-lg text-brand-cream-200/90 max-w-2xl font-normal leading-relaxed">
                Welcome to Ella's Kitchen. Savor rich smoky party jollof rice, assorted meats, warm golden puff puff, handcrafted celebration cakes, and refreshing zobo. Freshly prepared daily for prompt delivery across Abuja.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  href="/menu"
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-brand-gold-500 to-brand-gold-600 hover:from-brand-gold-400 hover:to-brand-gold-500 text-brand-dark-950 font-extrabold text-base shadow-gold-glow flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <span>Order Delicious Food</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#popular-categories"
                  className="px-8 py-4 rounded-full bg-brand-brown-900/80 hover:bg-brand-brown-800 text-brand-cream-100 border border-brand-brown-700 font-bold text-base flex items-center justify-center transition"
                >
                  Explore Our Categories
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-brand-brown-900/90 max-w-lg">
                <div>
                  <span className="font-serif text-2xl font-bold text-brand-gold-400">100%</span>
                  <span className="text-xs text-brand-brown-300 block">Fresh Ingredients</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-brand-gold-400">35 Mins</span>
                  <span className="text-xs text-brand-brown-300 block">Average Delivery</span>
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-brand-gold-400">Zero</span>
                  <span className="text-xs text-brand-brown-300 block">Registration Needed</span>
                </div>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden border-2 border-brand-gold-500/30 shadow-2xl bg-brand-dark-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
                    alt="Ella's Kitchen Signature Dish"
                    className="w-full h-96 sm:h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-950 via-transparent to-transparent" />
                  
                  {/* Floating Badge */}
                  <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-brand-dark-950/90 backdrop-blur-md border border-brand-gold-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-brand-gold-400 font-bold block">
                        Signature Specialty
                      </span>
                      <h4 className="font-serif text-lg font-bold text-brand-cream-50">
                        Party Jollof with Fried Chicken
                      </h4>
                      <p className="text-xs text-brand-brown-300">Served with sweet fried plantain and pepper sauce</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-brand-gold-400">₦4,500</span>
                      <Link
                        href="/menu"
                        className="text-xs text-brand-cream-100 hover:text-brand-gold-300 underline block mt-1"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC POPULAR CATEGORIES */}
      <section id="popular-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
            Curated Culinary Selection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream-50">
            Explore Ella's Kitchen Categories
          </h2>
          <p className="text-sm text-brand-brown-300">
            Choose from authentic rice dishes, traditional soups, warm snacks, baked treats, and chilled drinks.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="group bg-brand-dark-900 border border-brand-brown-800 hover:border-brand-gold-500/60 rounded-2xl p-4 text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-rich"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-brand-brown-900 mb-3 border border-brand-gold-500/20 group-hover:border-brand-gold-500 transition-colors">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-gold-400 font-serif font-bold">
                    EK
                  </div>
                )}
              </div>
              <h3 className="font-serif font-bold text-sm text-brand-cream-100 group-hover:text-brand-gold-400 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-brand-brown-400 mt-1">
                {cat.product_count || 0} delicious {cat.product_count === 1 ? 'dish' : 'dishes'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. POPULAR AND FEATURED DISHES */}
      <section id="popular-dishes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400 block mb-2">
              Customer Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream-50">
              Popular Dishes from Our Kitchen
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold-400 hover:text-brand-gold-300 transition"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. WHY CHOOSE ELLA'S KITCHEN */}
      <section className="bg-brand-brown-950/60 border-y border-brand-brown-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
              The Ella Distinction
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream-50">
              Why Abuja Chooses Ella's Kitchen
            </h2>
            <p className="text-sm text-brand-brown-300">
              We uphold uncompromising standards of hygiene, authentic recipes, and warm hospitality with every single plate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-brand-dark-950/80 p-8 rounded-2xl border border-brand-brown-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">Authentic Recipes</h3>
              <p className="text-xs text-brand-brown-300 leading-relaxed">
                Prepared with slow simmered plum tomatoes, native seasoning, scotch bonnet peppers, and traditional open-flame techniques.
              </p>
            </div>

            <div className="bg-brand-dark-950/80 p-8 rounded-2xl border border-brand-brown-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">Finest Ingredients</h3>
              <p className="text-xs text-brand-brown-300 leading-relaxed">
                We select premium cuts of tender meat, fresh market produce, and pure vegetable oil without shortcuts or artificial fillers.
              </p>
            </div>

            <div className="bg-brand-dark-950/80 p-8 rounded-2xl border border-brand-brown-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">Prompt Delivery</h3>
              <p className="text-xs text-brand-brown-300 leading-relaxed">
                Packed in thermal seal trays to arrive piping hot and fresh at your home or workplace in Nyanya, Wuse II, Maitama, Asokoro, and across Abuja.
              </p>
            </div>

            <div className="bg-brand-dark-950/80 p-8 rounded-2xl border border-brand-brown-800 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-cream-50">Guest Convenience</h3>
              <p className="text-xs text-brand-brown-300 leading-relaxed">
                Order in sixty seconds without tedious registration. Secure Paystack, bank transfer, and cash fulfilment options supported.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SPECIAL OCCASIONS & CATERING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-dark-900 border border-brand-gold-500/30 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400 block">
                Celebrations and Gatherings
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-brand-cream-50 leading-tight">
                Catering, Birthday Cakes, and Party Trays for Special Occasions
              </h2>
              <p className="text-sm sm:text-base text-brand-brown-300 leading-relaxed max-w-xl">
                Planning an intimate celebration, executive office meeting, or grand family banquet? Ella's Kitchen prepares customized birthday cakes, finger food platters, and generous buffet trays tailored to your guest count.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-brand-cream-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold-400" />
                  <span>Custom Double Layer Birthday Cakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold-400" />
                  <span>50 Piece Executive Small Chops Trays</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold-400" />
                  <span>Buffet Rice Trays Serving 12 Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold-400" />
                  <span>Chilled Zobo and Chapman Bundles</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/catering"
                  className="px-8 py-3.5 rounded-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm shadow-gold-glow text-center transition"
                >
                  Book Event Catering
                </Link>
                <a
                  href="https://wa.me/2348080058907?text=Hello%20Ella%27s%20Kitchen,%20I%20would%20like%20to%20inquire%20about%20catering%20and%20cakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-full bg-brand-brown-900 hover:bg-brand-brown-800 text-brand-gold-400 border border-brand-gold-500/30 font-bold text-sm text-center transition"
                >
                  Chat with Our Event Specialist
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden h-44 sm:h-56 border border-brand-brown-800">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
                  alt="Celebration Cakes"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-44 sm:h-56 border border-brand-brown-800 translate-y-4">
                <img
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80"
                  alt="Event Catering Buffet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GENUINE TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
            Patron Reflections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream-50">
            Words from Our Valued Guests
          </h2>
          <p className="text-sm text-brand-brown-300">
            Every dish is cooked with love and delivered with care across Abuja communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-brand-dark-900 border border-brand-brown-800 rounded-2xl p-8 flex flex-col justify-between space-y-6 relative"
            >
              <div className="space-y-4">
                <p className="text-sm text-brand-cream-200 leading-relaxed italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-brand-brown-800/80">
                <h4 className="font-serif font-bold text-brand-gold-400 text-base">{t.name}</h4>
                <p className="text-xs text-brand-brown-300">{t.role}</p>
                <span className="inline-block text-[11px] text-brand-brown-400 mt-1 bg-brand-dark-950 px-2 py-0.5 rounded border border-brand-brown-800">
                  Ordered: {t.dish}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CONTACT & ORDERING INFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50">Nyanya Kitchen Counter</h4>
                <p className="text-xs text-brand-brown-300 mt-1">
                  Nyanya, Abuja, Nigeria
                </p>
                <span className="text-[11px] text-brand-gold-400 font-semibold block mt-1">
                  Pickup and delivery available
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50">Operating Hours</h4>
                <p className="text-xs text-brand-brown-300 mt-1">
                  Monday to Sunday: 9:00 AM to 8:00 PM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400 flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-brand-cream-50">Direct Inquiries</h4>
                <p className="text-xs text-brand-brown-300 mt-1">
                  Phone: +234 808 005 8907
                </p>
                <a
                  href="https://wa.me/2348080058907"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-gold-400 hover:text-brand-gold-300 font-bold block mt-1"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
