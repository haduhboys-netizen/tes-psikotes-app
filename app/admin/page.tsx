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
  Info,
  ChevronRight
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

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  
  // STATE DRAWER PREVIEW PDF (DARI KANAN)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>('');

  // STATE MODAL REVIEW JAWABAN
  const [selectedEssayReport, setSelectedEssayReport] = useState<ReportItem | null>(null);
  const [activeTab, setActiveTab] = useState<'pg' | 'essay' | 'problem_solving'>('pg');

  // STATE MODAL KONFIRMASI BAHAYA KOSONGKAN DATA
  const [showClearModal, setShowClearModal] = useState(false);
  const [confirmDeleteInput, setConfirmDeleteInput] = useState('');

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
        alert('Gagal mengambil data dari server.');
      } else {
        setReports(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadReports();
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
        console.error(error);
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
      alert('Seluruh data laporan berhasil dikosongkan secara permanen!');
    } catch (err: any) {
      alert(`Gagal menghapus data: ${err.message}`);
    }
  };

  // FILTERING LOGIC
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

  // HITUNG PESERTA UNIK DENGAN SET BERSARKAN NAMA
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
              PT
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate-400">Silakan masukkan password admin untuk masuk.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password Admin</label>
            <input
              type="password"
              placeholder="Masukkan password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            Masuk Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER NAVBAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl flex items-center justify-center font-black">
              AD
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Panel Pengawas Admin</h1>
              <p className="text-xs text-slate-400 font-mono">Psikotes Teologis Evaluation System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadReports}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Data</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* METRIK SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Partisipan</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{uniqueParticipants}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Laporan Masuk</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">{reports.length}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rata-Rata Skor PG</span>
              <Award className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-blue-400">{avgPgScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Rata-Rata Esai AI</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-purple-400">{avgEssayScore} <span className="text-xs text-slate-500 font-normal">/ 100</span></p>
          </div>
        </div>

        {/* TABEL REKAPITULASI PESERTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h2 className="text-lg font-extrabold text-white">Daftar Laporan & Hasil Tes</h2>
              <p className="text-xs text-slate-400">Kelola dan tinjau lembar jawaban peserta yang masuk.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* SEARCH BAR */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* FILTER BATCH */}
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="ALL">Semua Batch</option>
                <option value="Batch 1">Batch 1</option>
                <option value="Batch 2">Batch 2</option>
              </select>

              {/* FILTER STATUS */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="ALL">Semua Status</option>
                <option value="LULUS">Lulus / Aman</option>
                <option value="REMEDIAL">Remedial Esai (&lt; 60)</option>
              </select>

              {/* EXPORT CSV */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Waktu Submit</th>
                  <th className="py-3 px-4">Nama Peserta</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Skor PG</th>
                  <th className="py-3 px-4">Esai AI</th>
                  <th className="py-3 px-4">Problem Solving</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">File PDF</th>
                  <th className="py-3 px-4 text-center">Aksi Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">
                      Memuat data laporan peserta...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">
                      Belum ada data laporan yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((item, idx) => {
                    const isBatch2 = item.batch?.includes('Batch 2');
                    const isRemedial = !isBatch2 && item.score_part2 < 60;

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-850/50 transition">
                        <td className="py-4 px-4 font-mono text-slate-400">
                          {new Date(item.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-4 px-4 font-bold text-white">
                          <div>{item.nama || 'Tanpa Nama'}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{item.email}</div>
                        </td>
                        {/* BATCH */}
                        <td className="py-4 px-4 align-top pt-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-block max-w-[160px] truncate leading-tight ${
                            isBatch2
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`} title={item.batch}>
                            {item.batch || 'Batch 1 - Teologi'}
                          </span>
                        </td>
                        {/* SKOR PG */}
                        <td className="py-4 px-4 font-bold text-blue-400 align-top pt-5">
                          {isBatch2 ? '-' : `${item.score_part1 ?? 0} / 100`}
                        </td>
                        {/* ESAI AI */}
                        <td className="py-4 px-4 font-bold text-emerald-400 align-top pt-5">
                          {isBatch2 ? '-' : `${item.score_part2 ?? 0} / 100`}
                        </td>
                        {/* PROBLEM SOLVING */}
                        <td className="py-4 px-4 font-bold text-amber-400 align-top pt-5">
                          {isBatch2 ? '-' : `${item.problem_solving_score ?? 0} / 100`}
                        </td>
                        <td className="py-4 px-4 align-top pt-5">
                          {isBatch2 ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Batch 2
                            </span>
                          ) : isRemedial ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" /> Remedial Esai
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" /> Lulus
                            </span>
                          )}
                        </td>
                        {/* TOMBOL PDF DENGAN DRAWER PREVIEW */}
                        <td className="py-4 px-4 align-top pt-5">
                          {item.pdf_url ? (
                            <button
                              onClick={() => {
                                setPreviewPdfUrl(item.pdf_url || null);
                                setPreviewPdfTitle(item.nama || 'Laporan PDF');
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl transition font-semibold cursor-pointer group shadow-sm"
                              title="Buka Drawer Pratinjau PDF"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                              <span className="truncate max-w-[90px]">{item.pdf_file_name || 'Buka PDF'}</span>
                              <ChevronRight className="w-3 h-3 text-blue-400/70 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ) : (
                            <span className="text-slate-600 italic text-[11px]">Tidak ada PDF</span>
                          )}
                        </td>
                        {/* AKSI REVIEW (DIHAPUS TOMBOL REVIEW KHUSUS BATCH 2) */}
                        <td className="py-4 px-4 text-center align-top pt-5">
                          <div className="flex items-center justify-center gap-2">
                            {!isBatch2 && (
                              <button
                                onClick={() => {
                                  setSelectedEssayReport(item);
                                  setActiveTab('pg');
                                }}
                                className="p-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-xl transition flex items-center gap-1 font-bold text-[11px]"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Review</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(item.id, idx)}
                              className="p-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-xl transition"
                              title="Hapus Laporan"
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

      </div>

      {/* DRAWER PDF PREVIEW (SLIDE DARI KANAN) */}
      {previewPdfUrl && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex justify-end transition-opacity animate-in fade-in duration-200">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* DRAWER HEADER */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Drawer Pratinjau Dokumen PDF</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Peserta: <span className="text-blue-400 font-bold">{previewPdfTitle}</span></p>
                </div>
              </div>
              <button
                onClick={() => setPreviewPdfUrl(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                title="Tutup Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* DRAWER BODY / IFRAME */}
            <div className="flex-1 bg-slate-950 p-4">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full rounded-2xl border border-slate-800 shadow-inner"
                title="PDF Drawer Preview"
              />
            </div>
            {/* DRAWER FOOTER */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 italic">Dokumen Laporan Peserta Resmi Tersimpan</span>
              <a
                href={previewPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
              >
                <span>Buka di Tab Baru</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REVIEW LEMBAR JAWABAN PESERTA (KHUSUS BATCH 1) */}
      {selectedEssayReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* HEADER MODAL */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  REVIEW LEMBAR JAWABAN
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{selectedEssayReport.nama}</h2>
              </div>
              <button
                onClick={() => setSelectedEssayReport(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY MODAL */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* RINGKASAN SKOR 3 KARTU */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NILAI PILIHAN GANDA</p>
                  <p className="text-2xl font-black text-blue-400 mt-1">
                    {selectedEssayReport.score_part1 ?? 0} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RATA-RATA ESAI AI</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {selectedEssayReport.score_part2 ?? 0} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROBLEM SOLVING</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">
                    {selectedEssayReport.problem_solving_score ?? 0} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </p>
                </div>
              </div>

              {/* NAVIGASI 3 TAB REVIEW */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('pg')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'pg'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Pilihan Ganda (PG)</span>
                </button>

                <button
                  onClick={() => setActiveTab('essay')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'essay'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Jawaban Esai</span>
                </button>

                <button
                  onClick={() => setActiveTab('problem_solving')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'problem_solving'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Problem Solving</span>
                </button>
              </div>

              {/* TAB 1: PILIHAN GANDA */}
              {activeTab === 'pg' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    RINCIAN JAWABAN PILIHAN GANDA
                  </h3>
                  {pgQuestions.map((q, qIdx) => {
                    const selectedOptIdx = selectedEssayReport.pg_answers?.[q.id];
                    let chosenText = 'Peserta belum menjawab.';

                    if (selectedOptIdx !== undefined && q.options[selectedOptIdx]) {
                      const opt = q.options[selectedOptIdx];
                      chosenText = typeof opt === 'object' ? opt.text : opt;
                    }

                    return (
                      <div key={q.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-xs font-bold text-slate-200">
                          {qIdx + 1}. {q.question}
                        </p>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                          <span className="text-xs text-blue-300 font-semibold">
                            Jawaban Peserta: <span className="text-slate-200">{chosenText}</span>
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: ESAI */}
              {activeTab === 'essay' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    RINCIAN JAWABAN ESAI TEOLOGIS
                  </h3>
                  {selectedEssayReport.essay_answers && Object.keys(selectedEssayReport.essay_answers).length > 0 ? (
                    Object.entries(selectedEssayReport.essay_answers).map(([key, val], idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                        <p className="text-xs font-bold text-slate-200">Esai Pertanyaan #{idx + 1}</p>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <p className="text-xs text-slate-300 leading-relaxed italic">"{val}"</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-4 text-center">Tidak ada data jawaban esai.</p>
                  )}
                </div>
              )}

              {/* TAB 3: PROBLEM SOLVING */}
              {activeTab === 'problem_solving' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    RINCIAN JAWABAN PROBLEM SOLVING & STUDI KASUS
                  </h3>

                  {problemSolvingQuestions.map((q, idx) => {
                    const answerText = selectedEssayReport.problem_solving_answers?.[q.id] || 'Peserta belum mengisi jawaban ini.';
                    return (
                      <div key={q.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                            {q.scenario}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                          <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{answerText}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KOSONGKAN DATA */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmClearAll} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-extrabold text-white">Konfirmasi Kosongkan Data</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tindakan ini akan menghapus <strong className="text-white">seluruh data laporan</strong> peserta di database secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Ketik <span className="text-rose-400 font-black">HAPUS</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                placeholder="Ketik HAPUS..."
                value={confirmDeleteInput}
                onChange={(e) => setConfirmDeleteInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 transition font-mono uppercase"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowClearModal(false);
                  setConfirmDeleteInput('');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/20"
              >
                Kosongkan Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}