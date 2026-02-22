"use client";
import { useState } from "react";

export default function Zakat() {
  const [wealth, setWealth] = useState(0);
  const zakat = wealth * 0.025;

  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Zakat Calculator</h1>
      <input
        type="number"
        placeholder="Enter total wealth"
        onChange={(e) => setWealth(Number(e.target.value))}
        className="border p-2 text-black"
      />
      <h2 className="mt-4">Zakat Due: {zakat}</h2>
    </div>
  );
}