"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4001/graphql';

export default function AdminPendingHostsPage() {
  const { data: session, status } = useSession();
  const [pendingHosts, setPendingHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({}); // For per-item feedback

  const fetchPendingHosts = async () => {
    if (status !== 'authenticated') {
      setError("You must be signed in to view this page.");
      setLoading(false);
      return;
    }

    // Basic role check on the client-side for better UX
    // The server-side resolver should be the source of truth for authorization.
    if (session.user?.role !== 'ADMIN') {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = session.accessToken;
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `query PendingHosts { pendingHosts { id email } }`, // Assuming email is available on the User type
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map(e => e.message).join('\n'));
      }
      setPendingHosts(result.data.pendingHosts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      fetchPendingHosts();
    }
  }, [status, session]);

  const handleApproveHost = async (userId) => {
    setFeedback({ ...feedback, [userId]: { message: 'Approving...', type: 'info' } });

    try {
      const token = session.accessToken;
      const response = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation ApproveHost($userId: ID!) { approveHost(userId: $userId) { success message } }`,
          variables: { userId },
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map(e => e.message).join('\n'));
      }

      if (result.data?.approveHost?.success) {
        setFeedback({ ...feedback, [userId]: { message: result.data.approveHost.message, type: 'success' } });
        // Refresh the list by removing the approved host
        setPendingHosts(currentHosts => currentHosts.filter(host => host.id !== userId));
      } else {
        throw new Error(result.data?.approveHost?.message || 'Approval failed.');
      }
    } catch (err) {
      setFeedback({ ...feedback, [userId]: { message: err.message, type: 'error' } });
    }
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Approve Pending Hosts</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {pendingHosts.length > 0 ? pendingHosts.map(host => (
              <li key={host.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{host.email || 'No email provided'}</p>
                  <p className="text-sm text-gray-500">ID: {host.id}</p>
                  {feedback[host.id] && (
                    <p className={`text-sm mt-1 ${feedback[host.id].type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                      {feedback[host.id].message}
                    </p>
                  )}
                </div>
                <button onClick={() => handleApproveHost(host.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400" disabled={feedback[host.id]?.type === 'success'}>
                  {feedback[host.id]?.type === 'success' ? 'Approved' : 'Approve'}
                </button>
              </li>
            )) : <li className="p-4 text-gray-500">No pending hosts found.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
