import React from 'react';

export default function ProfilesComponent({ id }) {
  return (
    <div>
      <h1>Profiles Service</h1>
      {id && <p>Profile ID: {id}</p>}
    </div>
  );
}