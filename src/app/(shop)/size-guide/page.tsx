'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Ruler,
    Info,
    HelpCircle,
    RefreshCcw,
    MessagesSquare,
    Check,
    ChevronRight,
    Shirt,
    Scissors
} from 'lucide-react';

type Category = 'men' | 'women' | 'kids';
type ProductType = 'tshirts' | 'jackets' | 'pants' | 'shoes';
type Unit = 'cm' | 'in';

// Helper for unit conversion
const convert = (val: number, unit: Unit) => {
    if (unit === 'cm') return val;
    return Number((val / 2.54).toFixed(1));
};

const formatRange = (min: number, max: number, unit: Unit) => {
    return `${convert(min, unit)} - ${convert(max, unit)}`;
};

// Data Definition
const sizeData: Record<Category, Record<ProductType, {
    headers: string[];
    keys: string[];
    rows: { size: string;[key: string]: any }[];
}>> = {
    men: {
        tshirts: {
            headers: ['Size', 'Chest', 'Waist', 'Length'],
            keys: ['chest', 'waist', 'length'],
            rows: [
                { size: 'XS', chest: [86, 91], waist: [71, 76], length: 68 },
                { size: 'S', chest: [91, 96], waist: [76, 81], length: 70 },
                { size: 'M', chest: [96, 101], waist: [81, 86], length: 72 },
                { size: 'L', chest: [101, 106], waist: [86, 91], length: 74 },
                { size: 'XL', chest: [106, 111], waist: [91, 96], length: 76 },
                { size: 'XXL', chest: [111, 116], waist: [96, 101], length: 78 },
            ]
        },
        jackets: {
            headers: ['Size', 'Chest', 'Waist', 'Sleeve'],
            keys: ['chest', 'waist', 'sleeve'],
            rows: [
                { size: 'S', chest: [91, 96], waist: [76, 81], sleeve: 84 },
                { size: 'M', chest: [96, 101], waist: [81, 86], sleeve: 86 },
                { size: 'L', chest: [101, 106], waist: [86, 91], sleeve: 89 },
                { size: 'XL', chest: [106, 111], waist: [91, 96], sleeve: 91 },
            ]
        },
        pants: {
            headers: ['Size', 'Waist', 'Hips', 'Inseam'],
            keys: ['waist', 'hips', 'inseam'],
            rows: [
                { size: '28', waist: [71, 74], hips: [86, 89], inseam: 81 },
                { size: '30', waist: [76, 79], hips: [91, 94], inseam: 81 },
                { size: '32', waist: [81, 84], hips: [97, 99], inseam: 81 },
                { size: '34', waist: [86, 89], hips: [102, 104], inseam: 86 },
                { size: '36', waist: [91, 95], hips: [107, 109], inseam: 86 },
            ]
        },
        shoes: {
            headers: ['EU', 'US', 'UK', 'CM'],
            keys: ['us', 'uk', 'cm'],
            rows: [
                { size: '40', us: 7, uk: 6, cm: 25 },
                { size: '41', us: 8, uk: 7, cm: 26 },
                { size: '42', us: 9, uk: 8, cm: 27 },
                { size: '43', us: 10, uk: 9, cm: 28 },
                { size: '44', us: 11, uk: 10, cm: 29 },
            ]
        }
    },
    women: {
        tshirts: {
            headers: ['Size', 'Bust', 'Waist', 'Hips'],
            keys: ['bust', 'waist', 'hips'],
            rows: [
                { size: 'XS', bust: [78, 83], waist: [60, 65], hips: [84, 89] },
                { size: 'S', bust: [83, 88], waist: [65, 70], hips: [89, 94] },
                { size: 'M', bust: [88, 93], waist: [70, 75], hips: [94, 99] },
                { size: 'L', bust: [93, 98], waist: [75, 80], hips: [99, 104] },
                { size: 'XL', bust: [98, 103], waist: [80, 85], hips: [104, 109] },
            ]
        },
        jackets: {
            headers: ['Size', 'Bust', 'Waist', 'Sleeve'],
            keys: ['bust', 'waist', 'sleeve'],
            rows: [
                { size: 'XS', bust: [78, 83], waist: [60, 65], sleeve: 58 },
                { size: 'S', bust: [83, 88], waist: [65, 70], sleeve: 59 },
                { size: 'M', bust: [88, 93], waist: [70, 75], sleeve: 60 },
                { size: 'L', bust: [93, 98], waist: [75, 80], sleeve: 61 },
            ]
        },
        pants: {
            headers: ['Size', 'Waist', 'Hips', 'Inseam'],
            keys: ['waist', 'hips', 'inseam'],
            rows: [
                { size: '26', waist: [60, 63], hips: [86, 89], inseam: 76 },
                { size: '28', waist: [65, 68], hips: [91, 94], inseam: 76 },
                { size: '30', waist: [70, 73], hips: [96, 99], inseam: 78 },
                { size: '32', waist: [75, 78], hips: [101, 104], inseam: 78 },
            ]
        },
        shoes: {
            headers: ['EU', 'US', 'UK', 'CM'],
            keys: ['us', 'uk', 'cm'],
            rows: [
                { size: '36', us: 5, uk: 3, cm: 22.5 },
                { size: '37', us: 6, uk: 4, cm: 23.5 },
                { size: '38', us: 7, uk: 5, cm: 24.5 },
                { size: '39', us: 8, uk: 6, cm: 25.5 },
                { size: '40', us: 9, uk: 7, cm: 26.5 },
            ]
        }
    },
    kids: {
        tshirts: {
            headers: ['Age', 'Height', 'Chest', 'Waist'],
            keys: ['height', 'chest', 'waist'],
            rows: [
                { size: '3-4Y', height: [98, 104], chest: [54, 56], waist: [52, 54] },
                { size: '5-6Y', height: [110, 116], chest: [58, 61], waist: [55, 57] },
                { size: '7-8Y', height: [122, 128], chest: [63, 67], waist: [58, 60] },
                { size: '9-10Y', height: [134, 140], chest: [70, 74], waist: [62, 64] },
            ]
        },
        jackets: {
            headers: ['Age', 'Height', 'Chest', 'Sleeve'],
            keys: ['height', 'chest', 'sleeve'],
            rows: [
                { size: '3-4Y', height: [98, 104], chest: [54, 56], sleeve: 35 },
                { size: '5-6Y', height: [110, 116], chest: [58, 61], sleeve: 40 },
                { size: '7-8Y', height: [122, 128], chest: [63, 67], sleeve: 45 },
            ]
        },
        pants: {
            headers: ['Age', 'Height', 'Waist', 'Hips'],
            keys: ['height', 'waist', 'hips'],
            rows: [
                { size: '3-4Y', height: [98, 104], waist: [52, 54], hips: [56, 60] },
                { size: '5-6Y', height: [110, 116], waist: [55, 57], hips: [62, 66] },
                { size: '7-8Y', height: [122, 128], waist: [58, 60], hips: [68, 72] },
            ]
        },
        shoes: {
            headers: ['EU', 'US Kids', 'UK Kids', 'CM'],
            keys: ['us', 'uk', 'cm'],
            rows: [
                { size: '28', us: 11, uk: 10, cm: 17.3 },
                { size: '30', us: 12.5, uk: 11.5, cm: 18.5 },
                { size: '32', us: 1, uk: 13, cm: 20 },
                { size: '34', us: 3, uk: 2, cm: 21.5 },
            ]
        }
    }
};

export default function SizeGuidePage() {
    const [activeCategory, setActiveCategory] = useState<Category>('men');
    const [activeProduct, setActiveProduct] = useState<ProductType>('tshirts');
    const [unit, setUnit] = useState<Unit>('cm');

    const currentData = sizeData[activeCategory][activeProduct];

    return (
        <main className="max-w-[1200px] mx-auto px-4 lg:px-10 py-8 text-slate-900">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
                <Link href="/" className="text-slate-400 hover:text-amber-500 transition-colors">
                    Home
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-slate-900 font-bold">Size Guide</span>
            </nav>

            {/* Page Heading */}
            <div className="mb-12">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 uppercase text-slate-900">
                    Size Guide
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                    Temukan ukuran yang pas dengan panduan pengukuran lengkap kami.
                    Kami memastikan setiap produk pas dengan sempurna.
                </p>
            </div>

            {/* Main Categories (Tabs) */}
            <div className="border-b border-slate-200 flex gap-8 mb-8">
                {(['men', 'women', 'kids'] as Category[]).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex flex-col items-center border-b-[3px] pb-3 pt-2 px-2 transition-colors capitalize text-sm font-bold tracking-wider ${activeCategory === cat
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Sub-Categories & Unit Toggle */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                {/* Product Type Tabs */}
                <div className="bg-slate-100 p-1.5 rounded-xl flex w-full md:w-auto overflow-x-auto hide-scrollbar">
                    {(['tshirts', 'jackets', 'pants', 'shoes'] as ProductType[]).map((prod) => (
                        <button
                            key={prod}
                            onClick={() => setActiveProduct(prod)}
                            className={`flex-1 md:w-32 h-10 flex items-center justify-center rounded-lg px-4 text-sm font-bold capitalize transition-all ${activeProduct === prod
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {prod}
                        </button>
                    ))}
                </div>

                {/* Unit Toggle - Hide for shoes if standard sizes are used, but we keep it for now */}
                {activeProduct !== 'shoes' && (
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg flex-shrink-0">
                        <button
                            onClick={() => setUnit('cm')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${unit === 'cm'
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            CM
                        </button>
                        <button
                            onClick={() => setUnit('in')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all uppercase ${unit === 'in'
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            IN
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Measurement Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border-2 border-slate-100 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-lg uppercase tracking-tight flex items-center gap-2">
                                <Shirt className="w-5 h-5 text-amber-500" />
                                {activeCategory} &apos;s {activeProduct} Sizing
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        {currentData.headers.map((header) => (
                                            <th key={header} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentData.rows.map((row, index) => (
                                        <tr key={index} className={index % 2 === 1 ? 'bg-slate-50/50' : ''}>
                                            <td className="px-6 py-4 font-bold text-slate-900">{row.size}</td>
                                            {currentData.keys.map((key) => {
                                                const val = row[key];

                                                // For shoes, values are standard (US, UK, CM) and shouldn't be converted
                                                if (activeProduct === 'shoes') {
                                                    return (
                                                        <td key={key} className="px-6 py-4 text-slate-600">
                                                            {val}
                                                        </td>
                                                    )
                                                }

                                                return (
                                                    <td key={key} className="px-6 py-4 text-slate-600">
                                                        {Array.isArray(val)
                                                            ? formatRange(val[0], val[1], unit)
                                                            : typeof val === 'number' ? convert(val, unit) : val
                                                        }
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-100 flex gap-4">
                        <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold mb-1 text-amber-900 uppercase tracking-tight text-sm">Tips Memilih Ukuran</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Jika ukuran Anda berada di antara dua size, kami sarankan memilih satu size lebih besar (size up) untuk fit yang lebih rileks, atau size lebih kecil untuk fit yang lebih ketat (tailored). Produk kami sudah melalui proses pre-shrunk untuk meminimalisir penyusutan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* How to Measure Section */}
                <div className="flex flex-col gap-8">
                    <div className="bg-white rounded-xl border-2 border-slate-100 p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-6 uppercase tracking-tight flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-amber-500" />
                            Cara Mengukur
                        </h3>

                        <div className="aspect-[3/4] bg-slate-50 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden border border-slate-100">
                            <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                                <Shirt size={200} strokeWidth={1} />
                            </div>
                            <div className="relative w-full h-full p-8 flex flex-col items-center justify-center">
                                {/* Simplified Abstract Body Shape */}
                                <div className="w-32 h-64 bg-slate-200 rounded-[3rem] relative flex flex-col items-center mx-auto">
                                    {/* Measurement Guidelines */}
                                    <div className="absolute top-[28%] w-40 border-t-2 border-amber-500 border-dashed flex items-center justify-between">
                                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2">CHEST</span>
                                    </div>
                                    <div className="absolute top-[45%] w-32 border-t-2 border-amber-500 border-dashed flex items-center justify-between">
                                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2">WAIST</span>
                                    </div>
                                    <div className="absolute top-[60%] w-40 border-t-2 border-amber-500 border-dashed flex items-center justify-between">
                                        <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full absolute left-1/2 -translate-x-1/2 -translate-y-1/2">HIPS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ul className="space-y-6">
                            {[
                                { title: 'Chest (Dada)', desc: 'Ukur di bagian terlebar dada Anda, jaga agar pita ukur tetap horizontal.' },
                                { title: 'Waist (Pinggang)', desc: 'Ukur di bagian terkecil pinggang (biasanya di mana tubuh menekuk ke samping).' },
                                { title: 'Hips (Pinggul)', desc: 'Ukur di bagian terlebar pinggul Anda, jaga meteran tetap lurus.' }
                            ].map((step, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                                        {i + 1}
                                    </span>
                                    <div>
                                        <h5 className="text-sm font-bold text-slate-900">{step.title}</h5>
                                        <p className="text-xs text-slate-500 leading-normal mt-1">{step.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-slate-900 text-white p-7 rounded-2xl relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2 text-lg">Masih bingung?</h4>
                            <p className="text-sm text-slate-300 mb-6">Konsultasikan ukuran dengan stylist kami atau lihat review pembeli lain.</p>
                            <Link href="/contact" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                                <MessagesSquare className="w-4 h-4" />
                                Chat CS Sekarang
                            </Link>
                        </div>
                        {/* Abstract Background Element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20">
                <h3 className="text-2xl font-black tracking-tight mb-8 uppercase text-slate-900">Pertanyaan Umum (FAQ)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-colors">
                        <h5 className="font-bold mb-3 flex items-center gap-3 text-slate-900">
                            <HelpCircle className="w-5 h-5 text-amber-500" />
                            Apakah ukuran sesuai standar (True to Size)?
                        </h5>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Sebagian besar pakaian kami dirancang dengan fit standar. Cek halaman produk masing-masing untuk tag &quot;Runs Small&quot; atau &quot;Runs Large&quot; berdasarkan ulasan pelanggan.
                        </p>
                    </div>
                    <div className="p-6 bg-white rounded-xl border-2 border-slate-100 hover:border-slate-200 transition-colors">
                        <h5 className="font-bold mb-3 flex items-center gap-3 text-slate-900">
                            <RefreshCcw className="w-5 h-5 text-amber-500" />
                            Bisa tukar jika tidak pas?
                        </h5>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Ya! Kami menawarkan kebijakan penukaran 30 hari tanpa ribet untuk masalah ukuran apa pun.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
