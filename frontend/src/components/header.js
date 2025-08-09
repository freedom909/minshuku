import Link from 'next/link';

export default function Header() {
  return (
    <div>
      {/* other navigation items */}
      <Link href="/login" className="text-blue-600 hover:underline">
        Join now
      </Link>
    </div>
  );
}
