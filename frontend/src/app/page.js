"use client"
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>Not signed in</p>;

  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <img src={session.user.image} alt="User Avatar" />
    </div>
  );
}
