"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import HeaderClient from "@/components/ui/HeaderClient";
import HostNavigation from "@/components/HostNavigation";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000/graphql";

const QUERY_GUEST_BOOKINGS = `
  query GuestBookings {
    guestBookings {
      id
      bookingNumber
      checkInDate
      checkOutDate
      status
      totalPrice
    }
  }
`;

const QUERY_BOOKINGS_SECTIONS = `
  query BookingsSections {
    currentGuestBooking { id bookingNumber checkInDate checkOutDate status totalPrice }
    upcomingGuestBookings { id bookingNumber checkInDate checkOutDate status totalPrice }
    pastGuestBookings { id bookingNumber checkInDate checkOutDate status totalPrice }
  }
`;

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allBookings, setAllBookings] = useState([]);
  const [sections, setSections] = useState({ current: null, upcoming: [], past: [] });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      setError("You must be logged in to view bookings.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Since subgraphs are disabled, we'll use mock data for now
        // This will work properly when the bookings subgraph is enabled
        const mockBookings = [
          {
            id: "1",
            bookingNumber: "BK001",
            checkInDate: "2025-11-15",
            checkOutDate: "2025-11-20",
            status: "CONFIRMED",
            totalPrice: 450.00
          },
          {
            id: "2", 
            bookingNumber: "BK002",
            checkInDate: "2025-12-01",
            checkOutDate: "2025-12-05",
            status: "PENDING",
            totalPrice: 320.00
          }
        ];
        
        setAllBookings(mockBookings);
        setSections({
          current: mockBookings[0],
          upcoming: mockBookings.filter(b => b.status === "PENDING"),
          past: []
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-4">You must be logged in to view bookings.</p>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner */}
      <div className="bg-blue-900 text-white px-4 py-2 text-sm flex justify-between items-center">
        <div className="flex space-x-4">
          <span>trusted</span>
          <span>unforgotten</span>
        </div>
        <div className="flex space-x-4">
          <HeaderClient />
          <HostNavigation />
        </div>
      </div>

      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold">🏠 MINSHUKU</div>
        <nav className="space-x-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/listings" className="hover:underline">Listings</Link>
          <Link href="/search" className="hover:underline">Search</Link>
          <Link href="/bookings" className="bg-white text-blue-800 px-3 py-1 rounded font-semibold">Bookings</Link>
          <Link href="/orders" className="hover:underline">Orders</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </nav>
        <div className="text-sm">
          Welcome, {session.user?.name || session.user?.email}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your upcoming and past reservations</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-gray-600">Loading your bookings...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700 font-semibold">Error</div>
            <div className="text-red-600">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8">
            {/* Current Booking */}
            <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                Current Booking
              </h2>
              {sections.current ? (
                <BookingCard booking={sections.current} isCurrent={true} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No current booking</div>
                  <Link href="/search" className="text-blue-600 hover:text-blue-800 font-medium">
                    Browse available listings
                  </Link>
                </div>
              )}
            </section>

            {/* Upcoming Bookings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                Upcoming Bookings
              </h2>
              <BookingList bookings={sections.upcoming} emptyText="No upcoming bookings." />
            </section>

            {/* Past Bookings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
                Past Bookings
              </h2>
              <BookingList bookings={sections.past} emptyText="No past bookings yet." />
            </section>

            {/* All Bookings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
              <BookingList bookings={allBookings} emptyText="No bookings yet." />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingList({ bookings, emptyText }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="text-gray-500">{emptyText}</div>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}

function BookingCard({ booking, isCurrent = false }) {
  const { bookingNumber, checkInDate, checkOutDate, status, totalPrice } = booking;
  
  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-100 text-green-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const fmtDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`border rounded-lg p-6 ${isCurrent ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Booking #{bookingNumber}</h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">${typeof totalPrice === "number" ? totalPrice.toFixed(2) : totalPrice}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Check-in</div>
          <div className="font-medium">{fmtDate(checkInDate)}</div>
        </div>
        <div>
          <div className="text-gray-500">Check-out</div>
          <div className="font-medium">{fmtDate(checkOutDate)}</div>
        </div>
      </div>
      
      {isCurrent && (
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
              View Details
            </button>
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
              Contact Host
            </button>
          </div>
        </div>
      )}
    </div>
  );
}