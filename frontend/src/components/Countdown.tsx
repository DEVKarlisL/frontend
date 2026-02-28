import React, { useEffect, useState } from "react";

interface Props {
  endTime: string; // ISO string
}

const formatRemaining = (ms: number) => {
  if (ms <= 0) return "Ended";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / (24 * 3600));
  const hours = Math.floor((s % (24 * 3600)) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

const Countdown: React.FC<Props> = ({ endTime }) => {
  const [remaining, setRemaining] = useState<string>("...");

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const tick = () => {
      const now = Date.now();
      setRemaining(formatRemaining(end - now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return <span>{remaining}</span>;
};

export default Countdown;
