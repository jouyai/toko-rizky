'use client';

import Link from 'next/link';

// Definisikan ikon media sosial sebagai komponen SVG sederhana
const SocialIcon = ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 transition-colors">
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom Tentang */}
          <div>
            <h3 className="text-lg font-bold text-indigo-600 mb-4">TokoRizky</h3>
            <p className="text-sm text-gray-600">
              Sumber utama Anda untuk produk berkualitas. Kami berdedikasi untuk memberikan yang terbaik.
            </p>
          </div>

          {/* Kolom Tautan Cepat */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:underline">Beranda</Link></li>
              <li><Link href="/product" className="text-gray-600 hover:underline">Produk</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:underline">Tentang Kami</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:underline">Kontak</Link></li>
            </ul>
          </div>

          {/* Kolom Bantuan */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Bantuan</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-600 hover:underline">FAQ</a></li>
              <li><a href="#" className="text-gray-600 hover:underline">Kebijakan Pengiriman</a></li>
              <li><a href="#" className="text-gray-600 hover:underline">Kebijakan Privasi</a></li>
            </ul>
          </div>

          {/* Kolom Media Sosial */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <SocialIcon href="https://facebook.com">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.147 2 12.315 2zm-1.161 1.545a3.27 3.27 0 00-2.172 1.05c-.58.58-.948 1.35-.948 2.172s.368 1.592.948 2.172a3.27 3.27 0 002.172 1.05c.822 0 1.592-.368 2.172-.948.58-.58.948-1.35.948-2.172s-.368-1.592-.948-2.172a3.27 3.27 0 00-2.172-1.05zm-4.43 8.97a.74.74 0 01.74-.74h8.86a.74.74 0 010 1.48h-8.86a.74.74 0 01-.74-.74z" clipRule="evenodd" /></svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </SocialIcon>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TokoRizky. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
