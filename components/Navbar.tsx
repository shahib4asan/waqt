"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-6 p-4 bg-gray-900 text-white">
      <Link href="/">Prayer</Link>
      <Link href="/tasbih">Tasbih</Link>
      <Link href="/zakat">Zakat</Link>
    </nav>
  );
}