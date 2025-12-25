import { useEffect, useState } from 'react';

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Update immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const labels = {
    days: 'Dní',
    hours: 'Hod',
    minutes: 'Min',
    seconds: 'Sek'
  };

  return (
    <div className="flex justify-center gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3 py-3 min-w-[64px] border border-white/10 shadow-lg">
            <p className="text-2xl font-black leading-none">{value.toString().padStart(2, '0')}</p>
          </div>
          <p className="text-[10px] mt-1.5 font-black uppercase tracking-widest opacity-60">{labels[unit]}</p>
        </div>
      ))}
    </div>
  );
}
