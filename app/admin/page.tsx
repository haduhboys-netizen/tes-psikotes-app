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
  CheckCircle2,
  ListOrdered,
  BookOpen,
  AlertTriangle,
  BrainCircuit,
  Upload,
  Loader2,
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { questions as pgQuestions } from '@/data/questions';
import { problemSolvingQuestions } from '@/data/problemSolvingQuestions';

interface ReportItem {
  id: string;
  created_at: string;
  nama: string;
  email?: string;
  batch: string;
  score_part1: number;
  score_part2: number;
  problem_solving_score?: number;
  pdf_file_name?: string;
  pdf_url?: string;
  essay_answers?: Record<string, string>;
  pg_answers?: Record<string, number>;
  problem_solving_answers?: { [key: number]: string };
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
  
  // STATE DRAWER PREVIEW PDF (DARI KANAN)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>('');

  // STATE MODAL REVIEW JAWABAN
  const [selectedEssayReport, setSelectedEssayReport] = useState<ReportItem | null>(null);
  const [activeTab, setActiveTab] = useState<'pg' | 'essay' | 'problem_solving'>('pg');

  // STATE MODAL KONFIRMASI BAHAYA KOSONGKAN DATA
  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

  // STATE KHUSUS KELOLA MODUL E-BOOK
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

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('psikotes_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setReports(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
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
      console.error('Unexpected error ebooks:', err);
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
      const { error } = await supabase
        .from('psikotes_reports')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Gagal menghapus data dari server.');
        return;
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

  const filteredReports = reports.filter((item) => {
    const matchesSearch = 
      (item.nama && item.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBatch = 
      selectedBatchFilter === 'ALL' || (item.batch && item.batch.includes(selectedBatchFilter));

    const isBatch2 = item.batch?.includes('Batch 2');
    const isRemedial = !isBatch2 && item.score_part2 < 60;

    let matchesStatus = true;
    if (selectedStatusFilter === 'LULUS') {
      matchesStatus = isBatch2 || !isRemedial;
    } else if (selectedStatusFilter === 'REMEDIAL') {
      matchesStatus = !isBatch2 && isRemedial;
    }

    return matchesSearch && matchesBatch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredReports.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['Tanggal', 'Nama', 'Email', 'Batch', 'Skor PG', 'Skor Esai', 'Problem Solving', 'URL PDF'];
    const rows = filteredReports.map(item => [
      new Date(item.created_at).toLocaleDateString('id-ID'),
      `"${item.nama || ''}"`,
      `"${item.email || ''}"`,
      `"${item.batch || ''}"`,
      item.score_part1,
      item.score_part2,
      item.problem_solving_score ?? 0,
      `"${item.pdf_url || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Psikotes_Teologis_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueParticipants = new Set(
    reports.map((r) => r.nama?.trim().toLowerCase()).filter(Boolean)
  ).size;

  const batch1Reports = reports.filter(r => !r.batch?.includes('Batch 2'));
  const totalBatch1 = batch1Reports.length;
  const avgPgScore = totalBatch1 > 0 
    ? Math.round(batch1Reports.reduce((acc, curr) => acc + (curr.score_part1 || 0), 0) / totalBatch1) 
    : 0;
  const avgEssayScore = totalBatch1 > 0 
    ? Math.round(batch1Reports.reduce((acc, curr) => acc + (curr.score_part2 || 0), 0) / totalBatch1) 
    : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-blue-500 selection:text-white">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold mx-auto text-xl shadow-lg shadow-blue-600/30">
              AD
            </div>
            <h1 className="text-xl font-bold text-white">Panel Pengawas Admin</h1>
            <p className="text-xs text-slate-400">Psikotes Teologis Evaluation System</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Password Pengawas</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Masukkan password admin..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            Masuk ke Panel Pengawas
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER NAVBAR ADMIN */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center font-black">
              AD
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Panel Pengawas Admin</h1>
              <p className="text-xs text-slate-400 font-mono">Psikotes Teologis Evaluation System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                loadReports();
                loadEbooks();
              }}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Data</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* 4 CARD STATISTIK RINGKASAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Partisipan</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{uniqueParticipants}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Laporan Masuk</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-white">{reports.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Rata-rata Skor PG</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-white">{avgPgScore}</p>
              <span className="text-xs text-slate-500 font-bold">/ 100</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Rata-rata Esai AI</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-white">{avgEssayScore}</p>
              <span className="text-xs text-slate-500 font-bold">/ 100</span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION RINGKAS (LAPORAN PESERTA VS KELOLA E-BOOK) */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 border border-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setAdminTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              adminTab === 'reports'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-950'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Laporan & Hasil Tes</span>
          </button>

          <button
            onClick={() => setAdminTab('ebooks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              adminTab === 'ebooks'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-950'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kelola E-Book Peserta</span>
            {ebooks.length > 0 && (
              <span className="bg-slate-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-slate-800">
                {ebooks.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: LAPORAN & HASIL TES PESERTA */}
        {adminTab === 'reports' && (
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Daftar Laporan & Hasil Tes</h2>
                <p className="text-xs text-slate-400">Kelola dan tinjau lembar jawaban peserta yang masuk.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">Semua Batch</option>
                  <option value="Batch 1">Batch 1</option>
                  <option value="Batch 2">Batch 2</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="LULUS">Lulus</option>
                  <option value="REMEDIAL">Remedial</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 rounded-l-xl">Waktu Submit</th>
                    <th className="p-4">Nama Peserta</th>
                    <th className="p-4">Batch</th>
                    <th className="p-4">Skor PG</th>
                    <th className="p-4">Esai AI</th>
                    <th className="p-4">Problem Solving</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">File PDF</th>
                    <th className="p-4 text-center rounded-r-xl">Aksi Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Memuat data laporan dari database...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Tidak ada data laporan yang cocok dengan kriteria.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((item, idx) => {
                      const isBatch2 = item.batch?.includes('Batch 2');
                      const isRemedial = !isBatch2 && item.score_part2 < 60;

                      return (
                        <tr key={item.id} className="hover:bg-slate-950/50 transition">
                          <td className="p-4 font-mono text-[11px] text-slate-400">
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4 font-bold text-white">
                            <div>{item.nama}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.email || '-'}</div>
                          </td>
                          <td className="p-4 font-bold">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] border ${
                              isBatch2 
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {isBatch2 ? 'Batch 2' : 'Batch 1'}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-blue-400">
                            {isBatch2 ? '-' : `${item.score_part1} / 100`}
                          </td>
                          <td className="p-4 font-mono font-bold text-emerald-400">
                            {isBatch2 ? '-' : `${item.score_part2} / 100`}
                          </td>
                          <td className="p-4 font-mono font-bold text-amber-400">
                            {isBatch2 ? '-' : `${item.problem_solving_score ?? 0} / 100`}
                          </td>
                          <td className="p-4 font-bold">
                            {isBatch2 ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Laporan Lapangan
                              </span>
                            ) : isRemedial ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
                                Remedial
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Lulus
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {item.pdf_url ? (
                              <button
                                onClick={() => {
                                  setPreviewPdfUrl(item.pdf_url || null);
                                  setPreviewPdfTitle(`Dokumen PDF - ${item.nama}`);
                                }}
                                className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-blue-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Lihat PDF</span>
                              </button>
                            ) : (
                              <span className="text-slate-600 italic text-[11px]">Tidak ada PDF</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEssayReport(item);
                                  setActiveTab('pg');
                                }}
                                className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>Review</span>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, idx)}
                                className="p-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-lg transition cursor-pointer"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: KELOLA E-BOOK PESERTA */}
        {adminTab === 'ebooks' && (
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" /> Kelola Modul E-Book Peserta
                </h2>
                <p className="text-xs text-slate-400">Upload modul e-book baru atau hapus modul secara bebas.</p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                {ebooks.length} Modul Aktif
              </span>
            </div>

            {/* FORM UPLOAD MODUL E-BOOK */}
            <form onSubmit={handleUploadEbook} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-400" /> Tambah E-Book Baru
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">Judul E-Book</label>
                  <input
                    type="text"
                    required
                    value={ebookTitle}
                    onChange={(e) => setEbookTitle(e.target.value)}
                    placeholder="Contoh: E-Book Fondasi Teologi Dasar"
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">File PDF E-Book</label>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => setEbookFile(e.target.files?.[0] || null)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={ebookDesc}
                  onChange={(e) => setEbookDesc(e.target.value)}
                  placeholder="Penjelasan ringkas mengenai materi e-book..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingEbook}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploadingEbook ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunggah File Ke Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload E-Book ke Dashboard Peserta</span>
                  </>
                )}
              </button>
            </form>

            {/* DAFTAR MODUL TER-UPLOAD */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Modul Terbit</h3>

              {loadingEbooks ? (
                <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Memuat daftar e-book...
                </div>
              ) : ebooks.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">Belum ada modul e-book yang di-upload ke peserta.</p>
              ) : (
                <div className="space-y-3">
                  {ebooks.map((eb) => (
                    <div
                      key={eb.id}
                      className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          {eb.title}
                        </p>
                        <p className="text-[11px] text-slate-400">{eb.description || 'Tidak ada deskripsi'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={eb.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-bold hover:bg-slate-800 transition flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-blue-400" /> Buka PDF
                        </a>
                        <button
                          onClick={() => handleDeleteEbook(eb.id, eb.file_name)}
                          className="px-3 py-1.5 bg-rose-600/10 border border-rose-600/30 text-rose-400 rounded-lg text-[11px] font-bold hover:bg-rose-600/20 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
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

      {/* MODAL REVIEW JAWABAN PESERTA */}
      {selectedEssayReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-md border border-blue-500/20">
                  Review Jawaban
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedEssayReport.nama}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedEssayReport.email}</p>
              </div>

              <button
                onClick={() => setSelectedEssayReport(null)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 gap-3">
              <button
                onClick={() => setActiveTab('pg')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'pg'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListOrdered className="w-4 h-4" />
                <span>Pilihan Ganda ({selectedEssayReport.score_part1}/100)</span>
              </button>

              <button
                onClick={() => setActiveTab('essay')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'essay'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Esai AI ({selectedEssayReport.score_part2}/100)</span>
              </button>

              <button
                onClick={() => setActiveTab('problem_solving')}
                className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'problem_solving'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Problem Solving ({selectedEssayReport.problem_solving_score ?? 0}/100)</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {activeTab === 'pg' && (
                <div className="space-y-4">
                  {pgQuestions.map((q, idx) => {
                    const selectedIdx = selectedEssayReport.pg_answers?.[q.id];
                    return (
                      <div key={q.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-white">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="text-xs text-slate-400">
                          Jawaban Dipilih:{' '}
                          <span className="font-bold text-blue-400">
                            {selectedIdx !== undefined
                              ? typeof q.options[selectedIdx] === 'string'
                                ? q.options[selectedIdx]
                                : (q.options[selectedIdx] as any)?.text
                              : 'Tidak Dijawab'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'essay' && (
                <div className="space-y-4">
                  {selectedEssayReport.essay_answers ? (
                    Object.entries(selectedEssayReport.essay_answers).map(([key, answer], idx) => (
                      <div key={key} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-blue-400">Soal #{idx + 1}</p>
                        <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                          {answer}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">
                      Detail jawaban esai tidak terekam dalam laporan ini.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'problem_solving' && (
                <div className="space-y-4">
                  {problemSolvingQuestions.map((q, idx) => {
                    const psAns = selectedEssayReport.problem_solving_answers?.[q.id];
                    return (
                      <div key={q.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-white">
                          Studi Kasus #{idx + 1}: {q.question}
                        </p>
                        <p className="text-xs text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                          {psAns || 'Tidak Dijawab'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DRAWER VIEW PDF */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden relative">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {previewPdfTitle}
              </h3>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-slate-950">
              <iframe src={previewPdfUrl} className="w-full h-full border-none" title="PDF Preview" />
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KOSONGKAN DATA */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl text-center relative">
            <button
              onClick={() => setShowClearModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 bg-slate-950 rounded-xl border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Kosongkan Seluruh Data?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tindakan ini akan menghapus **SELURUH HASIL UJIAN PESERTA** secara permanen dari Supabase.
              </p>
            </div>

            <form onSubmit={handleConfirmClearAll} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold text-slate-400">
                  Ketik <strong className="text-rose-400">HAPUS</strong> untuk mengonfirmasi:
                </label>
                <input
                  type="text"
                  required
                  value={confirmDeleteInput}
                  onChange={(e) => setConfirmDeleteInput(e.target.value)}
                  placeholder="Ketik HAPUS..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-500 font-mono uppercase"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="w-1/2 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  Hapus Semua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}