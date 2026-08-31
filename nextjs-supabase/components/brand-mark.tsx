export function BrandMark({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 128 128" aria-hidden="true" className={className}>
    <rect width="128" height="128" rx="10" fill="#1A365D" />
    <path fill="#F59E0B" d="M64 12c9 13 18 20 39 24v40c0 21-15 37-39 51C40 113 25 97 25 76V36c21-4 30-11 39-24Z" />
    <path fill="#1A365D" d="M64 30c-3 8-1 13-8 20-9 9-14 18-9 28 3 7 10 9 10 18 0 6 3 12 7 17 4-6 7-11 7-18 0-8-6-12-5-20 1-8 10-13 11-23 1-8-5-16-13-22Z" />
    <path fill="#F59E0B" d="M61 65h6v52h-6zM33 54c10 0 20-4 30-10v9c-8 6-18 9-30 10v-9ZM67 44c10 6 19 9 28 10v9c-11-1-21-4-28-10v-9Z" />
  </svg>;
}
