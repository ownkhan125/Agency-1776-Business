import { Geist, Geist_Mono, Anton_SC } from "next/font/google";
import "./globals.css";
import GlobalChrome from "@/components/GlobalChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for every heading site-wide. `display: 'swap'` renders
// the fallback immediately then swaps in Anton SC when ready — no
// FOIT, and next/font self-hosts + preloads so it lands on first paint
// under normal conditions.
const antonSC = Anton_SC({
  variable: "--font-anton-sc",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Agency 1776 Business",
  description: "Agency 1776 Business",
};

// Pre-hydration script. Runs synchronously as the first child of <body>
// (parser reaches it before painting any content), reads the persisted
// theme from localStorage, and rewrites the <html> class + data-theme
// attribute. Since theming is purely a CSS-variable swap driven by
// class name, there is no React tree divergence between server and
// client — the class flip is invisible to hydration.
const THEME_INIT_SCRIPT = `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var t = stored === 'light' ? 'light' : 'black';
    var h = document.documentElement;
    h.setAttribute('data-theme', t);
    h.classList.remove('theme-black', 'theme-light');
    h.classList.add('theme-' + t);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="black"
      className={`${geistSans.variable} ${geistMono.variable} ${antonSC.variable} theme-black h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="isolate min-h-full flex flex-col bg-background text-foreground selection:bg-accent selection:text-background">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <GlobalChrome>{children}</GlobalChrome>
      </body>
    </html>
  );
}
