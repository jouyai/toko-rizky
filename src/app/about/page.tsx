import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Heart } from 'lucide-react';
import type { Metadata } from 'next';

// Tambahkan metadata untuk halaman ini
export const metadata: Metadata = {
  title: 'Tentang Kami',
};


// Komponen untuk menampilkan setiap nilai perusahaan
const ValueCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-12">
      {/* Bagian Utama */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 p-8">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-center text-indigo-600">Mengenal Toko Rizky Lebih Dekat</CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6 text-lg text-gray-700">
          <p className="text-center italic">
            "Menghadirkan Kualitas dan Kepercayaan dalam Setiap Produk."
          </p>
          <p>
            Selamat datang di Toko Rizky! Kami bukan sekadar toko online biasa. Kami adalah sebuah tim yang bersemangat untuk menghadirkan produk-produk pilihan terbaik yang tidak hanya berkualitas tinggi, tetapi juga unik dan penuh gaya.
          </p>
          <p>
            Perjalanan kami dimulai pada tahun 2024 dari sebuah ide sederhana: menciptakan platform belanja yang mudah, aman, dan menyenangkan. Kami percaya bahwa setiap orang berhak mendapatkan produk terbaik dengan layanan yang memuaskan. Oleh karena itu, kami mendedikasikan waktu kami untuk melakukan riset mendalam, memilih pemasok terpercaya, dan memastikan setiap produk yang sampai ke tangan Anda adalah yang terbaik.
          </p>
        </CardContent>
      </Card>

      {/* Bagian Visi & Misi */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Visi & Misi Kami</h2>
        <p className="max-w-2xl mx-auto text-gray-600">
          Menjadi toko online terpercaya di Indonesia yang dikenal karena kualitas produk, keunikan, dan pelayanan pelanggan yang prima.
        </p>
      </div>

      {/* Bagian Nilai-nilai Kami */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ValueCard icon={<Heart size={32} />} title="Pelanggan Utama">
          Kepuasan Anda adalah prioritas kami. Kami selalu berusaha memberikan pengalaman berbelanja yang tak terlupakan.
        </ValueCard>
        <ValueCard icon={<Target size={32} />} title="Kualitas Terjamin">
          Setiap produk telah melalui proses seleksi ketat untuk memastikan Anda mendapatkan kualitas terbaik.
        </ValueCard>
        <ValueCard icon={<Users size={32} />} title="Inovasi Berkelanjutan">
          Kami terus berinovasi untuk menghadirkan produk-produk baru yang relevan dengan gaya hidup Anda.
        </ValueCard>
      </div>

      {/* Ajakan */}
      <Card className="bg-indigo-600 text-white text-center">
         <CardContent className="p-8">
           <h3 className="text-2xl font-bold mb-2">Punya Pertanyaan?</h3>
           <p className="mb-4">Tim kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.</p>
           <a href="/contact" className="bg-white text-indigo-600 font-bold py-2 px-6 rounded-md hover:bg-gray-100 transition-colors">
             Hubungi Kami
           </a>
         </CardContent>
      </Card>
    </div>
  )
}
