'use client'; // In Navbar.js (if it contains client-specific logic)

import { useEffect, useState } from "react";
import Link from "next/link";
export default function Navbar() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Component will only render client-side
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Or a loading state until mounted
    }

    return (
        <nav>
            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/listing">Listing</Link></li>
                <li><Link href="/oauth">OAuth</Link></li>
                <li><Link href="/login">Login</Link></li>
            </ul>
        </nav>
    );
}
