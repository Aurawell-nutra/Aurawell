export const metadata = {
  title: { default: "Admin", template: "%s | Aaurawell Admin" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
