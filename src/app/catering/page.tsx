import React from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, Phone, Calendar, Users, Sparkles, ChefHat } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Catering and Special Events',
  description:
    'Executive Nigerian catering in Abuja, party jollof trays, small chops platters, and custom birthday cakes for corporate events, weddings, and celebrations.',
  path: '/catering',
  keywords: ['catering Abuja', 'party jollof trays Abuja', 'small chops platter Abuja', 'event catering Nigeria', 'birthday cakes Abuja'],
});

export default function CateringPage() {
  const packages = [
    {
      title: 'Party Rice Buffet Tray',
      serves: 'Serves 10 to 12 Guests',
      price: '₦42,000',
      description: 'Generous aluminum catering buffet tray loaded with authentic smoky party jollof rice, plantain, and 12 pieces of grilled chicken.',
      features: [
        'Smoky party jollof rice or fried rice',
        '12 cuts of crispy golden chicken',
        'Fried sweet dodo plantain',
        'Special spicy pepper sauce',
        'Thermal seal tray keeping food hot for 3 hours',
      ],
      link: '/menu?category=catering-and-party-trays',
    },
    {
      title: 'Executive Small Chops Platter',
      serves: '50 Finger Food Pieces',
      price: '₦25,000',
      description: 'The ultimate Abuja celebration finger food platter, prepared fresh on event morning for maximum crispiness.',
      features: [
        '20 golden sweet puff puff balls',
        '10 crispy vegetable spring rolls',
        '10 seasoned minced beef samosas',
        '10 tender peppered gizzard bites',
        'Signature pepper dipping sauce cup',
      ],
      link: '/menu?category=catering-and-party-trays',
    },
    {
      title: 'Celebration Cake and Pastry Service',
      serves: '8 to 12 Inch Cakes',
      price: 'From ₦20,000',
      description: 'Double and triple layer artisan celebration cakes with gold leaf accents and Madagascar vanilla or rich chocolate fudge.',
      features: [
        'Custom birthday greeting script',
        'Velvety whipped buttercream frosting',
        'Gold celebration candles included',
        'Acrylic custom topper options',
        'Express 24 hours notice delivery in Abuja',
      ],
      link: '/menu?category=cakes-and-pastries',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
          Executive Food Service
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand-cream-50">
          Catering and Special Events
        </h1>
        <p className="text-base text-brand-brown-300">
          From intimate family milestones and birthday soirees to corporate retreats in Abuja, Ella's Kitchen delivers sumptuous Nigerian dining that delights every guest.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {packages.map((pkg, idx) => (
          <div
            key={idx}
            className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 hover:border-brand-gold-500/50 transition-colors"
          >
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold-400 block">
                {pkg.serves}
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-cream-50 leading-snug">
                {pkg.title}
              </h3>
              <p className="font-serif text-3xl font-extrabold text-brand-gold-400">
                {pkg.price}
              </p>
              <p className="text-xs text-brand-brown-300 leading-relaxed">
                {pkg.description}
              </p>

              <div className="pt-4 border-t border-brand-brown-800/80 space-y-2.5">
                {pkg.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-brand-cream-200">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={pkg.link}
              className="w-full py-3.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-xs text-center shadow-gold-glow transition block"
            >
              Order for Your Event
            </Link>
          </div>
        ))}
      </div>

      {/* Custom Event Consultation Banner */}
      <div className="bg-brand-dark-900 border border-brand-gold-500/30 rounded-3xl p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="font-serif text-3xl font-bold text-brand-cream-50">
              Need a Custom Event Menu in Abuja?
            </h2>
            <p className="text-sm text-brand-brown-300 max-w-2xl leading-relaxed">
              Our lead culinary director collaborates with you on custom guest counts, dietary preferences, live cooking stations, and tailored dessert bars for weddings, anniversaries, and corporate events.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
            <a
              href="https://wa.me/2348080058907?text=Hello%20Ella%27s%20Kitchen,%20I%20would%20like%20to%20discuss%20a%20custom%20catering%20menu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Discuss on WhatsApp</span>
            </a>
            <a
              href="tel:+2348080058907"
              className="px-6 py-3.5 rounded-xl bg-brand-brown-900 border border-brand-brown-700 text-brand-cream-100 font-bold text-xs flex items-center justify-center gap-2 hover:border-brand-gold-500 transition"
            >
              <Phone className="w-4 h-4 text-brand-gold-400" />
              <span>Call +234 808 005 8907</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
