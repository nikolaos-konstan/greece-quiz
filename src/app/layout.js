import { Cinzel, GFS_Didot, Geist, Noto_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

// Geist and Cinzel have no Greek letters, so globals.css puts these first when
// the page is in Greek. They are not preloaded, as English pages never use them.
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["greek"],
  preload: false,
});

const gfsDidot = GFS_Didot({
  variable: "--font-gfs-didot",
  subsets: ["greek"],
  weight: "400",
  preload: false,
});

const fontVariables = [geistSans, cinzel, notoSans, gfsDidot]
  .map((font) => font.variable)
  .join(" ");

export const metadata = {
  title: "Greece Geography Quiz",
  description:
    "Test your knowledge of Greek geography. Identify prefectures and municipalities on an interactive map.",
};

export default function RootLayout({ children }) {
  return (
    // The font variables go on <html>, so the :root tokens in globals.css can use them.
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
