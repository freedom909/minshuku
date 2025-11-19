"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';
const DEFAULT_LISTING_IMAGE = '/default-listing-image.jpg';

function ListingDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg"></div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function ListingDetailsPage() {
  const params = useParams();
  const { id } = params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      const query = {
        query: `
          query GetListing($id: ID!) {
            listing(id: $id) {
              id
              title
              description
              pictures
              price
              numOfBeds
              amenities {
                id
                name
              }
              host {
                id
                name
              }
              location {
                name
                city
                country
              }
            }
          }
        `,
        variables: { id },
      };

      try {
        const res = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        });
        const json = await res.json();
        if (json.errors) {
          throw new Error(json.errors[0].message || 'Failed to fetch listing details.');
        }
        setListing(json.data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const renderContent = () => {
    if (loading) return <ListingDetailsSkeleton />;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;
    if (!listing) return <div className="text-center">Listing not found.</div>;

    return (
      <div>
        <img src={listing.pictures && listing.pictures.length > 0 ? listing.pictures[0] : DEFAULT_LISTING_IMAGE} alt={listing.title} className="w-full h-96 object-cover rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold">{listing.title}</h1>
            <p className="text-lg text-gray-600 mt-2">{listing.location.name || `${listing.location.city}, ${listing.location.country}`}</p>
            <p className="mt-6 text-gray-800">{listing.description}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-3xl font-bold">¥{listing.price} <span className="text-lg font-normal">/ night</span></p>
            <p className="mt-4"><strong>Beds:</strong> {listing.numOfBeds}</p>
            <p><strong>Host:</strong> {listing.host.name}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-6xl mx-auto p-6">
        {renderContent()}
      </main>
    </div>
  );
}