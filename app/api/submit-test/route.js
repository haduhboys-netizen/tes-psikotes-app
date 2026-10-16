import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama, answers } = body;

    // 1. Hitung Total Skor
    const totalSkor = Object.values(answers || {}).reduce((acc, curr) => acc + curr, 0);

    // 2. Tentukan Kategori Hasil
    let kategori = '';
    if (totalSkor >= 85) {
      kategori = 'Kematangan Teologis & Spiritual Sangat Tinggi (Sangat Baik)';
    } else if (totalSkor >= 65) {
      kategori = 'Kematangan Spiritual Stabil & Beralas Teguh (Cukup Baik)';
    } else if (totalSkor >= 45) {
      kategori = 'Kematangan Spiritual Moderat (Perlu Pendampingan Lanjutan)';
    } else {
      kategori = 'Membutuhkan Pembimbingan & Pendampingan Khusus';
    }

    // 3. Return Hasil
    return NextResponse.json({
      success: true,
      message: 'Hasil tes berhasil dihitung!',
      data: {
        nama,
        totalSkor,
        kategori,
      },
    });

  } catch (error) {
    console.error('Error Backend:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}