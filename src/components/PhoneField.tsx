'use client';

import { useId } from 'react';

type Country = { code: string; dial: string; flag: string; label: string };

const COUNTRIES: Country[] = [
  { code: 'TR', dial: '+90', flag: '🇹🇷', label: 'Türkiye' },
  { code: 'US', dial: '+1', flag: '🇺🇸', label: 'United States' },
  { code: 'GB', dial: '+44', flag: '🇬🇧', label: 'United Kingdom' },
  { code: 'DE', dial: '+49', flag: '🇩🇪', label: 'Germany' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', label: 'France' },
  { code: 'NL', dial: '+31', flag: '🇳🇱', label: 'Netherlands' },
];

export default function PhoneField() {
  const selectId = useId();
  const inputId = useId();

  return (
    <div className="flex gap-2">
      <div className="relative">
        <label htmlFor={selectId} className="sr-only">
          Country code
        </label>
        <select
          id={selectId}
          name="phone_country"
          className="input pr-8 w-44"
          defaultValue="TR"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.flag} {c.label} ({c.dial})
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor={inputId} className="sr-only">
          Phone number
        </label>
        <input
          id={inputId}
          name="phone_local"
          type="tel"
          inputMode="tel"
          placeholder="5xx xxx xx xx"
          className="input"
          autoComplete="tel-national"
        />
      </div>
    </div>
  );
}
