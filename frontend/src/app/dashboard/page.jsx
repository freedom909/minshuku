"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allBookings, setAllBookings] = useState([]);
  const [sections, setSections] = useState({ current: null, upcoming: [], past: [] });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
    if (!token) {
      setError("You must be logged in to view bookings.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch list of guest bookings
        const resList = await fetch(GATEWAY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: QUERY_GUEST_BOOKINGS }),
        });
        if (!resList.ok) throw new Error(`HTTP ${resList.status}`);
        const jsonList = await resList.json();
        if (jsonList.errors) throw new Error(jsonList.errors?.[0]?.message || "GraphQL error");
        setAllBookings(jsonList.data.guestBookings || []);

        // Fetch current/upcoming/past sections
        const resSections = await fetch(GATEWAY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: QUERY_BOOKINGS_SECTIONS }),
        });
        if (!resSections.ok) throw new Error(`HTTP ${resSections.status}`);
        const jsonSections = await resSections.json();
        if (jsonSections.errors) throw new Error(jsonSections.errors?.[0]?.message || "GraphQL error");
        setSections({
          current: jsonSections.data.currentGuestBooking,
          upcoming: jsonSections.data.upcomingGuestBookings || [],
          past: jsonSections.data.pastGuestBookings || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>My Bookings</h1>
      <p>Data through Apollo Gateway → subgraph-bookings.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 24 }}>
          {/* Current booking */}
          <section>
            <h2 style={{ marginTop: 0 }}>Current Booking</h2>
            {sections.current ? (
              <BookingCard booking={sections.current} />
            ) : (
              <p>No current booking.</p>
            )}
          </section>

          {/* Upcoming bookings */}
          <section>
            <h2>Upcoming</h2>
            <BookingList bookings={sections.upcoming} emptyText="No upcoming bookings." />
          </section>

          {/* Past bookings */}
          <section>
            <h2>Past</h2>
            <BookingList bookings={sections.past} emptyText="No past bookings." />
          </section>

          {/* All bookings */}
          <section>
            <h2>All</h2>
            <BookingList bookings={allBookings} emptyText="No bookings yet." />
          </section>
        </div>
      )}
    </div>
  );
}

function BookingList({ bookings, emptyText }) {
  if (!bookings || bookings.length === 0) return <p>{emptyText}</p>;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}

function BookingCard({ booking }) {
  const { bookingNumber, checkInDate, checkOutDate, status, totalPrice } = booking;
  const fmt = (d) => (d ? new Date(d).toLocaleString() : "-");
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <p><strong>Booking #:</strong> {bookingNumber}</p>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Check-in:</strong> {fmt(checkInDate)}</p>
      <p><strong>Check-out:</strong> {fmt(checkOutDate)}</p>
      <p><strong>Total Price:</strong> {typeof totalPrice === "number" ? `$${totalPrice.toFixed(2)}` : totalPrice}</p>
    </div>
  );
}
