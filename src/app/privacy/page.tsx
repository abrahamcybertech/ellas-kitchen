import React from 'react';

export const metadata = {
  title: "Privacy Policy | Ella's Kitchen Abuja",
  description: "Privacy policy regarding customer information and guest food orders at Ella's Kitchen.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="space-y-2 border-b border-brand-brown-800 pb-6">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-cream-50">
          Privacy Policy
        </h1>
        <p className="text-xs text-brand-brown-400">
          Last updated: October 2026. Effective for all Ella's Kitchen customers and visitors.
        </p>
      </div>

      <div className="space-y-6 text-sm text-brand-brown-200 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            1. Information We Collect
          </h2>
          <p>
            Ella's Kitchen respects your personal privacy. We collect only the information necessary to fulfill your food orders and ensure prompt doorstep delivery in Abuja. This includes your name, contact phone number, delivery address, and optional email address.
          </p>
          <p>
            Because we offer guest checkout without mandatory account registration, we do not store customer passwords or require unnecessary identity profiling.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            2. Payment Security and Banking Data
          </h2>
          <p>
            We never collect, store, or process debit card numbers, CVVs, or bank security PINs on our servers. All online card transactions are handled exclusively by licensed payment provider Paystack via encrypted channels. Direct bank transfer confirmations are verified by authorized kitchen finance officers solely for order confirmation.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            3. Use of Information
          </h2>
          <p>
            Your information is used strictly to prepare your meals, dispatch delivery personnel, provide status updates, and communicate regarding order specifics. We never sell, rent, or trade customer contact details with third party advertisers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-brand-gold-400">
            4. Contact Regarding Data Privacy
          </h2>
          <p>
            For questions regarding our privacy commitments or to request removal of your delivery records, please contact our administrative desk at orders@ellaskitchen.ng or reach our Nyanya office.
          </p>
        </section>
      </div>
    </div>
  );
}
