import React from 'react';
import Link from 'next/link';
import { Flame, Heart, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'About Us',
  description:
    "Learn about Ella's Kitchen culinary heritage, traditional recipes, and passion for authentic Nigerian food prepared fresh in Nyanya, Abuja.",
  path: '/about',
  keywords: ["Ella's Kitchen story", 'Nigerian food Abuja', 'Nigerian catering Nyanya', 'authentic Nigerian cuisine'],
});

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
          Our Culinary Story
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand-cream-50">
          Celebrating Authentic Nigerian Hospitality
        </h1>
        <p className="text-base text-brand-brown-300 leading-relaxed">
          Rooted in the vibrant culinary culture of Nigeria, Ella's Kitchen was born from a simple belief: genuine food brings families, friends, and communities together in joy.
        </p>
      </div>

      {/* Story & Philosophy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
            Our Foundation
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cream-50 leading-tight">
            Firewood Smokiness, Handcrafted Spices, and Pure Passion
          </h2>
          <p className="text-sm text-brand-brown-300 leading-relaxed">
            In our Nyanya kitchen, we do not believe in shortcuts or mass processed sauces. We slow roast fresh plum tomatoes, red bell peppers, and scotch bonnets to cultivate the deep smoky richness that makes true Abuja party jollof unforgettable.
          </p>
          <p className="text-sm text-brand-brown-300 leading-relaxed">
            Every cut of goat meat, beef, shaki, and croaker fish is thoroughly seasoned with natural herbs, garlic, ginger, and traditional broth. Our bakers rise at dawn to fry golden sweet puff puff and bake buttery meat pies with flaky crusts.
          </p>

          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm shadow-gold-glow transition"
            >
              <span>Explore What We Cook</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 relative">
          <div className="relative rounded-3xl overflow-hidden border border-brand-gold-500/30 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80"
              alt="Traditional Nigerian Cooking"
              className="w-full h-96 sm:h-[460px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-950 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-cream-50">Firewood Heritage</h3>
          <p className="text-xs text-brand-brown-300 leading-relaxed">
            We honor the legendary Nigerian firewood tradition, ensuring our rice dishes and peppered meats carry deep authentic savoriness.
          </p>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-cream-50">Kitchen Standards</h3>
          <p className="text-xs text-brand-brown-300 leading-relaxed">
            Our kitchen complies with rigorous food hygiene, temperature control, and premium packaging to protect freshness every time.
          </p>
        </div>

        <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-brand-gold-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-cream-50">Heartfelt Service</h3>
          <p className="text-xs text-brand-brown-300 leading-relaxed">
            Whether preparing a quick lunch bowl or fifty catering platters, we treat every order as a personal reflection of our integrity.
          </p>
        </div>
      </div>
    </div>
  );
}
