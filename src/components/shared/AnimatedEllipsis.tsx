"use client";
import { useEffect, useState } from "react";

export default function AnimatedEllipsis({
  interval = 200,
}: {
  interval?: number;
}) {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDots(prev => (prev + 1) % 4); // 0, 1, 2, 3
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);

  return <span>{".".repeat(dots)}</span>;
}
