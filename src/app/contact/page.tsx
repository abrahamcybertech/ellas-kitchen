'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-400">
          Get in Touch
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-brand-cream-50">
          Contact Ella's Kitchen
        </h1>
        <p className="text-base text-brand-brown-300">
          We welcome your inquiries, feedback, corporate orders, and special culinary requests. Reach out to our kitchen team in Nyanya, Abuja.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-brand-cream-50">
              Kitchen Details
            </h3>

            <div className="space-y-4 text-sm text-brand-brown-300">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-cream-100 block">Kitchen Address</span>
                  <span>Nyanya, Abuja, Nigeria</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-cream-100 block">Service Hours</span>
                  <span>Monday to Sunday: 9:00 AM to 8:00 PM</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-cream-100 block">Phone Order Line</span>
                  <span>+234 808 005 8907</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-brand-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-brand-cream-100 block">Email Desk</span>
                  <span>orders@ellaskitchen.ng</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-brown-800">
              <a
                href="https://wa.me/2348080058907"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Us on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Interactive Inquiry Form */}
        <div className="lg:col-span-7 bg-brand-dark-900 border border-brand-brown-800 rounded-3xl p-8 sm:p-10 space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-brand-cream-50">
              Send a Note or Inquiry
            </h3>
            <p className="text-xs text-brand-brown-300 mt-1">
              Have questions regarding our dishes, delivery coverage, or catering? Drop us a line below.
            </p>
          </div>

          {isSent && (
            <div className="p-4 rounded-xl bg-green-950/60 border border-green-800 text-green-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>Thank you for reaching out. A representative from Ella's Kitchen will respond promptly.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Full Name <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-cream-200">
                  Phone Number <span className="text-brand-gold-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0803 123 4567"
                  className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-brand-cream-200">
                Message or Order Inquiry <span className="text-brand-gold-400">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your event, feedback, or inquiry..."
                className="w-full bg-brand-dark-950 border border-brand-brown-800 rounded-xl px-4 py-3 text-sm text-brand-cream-100 placeholder-brand-brown-500 focus:outline-none focus:border-brand-gold-500 transition h-32 resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-brand-gold-500 hover:bg-brand-gold-400 text-brand-dark-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Send Your Note</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
