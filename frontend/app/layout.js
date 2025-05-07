import { Geist, Geist_Mono, Montserrat } from 'next/font/google';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

const montserrat = Montserrat({
  subsets: ['latin'],
});

export const metadata = {
  title: 'ThinkSage AI',
  description: 'AI-powered video analysis platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
