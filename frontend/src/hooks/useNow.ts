import { useEffect, useState } from 'react';

// Current unix time in seconds, re-rendering every `intervalMs` so countdowns tick.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now() / 1000);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
