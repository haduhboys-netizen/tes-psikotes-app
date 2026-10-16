'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [nama, setNama] = useState('');
  const [batch, setBatch] = useState('Batch 1');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) {
      alert('Silakan masukkan nama Anda.');
      return;
    }

    setLoading(true);
    localStorage.setItem('user_psikotes', JSON.stringify({ nama, batch }));

    // Kasih jeda 500ms agar efek loading pada tombol sempat terlihat
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
        
        {/* Glow Decor */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-2 relative z-10">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/30 mx-auto text-xl">
            PT
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">Psikotes Teologis</h1>
          <p className="text-xs text-slate-400">Masuk untuk mengakses materi E-Book & Kuis</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300 uppercase tracking-wider">Nama Peserta</label>
            <input
              type="text"
              required
              disabled={loading}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-300 uppercase tracking-wider">Pilih Batch / Gelombang</label>
            <select
              value={batch}
              disabled={loading}
              onChange={(e) => setBatch(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 transition text-sm disabled:opacity-50 cursor-pointer"
            >
              <option value="Batch 1">Batch 1 - Dasar Teologis</option>
              <option value="Batch 2">Batch 2 - Lanjutan & Praktika</option>
              <option value="Batch 3">Batch 3 - Kematangan Spiritual</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard →</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}