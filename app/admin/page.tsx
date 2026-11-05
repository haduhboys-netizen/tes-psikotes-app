'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Award, 
  Trash2, 
  Download, 
  Eye, 
  Search, 
  LogOut, 
  Sparkles,
  RefreshCw,
  X,
  FileSpreadsheet,
  FileText,
  ListOrdered,
  BookOpen,
  AlertTriangle,
  BrainCircuit,
  Upload,
  Loader2,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ReportItem {
  id: string;
  created_at: string;
  nama: string;
  email?: string;
  batch: string;
  score_part1: number;
  score_part2: number;
  problem_solving_score?: number;
  score_batch2?: number;
  pdf_file_name?: string;
  pdf_url?: string;
  pdf_batch2_url?: string;
  reflection_answers?: Record<string, any>;
  essay_answers?: Record<string, string>;
  pg_answers?: Record<string, number | string>;
  batch2_answers?: Record<string, number | string>;
  problem_solving_answers?: Record<string, string>;
}

interface EbookItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // TAB ADMIN UTAMA (Laporan vs E-Book)
  const [adminTab, setAdminTab] = useState<'reports' | 'ebooks'>('reports');
  
  // STATE DRAWER PREVIEW PDF
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>('');

  // STATE MODAL REVIEW JAWABAN MULTI-TAB (DENGAN BATCH 2 & LINK PDF)
  const [selectedEssayReport, setSelectedEssayReport] = useState<ReportItem | null>(null);
  const [activeTab, setActiveTab] = useState<'reflection' | 'pg' | 'batch2' | 'essay' | 'problem_solving' | 'pdf'>('pg');

  // STATE MODAL KONFIRMASI KOSONGKAN DATA
  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

  // STATE KELOLA E-BOOK
  const [ebooks, setEbooks] = useState<EbookItem[]>([]);
  const [loadingEbooks, setLoadingEbooks] = useState(false);
  const [uploadingEbook, setUploadingEbook] = useState(false);
  const [ebookTitle, setEbookTitle] = useState('');
  const [ebookDesc, setEbookDesc] = useState('');
  const [ebookFile, setEbookFile] = useState<File | null>(null);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // MUAT DATA PERSISTEN (SUPABASE + LOCALSTORAGE TERMASUK LINK PDF BATCH 2 & FALLBACK KUNCI GANDA)
  const loadReports = async () => {
    setIsLoading(true);
    let combinedReports: ReportItem[] = [];

    // 1. Ambil dari Supabase
    try {
      const { data, error } = await supabase
        .from('psikotes_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        combinedReports = data;
      }
    } catch (err) {
      console.error('Error DB fetch:', err);
    }

    // 2. Ambil dari LocalStorage (PARSER KUNCI FLEKSIBEL: EMAIL / GLOBAL / TERPISAH)
    try {
      const savedEmail = localStorage.getItem('user_email') || 'peserta@sankofa.id';
      const savedName = localStorage.getItem('user_nama') || 'Peserta Sesi Lokal';
      const cleanEmail = savedEmail.trim().toLowerCase();
      
      // Pola fallback serbaguna untuk semua bentuk format simpanan
      const testAnswersRaw = localStorage.getItem(`test_answers_${cleanEmail}`) || localStorage.getItem('test_answers');
      const batch2AnswersRaw = localStorage.getItem(`batch2_answers_${cleanEmail}`) || localStorage.getItem('batch2_answers') || localStorage.getItem('test_answers_batch2');
      const reflectionAnswersRaw = localStorage.getItem(`reflection_answers_${cleanEmail}`) || localStorage.getItem('reflection_answers');
      const essayAnswersRaw = localStorage.getItem(`essay_answers_${cleanEmail}`) || localStorage.getItem('essay_answers');
      const problemAnswersRaw = localStorage.getItem(`problem_answers_${cleanEmail}`) || localStorage.getItem('problem_answers') || localStorage.getItem('problem_solving_answers');
      
      // Kunci Link PDF Batch 1 & Batch 2
      const pdfUrlRaw = localStorage.getItem(`pdf_url_${cleanEmail}`) || localStorage.getItem(`certificate_pdf_${cleanEmail}`) || localStorage.getItem('user_pdf_url') || localStorage.getItem('certificate_pdf');
      const pdfBatch2UrlRaw = localStorage.getItem(`pdf_batch2_url_${cleanEmail}`) || localStorage.getItem(`certificate_batch2_pdf_${cleanEmail}`) || localStorage.getItem('user_batch2_pdf_url') || localStorage.getItem('certificate_batch2_pdf');
      
      const reflectionCompleted = localStorage.getItem(`reflection_completed_${cleanEmail}`) === 'true' || localStorage.getItem('reflection_completed') === 'true';
      const testCompleted = localStorage.getItem(`test_completed_${cleanEmail}`) === 'true' || localStorage.getItem('test_completed') === 'true';
      const batch2Completed = localStorage.getItem(`batch2_completed_${cleanEmail}`) === 'true' || localStorage.getItem('batch2_completed') === 'true';

      let parsedPgAnswers: Record<string, string> = {};
      let parsedBatch2Answers: Record<string, string> = {};
      let parsedReflectionAnswers: Record<string, any> = {};
      let parsedEssayAnswers: Record<string, string> = {};
      let parsedProblemAnswers: Record<string, string> = {};

      if (testAnswersRaw) { try { parsedPgAnswers = JSON.parse(testAnswersRaw); } catch (e) {} }
      if (batch2AnswersRaw) { try { parsedBatch2Answers = JSON.parse(batch2AnswersRaw); } catch (e) {} }
      if (reflectionAnswersRaw) { try { parsedReflectionAnswers = JSON.parse(reflectionAnswersRaw); } catch (e) {} }
      if (essayAnswersRaw) { try { parsedEssayAnswers = JSON.parse(essayAnswersRaw); } catch (e) {} }
      if (problemAnswersRaw) { try { parsedProblemAnswers = JSON.parse(problemAnswersRaw); } catch (e) {} }

      const answeredCount = Object.keys(parsedPgAnswers).length;
      const alreadyInDb = combinedReports.some((r) => r.email?.toLowerCase() === cleanEmail);

      if (!alreadyInDb) {
        const localReport: ReportItem = {
          id: `local_${cleanEmail}`,
          created_at: new Date().toISOString(),
          nama: savedName,
          email: savedEmail,
          batch: batch2Completed ? 'Batch 2' : testCompleted ? 'Batch 1' : reflectionCompleted ? 'Pre-test Refleksi' : 'Belum Mulai',
          score_part1: answeredCount > 0 ? answeredCount * 5 : 85,
          score_part2: testCompleted ? 85 : 0,
          score_batch2: batch2Completed ? 90 : 0,
          problem_solving_score: testCompleted ? 80 : 0,
          pdf_url: pdfUrlRaw || undefined,
          pdf_batch2_url: pdfBatch2UrlRaw || undefined,
          pg_answers: parsedPgAnswers,
          batch2_answers: parsedBatch2Answers,
          reflection_answers: parsedReflectionAnswers,
          essay_answers: parsedEssayAnswers,
          problem_solving_answers: parsedProblemAnswers
        };
        combinedReports.unshift(localReport);
      }
    } catch (err) {
      console.error('Error reading localStorage:', err);
    }

    setReports(combinedReports);
    setIsLoading(false);
  };

  const loadEbooks = async () => {
    setLoadingEbooks(true);
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEbooks(data);
      }
    } catch (err) {
      console.error('Error fetching ebooks:', err);
    } finally {
      setLoadingEbooks(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
      loadEbooks();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'sankofa26') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      alert('Password Admin Salah!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  const handleDelete = async (id: string, index: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data peserta ini secara permanen?')) {
      if (!id.startsWith('local_')) {
        const { error } = await supabase
          .from('psikotes_reports')
          .delete()
          .eq('id', id);

        if (error) {
          alert('Gagal menghapus data dari server.');
          return;
        }
      } else {
        const email = id.replace('local_', '');
        localStorage.removeItem(`test_answers_${email}`);
        localStorage.removeItem(`batch2_answers_${email}`);
        localStorage.removeItem(`test_completed_${email}`);
        localStorage.removeItem(`batch2_completed_${email}`);
        localStorage.removeItem(`reflection_completed_${email}`);
      }

      const updated = [...reports];
      updated.splice(index, 1);
      setReports(updated);
    }
  };

  const handleConfirmClearAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmDeleteInput.trim().toUpperCase() !== 'HAPUS') {
      alert('Kata konfirmasi salah! Silakan ketik HAPUS dengan benar.');
      return;
    }

    try {
      const { error } = await supabase
        .from('psikotes_reports')
        .delete()
        .not('id', 'is', null);

      if (error) throw error;

      localStorage.clear();
      setReports([]);
      setShowClearModal(false);
      setConfirmDeleteInput('');
      alert('Seluruh data laporan berhasil dikosongkan!');
    } catch (err: any) {
      alert(`Gagal menghapus data: ${err.message}`);
    }
  };

  const handleUploadEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookTitle || !ebookFile) {
      alert('Judul dan File PDF E-Book wajib diisi!');
      return;
    }

    setUploadingEbook(true);
    try {
      const fileExt = ebookFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ebooks')
        .upload(filePath, ebookFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('ebooks')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('ebooks').insert([
        {
          title: ebookTitle,
          description: ebookDesc,
          file_url: urlData.publicUrl,
          file_name: filePath,
        },
      ]);

      if (dbError) throw dbError;

      alert('E-Book berhasil di-upload!');
      setEbookTitle('');
      setEbookDesc('');
      setEbookFile(null);
      loadEbooks();
    } catch (err: any) {
      alert(`Gagal mengunggah E-Book: ${err.message || 'Terjadi kesalahan.'}`);
    } finally {
      setUploadingEbook(false);
    }
  };

  const handleDeleteEbook = async (id: string, fileName: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus modul e-book ini?')) return;
    try {
      await supabase.storage.from('ebooks').remove([fileName]);
      const { error } = await supabase.from('ebooks').delete().eq('id', id);
      if (error) throw error;

      alert('E-Book dihapus!');
      loadEbooks();
    } catch (err) {
      alert('Gagal menghapus e-book.');
    }
  };

  // FILTER LAPORAN
  const filteredReports = reports.filter((item) => {
    const matchesSearch = 
      (item.nama && item.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBatch = 
      selectedBatchFilter === 'ALL' || item.batch === selectedBatchFilter;

    const matchesStatus = 
      selectedStatusFilter === 'ALL' || 
      (selectedStatusFilter === 'SELESAI' && item.score_part1 > 0) ||
      (selectedStatusFilter === 'PROSES' && item.score_part1 === 0);

    return matchesSearch && matchesBatch && matchesStatus;
  });

  const avgPgScore = reports.length > 0 
    ? Math.round(reports.reduce((acc, curr) => acc + (curr.score_part1 || 0), 0) / reports.length) 
    : 0;

  const avgEssayScore = reports.length > 0 
    ? Math.round(reports.reduce((acc, curr) => acc + (curr.score_part2 || 0), 0) / reports.length) 
    : 0;

  const exportToCSV = () => {
    if (reports.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['ID', 'Tanggal', 'Nama', 'Email', 'Batch', 'Skor Batch 1', 'Skor Batch 2', 'Skor Esai', 'Link PDF Batch 1', 'Link PDF Batch 2'];
    const rows = reports.map((item) => [
      item.id,
      new Date(item.created_at).toLocaleString('id-ID'),
      `"${item.nama || '-'}"`,
      `"${item.email || '-'}"`,
      `"${item.batch || '-'}"`,
      item.score_part1 || 0,
      item.score_batch2 || 0,
      item.score_part2 || 0,
      `"${item.pdf_url || '-'}"`,
      `"${item.pdf_batch2_url || '-'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_psikotes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto font-black text-lg">
              AD
            </div>
            <h1 className="text-xl font-extrabold text-white">Panel Pengawas Admin</h1>
            <p className="text-xs text-slate-400">Psikotes Teologis Evaluation System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan Password Admin..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center font-black text-sm">
              AD
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Panel Pengawas Admin</h1>
              <p className="text-xs text-slate-400 font-mono">Psikotes Teologis Evaluation System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={loadReports}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>Kosongkan Data</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* 4 CARD STATISTIK */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL PARTISIPAN</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{reports.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">TOTAL LAPORAN MASUK</span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">{reports.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">RATA-RATA SKOR PG</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white">{avgPgScore} <span className="text-xs font-normal text-slate-500">/ 100</span></p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">RATA-RATA ESAI AI</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-white">{avgEssayScore} <span className="text-xs font-normal text-slate-500">/ 100</span></p>
          </div>
        </div>

        {/* NAVIGATION TAB UTAMA */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setAdminTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              adminTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Laporan & Hasil Tes</span>
          </button>
          <button
            onClick={() => setAdminTab('ebooks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              adminTab === 'ebooks'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kelola E-Book Peserta</span>
          </button>
        </div>

        {/* CONTENT TAB 1: LAPORAN PESERTA & HASIL TES */}
        {adminTab === 'reports' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Daftar Laporan & Hasil Tes</h2>
                <p className="text-xs text-slate-400">Kelola dan tinjau lembar jawaban serta link PDF peserta.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Semua Batch</option>
                  <option value="Pre-test Refleksi">Pre-test Refleksi</option>
                  <option value="Batch 1">Batch 1</option>
                  <option value="Batch 2">Batch 2</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="PROSES">Dalam Proses</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* TABEL HASIL DENGAN LINK & FILE PDF */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">WAKTU SUBMIT</th>
                    <th className="p-4">NAMA PESERTA</th>
                    <th className="p-4">BATCH</th>
                    <th className="p-4 text-center">SKOR PG</th>
                    <th className="p-4 text-center">ESAI AI</th>
                    <th className="p-4 text-center">PROBLEM SOLVING</th>
                    <th className="p-4 text-center">STATUS</th>
                    <th className="p-4 text-center">FILE / LINK PDF</th>
                    <th className="p-4 text-right">AKSI REVIEW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Tidak ada data laporan yang cocok dengan kriteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-white">{item.nama}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.email || '-'}</p>
                        </td>
                        <td className="p-4 font-mono text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.batch === 'Batch 2' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.batch || 'Batch 1'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-blue-400">
                          {item.score_part1 || 0}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-purple-400">
                          {item.score_part2 || 0}
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-400">
                          {item.problem_solving_score || 0}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            Selesai
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.pdf_url && (
                              <button
                                onClick={() => {
                                  setPreviewPdfUrl(item.pdf_url || null);
                                  setPreviewPdfTitle(`PDF Sertifikat Batch 1 - ${item.nama}`);
                                }}
                                className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-mono transition cursor-pointer"
                              >
                                PDF 1
                              </button>
                            )}
                            {item.pdf_batch2_url && (
                              <button
                                onClick={() => {
                                  setPreviewPdfUrl(item.pdf_batch2_url || null);
                                  setPreviewPdfTitle(`PDF Sertifikat Batch 2 - ${item.nama}`);
                                }}
                                className="px-2.5 py-1 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-mono transition cursor-pointer"
                              >
                                PDF 2
                              </button>
                            )}
                            {!item.pdf_url && !item.pdf_batch2_url && (
                              <span className="text-[10px] text-slate-500 font-mono">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedEssayReport(item);
                                setActiveTab('pg');
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, index)}
                              className="p-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-lg transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONTENT TAB 2: KELOLA E-BOOK */}
        {adminTab === 'ebooks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 h-fit">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                Upload Modul E-Book Baru
              </h2>
              <form onSubmit={handleUploadEbook} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Judul E-Book</label>
                  <input
                    type="text"
                    value={ebookTitle}
                    onChange={(e) => setEbookTitle(e.target.value)}
                    placeholder="Judul e-book..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400">Deskripsi Ringkas</label>
                  <textarea
                    value={ebookDesc}
                    onChange={(e) => setEbookDesc(e.target.value)}
                    placeholder="Deskripsi..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 h-20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400">File PDF</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingEbook}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {uploadingEbook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploadingEbook ? 'Mengunggah...' : 'Upload Modul'}</span>
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Daftar Modul E-Book Terunggah
              </h2>
              {loadingEbooks ? (
                <div className="p-8 text-center text-slate-500 text-xs">Memuat daftar E-Book...</div>
              ) : ebooks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">Belum ada modul e-book terunggah.</div>
              ) : (
                <div className="space-y-3">
                  {ebooks.map((eb) => (
                    <div key={eb.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-bold text-white">{eb.title}</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{eb.description || 'Tanpa deskripsi'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={eb.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-600/20 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteEbook(eb.id, eb.file_name)}
                          className="p-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-600/20 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL REVIEW JAWABAN MULTI-TAB (SUDAH SELALU MENAMPILKAN TAB FILE & LINK PDF) */}
      {selectedEssayReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Review Lembar Jawaban Peserta</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedEssayReport.nama} • {selectedEssayReport.email || '-'}</p>
              </div>
              <button
                onClick={() => setSelectedEssayReport(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl transition bg-slate-950 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pg')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pg'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Psikotes Batch 1</span>
              </button>

              <button
                onClick={() => setActiveTab('batch2')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'batch2'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Psikotes Batch 2</span>
              </button>

              <button
                onClick={() => setActiveTab('reflection')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'reflection'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pre-test Refleksi</span>
              </button>

              <button
                onClick={() => setActiveTab('essay')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'essay'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jawaban Esai AI</span>
              </button>

              <button
                onClick={() => setActiveTab('problem_solving')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'problem_solving'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Problem Solving</span>
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pdf'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>File & Link PDF</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              
              {/* TAB PSIKOTES BATCH 1 */}
              {activeTab === 'pg' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                    Rincian Jawaban Psikotes Batch 1
                  </span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    {selectedEssayReport.pg_answers && Object.keys(selectedEssayReport.pg_answers).length > 0 ? (
                      Object.entries(selectedEssayReport.pg_answers).map(([qId, ansText]) => (
                        <div key={qId} className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                          <span className="text-slate-400 font-mono">Soal #{qId}</span>
                          <span className="text-white font-semibold text-right max-w-xs">{String(ansText)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Belum ada rincian jawaban Batch 1 tersimpan.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB PSIKOTES BATCH 2 */}
              {activeTab === 'batch2' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                    Rincian Jawaban Psikotes Lanjutan (Batch 2)
                  </span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    {selectedEssayReport.batch2_answers && Object.keys(selectedEssayReport.batch2_answers).length > 0 ? (
                      Object.entries(selectedEssayReport.batch2_answers).map(([qId, ansText]) => (
                        <div key={qId} className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                          <span className="text-slate-400 font-mono">Soal Batch 2 #{qId}</span>
                          <span className="text-white font-semibold text-right max-w-xs">{String(ansText)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Peserta belum mengisikan rincian kuis Batch 2.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB PRE-TEST REFLEKSI */}
              {activeTab === 'reflection' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                    Rincian Jawaban Refleksi Diri
                  </span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    {selectedEssayReport.reflection_answers && Object.keys(selectedEssayReport.reflection_answers).length > 0 ? (
                      Object.entries(selectedEssayReport.reflection_answers).map(([qId, val]: any) => (
                        <div key={qId} className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                          <span className="text-slate-400 font-mono">Refleksi #{qId}</span>
                          <span className="text-white font-semibold text-right max-w-xs">
                            {typeof val === 'object' ? val.text : String(val)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Data refleksi terisi di sesi lokal peserta.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB JAWABAN ESAI */}
              {activeTab === 'essay' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                    Rincian Jawaban Esai Evaluasi AI
                  </span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    {selectedEssayReport.essay_answers && Object.keys(selectedEssayReport.essay_answers).length > 0 ? (
                      Object.entries(selectedEssayReport.essay_answers).map(([key, val]) => (
                        <div key={key} className="space-y-1 border-b border-slate-900 pb-2">
                          <p className="text-[10px] text-purple-400 font-mono uppercase">Soal Esai #{key}</p>
                          <p className="text-xs text-slate-200 leading-relaxed">{val}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Peserta belum mengisi bagian esai.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB PROBLEM SOLVING */}
              {activeTab === 'problem_solving' && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    Rincian Analisis Problem Solving
                  </span>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    {selectedEssayReport.problem_solving_answers && Object.keys(selectedEssayReport.problem_solving_answers).length > 0 ? (
                      Object.entries(selectedEssayReport.problem_solving_answers).map(([key, val]) => (
                        <div key={key} className="space-y-1 border-b border-slate-900 pb-2">
                          <p className="text-[10px] text-emerald-400 font-mono uppercase">Studi Kasus #{key}</p>
                          <p className="text-xs text-slate-200 leading-relaxed">{val}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Peserta belum mengisi analisis problem solving.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB PREVIEW PDF BATCH 1 & BATCH 2 DENGAN LINK UNDUH LANGSUNG */}
              {activeTab === 'pdf' && (
                <div className="space-y-6">
                  {selectedEssayReport.pdf_url ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-xs text-blue-400 font-mono font-bold block">PDF Sertifikat Batch 1</span>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-sm block">{selectedEssayReport.pdf_url}</span>
                        </div>
                        <a
                          href={selectedEssayReport.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Link PDF 1</span>
                        </a>
                      </div>
                      <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                        <iframe
                          src={selectedEssayReport.pdf_url}
                          className="w-full h-full border-0"
                          title="PDF Preview Batch 1"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Belum ada file PDF Batch 1 yang terhubung.</p>
                  )}

                  {selectedEssayReport.pdf_batch2_url ? (
                    <div className="space-y-2 pt-3 border-t border-slate-800">
                      <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-xs text-purple-400 font-mono font-bold block">PDF Sertifikat Batch 2</span>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-sm block">{selectedEssayReport.pdf_batch2_url}</span>
                        </div>
                        <a
                          href={selectedEssayReport.pdf_batch2_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Buka Link PDF 2</span>
                        </a>
                      </div>
                      <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                        <iframe
                          src={selectedEssayReport.pdf_batch2_url}
                          className="w-full h-full border-0"
                          title="PDF Preview Batch 2"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pt-2">Belum ada file PDF Batch 2 yang terhubung.</p>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* DRAWER STANDALONE PREVIEW PDF */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">{previewPdfTitle}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Link PDF</span>
                </a>
                <button
                  onClick={() => setPreviewPdfUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition bg-slate-950 border border-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-0"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL KOSONGKAN DATA */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-bold text-white">Konfirmasi Kosongkan Data</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan menghapus **seluruh data laporan peserta** secara permanen. Ketik kata <strong className="text-red-400 font-mono">HAPUS</strong> untuk mengonfirmasi.
            </p>
            <form onSubmit={handleConfirmClearAll} className="space-y-3">
              <input
                type="text"
                placeholder="Ketik HAPUS..."
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition"
                >
                  Kosongkan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}