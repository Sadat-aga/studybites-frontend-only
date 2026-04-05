import Image from "next/image";

export function GlobeIcon() {
  return (
    <Image
      src="/images/studybites/globe.svg"
      alt="Change locale"
      width={21}
      height={21}
      className="size-[21px]"
    />
  );
}

export function ArrowDownIcon() {
  return (
    <Image
      src="/images/studybites/arrow-down.svg"
      alt="Arrow Down"
      width={10}
      height={6}
      className="h-[6px] w-[10px]"
    />
  );
}

export function EyeOpenIcon() {
  return (
    <Image
      src="/images/studybites/eye-open.svg"
      alt="Show password"
      width={17}
      height={12}
      className="h-6 w-auto"
    />
  );
}

export function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
      <path
        fill="#EA4335"
        d="M12.23 10.16v3.84h5.38c-.24 1.24-.95 2.29-2.02 3l3.26 2.53c1.9-1.75 2.99-4.34 2.99-7.43 0-.71-.06-1.39-.18-2.04h-9.43Z"
      />
      <path
        fill="#4285F4"
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.26-2.53c-.9.6-2.05.97-3.36.97-2.58 0-4.77-1.74-5.55-4.09H3.08v2.57A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.45 13.91A5.98 5.98 0 0 1 6.14 12c0-.66.11-1.3.31-1.91V7.52H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.48l3.37-2.57Z"
      />
      <path
        fill="#34A853"
        d="M12 6c1.47 0 2.8.51 3.84 1.52l2.88-2.88C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.08 7.52l3.37 2.57C7.23 7.74 9.42 6 12 6Z"
      />
    </svg>
  );
}

export function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-black">
      <path d="M16.7 12.7c0-1.9 1.5-2.8 1.6-2.9-.9-1.3-2.2-1.5-2.7-1.5-1.1-.1-2.2.7-2.8.7s-1.5-.7-2.4-.7c-1.3 0-2.4.7-3 1.8-1.3 2.1-.3 5.4.9 7.1.6.8 1.3 1.8 2.3 1.8.9 0 1.3-.6 2.4-.6s1.5.6 2.5.6 1.7-.9 2.3-1.7c.7-.9 1-1.8 1-1.9-.1 0-2.1-.8-2.1-2.7Zm-1.8-5.5c.5-.6.9-1.4.8-2.2-.8 0-1.7.5-2.3 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.8-.5 2.3-1.1Z" />
    </svg>
  );
}
