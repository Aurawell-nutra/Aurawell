import { Playfair_Display, Poppins, Allura } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const script = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script-face",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Aaurawell Nutra — Small Gummies. Big Wellness.",
    template: "%s | Aaurawell Nutra",
  },
  description:
    "Thoughtfully formulated nutritional gummies for a healthier, brighter you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
