import type { SVGProps } from "react";

const paths = {
  leaf: (
    <>
      <path d="M20 4C11 3 4 7 4 13a7 7 0 0 0 7 7c6 0 10-7 9-16Z" />
      <path d="m4 20 11-11M9 15v-5m0 5h5" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  location: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  phone: <path d="m7 3 3 5-3 3a16 16 0 0 0 6 6l3-3 5 3v3c-9 4-21-8-17-17h3Z" />,
  chat: (
    <>
      <path d="M21 11.5a9 9 0 0 1-9 9 11 11 0 0 1-4-.8L3 21l1.3-5a9 9 0 1 1 16.7-4.5Z" />
      <path d="M8 9h8m-8 5h5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  bag: (
    <>
      <path d="M5 7h14l2 14H3L5 7Z" />
      <path d="M8 9V6a4 4 0 0 1 8 0v3" />
    </>
  ),
  box: (
    <>
      <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10v10M3 7l9 5 9-5M7 4l9 5" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  chart: (
    <>
      <path d="M4 3v17h17M8 16v-5m5 5V7m5 9V4" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="m9 3 1 3h4l1-3 3 2-1 3 2 3 3 1-1 4-3-1-3 2-1 3h-4l-1-3-3-2-3 1-1-4 3-1 2-3-1-3 3-2Z" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  moon: <path d="M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10h.01" />
    </>
  ),
  truck: (
    <>
      <path d="M3 5h11v12H3V5Zm11 5h4l3 4v3h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
};
export type IconName = keyof typeof paths;
export default function Icon({
  name,
  className = "",
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`icon ${className}`}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
