import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waqt — Islamic Companion",
  description: "Built for the Modern Ummah",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}