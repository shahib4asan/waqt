"use client";
import { useState, useEffect } from "react";

export default function Tasbih() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("tasbih");
    if (saved) setCount(Number(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasbih", count.toString());
  }, [count]);

  return (
    <div className="flex flex-col items-center mt-20">
      <h1 className="text-6xl">{count}</h1>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-green-600 px-6 py-3 mt-6 rounded"
      >
        Tap
      </button>
      <button
        onClick={() => setCount(0)}
        className="bg-red-600 px-4 py-2 mt-3 rounded"
      >
        Reset
      </button>
    </div>
  );
}