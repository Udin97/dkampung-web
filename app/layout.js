import './globals.css'
import Navbar from '@/components/Navbar'
import FooterWrapper from '@/components/FooterWrapper'
import PageTracker from '@/components/PageTracker'

export const metadata = {
  title: 'DKAMPUNG – Kuih Tradisional Terbaik',
  description: 'Kuih tradisional buatan tangan segar setiap hari. Apam, Kaswi, Tepung Pelita. Tempahan majlis dari 50 hingga 200 pax di Cyberjaya dan Taman Putra Perdana.',
  keywords: 'kuih tradisional, kuih cyberjaya, apam, kaswi, tepung pelita, dkampung',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body>
        <Navbar />
        <PageTracker />
        <main>{children}</main>
        <FooterWrapper />
      </body>
    </html>
  )
}
