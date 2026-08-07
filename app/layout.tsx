export const metadata = {
  title: "Dangal Competition — Live State vs State Dashboard",
  description: "Live onboarding & activation leaderboard across all 11 Dangal matches",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
