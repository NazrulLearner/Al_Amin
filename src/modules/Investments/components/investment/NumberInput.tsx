// ==========================================
// NumberInput — one input for ALL amounts and percentages
// ------------------------------------------
// Fixes: leading "0" (02, 020), spinner arrows, mouse-wheel changing the value,
// letters like "e" or "-", and wrong mobile keyboard.
// How: it is a normal text box (no spinner/scroll behaviour) that opens the
// numeric keyboard on phones (inputMode="decimal"), keeps what you type as text,
// and gives the parent a real number.
// ==========================================
import { useEffect, useState } from 'react';
import { formatTaka } from '../../utils/investmentUtils';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

// Keeps only digits and ONE dot; Bangla digits become English; strips leading zeros.
export function sanitizeDecimal(raw: string, maxDecimals = 2): string {
  let s = raw.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  s = s.replace(/[^0-9.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, maxDecimals);
  }
  s = s.replace(/^0+(?=\d)/, '');
  if (s.startsWith('.')) s = '0' + s;
  return s;
}

interface Props {
  value: number | undefined;
  onChange: (value: number) => void;
  kind?: 'amount' | 'percent';
  max?: number; // percent defaults to 100
  maxDecimals?: number;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  onBlur?: () => void;
}

export default function NumberInput({
  value,
  onChange,
  kind = 'amount',
  max,
  maxDecimals = 2,
  placeholder,
  disabled,
  invalid,
  id,
  onBlur,
}: Props) {
  const limit = max ?? (kind === 'percent' ? 100 : undefined);
  const toText = (v?: number) => (v ? String(v) : '');
  const [text, setText] = useState(toText(value));

  // If the parent changes the value (e.g. form reset), follow it.
  useEffect(() => {
    if (Number(text || 0) !== (value || 0)) setText(toText(value));
  }, [value, text]);

  const handle = (raw: string) => {
    const next = sanitizeDecimal(raw, maxDecimals);
    const num = next === '' || next === '.' ? 0 : Number(next);
    if (limit !== undefined && num > limit) {
      setText(String(limit));
      onChange(limit);
      return;
    }
    setText(next);
    onChange(num);
  };

  return (
    <div>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="done"
        className="inp"
        style={invalid ? { borderColor: '#ef4444' } : undefined}
        value={text}
        placeholder={placeholder ?? (kind === 'percent' ? '0' : '0')}
        disabled={disabled}
        onChange={(e) => handle(e.target.value)}
        onBlur={() => {
          // tidy "5." -> "5" when leaving the box
          if (text.endsWith('.')) setText(text.slice(0, -1));
          onBlur?.();
        }}
      />
      {kind === 'amount' && (value || 0) > 0 && (
        <p className="mt-1 text-xs text-slate-500">= ৳{formatTaka(value || 0)}</p>
      )}
    </div>
  );
}
