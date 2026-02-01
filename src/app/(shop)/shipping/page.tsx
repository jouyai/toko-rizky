'use client';

import Link from 'next/link';
import {
    ChevronRight,
    Truck,
    Clock,
    Globe,
    Search,
    PackageSearch,
    MapPin,
    HelpCircle,
    MessageSquare,
    Mail
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function ShippingPage() {
    return (
        <main className="max-w-[1200px] mx-auto px-4 lg:px-10 py-8 text-slate-900">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
                <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
                    Home
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-slate-900 font-bold">Shipping & Delivery</span>
            </nav>

            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 mb-10">
                <div className="flex min-w-72 flex-col gap-3">
                    <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight uppercase text-slate-900">
                        Shipping & Delivery
                    </h1>
                    <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
                        Pengiriman cepat dan terpercaya untuk gaya hidup modern. Pelajari bagaimana kami mengirimkan pesanan ke depan pintu Anda.
                    </p>
                </div>
            </div>

            {/* Quick Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Truck className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 uppercase tracking-tight">Free Shipping</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Gratis ongkir untuk semua pesanan di atas Rp 500.000. Otomatis diterapkan saat checkout.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Clock className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 uppercase tracking-tight">Express Delivery</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Butuh cepat? Pilih pengiriman Express untuk sampai dalam 1-2 hari kerja.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <Globe className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 uppercase tracking-tight">National Reach</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Kami mengirim ke seluruh pelosok Indonesia dengan cepat dan aman.
                    </p>
                </div>
            </div>

            {/* Detailed Information Sections (Accordion Style) */}
            <div className="mb-20 max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="w-full space-y-4">

                    <AccordionItem value="item-1" className="border border-slate-200 rounded-xl px-2 data-[state=open]:bg-slate-50 data-[state=open]:border-slate-300 transition-colors">
                        <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>span]:text-amber-600">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">Metode & Tarif Pengiriman</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-6 pt-2">
                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="px-6 py-4 font-bold">Metode</th>
                                            <th className="px-6 py-4 font-bold">Estimasi Waktu</th>
                                            <th className="px-6 py-4 font-bold">Biaya</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-900">Reguler (JNE/J&T)</td>
                                            <td className="px-6 py-4 text-slate-600">3-5 Hari Kerja</td>
                                            <td className="px-6 py-4 text-slate-600">Rp 15.000 (Gratis &gt; 500rb)</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-900">Next Day (Sicepat Best)</td>
                                            <td className="px-6 py-4 text-slate-600">1-2 Hari Kerja</td>
                                            <td className="px-6 py-4 text-slate-600">Rp 35.000</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-slate-900">Instant (Gojek/Grab)</td>
                                            <td className="px-6 py-4 text-slate-600">3-6 Jam (Jabodetabek)</td>
                                            <td className="px-6 py-4 text-slate-600">Sesuai Aplikasi</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border border-slate-200 rounded-xl px-2 data-[state=open]:bg-slate-50 data-[state=open]:border-slate-300 transition-colors">
                        <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>span]:text-amber-600">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">Pengiriman Internasional</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-6 pt-2">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold mb-2 text-slate-900 text-sm uppercase tracking-wide">Cakupan Layanan</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Saat ini kami melayani pengiriman ke Malaysia, Singapura, dan Thailand. Semua pesanan internasional dikirim menggunakan DHL Express atau FedEx International Priority.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-2 text-slate-900 text-sm uppercase tracking-wide">Pajak & Bea Masuk</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Harap dicatat bahwa pengiriman internasional mungkin dikenakan bea masuk dan pajak impor yang dipungut setelah paket mencapai negara tujuan. Biaya ini ditanggung oleh penerima.
                                    </p>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border border-slate-200 rounded-xl px-2 data-[state=open]:bg-slate-50 data-[state=open]:border-slate-300 transition-colors">
                        <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]>div>span]:text-amber-600">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">Waktu Pemrosesan</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-6 pt-2">
                            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                Pesanan diproses hari Senin hingga Jumat, tidak termasuk hari libur nasional. Sebagian besar pesanan dikirim dalam waktu 24-48 jam setelah pembelian. Selama masa promo atau peluncuran koleksi baru, pemrosesan mungkin memakan waktu hingga 4 hari kerja.
                            </p>
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs font-medium">
                                <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>Pesanan yang masuk setelah jam 14:00 WIB pada hari Jumat akan mulai diproses pada hari Senin berikutnya.</span>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                </Accordion>
            </div>

            {/* Final CTA Support */}
            <div className="flex flex-col items-center justify-center text-center py-12 border-t border-slate-200">
                <p className="text-lg font-medium text-slate-600 mb-8">Masih ada pertanyaan tentang pengiriman?</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl border-2 border-slate-200 h-12 px-6 bg-white text-slate-700 text-sm font-bold uppercase tracking-wide hover:border-slate-300 hover:bg-slate-50 transition-all">
                        <Mail className="w-4 h-4 text-amber-500" />
                        Hubungi Kami
                    </button>
                </div>
            </div>
        </main>
    );
}
