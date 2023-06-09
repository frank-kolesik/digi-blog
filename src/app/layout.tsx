import Link from 'next/link';

import SearchField from '../components/SearchField';

import '../styles/globals.css';

export const metadata = {
  title: 'Digitale Grundbildung',
  description: 'Digitale Grundbildung - Blog',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="sticky top-0 inset-x-0 bg-white shadow-sm z-20">
          <div className="max-w-7xl mx-auto w-full p-4 flex justify-between items-center">
            <Link href="/">
              <span className="font-bold hover:bg-blue-500 hover:bg-none text-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-transparent bg-clip-text">
                DigiBlog
              </span>
            </Link>

            <ul className="gap-2 flex">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="?markdown=datei-explorer">Datei-Explorer</Link>
              </li>
            </ul>

            <SearchField />
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
