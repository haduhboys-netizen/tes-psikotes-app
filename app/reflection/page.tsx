'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  reflectionQuestions 
} from '@/data/reflectionQuestions';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2,
  PieChart,
  UserCheck
} from 'lucide-react';

export default function ReflectionPage() {
  const router = useRouter();

  // NAMA & EMAIL OTOMATIS DARI LOGIN
  const [userNama, setUserNama] = useState('Peserta');
  const [userEmail, setUserEmail] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  // STATE ANIMASI TRANSISI TIRAI BIRU EXIT
  const [isExpanding, setIsExpanding] = useState(false);

  // STATE KUIS & JAWABAN
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // LINK GRUP WA
  const WA_GROUP_LINK = 'https://chat.whatsapp.com/Du7w6LKPUxMBGwK9pha3kV?s=sh&p=a&iam=2';

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || '';
    setUserNama(savedName);
    setUserEmail(savedEmail);
  }, []);

  const handleSelectOption = (type: string) => {
    const qId = reflectionQuestions[currentIndex].id;
    setAnswers((prev) => ({ ...prev, [qId]: type }));
  };

  const handleNext = () => {
    if (!answers[reflectionQuestions[currentIndex].id]) {
      alert('Pilih salah satu jawaban terlebih dahulu.');
      return;
    }
    if (currentIndex < reflectionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
  setIsCompleted(true);
  const cleanEmail = userEmail.trim().toLowerCase();
  localStorage.setItem('reflection_completed', 'true');
  localStorage.setItem(`reflection_completed_${cleanEmail}`, 'true');
}
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // HANDLER PINDAH KE DASHBOARD DENGAN ANIMASI TIRAI BIRU MELAR
  const handleGoToDashboard = () => {
    setIsExpanding(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 700);
  };

  // KALKULASI PROFIL & DISTRIBUSI
  const calculateResult = () => {
    const counts: Record<string, number> = {
      'Self-Protector': 0,
      'Deep Thinker': 0,
      'Meaning Seeker': 0,
      'Overthinker': 0,
      'Action Builder': 0,
    };

    Object.values(answers).forEach((type) => {
      if (counts[type] !== undefined) counts[type]++;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const primaryProfile = sorted[0];
    const secondaryProfile = sorted[1];
    const totalAns = reflectionQuestions.length;

    return { counts, sorted, primaryProfile, secondaryProfile, totalAns };
  };

  const currentQ = reflectionQuestions[currentIndex];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white p-4 sm:p-8 flex items-center justify-center overflow-hidden">
      
      {/* 1. ELEMEN TIRAI BIRU MASUK (MENYUSUT KE ATAS PAS HALAMAN DIBUKA) */}
      <motion.div
        initial={{ height: '100%' }}
        animate={{ height: '0%' }}
        transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
        className="fixed top-0 left-0 right-0 bg-[#6366f1] z-50 pointer-events-none rounded-b-[100%] scale-x-125"
      />

      {/* 2. ELEMEN TIRAI BIRU KELUAR (MELAR TURUN PAS TEKAN AKSES DASHBOARD) */}
      <motion.div
        initial={{ height: '0%' }}
        animate={{ height: isExpanding ? '100%' : '0%' }}
        transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
        className="fixed top-0 left-0 right-0 bg-[#6366f1] z-50 pointer-events-none rounded-b-[100%] scale-x-125"
      />

      {/* KONTEN UTAMA PRE-TEST */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden space-y-6"
      >
        {/* HEADER NAVBAR */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center font-black text-xs">
              SN
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Sankofa Navigator</h1>
              <p className="text-[10px] text-slate-400 font-mono">Pre-test Refleksi Diri</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            {isCompleted ? 'Hasil Refleksi' : isStarted ? `Soal ${currentIndex + 1}/20` : 'Petunjuk Awal'}
          </span>
        </div>

        {/* PETUNJUK AWAL */}
        {!isStarted && !isCompleted && (
          <div className="space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{userNama}</p>
                <p className="text-[10px] text-slate-400 font-mono">{userEmail || 'Peserta Terdaftar'}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3 h-3" /> PETUNJUK AWAL PRE-TEST
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sebelum mengakses Dashboard Psikotes Batch 1, Anda diwajibkan menyelesaikan "20 pertanyaan refleksi". 
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside pt-1">
                <li>Pilih opsi (A–E) yang paling menggambarkan diri Anda secara jujur.</li>
                <li>Ini "bukan ujian nilai/skor", melainkan pemetaan profil refleksi diri.</li>
                <li>Setelah selesai, Anda dapat bergabung ke Komunitas WhatsApp dan mengakses Dashboard Batch 1.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setIsStarted(true)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Mulai Refleksi Diri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SOAL REFLEKSI (20 SOAL) */}
        {isStarted && !isCompleted && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-blue-400 font-bold uppercase tracking-wider">{currentQ.dimension}</span>
              <span>Pertanyaan {currentIndex + 1} / {reflectionQuestions.length}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{currentQ.question}</h2>

            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.type;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(opt.type)}
                    className={`w-full p-4 rounded-2xl text-left text-xs font-medium transition border flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <span>{currentIndex === reflectionQuestions.length - 1 ? 'Lihat Hasil' : 'Lanjut'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* HASIL PROFIL REFLEKSI & GABUNG WA */}
        {isCompleted && (() => {
          const res = calculateResult();
          return (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                  <CheckCircle2 className="w-3 h-3" /> PROFIL KECENDERUNGAN UTAMA
                </span>
                <h3 className="text-2xl font-black text-white">{res.primaryProfile[0]}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kecenderungan sekunder Anda: <strong className="text-blue-400">{res.secondaryProfile[0]}</strong>
                </p>
              </div>

              {/* DISTRIBUSI JAWABAN */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-blue-400" /> Distribusi Persentase Jawaban
                </h4>
                <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  {res.sorted.map(([typeName, count]) => {
                    const percent = Math.round((count / res.totalAns) * 100);
                    return (
                      <div key={typeName} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                          <span>{typeName}</span>
                          <span className="font-mono text-slate-400">{percent}% ({count}/{res.totalAns})</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOMBOL AKSI AKHIR */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <a
                  href={WA_GROUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Gabung Grup WhatsApp Komunitas</span>
                </a>

                <button
                  onClick={handleGoToDashboard}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <span>Akses Dashboard Batch 1</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

      </motion.div>
    </div>
  );
}