'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Save, RefreshCw, Sparkles } from 'lucide-react';

const MAIN_QUESTIONS = [
  { id: 1, text: "Saya merasa mampu mengendalikan emosi dan tetap tenang saat menghadapi situasi bertekanan tinggi." },
  { id: 2, text: "Dalam mengambil keputusan penting, saya selalu mempertimbangkan dampak moral dan etika jangka panjang." },
  { id: 3, text: "Saya mudah beradaptasi dengan perubahan lingkungan atau aturan baru dalam kelompok." },
  { id: 4, text: "Ketika mengalami kegagalan, saya cenderung mencari penyebabnya untuk perbaikan ketimbang menyalahkan situasi." },
  { id: 5, text: "Saya merasa nyaman memimpin dan mengambil tanggung jawab atas keputusan tim." },
  { id: 6, text: "Prinsip dan nilai-nilai keyakinan pribadi menjadi kompas utama saya dalam mengambil keputusan rumit." },
  { id: 7, text: "Saya terbuka menerima kritik keras dari orang lain jika itu bertujuan positif untuk kemajuan." },
  { id: 8, text: "Saya dapat bekerja sama secara akurat dengan tim yang memiliki latar belakang pemikiran berbeda." },
  { id: 9, text: "Saat tenggat waktu mendesak, saya dapat memprioritaskan tugas kritis tanpa kehilangan fokus." },
  { id: 10, text: "Saya merasa penting untuk terus mempelajari hal-hal baru di luar bidang keahlian saya saat ini." },
  { id: 11, text: "Saya cenderung menyelesaikan masalah secara mandiri terlebih dahulu sebelum meminta bantuan orang lain." },
  { id: 12, text: "Saya mampu menjaga konsistensi komitmen kerja dalam jangka waktu panjang meski menghadapi kejenuhan." },
  { id: 13, text: "Keberhasilan rekan sejawat menjadi motivasi bagi saya untuk ikut tumbuh dan meningkatkan kualitas diri." },
  { id: 14, text: "Saya menyusun perencanaan target mingguan secara terstruktur dan terukur." },
  { id: 15, text: "Saya bersedia berkorban waktu dan tenaga lebih demi tercapainya tujuan bersama." },
  { id: 16, text: "Dalam situasi ketidakpastian, saya dapat tetap mengambil tindakan terukur tanpa kebingungan." },
  { id: 17, text: "Saya merasa integritas kejujuran lebih penting daripada sekadar mencapai hasil cepat." },
  { id: 18, text: "Saya mampu mendengarkan masukan dan sudut pandang orang lain tanpa mendebat secara emosional." },
  { id: 19, text: "Saya tidak ragu mengakui kesalahan jika strategi yang saya rencanakan ternyata kurang tepat." },
  { id: 20, text: "Saya meyakini bahwa setiap usaha maksimal harus diimbangi dengan kedewasaan berserah diri pada hasil." }
];

const LIKERT_OPTIONS = [
  { label: 'A', text: 'Sangat Setuju' },
  { label: 'B', text: 'Setuju' },
  { label: 'C', text: 'Netral' },
  { label: 'D', text: 'Tidak Setuju' },
  { label: 'E', text: 'Sangat Tidak Setuju' }
];

export default function TestPage() {
  const router = useRouter();
  const [userNama, setUserNama] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('user_nama') || 'Peserta';
    const savedEmail = localStorage.getItem('user_email') || '';

    if (!savedEmail) {
      router.push('/login');
      return;
    }

    setUserNama(savedName);
    setUserEmail(savedEmail);

    const cleanEmail = savedEmail.trim().toLowerCase();
    const savedAnswers = localStorage.getItem(`test_answers_${cleanEmail}`);
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error('Failed to parse answers', e);
      }
    }
  }, [router]);

  const handleSelectOption = (questionId: number, optionText: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleNext = () => {
    if (currentIndex < MAIN_QUESTIONS.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < MAIN_QUESTIONS.length) {
      const confirmSubmit = window.confirm(
        `Anda baru menjawab ${answeredCount} dari ${MAIN_QUESTIONS.length} soal. Yakin ingin menyimpan?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    const cleanEmail = userEmail.trim().toLowerCase();

    try {
      localStorage.setItem(`test_answers_${cleanEmail}`, JSON.stringify(answers));
      localStorage.setItem(`test_completed_${cleanEmail}`, 'true');
      setIsSaved(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err) {
      alert('Gagal menyimpan jawaban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = MAIN_QUESTIONS[currentIndex];
  const currentAnswer = answers[currentQ.id] || '';
  const progressPercent = Math.round(((currentIndex + 1) / MAIN_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">Psikotes Batch 1</h1>
              <p className="text-[10px] text-slate-400 font-mono">Evaluasi Utama (20 Soal)</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Soal {currentIndex + 1} / {MAIN_QUESTIONS.length}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Progress Pengerjaan</span>
            <span>{Object.keys(answers).length} / {MAIN_QUESTIONS.length} Terjawab ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className="space-y-5 pt-1">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20 w-fit flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> SOAL NOMOR {currentIndex + 1}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{currentQ.text}</h2>
          </div>

          <div className="space-y-3">
            {LIKERT_OPTIONS.map((opt) => {
              const isSelected = currentAnswer === opt.text;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.text)}
                  className={`w-full p-4 rounded-2xl text-left text-xs font-medium transition border flex items-center gap-3 cursor-pointer ${
                    isSelected ? 'bg-blue-600/15 border-blue-500 text-white shadow-md' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}>
                    {opt.label}
                  </span>
                  <span className="leading-relaxed font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800 gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < MAIN_QUESTIONS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isSaved}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Selesai & Simpan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}