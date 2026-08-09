const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const idStr = `
  id: {
    nav: { features: "Fitur", howItWorks: "Cara Kerja", benefits: "Manfaat", login: "Masuk", register: "Daftar" },
    hero: {
      tag: "Kecerdasan Akademik Berbasis AI",
      title1: "Berhenti panik dikejar deadline.",
      title2: "Mulai taklukkan semuanya.",
      desc: "FLearn memadukan pemahaman dokumen, sinkronisasi kalender, dan skor prioritas ke dalam satu AI yang memberi tahu kamu tepatnya apa yang harus dipelajari, kapan memulainya, dan mengapa itu penting.",
      cta1: "Coba Gratis",
    },
    stats: [
      { value: "2.4×", label: "Efisiensi belajar", accent: "text-primary dark:text-blue-400" },
      { value: "89%", label: "Tugas selesai", accent: "text-success dark:text-green-400" },
      { value: "5.2h", label: "Hemat per minggu", accent: "text-amber-600 dark:text-amber-400" },
      { value: "12k+", label: "Mahasiswa aktif", accent: "text-sky dark:text-sky-400" },
    ],
    featuresSection: {
      sub: "Pilar Utama",
      title: "Empat keunggulan yang mengubah cara belajarmu",
      items: [
        { icon: FileText, title: "Kecerdasan Dokumen", description: "Unggah materi kuliah, bacaan, atau silabus. Dapatkan ringkasan AI seketika, flashcard, dan peta konsep.", color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60", accent: "border-l-blue-500 dark:border-l-blue-400" },
        { icon: Calendar, title: "Sinkronisasi Kalender", description: "Satu sumber kebenaran untuk ujian, deadline, dan jadwal belajar yang diatur AI — dalam satu tampilan.", color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60", accent: "border-l-amber-500 dark:border-l-amber-400" },
        { icon: BarChart3, title: "Mesin Prioritas", description: "Skor urgensi langsung di setiap tugas. Ketahui dengan pasti apa yang harus dikerjakan lebih dulu dan alasannya.", color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60", accent: "border-l-red-500 dark:border-l-red-400" },
        { icon: BookOpen, title: "Rencana Belajar", description: "Jadwal harianmu disusun oleh AI dari kalender, dokumen, dan riwayat belajarmu. Beradaptasi setiap hari.", color: "bg-green-50 text-green-600 border-green-100 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/60", accent: "border-l-green-500 dark:border-l-green-400" },
      ],
    },
    howItWorksSection: {
      sub: "Proses",
      title: "Siap dalam tiga langkah mudah",
      items: [
        { num: "01", title: "Unggah & Hubungkan", desc: "Masukkan silabus, slide kuliah, dan catatanmu. Hubungkan Google Calendar dalam satu klik.", color: "from-primary to-sky" },
        { num: "02", title: "Analisis AI", desc: "Dokumenmu diproses, konsep penting diekstrak, dan dicocokkan silang dengan daftar deadline-mu.", color: "from-sky to-green-400" },
        { num: "03", title: "Belajar Lebih Cerdas", desc: "Dapatkan daftar tugas dengan skor, rencana harian konkret, dan asisten AI yang siap menjawab segalanya.", color: "from-green-400 to-amber-400" },
      ],
    },
    benefitsSection: {
      sub: "Mengapa ini berhasil",
      title: "Dirancang khusus untuk mahasiswa yang ingin berprestasi",
      desc: "Setiap fitur dibangun berdasarkan satu pertanyaan: apa yang dibutuhkan mahasiswa agar tidak membuang waktu dan mulai fokus pada hal yang paling penting?",
      list: [
        "Ringkasan AI dan ekstraksi konsep penting dari dokumen apa pun",
        "Skor prioritas cerdas berdasarkan urgensi, tingkat kesulitan, dan bobot nilai",
        "Jadwal belajar harian personal yang beradaptasi dengan kesibukanmu",
        "Integrasi Google Calendar untuk deteksi konflik dan waktu luang",
        "Pelacakan sesi fokus disertai analitik produktivitas nyata",
        "Chat AI berbasis sumber mutlak — jawaban dijamin sesuai catatan aslimu",
      ],
      cta: "Mulai masa uji coba gratis",
      stats: [
        { icon: BarChart3, value: "2.4×", label: "Peningkatan rata-rata efisiensi belajar", color: "text-primary dark:text-blue-400", bg: "bg-card", border: "border-border" },
        { icon: CheckCircle, value: "89%", label: "Tingkat penyelesaian tugas dengan AI", color: "text-success dark:text-green-400", bg: "bg-card", border: "border-border" },
        { icon: Zap, value: "5.2j", label: "Rata-rata waktu yang dihemat per minggu", color: "text-amber-600 dark:text-amber-400", bg: "bg-card", border: "border-border" },
        { icon: Brain, value: "12k+", label: "Mahasiswa aktif menggunakan FLearn", color: "text-sky dark:text-sky-400", bg: "bg-card", border: "border-border" },
      ],
    },
    ctaSection: { sub: "Mulai sekarang juga", title: "Penasihat akademik AI kamu sudah menunggu.", desc: "Bergabunglah dengan ribuan mahasiswa yang telah meninggalkan kepanikan belajar.", cta1: "Mulai Gratis" },
    footer: { copy: "© 2025 FLearn AI", links: ["Bantuan", "Kebijakan Privasi", "Ketentuan Layanan"] },
  },
};`;

const idStartIndex = content.indexOf('  id: {');
const languagesArrIndex = content.indexOf('const languages = [');

if (idStartIndex > -1 && languagesArrIndex > -1) {
    content = content.substring(0, idStartIndex) + idStr + '\n\n' + content.substring(languagesArrIndex);
}

fs.writeFileSync('src/app/page.tsx', content);
