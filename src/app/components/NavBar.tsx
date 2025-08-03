// components/NavBar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  return (
    <nav className="bg-green-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        {/* Use more padding so nav grows with larger logos */}
        <div className="relative flex items-center justify-between py-6 font-inter">
          {/* Left Logo at 80px tall */}
          <Link href="/">
            <Image
              src="/Logo1.png"
              alt="Left Logo"
              width={200}      // intrinsic width (you can tweak)
              height={80}      // intrinsic height
              className="object-contain h-22 w-auto"
            />
          </Link>

          {/* Center Title */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 text-white text-3xl font-semibold"
          >
            TRACER MONITORING SYSTEM
          </Link>

          {/* Right Logo at 80px tall */}
          <Link href="/">
            <Image
              src="/Logo2.png"
              alt="Right Logo"
              width={200}
              height={80}
              className="object-contain h-22 w-auto"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
