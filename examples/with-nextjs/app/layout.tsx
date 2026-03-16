import { JankMeter } from 'jankmeter/next';
import './globals.css';

export const metadata = {
  title: 'jankmeter — Next.js Example',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JankMeter />
        {children}
      </body>
    </html>
  );
}
