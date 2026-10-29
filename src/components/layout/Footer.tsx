import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark-950 text-brand-cream-200 border-t border-brand-brown-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="h-14 w-44">
              <img
                src="/ella.png"
                alt="Ella's Kitchen"
                className="h-full w-auto object-contain"
              />
            </div>
            <p className="text-sm text-brand-brown-300 leading-relaxed">
              Ella's Kitchen is a premier Nigerian culinary destination in Abuja, delivering smoky firewood jollof rice, traditional assorted meat delicacies, fresh pastries, celebration cakes, and refreshing chilled beverages.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com/ellaskitchen_ng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-brown-900 border border-brand-brown-800 flex items-center justify-center text-brand-gold-400 hover:bg-brand-gold-500 hover:text-brand-dark-950 transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/ellaskitchen_ng"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-brown-900 border border-brand-brown-800 flex items-center justify-center text-brand-gold-400 hover:bg-brand-gold-500 hover:text-brand-dark-950 transition"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/2348080058907"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-brown-900 border border-brand-brown-800 flex items-center justify-center text-brand-gold-400 hover:bg-brand-gold-500 hover:text-brand-dark-950 transition"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com/@ellakitchen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-brown-900 border border-brand-brown-800 flex items-center justify-center text-brand-gold-400 hover:bg-brand-gold-500 hover:text-brand-dark-950 transition"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.89-2.89c.28 0 .55.04.81.1V9.3a6.33 6.33 0 1 0 5.53 6.27V8.4a8.16 8.16 0 0 0 4.77 1.52v-3.2a4.85 4.85 0 0 1-1-.03z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="font-serif text-lg font-bold text-brand-cream-50 mb-4 tracking-wide">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-brand-brown-300 hover:text-brand-gold-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-brand-brown-300 hover:text-brand-gold-400 transition">
                  Our Complete Menu
                </Link>
              </li>
              <li>
                <Link href="/catering" className="text-brand-brown-300 hover:text-brand-gold-400 transition">
                  Catering and Event Trays
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-brand-brown-300 hover:text-brand-gold-400 transition">
                  About Ella's Kitchen
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-brand-brown-300 hover:text-brand-gold-400 transition">
                  Contact and Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="font-serif text-lg font-bold text-brand-cream-50 mb-4 tracking-wide">
              Our Specialties
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-brown-300">
              <li>Nigerian Firewood Rice Dishes</li>
              <li>Traditional Assorted Meat Soups</li>
              <li>Fresh Golden Puff Puff and Meat Pies</li>
              <li>Celebration Birthday Cakes</li>
              <li>Handcrafted Zobo and Chapman</li>
              <li>Executive Event Small Chops</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-serif text-lg font-bold text-brand-cream-50 mb-4 tracking-wide">
              Kitchen and Contact
            </h3>
            <ul className="space-y-3 text-sm text-brand-brown-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                <span>Nyanya, Abuja, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-gold-400 flex-shrink-0" />
                <span>+234 808 005 8907</span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-brand-gold-400 flex-shrink-0" />
                <a
                  href="https://wa.me/2348080058907"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-gold-400 transition"
                >
                  WhatsApp Ordering Available
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-gold-400 flex-shrink-0" />
                <span>orders@ellaskitchen.ng</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Legal & Developer Credit */}
        <div className="pt-8 border-t border-brand-brown-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-brown-400">
          <div className="flex flex-wrap items-center gap-6">
            <span>&copy; {new Date().getFullYear()} Ella's Kitchen Delicacies. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-brand-gold-400 transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-gold-400 transition">
              Terms and Conditions
            </Link>
            <Link href="/refund-policy" className="hover:text-brand-gold-400 transition">
              Refund and Cancellation Policy
            </Link>
          </div>

          {/* Required Developer Credit */}
          <div className="flex items-center space-x-1.5 text-brand-brown-300">
            <span>Built by</span>
            <a
              href="https://abrahamcyber.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-gold-400 hover:text-brand-gold-300 underline underline-offset-4 decoration-brand-gold-500/40 transition"
            >
              Abraham Cyber Tech
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
