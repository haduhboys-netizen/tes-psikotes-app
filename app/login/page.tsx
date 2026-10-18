'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Award } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [namaInput, setNamaInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [batchInput, setBatchInput] = useState('Batch 1');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaInput.trim() || !emailInput.trim()) {
      alert('Mohon lengkapi nama dan email Anda.');
      return;
    }

    localStorage.setItem('user_nama', namaInput);
    localStorage.setItem('user_email', emailInput);
    localStorage.setItem('user_batch', batchInput);

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-blue-500 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/30 mx-auto">
            PT
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Psikotes Teologis</h1>
          <p className="text-xs text-slate-400">Masuk untuk mengakses materi E-Book & Kuis</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> Nama Peserta
            </label>
            <input
              type="text"
              required
              value={namaInput}
              onChange={(e) => setNamaInput(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Peserta
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Masukkan alamat email"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-400" /> Pilih Batch / Gelombang
            </label>
            <select
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 text-sm cursor-pointer"
            >
              <option value="Batch 1">Batch 1 - Dasar Teologis</option>
              {/* OPSI BATCH 2 DIGEMBOK / DISABLED */}
              <option value="Batch 2" disabled className="text-slate-500 bg-slate-900">
                🔒 Batch 2 - Lanjutan &amp; Praktika (Belum Dibuka)
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20 text-white mt-2"
          >
            Masuk ke Dashboard →
          </button>
        </form>
      </motion.div>
    </div>
  );
}