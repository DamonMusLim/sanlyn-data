import './globals.css';

export const metadata = {
  title: 'Sanlyn OS - Smart Logistics Platform',
  description: 'FortuneSanlyn Smart Logistics Management System',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
