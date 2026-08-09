"use client";

import { useEffect } from "react";
import type { LangKey } from "./translations";

type Pair = [en: string, id: string];

const PAIRS: Pair[] = [
  // Brand subtitles / common shell
  ["Academic Advisor", "Penasihat Akademik"],
  ["Ask AI Assistant", "Tanya Asisten AI"],
  ["Switch Language", "Ganti Bahasa"],
  ["Searching...", "Mencari..."],
  ["No results found", "Tidak ada hasil"],
  ["Documents", "Dokumen"],
  ["Chat Sessions", "Sesi Chat"],
  ["Untitled Document", "Dokumen Tanpa Judul"],
  ["Unnamed Session", "Sesi Tanpa Nama"],
  ["messages", "pesan"],
  ["Just now", "Baru saja"],
  ["Notifications", "Notifikasi"],
  ["Mark all as read", "Tandai semua dibaca"],
  ["No new notifications", "Tidak ada notifikasi baru"],
  ["Log Out", "Keluar"],
  ["Sign In", "Masuk"],
  ["Settings", "Pengaturan"],
  ["Dashboard", "Dasbor"],
  ["Calendar", "Kalender"],
  ["Workflow", "Alur Belajar"],
  ["Statistics", "Statistik"],
  ["Workspace AI", "Workspace AI"],

  // Settings page
  ["Account Settings", "Pengaturan Akun"],
  ["Manage your academic profile, calendar integrations, and AI preferences", "Kelola profil akademik, integrasi kalender, dan preferensi AI"],
  ["Personal Profile", "Profil Pribadi"],
  ["Your personal details and avatar", "Detail pribadi dan avatar kamu"],
  ["Change Avatar", "Ganti Avatar"],
  ["Remove", "Hapus"],
  ["Recommended size: 256x256px. Formats: JPG, PNG.", "Ukuran disarankan: 256x256px. Format: JPG, PNG."],
  ["Full Name", "Nama Lengkap"],
  ["Email Address", "Alamat Email"],
  ["University", "Universitas"],
  ["Save Changes", "Simpan Perubahan"],
  ["Saved", "Tersimpan"],
  ["Saved!", "Tersimpan!"],
  ["Academic Profile", "Profil Akademik"],
  ["Major, study year, and active courses", "Jurusan, tahun studi, dan mata kuliah aktif"],
  ["Major / Program", "Jurusan / Program"],
  ["Select major...", "Pilih jurusan..."],
  ["Pilih jurusan...", "Pilih jurusan..."],
  ["Target Academic Goal", "Target Akademik"],
  ["Select target...", "Pilih target..."],
  ["Pilih target...", "Pilih target..."],
  ["Other...", "Lainnya..."],
  ["Specify your major", "Masukkan jurusanmu"],
  ["Specify your target", "Masukkan targetmu"],
  ["Active Courses", "Mata Kuliah Aktif"],
  ["Type a course and press Enter...", "Ketik mata kuliah lalu tekan Enter..."],
  ["No active courses. Add one above.", "Belum ada mata kuliah aktif. Tambahkan di atas."],
  ["Connected Accounts", "Akun Terhubung"],
  ["External Google Calendar integration", "Integrasi eksternal Google Calendar"],
  ["Google Calendar", "Google Calendar"],
  ["Connected", "Terhubung"],
  ["Not Connected", "Belum Terhubung"],
  ["No account linked", "Belum ada akun terhubung"],
  ["Connect Google Calendar", "Hubungkan Google Calendar"],
  ["Disconnect", "Putuskan"],
  ["Updating…", "Memperbarui…"],
  ["Data & Privacy", "Data & Privasi"],
  ["Manage your personal data and account deletion", "Kelola data pribadi dan penghapusan akun"],

  ["Delete Account", "Hapus Akun"],
  ["Permanently remove your account, calendar sync, and all uploaded documents.", "Hapus akun, sinkronisasi kalender, dan semua dokumen unggahan secara permanen."],
  ["Are you sure you want to delete your account? This action cannot be undone.", "Yakin ingin menghapus akun? Tindakan ini tidak bisa dibatalkan."],
  ["Type \"DELETE\" to confirm account deletion:", "Ketik \"HAPUS\" untuk konfirmasi penghapusan akun:"],
  ["Deletion cancelled: confirmation text did not match.", "Penghapusan dibatalkan: teks konfirmasi tidak sesuai."],
  ["Personal Profile:", "Profil Pribadi:"],
  ["No active courses.", "Belum ada mata kuliah aktif."],

  // Academic target options
  ["Maintain 3.8+ GPA (High Academic Honors)", "Pertahankan IPK 3.8+ (Prestasi Akademik Tinggi)"],
  ["Optimize Study Time (Save 5h+/wk for Extracurriculars)", "Optimalkan Waktu Belajar (Hemat 5+ jam/minggu untuk Ekstrakurikuler)"],
  ["Never Miss a Deadline (Perfect Compliance & Low Stress)", "Tidak Pernah Melewatkan Tenggat (Patuh Jadwal & Minim Stres)"],
  ["Research & Thesis Excellence (Deep Concept Mastery)", "Unggul Riset & Skripsi (Penguasaan Konsep Mendalam)"],
  ["Career & Internship Preparation (Practical Skill Building)", "Persiapan Karier & Magang (Pengembangan Skill Praktis)"],
  ["Computer Science", "Ilmu Komputer"],
  ["Biology & Life Sciences", "Biologi & Ilmu Hayati"],
  ["Economics & Finance", "Ekonomi & Keuangan"],
  ["Mathematics & Statistics", "Matematika & Statistik"],
  ["Engineering & Robotics", "Teknik & Robotika"],
  ["History & Humanities", "Sejarah & Humaniora"],
  ["Psychology & Cognitive Science", "Psikologi & Ilmu Kognitif"],
  ["Business Administration", "Administrasi Bisnis"],

  // Upload modal / sources
  ["Upload Documents From Laptop", "Unggah Dokumen dari Laptop"],
  ["Directly connect to your local files. Upload syllabi, lecture slides, or reading notes for AI parsing.", "Pilih file lokalmu secara langsung. Unggah silabus, slide kuliah, atau catatan bacaan untuk diproses AI."],
  ["Upload Complete!", "Unggah Selesai!"],
  ["Uploading & Parsing with AI…", "Mengunggah & Memproses dengan AI…"],
  ["Upload Document", "Unggah Dokumen"],
  ["Please select a file from your laptop first.", "Pilih file dari laptop dulu."],
  ["Upload failed", "Unggah gagal"],
  ["Upload Berhasil", "Unggah Berhasil"],
  ["Search files or titles…", "Cari file atau judul…"],
  ["Upload New Source", "Unggah Sumber Baru"],
  ["Uploaded", "Terunggah"],
  ["Processing", "Memproses"],
  ["Processed", "Diproses"],

  // Calendar / dashboard / workflow common
  ["Today's Focus", "Fokus Hari Ini"],
  ["Today", "Hari Ini"],
  ["This Week", "Minggu Ini"],
  ["Recent Documents", "Dokumen Terbaru"],
  ["Upload New", "Unggah Baru"],
  ["Free Time", "Waktu Luang"],
  ["No scheduled tasks for today.", "Tidak ada tugas terjadwal hari ini."],
  ["No documents uploaded yet.", "Belum ada dokumen yang diunggah."],
  ["Generate Study Plan", "Buat Rencana Belajar"],
  ["AI Generated", "Dibuat AI"],
  ["Generate Workflow", "Buat Alur Belajar"],
  ["Start Now", "Mulai Sekarang"],
  ["Complete", "Selesai"],
  ["Urgency", "Urgensi"],
  ["Difficulty", "Tingkat Kesulitan"],
  ["Impact", "Dampak"],

  // Chat/workspace
  ["New Chat", "Chat Baru"],
  ["Sources", "Sumber"],
  ["Add Source", "Tambah Sumber"],
  ["Upload PDF, Docs, Video", "Unggah PDF, Dokumen, Video"],
  ["Ask anything about your syllabus or materials...", "Tanyakan apa saja tentang silabus atau materimu..."],
  ["Hello, I'm FLearn AI", "Halo, saya FLearn AI"],
  ["Generate a study plan for this week", "Buatkan jadwal belajar minggu ini"],
  ["Summarize the uploaded documents", "Ringkas dokumen yang sudah diunggah"],
  ["Find 2 hours of free time in my calendar", "Temukan waktu luang 2 jam di kalenderku"],
  ["Create 5 flashcards from this material", "Buat 5 flashcard dari materi ini"],
  ["Upload documents in the left panel, then ask me anything about your materials or request a study schedule.", "Unggah dokumen di panel kiri, lalu tanya saya apa saja tentang materimu atau minta jadwal belajar."],

  // Help / onboarding / auth complete
  ["Upload Materi", "Unggah Materi"],
  ["Upload dokumen PDF, DOC, atau video ke Workspace AI", "Unggah dokumen PDF, DOC, atau video ke Workspace AI"],
  ["Generate Jadwal", "Buat Jadwal"],
  ["Login Success", "Login berhasil"],
  ["Your FLearn dashboard is opening in a new tab. If the browser blocks pop-ups, use the button below.", "Dashboard FLearn sedang dibuka di tab baru. Kalau browser memblokir pop-up, klik tombol di bawah."],
  ["Open Dashboard", "Buka Dashboard"],
  ["Back to landing page", "Kembali ke landing page"],
  ["Pop-up may be blocked by the browser. Use the manual button above.", "Pop-up mungkin diblokir browser. Gunakan tombol manual di atas."],
  ["Try again", "Coba lagi"],
  ["Go to Home", "Ke Beranda"],
  ["Something went wrong", "Terjadi kesalahan"],
  ["A fatal error occurred while loading the app. Try reloading the page.", "Terjadi kesalahan fatal saat memuat aplikasi. Coba reload halaman."],

  // Extra phrases found by UI audit (keep 100% bilingual coverage)
  ["AI Weekly Summary", "Ringkasan AI Mingguan"],
  ["Avg Focus Session", "Rata-rata Sesi Fokus"],
  ["Completion Rate", "Tingkat Penyelesaian"],
  ["Productivity Metrics", "Metrik Produktivitas"],
  ["Subject Distribution", "Distribusi Mata Kuliah"],
  ["Weekly Improvement", "Peningkatan Mingguan"],
  ["AI grounded in your documents & calendar", "AI berbasis dokumen & kalendermu"],
  ["No history yet", "Belum ada riwayat"],
  ["No sources yet. Upload your course materials to get started.", "Belum ada sumber. Upload materi kuliah kamu untuk mulai."],
  ["New Chat", "Chat Baru"],
  ["Connect in the Calendar menu", "Hubungkan di menu Calendar"],
  ["Send", "Kirim"],
  ["Send to Google Calendar", "Kirim ke Google Calendar"],
  ["Start a new chat session", "Mulai sesi chat baru"],
  ["AI analysis output", "Output dari analisis AI"],
  ["History", "Riwayat"],
  ["Conversation History", "Riwayat Percakapan"],
  ["Chat history", "Riwayat chat"],
  ["Ready", "Siap"],
  ["Study Workflow", "Alur Belajar"],
  ["Workflow not generated yet", "Workflow belum dibuat"],
  ["or drag & drop here", "atau seret ke sini"],
  ["Category", "Kategori"],
  ["File", "File"],
  ["View all", "Lihat semua"],
  ["Today's Insight", "Insight Hari Ini"],
  ["Update Workflow", "Perbarui Alur Belajar"],
  ["AI Assistant", "Asisten AI"],
  ["Ask about this document…", "Tanya tentang dokumen ini…"],
  ["Document Details", "Detail Dokumen"],
  ["Document Outline", "Garis Besar Dokumen"],
  ["Important Terms", "Istilah Penting"],
  ["Key Concepts", "Konsep Kunci"],
  ["Overview", "Ringkasan"],
  ["Subject: Biology", "Mata Kuliah: Biologi"],
  ["Sources Library", "Pustaka Sumber"],
  ["Your uploaded documents and lecture materials from laptop", "Dokumen unggahan dan materi kuliahmu dari laptop"],
  ["Add Task", "Tambah Tugas"],
  ["Based on your deadlines, calendar, and document insights.", "Berdasarkan tenggat, kalender, dan insight dokumenmu."],
  ["Due in 3 hours", "Tenggat 3 jam lagi"],
  ["Free Time Remaining", "Sisa Waktu Luang"],
  ["Most Urgent", "Paling Mendesak"],
  ["Optimize", "Optimalkan"],
  ["Plan Summary", "Ringkasan Rencana"],
  ["Recommended Next", "Langkah Berikutnya"],
  ["Study Readiness", "Kesiapan Belajar"],
  ["Total Study Time", "Total Waktu Belajar"],
  ["Your plan for today", "Rencanamu untuk hari ini"],
  ["AI expects high efficiency today based on your current sleep data and task difficulty mix.", "AI memperkirakan efisiensi tinggi hari ini berdasarkan data tidur dan kombinasi tingkat kesulitan tugasmu."],
  ["AI Processed", "Diproses AI"],
  ["Back", "Kembali"],
  ["Click to browse laptop files or drag & drop", "Klik untuk memilih file laptop atau seret & lepas"],
  ["Connect Your Google Calendar", "Hubungkan Google Calendar"],
  ["Directly connect to your laptop storage. Upload course syllabi, lecture notes, or slides to build your AI knowledge base.", "Hubungkan langsung ke penyimpanan laptopmu. Unggah silabus kuliah, catatan kuliah, atau slide untuk membangun basis pengetahuan AI."],
  ["FLearn syncs your lecture schedules, assignment due dates, and study blocks to power the AI Decision Engine.", "FLearn menyinkronkan jadwal kuliah, tenggat tugas, dan blok belajar untuk mendukung Mesin Keputusan AI."],
  ["Google Calendar Connected", "Google Calendar Terhubung"],
  ["PDF, DOCX, PPTX, or MP4 (up to 50MB)", "PDF, DOCX, PPTX, atau MP4 (hingga 50MB)"],
  ["Set Your Academic Profile", "Atur Profil Akademikmu"],
  ["Tell us what you are studying so FLearn can benchmark task difficulties and calibrate priority scoring.", "Beri tahu kami jurusanmu agar FLearn bisa menilai tingkat kesulitan tugas dan mengkalibrasi skor prioritas."],
  ["Upload Initial Sources From Laptop", "Unggah Sumber Awal dari Laptop"],
  ["Uploaded Documents", "Dokumen Terunggah"],
  ["You can also connect Outlook or Apple Calendar later in settings.", "Kamu juga bisa menghubungkan Outlook atau Apple Calendar nanti di pengaturan."],
  ["Welcome back, Alex!", "Selamat datang kembali, Alex!"],
  ["You have 3 tasks due this week.", "Kamu punya 3 tugas yang tenggatnya minggu ini."],
  ["Your next priority is", "Prioritas berikutnya adalah"],
  ["Dismiss", "Tutup"],
  ["Google Calendar Auto-Synced", "Google Calendar Tersinkron Otomatis"],
  ["Your class schedule and deadlines are now linked to the FLearn AI priority engine.", "Jadwal kuliah dan tenggat waktu Anda langsung terhubung ke sistem mesin prioritas FLearn AI."],
  ["Ask anything about your courses...", "Tanya apa saja tentang mata kuliahmu..."],
  ["FLearn AI Assistant", "Asisten AI FLearn"],
  ["How FLearn AI Works", "Cara Kerja FLearn AI"],
  ["Send study schedules directly to Google Calendar", "Kirim jadwal belajar langsung ke Google Calendar"],
  ["Ask AI to auto-generate a study schedule based on your materials", "Minta AI buatkan jadwal belajar otomatis berdasarkan materi"],
  ["Start Now", "Mulai Sekarang"],
  ["A quick guide to get started", "Panduan singkat untuk memulai"],
  ["Ask anything about your materials and AI will answer based on your documents", "Tanya apa saja tentang materimu, AI akan menjawab berdasarkan dokumenmu"],
  ["Toggle Dark/Light Mode", "Ganti Mode Gelap/Terang"],
  ["AI has extracted key concepts and synced with priority engine.", "AI telah mengekstrak konsep kunci dan menyinkronkan dengan mesin prioritas."],
  ["Automatic AI Knowledge Base Sync", "Sinkronisasi Basis Pengetahuan AI Otomatis"],
  ["Cancel", "Batal"],
  ["Supports PDF, DOCX, PPTX, MP4 (Up to 50MB)", "Mendukung PDF, DOCX, PPTX, MP4 (hingga 50MB)"],
  ["Try Again", "Coba Lagi"],
  ["FLearn is analyzing...", "FLearn sedang menganalisis..."],
  ["Failed to create explanation", "Gagal membuat penjelasan"],
  ["Creating an in-depth explanation for", "Membuat penjelasan mendalam untuk"],
  ["Explanation from FLearn AI", "Penjelasan dari FLearn AI"],
];

const toEn = new Map<string, string>();
const toId = new Map<string, string>();
for (const [en, id] of PAIRS) {
  toId.set(en, id);
  toEn.set(id, en);
}

function translateExact(text: string, lang: LangKey) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const map = lang === "id" ? toId : toEn;
  const translated = map.get(trimmed);
  if (!translated || translated === trimmed) return text;
  return text.replace(trimmed, translated);
}

function translateNode(root: ParentNode, lang: LangKey) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (["script", "style", "code", "pre", "textarea"].includes(tag)) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-auto-translate]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) {
    const next = translateExact(node.nodeValue || "", lang);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  const attrNames = ["placeholder", "title", "aria-label", "alt"];
  for (const attr of attrNames) {
    root.querySelectorAll?.(`[${attr}]`).forEach((el) => {
      if ((el as HTMLElement).closest("[data-no-auto-translate]")) return;
      const current = el.getAttribute(attr) || "";
      const next = translateExact(current, lang);
      if (next !== current) el.setAttribute(attr, next);
    });
  }
}

export function UiPhraseTranslator({ language }: { language: LangKey }) {
  useEffect(() => {
    const run = () => translateNode(document.body, language);
    run();
    const observer = new MutationObserver(() => run());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title", "aria-label", "alt"] });
    return () => observer.disconnect();
  }, [language]);

  return null;
}
