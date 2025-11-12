"use client";

import React from 'react';
import BecomeHostApplication from '@/components/BecomeHostApplication';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function BecomeHostPage() {
  const { data: session } = useSession();
  const isHost = session?.user?.role === 'HOST';
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">🏠 MINSHUKU</Link>
            <nav className="space-x-4">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/listings" className="hover:underline">Listings</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Become a Host</h1>
          {!isHost && (
            <p className="text-xl md:text-2xl mb-6">Turn your extra space into extra income</p>
          )}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center">
              <span className="mr-2">💰</span> Earn up to $5,000/month
            </div>
            <div className="flex items-center">
              <span className="mr-2">🏠</span> Share your unique space
            </div>
            <div className="flex items-center">
              <span className="mr-2">🌟</span> Join 2M+ hosts worldwide
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-semibold mb-2">Earn Extra Income</h3>
              <p className="text-gray-600">Turn your spare room or entire property into a source of income.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🕒</div>
              <h3 className="text-xl font-semibold mb-2">Flexible Schedule</h3>
              <p className="text-gray-600">You're in control. Host when you want and set your own availability.</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Host Protection</h3>
              <p className="text-gray-600">We've got your back with property damage protection and support.</p>
            </div>
          </div>

          {/* Application Section */}
          {!isHost ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-6">
                <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
                <p className="text-blue-100">Complete your host application in just a few minutes</p>
              </div>
              <div className="p-6">
                <BecomeHostApplication />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-semibold mb-2">You are already a host</h2>
              <p className="text-gray-600 mb-4">Manage your listings or create a new one.</p>
              <div className="flex justify-center gap-4">
                <Link href="/create-listing" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">Create Listing</Link>
                <Link href="/dashboard" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50">Go to Dashboard</Link>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">How much can I earn as a host?</h3>
                <p className="text-gray-600">Earnings vary based on location, property type, and availability. Many hosts earn between $500-$5,000 per month.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">How long does approval take?</h3>
                <p className="text-gray-600">Most applications are reviewed within 24-48 hours by our admin team.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">What are the requirements?</h3>
                <p className="text-gray-600">You need a valid property, basic amenities, and agreement to our hosting standards.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Can I host part-time?</h3>
                <p className="text-gray-600">Absolutely! Many hosts start part-time and gradually increase their availability.</p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-4">Our support team is here to help you get started</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  📞 Contact Support
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                  💬 Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Minshuku. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}