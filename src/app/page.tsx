"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  FileText,
  Calendar,
  BarChart3,
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle,
  Brain,
  Globe,
  LayoutDashboard,
  NotebookPen,
  GitBranch,
  Menu,
  X,
  Clock,
  Target,
  ListTodo
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/auth/login-modal";

import { ScrollProgress } from '@/components/core/scroll-progress';
import { TextEffect } from '@/components/core/text-effect';
import { TextLoop } from '@/components/core/text-loop';
import { AnimatedGroup } from '@/components/core/animated-group';
import { InfiniteSlider } from '@/components/core/infinite-slider';
import { BorderTrail } from '@/components/core/border-trail';
import { Accordion } from '@/components/core/accordion';
import { GlowEffect } from '@/components/core/glow-effect';
import { TransitionPanel } from '@/components/core/transition-panel';
import { LogoWithText } from '@/components/brand/logo';

const translations = {
  en: {
    nav: { features: 'Features', howItWorks: 'How It Works', benefits: 'Benefits', faq: 'FAQ', login: 'Sign In', register: 'Register' },
    hero: {
      title: 'Stop reacting to deadlines. Start outsmarting them.',
      desc: 'FLearn combines document understanding, calendar awareness, and priority scoring into one AI that tells you exactly what to study, when to study it, and why it matters.',
      cta1: 'Start Free Trial',
      cta2: 'View Demo',
      trust: 'Ready for academic use',
      dash: { title: 'Dashboard', h: '12.5h', hd: 'Study Hours', t: '8/12', td: 'Tasks Done', s: '92%', sd: 'Focus Score', next: 'Next Priority', nextVal: 'Biology 101 Lab Report' }
    },
    trusted: 'Designed for University Curriculums Across Indonesia',
    featuresSection: {
      sub: 'Core Pillars',
      title: 'Four things that change how you study',
      f1: { title: 'Document Intelligence', desc: 'Upload any lecture, reading, or syllabus. Get instant AI summaries, flashcards, and concept maps.', b1: 'Smart Summaries', b2: 'Auto Flashcards' },
      f2: { title: 'Calendar Sync', desc: 'One source of truth for exams, deadlines, and AI-scheduled study blocks — all in one view.', b1: 'Google Calendar integration', b2: 'Conflict detection' },
      f3: { title: 'Priority Engine', desc: 'A live urgency score on every task. Know exactly what to tackle first and why — not just when.', b1: 'Urgency metrics', b2: 'Impact scoring' },
      f4: { title: 'Study Plans', desc: 'Your day, built by AI from your calendar, documents, and learning history. Adapts daily.', b1: 'Dynamic schedules', b2: 'Adaptive pacing' }
    },
    howItWorksSection: {
      sub: 'Process',
      title: 'Ready in three steps',
      items: [
        { num: '1', title: 'Upload & Connect', desc: 'Drop in your syllabi, lecture slides, and notes. Connect Calendar in one click.' },
        { num: '2', title: 'AI Analyzes', desc: 'Documents are processed, concepts extracted, and cross-referenced with deadlines.' },
        { num: '3', title: 'Study Smarter', desc: 'Get a scored task list, concrete daily plan, and an AI you can ask anything.' }
      ]
    },
    explorer: {
      title: 'Explore Capabilities',
      tabs: ['Document Intelligence', 'Calendar Sync', 'Priority Score', 'Daily Schedule'],
      c1: { title: 'Understand Any Document', desc: 'Our AI reads your PDFs and creates structured notes.', b: ['Extract key concepts', 'Generate practice questions', 'Identify formulas'] },
      c2: { title: 'Seamless Scheduling', desc: 'Never miss a deadline again with smart sync.', b: ['Two-way Google sync', 'Automatic block finding', 'Rescheduling suggestions'] },
      c3: { title: 'Know What Matters', desc: 'Every task is scored based on deadlines and grade impact.', b: ['0-100 Priority scale', 'Urgency decay models', 'Difficulty modifiers'] },
      c4: { title: 'Your Day, Planned', desc: 'Wake up to a realistic study plan.', b: ['Timeboxed sessions', 'Pomodoro integration', 'Flexible adjustments'] }
    },
    benefitsSection: {
      sub: 'Why it works',
      title: 'Built for students who actually want to perform',
      list: [
        'AI summaries and key concept extraction',
        'Smart priority scoring across urgency and difficulty',
        'Personalized daily study timelines',
        'Calendar integration for conflict detection',
        'Focus session tracking with real analytics',
        'Source-grounded AI chat'
      ],
      stats: [
        { value: '100%', label: 'AI-Driven Intelligence' },
        { value: '24/7', label: 'Academic Assistant' },
        { value: 'Multi', label: 'Doc & Calendar Sync' },
        { value: '0', label: 'Panic Deadlines' }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { q: 'Is my data private?', a: 'Yes. We do not sell your data or use your documents to train public models.' },
        { q: 'Does it work with Canvas/Blackboard?', a: 'You can export your calendar from any LMS and sync it directly to FLearn.' },
        { q: 'What file types are supported?', a: 'PDF, DOCX, PPTX, and standard image formats are fully supported.' },
        { q: 'How much does it cost?', a: 'There is a generous free tier. Pro features start at $5/month.' }
      ]
    },
    ctaSection: {
      title: 'Ready to study smarter?',
      desc: 'Start organizing your lectures, documents, and schedules in one intelligent workspace.',
      cta: 'Get Started Now'
    },
    footer: { copy: '© 2026 FLearn AI. All rights reserved.', links: ['Support', 'Privacy', 'Terms'] }
  },
  id: {
    nav: { features: 'Fitur', howItWorks: 'Cara Kerja', benefits: 'Manfaat', faq: 'FAQ', login: 'Masuk', register: 'Daftar' },
    hero: {
      title: 'Berhenti panik karena deadline. Mulai taklukkan semuanya.',
      desc: 'FLearn memadukan pemahaman dokumen, sinkronisasi kalender, dan skor prioritas ke dalam satu AI yang memberi tahu Anda tepatnya apa yang harus dipelajari, kapan, dan mengapa.',
      cta1: 'Coba Gratis',
      cta2: 'Lihat Demo',
      trust: 'Siap digunakan untuk perkuliahan',
      dash: { title: 'Dasbor', h: '12.5j', hd: 'Jam Belajar', t: '8/12', td: 'Tugas Selesai', s: '92%', sd: 'Skor Fokus', next: 'Prioritas Berikut', nextVal: 'Laporan Lab Biologi 101' }
    },
    trusted: 'Dirancang untuk Kurikulum Kampus di Indonesia',
    featuresSection: {
      sub: 'Pilar Utama',
      title: 'Empat hal yang mengubah cara Anda belajar',
      f1: { title: 'Kecerdasan Dokumen', desc: 'Unggah materi atau silabus. Dapatkan ringkasan AI, flashcard, dan peta konsep.', b1: 'Ringkasan Cerdas', b2: 'Flashcard Otomatis' },
      f2: { title: 'Sinkronisasi Kalender', desc: 'Satu sumber untuk ujian, deadline, dan blok belajar terjadwal — dalam satu tampilan.', b1: 'Integrasi Google Calendar', b2: 'Deteksi Konflik' },
      f3: { title: 'Mesin Prioritas', desc: 'Skor urgensi langsung pada setiap tugas. Tahu apa yang harus dikerjakan lebih dulu.', b1: 'Metrik Urgensi', b2: 'Skor Dampak' },
      f4: { title: 'Rencana Belajar', desc: 'Hari Anda disusun oleh AI dari kalender dan dokumen. Beradaptasi setiap hari.', b1: 'Jadwal Dinamis', b2: 'Kecepatan Adaptif' }
    },
    howItWorksSection: {
      sub: 'Proses',
      title: 'Siap dalam tiga langkah',
      items: [
        { num: '1', title: 'Unggah & Hubungkan', desc: 'Masukkan silabus, slide, dan catatan. Hubungkan Kalender dalam satu klik.' },
        { num: '2', title: 'Analisis AI', desc: 'Dokumen diproses, konsep diekstrak, dan disesuaikan dengan deadline.' },
        { num: '3', title: 'Belajar Cerdas', desc: 'Dapatkan daftar tugas dengan skor dan rencana harian yang konkret.' }
      ]
    },
    explorer: {
      title: 'Eksplorasi Fitur',
      tabs: ['Kecerdasan Dokumen', 'Sinkronisasi Kalender', 'Skor Prioritas', 'Jadwal Harian'],
      c1: { title: 'Pahami Dokumen Apapun', desc: 'AI kami membaca PDF Anda dan membuat catatan terstruktur.', b: ['Ekstrak konsep utama', 'Buat soal latihan', 'Identifikasi rumus'] },
      c2: { title: 'Penjadwalan Mulus', desc: 'Jangan pernah lewatkan deadline dengan sinkronisasi cerdas.', b: ['Sinkronisasi dua arah', 'Cari waktu kosong', 'Saran penjadwalan ulang'] },
      c3: { title: 'Ketahui Apa yang Penting', desc: 'Setiap tugas diberi skor berdasarkan deadline dan dampaknya.', b: ['Skala Prioritas 0-100', 'Model Penurunan Urgensi', 'Modifikator Kesulitan'] },
      c4: { title: 'Hari Anda, Direncanakan', desc: 'Bangun dengan rencana belajar yang realistis.', b: ['Sesi berbasis waktu', 'Integrasi Pomodoro', 'Penyesuaian fleksibel'] }
    },
    benefitsSection: {
      sub: 'Mengapa ini berhasil',
      title: 'Dibuat untuk mahasiswa yang ingin berprestasi',
      list: [
        'Ringkasan AI dan ekstraksi konsep penting',
        'Skor prioritas cerdas dan tingkat kesulitan',
        'Jadwal belajar harian personal',
        'Integrasi kalender untuk deteksi konflik',
        'Pelacakan sesi fokus disertai analitik',
        'Chat AI berbasis sumber dokumen'
      ],
      stats: [
        { value: '100%', label: 'Kecerdasan Berbasis AI' },
        { value: '24/7', label: 'Asisten Akademik Pribadi' },
        { value: 'Multi', label: 'Sinkronisasi Dokumen & Kalender' },
        { value: '0', label: 'Kepanikan Deadline' }
      ]
    },
    faq: {
      title: 'Pertanyaan Umum',
      items: [
        { q: 'Apakah data saya aman?', a: 'Ya. Kami tidak menjual data Anda atau menggunakannya untuk melatih model publik.' },
        { q: 'Bisa terhubung dengan Canvas/SIAKAD?', a: 'Anda dapat mengekspor kalender dari sistem manapun dan sinkronisasi ke FLearn.' },
        { q: 'Format file apa yang didukung?', a: 'PDF, DOCX, PPTX, dan format gambar standar didukung penuh.' },
        { q: 'Berapa biayanya?', a: 'Tersedia versi gratis. Fitur Pro mulai dari Rp 75.000/bulan.' }
      ]
    },
    ctaSection: {
      title: 'Siap belajar lebih cerdas?',
      desc: 'Mulai kelola materi kuliah, dokumen, dan jadwalmu dalam satu tempat kerja berbasis AI.',
      cta: 'Mulai Sekarang'
    },
    footer: { copy: '© 2026 FLearn AI. Hak cipta dilindungi.', links: ['Bantuan', 'Privasi', 'Ketentuan'] }
  }
};

type LangKey = keyof typeof translations;

const langOptions: { code: LangKey; label: string; icon: typeof Globe }[] = [
  { code: "id", label: "ID", icon: Globe },
  { code: "en", label: "EN", icon: Globe },
];

export default function LandingPage() {
  const [lang, setLang] = useState<LangKey>("id");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const { setShowLoginModal, setAuthView } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const storedLang = localStorage.getItem("flearn-language") as LangKey;
    if (storedLang && translations[storedLang]) {
      setLang(storedLang);
    }
  }, []);

  const changeLanguage = (code: LangKey) => {
    setLang(code);
    localStorage.setItem("flearn-language", code);
    setShowLangMenu(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const smoothScrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ITEMS = [
    {
      title: t.explorer.c1.title,
      subtitle: t.explorer.c1.desc,
      points: t.explorer.c1.b,
      icon: FileText
    },
    {
      title: t.explorer.c2.title,
      subtitle: t.explorer.c2.desc,
      points: t.explorer.c2.b,
      icon: Calendar
    },
    {
      title: t.explorer.c3.title,
      subtitle: t.explorer.c3.desc,
      points: t.explorer.c3.b,
      icon: BarChart3
    },
    {
      title: t.explorer.c4.title,
      subtitle: t.explorer.c4.desc,
      points: t.explorer.c4.b,
      icon: Clock
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#343A40] text-[#343A40] dark:text-[#F8F9FA] font-['Inter',sans-serif]">
      <ScrollProgress className="top-0 z-[110]" />
      <LoginModal lang={lang} />

      {/* 2. Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 dark:bg-[#343A40]/90 backdrop-blur border-b border-[#e2e8f0] dark:border-[#212529] px-6 py-4">
        <div className="mx-auto max-w-[1280px] flex items-center justify-between">
          <div className="flex-shrink-0 flex items-center gap-2">
            <LogoWithText size={28} />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={smoothScrollTo('features')} className="text-sm font-semibold hover:text-[#007BFF] transition-colors">{t.nav.features}</a>
            <a href="#how-it-works" onClick={smoothScrollTo('how-it-works')} className="text-sm font-semibold hover:text-[#007BFF] transition-colors">{t.nav.howItWorks}</a>
            <a href="#benefits" onClick={smoothScrollTo('benefits')} className="text-sm font-semibold hover:text-[#007BFF] transition-colors">{t.nav.benefits}</a>
            <a href="#faq" onClick={smoothScrollTo('faq')} className="text-sm font-semibold hover:text-[#007BFF] transition-colors">{t.nav.faq}</a>
          </div>

          <div className="flex items-center gap-4">
            <div ref={langMenuRef} className="relative">
              <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-2 text-sm font-semibold border border-[#e2e8f0] dark:border-[#212529] px-3 py-1.5 rounded-[4px] hover:bg-[#F8F9FA] dark:hover:bg-[#212529]">
                <Globe className="h-4 w-4" />
                <span>{lang.toUpperCase()}</span>
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#343A40] border border-[#e2e8f0] dark:border-[#212529] shadow-sm rounded-[4px] py-1 z-[101]">
                  {langOptions.map((opt) => (
                    <button key={opt.code} onClick={() => changeLanguage(opt.code)} className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-[#F8F9FA] dark:hover:bg-[#212529]">
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <ThemeToggle />
            
            <button onClick={() => { setAuthView("login"); setShowLoginModal(true); }} className="text-sm font-semibold hidden md:block">
              {t.nav.login}
            </button>
            <button onClick={() => { setAuthView("register"); setShowLoginModal(true); }} className="bg-[#007BFF] text-white text-sm font-semibold px-4 py-2 rounded-[4px] hover:bg-[#0056b3] transition-colors">
              {t.nav.register}
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-[#F8F9FA] dark:bg-[#212529] border-b border-[#e2e8f0] dark:border-[#1a1d20]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 bg-[#e9ecef] dark:bg-[#343A40] px-3 py-1 rounded-[4px] mb-6">
                <Target className="h-4 w-4 text-[#007BFF]" />
                <span className="text-sm font-bold text-[#343A40] dark:text-white">
                  <TextLoop>
                    {[lang === 'id' ? 'Silabus Kuliah' : 'Syllabi', lang === 'id' ? 'Tugas Akhir' : 'Final Projects', lang === 'id' ? 'Jadwal Ujian' : 'Exam Schedules']}
                  </TextLoop>
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-[#343A40] dark:text-white">
                <TextEffect per="word">
                  {t.hero.title}
                </TextEffect>
              </h1>
              <p className="text-lg text-[#6c757d] dark:text-[#adb5bd] mb-8 font-normal leading-relaxed">
                {t.hero.desc}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <button onClick={() => { setAuthView("register"); setShowLoginModal(true); }} className="bg-[#007BFF] text-white font-bold px-6 py-3 rounded-[4px] hover:bg-[#0056b3] transition-colors w-full sm:w-auto text-center">
                  {t.hero.cta1}
                </button>
                <button onClick={() => smoothScrollTo('how-it-works')({ preventDefault: () => {} } as any)} className="border-2 border-[#343A40] dark:border-white text-[#343A40] dark:text-white font-bold px-6 py-3 rounded-[4px] hover:bg-[#343A40] hover:text-white dark:hover:bg-white dark:hover:text-[#343A40] transition-colors w-full sm:w-auto text-center">
                  {t.hero.cta2}
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6c757d] font-semibold">
                <CheckCircle className="h-4 w-4 text-[#28A745]" />
                <span>{t.hero.trust}</span>
              </div>
            </div>
            
            <div className="md:w-1/2 hidden md:block">
              <BorderTrail className="p-1 rounded-[4px]">
                <div className="bg-white dark:bg-[#343A40] border border-[#e2e8f0] dark:border-[#212529] rounded-[4px] shadow-sm p-6 w-full">
                  <div className="flex items-center gap-3 border-b border-[#e2e8f0] dark:border-[#212529] pb-4 mb-6">
                    <div className="h-3 w-3 rounded-[4px] bg-[#28A745]"></div>
                    <span className="font-bold text-[#343A40] dark:text-white">{t.hero.dash.title}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#F8F9FA] dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                      <div className="text-2xl font-bold text-[#007BFF]">{t.hero.dash.h}</div>
                      <div className="text-xs font-semibold text-[#6c757d] mt-1 uppercase">{t.hero.dash.hd}</div>
                    </div>
                    <div className="bg-[#F8F9FA] dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                      <div className="text-2xl font-bold text-[#FFC107]">{t.hero.dash.t}</div>
                      <div className="text-xs font-semibold text-[#6c757d] mt-1 uppercase">{t.hero.dash.td}</div>
                    </div>
                    <div className="bg-[#F8F9FA] dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                      <div className="text-2xl font-bold text-[#28A745]">{t.hero.dash.s}</div>
                      <div className="text-xs font-semibold text-[#6c757d] mt-1 uppercase">{t.hero.dash.sd}</div>
                    </div>
                  </div>

                  <div className="bg-[#007BFF] p-4 rounded-[4px] text-white">
                    <div className="text-xs font-bold uppercase mb-1">{t.hero.dash.next}</div>
                    <div className="text-lg font-bold">{t.hero.dash.nextVal}</div>
                  </div>
                </div>
              </BorderTrail>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trusted By / InfiniteSlider */}
      <section className="py-12 border-b border-[#e2e8f0] dark:border-[#212529] bg-white dark:bg-[#343A40]">
        <div className="mx-auto max-w-[1280px] px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#6c757d] mb-8">{t.trusted}</p>
          <InfiniteSlider speed={40}>
            {['Universitas Indonesia', 'Institut Teknologi Bandung', 'Universitas Gadjah Mada', 'Institut Teknologi Sepuluh Nopember', 'Bina Nusantara', 'Telkom University', 'Universitas Padjadjaran', 'Universitas Brawijaya'].map((uni, idx) => (
              <div key={idx} className="text-lg font-bold uppercase tracking-wider text-[#343A40]/40 dark:text-white/40 whitespace-nowrap">
                {uni}
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </section>

      {/* 5. Features Section (Zig-Zag Layout) */}
      <section id="features" className="py-20 bg-white dark:bg-[#343A40]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center mb-16">
            <span className="text-[#007BFF] font-bold uppercase tracking-wider text-sm">{t.featuresSection.sub}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-[#343A40] dark:text-white">{t.featuresSection.title}</h2>
          </div>

          <div className="space-y-24">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="md:w-1/2">
                <div className="bg-[#007BFF] w-12 h-12 flex items-center justify-center rounded-[4px] mb-6">
                  <FileText className="text-white h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#343A40] dark:text-white">{t.featuresSection.f1.title}</h3>
                <p className="text-[#6c757d] dark:text-[#adb5bd] mb-6 text-lg">{t.featuresSection.f1.desc}</p>
                <ul className="space-y-3 font-semibold">
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f1.b1}</li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f1.b2}</li>
                </ul>
              </div>
              <div className="md:w-1/2 w-full">
                <AnimatedGroup className="grid grid-cols-2 gap-4 h-full">
                  {/* Document Mockup */}
                  <div className="bg-white dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e2e8f0] dark:border-[#343A40]">
                      <FileText className="h-5 w-5 text-[#007BFF]" />
                      <div className="text-xs font-bold text-[#343A40] dark:text-white truncate">biology_lecture_01.pdf</div>
                    </div>
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-full rounded-[2px]"></div>
                      <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-5/6 rounded-[2px]"></div>
                      <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-4/6 rounded-[2px]"></div>
                      <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-full rounded-[2px]"></div>
                    </div>
                  </div>
                  {/* Summary Mockup */}
                  <div className="bg-[#F8F9FA] dark:bg-[#1a1d20] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#212529] shadow-inner flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFC107] to-[#007BFF]"></div>
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e2e8f0] dark:border-[#343A40]">
                      <Sparkles className="h-4 w-4 text-[#FFC107]" />
                      <div className="text-xs font-bold text-[#343A40] dark:text-white">AI Extraction</div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="bg-white dark:bg-[#343A40] p-2 rounded-[4px] border border-[#e2e8f0] dark:border-[#212529] flex items-center justify-between">
                         <div className="text-[10px] font-bold text-[#343A40] dark:text-white">Key Concept 1</div>
                         <CheckCircle className="h-3 w-3 text-[#28A745]" />
                      </div>
                      <div className="bg-white dark:bg-[#343A40] p-2 rounded-[4px] border border-[#e2e8f0] dark:border-[#212529] flex items-center justify-between">
                         <div className="text-[10px] font-bold text-[#343A40] dark:text-white">Flashcards (12)</div>
                         <ArrowRight className="h-3 w-3 text-[#007BFF]" />
                      </div>
                    </div>
                  </div>
                </AnimatedGroup>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
              <div className="md:w-1/2">
                <div className="bg-[#FFC107] w-12 h-12 flex items-center justify-center rounded-[4px] mb-6">
                  <Calendar className="text-[#343A40] h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#343A40] dark:text-white">{t.featuresSection.f2.title}</h3>
                <p className="text-[#6c757d] dark:text-[#adb5bd] mb-6 text-lg">{t.featuresSection.f2.desc}</p>
                <ul className="space-y-3 font-semibold">
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f2.b1}</li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f2.b2}</li>
                </ul>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="bg-white dark:bg-[#111827] text-[#343A40] dark:text-white p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1f293d] shadow-sm overflow-hidden flex flex-col h-64 transition-colors">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#F8F9FA] dark:bg-[#1f293d] border border-[#e2e8f0] dark:border-transparent px-3 py-1 text-xs font-bold rounded-[4px] transition-colors">Today</div>
                      <div className="flex items-center gap-1 bg-[#F8F9FA] dark:bg-[#1f293d] border border-[#e2e8f0] dark:border-transparent px-2 py-1 rounded-[4px] transition-colors">
                        <div className="w-4 h-4 bg-white dark:bg-[#374151] border border-[#e2e8f0] dark:border-transparent rounded-[4px] flex items-center justify-center text-[8px] transition-colors">&lt;</div>
                        <div className="w-4 h-4 bg-white dark:bg-[#374151] border border-[#e2e8f0] dark:border-transparent rounded-[4px] flex items-center justify-center text-[8px] transition-colors">&gt;</div>
                      </div>
                      <div className="font-bold text-sm ml-2">August 2026</div>
                    </div>
                    <div className="flex bg-[#F8F9FA] dark:bg-[#1f293d] border border-[#e2e8f0] dark:border-transparent rounded-[4px] text-xs font-bold overflow-hidden transition-colors">
                      <div className="px-3 py-1">Week</div>
                      <div className="px-3 py-1 bg-[#007BFF] text-white">Month</div>
                    </div>
                  </div>
                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 gap-[1px] bg-[#e2e8f0] dark:bg-[#1f293d] border-t border-b border-[#e2e8f0] dark:border-[#1f293d] py-1 text-[8px] text-center font-bold text-[#6c757d] dark:text-gray-400 transition-colors">
                    <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                  </div>
                  {/* Calendar Grid Body */}
                  <div className="grid grid-cols-7 gap-[1px] bg-[#e2e8f0] dark:bg-[#1f293d] flex-1 transition-colors">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className={`bg-white dark:bg-[#111827] p-1 flex flex-col gap-1 transition-colors ${i === 4 ? 'bg-[#F8F9FA] dark:bg-[#1e293b]' : ''}`}>
                        <div className={`text-[10px] font-bold text-center ${i === 4 ? 'w-4 h-4 mx-auto bg-[#007BFF] rounded-[4px] flex items-center justify-center text-white' : 'text-[#6c757d] dark:text-gray-300'}`}>
                          {i + 2}
                        </div>
                        {i === 0 && (
                          <div className="space-y-[2px]">
                            <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300"><span className="text-[#FFC107] font-bold">1:00</span> Final Review...</div>
                            <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300">7:00 Sibukkkk</div>
                          </div>
                        )}
                        {i === 1 && (
                          <div className="space-y-[2px]">
                            <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300"><span className="text-[#007BFF] font-bold">• 17:00</span> Review Ma...</div>
                            <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300"><span className="text-[#007BFF] font-bold">• 18:00</span> Latihan So...</div>
                            <div className="text-[5px] text-[#007BFF] font-bold">+1 lainnya</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="md:w-1/2">
                <div className="bg-[#17A2B8] w-12 h-12 flex items-center justify-center rounded-[4px] mb-6">
                  <BarChart3 className="text-white h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#343A40] dark:text-white">{t.featuresSection.f3.title}</h3>
                <p className="text-[#6c757d] dark:text-[#adb5bd] mb-6 text-lg">{t.featuresSection.f3.desc}</p>
                <ul className="space-y-3 font-semibold">
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f3.b1}</li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f3.b2}</li>
                </ul>
              </div>
              <div className="md:w-1/2 w-full space-y-4">
                <div className="bg-white dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#343A40] dark:text-white">Calculus Midterm</div>
                    <div className="text-sm text-[#6c757d]">Due in 2 days</div>
                  </div>
                  <div className="bg-[#dc3545] text-white font-bold px-3 py-1 rounded-[4px]">98</div>
                </div>
                <div className="bg-white dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#343A40] dark:text-white">History Essay</div>
                    <div className="text-sm text-[#6c757d]">Due in 5 days</div>
                  </div>
                  <div className="bg-[#FFC107] text-[#343A40] font-bold px-3 py-1 rounded-[4px]">75</div>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
              <div className="md:w-1/2">
                <div className="bg-[#28A745] w-12 h-12 flex items-center justify-center rounded-[4px] mb-6">
                  <BookOpen className="text-white h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#343A40] dark:text-white">{t.featuresSection.f4.title}</h3>
                <p className="text-[#6c757d] dark:text-[#adb5bd] mb-6 text-lg">{t.featuresSection.f4.desc}</p>
                <ul className="space-y-3 font-semibold">
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f4.b1}</li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-[#28A745]" /> {t.featuresSection.f4.b2}</li>
                </ul>
              </div>
              <div className="md:w-1/2 w-full">
                 <div className="bg-[#F8F9FA] dark:bg-[#212529] p-6 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm relative">
                  <div className="absolute left-8 top-6 bottom-6 w-1 bg-[#e2e8f0] dark:bg-[#343A40]"></div>
                  <div className="space-y-6 relative">
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 rounded-[4px] bg-[#007BFF] mt-1 relative z-10 border-2 border-white dark:border-[#212529]"></div>
                      <div className="flex-1 bg-white dark:bg-[#343A40] p-3 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                        <div className="text-xs font-bold text-[#6c757d] mb-1">09:00 - 11:00</div>
                        <div className="font-bold">Deep Work: Calculus</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-4 h-4 rounded-[4px] bg-[#FFC107] mt-1 relative z-10 border-2 border-white dark:border-[#212529]"></div>
                      <div className="flex-1 bg-white dark:bg-[#343A40] p-3 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                        <div className="text-xs font-bold text-[#6c757d] mb-1">11:15 - 12:00</div>
                        <div className="font-bold">Review: History</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#F8F9FA] dark:bg-[#212529] border-y border-[#e2e8f0] dark:border-[#1a1d20]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="text-center mb-16">
            <span className="text-[#007BFF] font-bold uppercase tracking-wider text-sm">{t.howItWorksSection.sub}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-[#343A40] dark:text-white">{t.howItWorksSection.title}</h2>
          </div>
          
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-1 bg-[#e2e8f0] dark:bg-[#343A40] -z-10 rounded-[4px]"></div>
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
              {t.howItWorksSection.items.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-[#343A40] p-8 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm text-center relative h-full flex flex-col">
                  <div className="w-16 h-16 bg-[#007BFF] text-white text-2xl font-bold flex items-center justify-center rounded-[4px] mx-auto mb-6 shadow-sm absolute -top-8 left-1/2 -translate-x-1/2">
                    {item.num}
                  </div>
                  <h3 className="text-xl font-bold mb-3 mt-4 text-[#343A40] dark:text-white">{item.title}</h3>
                  <p className="text-[#6c757d] dark:text-[#adb5bd] font-normal flex-1">{item.desc}</p>
                </div>
              ))}
            </AnimatedGroup>
          </div>
        </div>
      </section>

      {/* 7. Interactive Feature Explorer */}
      <section className="py-20 bg-white dark:bg-[#343A40]">
        <div className="mx-auto max-w-[1280px] px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#343A40] dark:text-white">{t.explorer.title}</h2>
          
          <div className="flex flex-wrap border-b border-[#e2e8f0] dark:border-[#212529] mb-8">
            {t.explorer.tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-4 text-sm font-bold border-b-4 transition-colors ${
                  activeTab === index 
                    ? "border-[#007BFF] text-[#007BFF]" 
                    : "border-transparent text-[#6c757d] hover:text-[#343A40] dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#212529] border border-[#e2e8f0] dark:border-[#1a1d20] rounded-[4px] p-8 min-h-[300px]">
            <TransitionPanel>
              <div key={activeTab} className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/2">
                  {React.createElement(ITEMS[activeTab].icon, { className: "w-10 h-10 text-[#007BFF] mb-6" })}
                  <h3 className="text-2xl font-bold mb-4 text-[#343A40] dark:text-white">{ITEMS[activeTab].title}</h3>
                  <p className="text-[#6c757d] dark:text-[#adb5bd] mb-6 text-lg">{ITEMS[activeTab].subtitle}</p>
                  <ul className="space-y-3 font-semibold">
                    {ITEMS[activeTab].points.map((p, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-[#28A745]" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:w-1/2 bg-white dark:bg-[#343A40] border border-[#e2e8f0] dark:border-[#1a1d20] rounded-[4px] p-8 flex items-center justify-center">
                   <div className="w-full h-full min-h-[220px] bg-[#F8F9FA] dark:bg-[#212529] rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-inner p-6 flex flex-col items-center justify-center relative overflow-hidden">
                     {activeTab === 0 && (
                       <div className="w-full h-full flex flex-col justify-center">
                         <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full min-h-[160px]">
                           {/* Document Mockup */}
                           <div className="bg-white dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm flex flex-col">
                             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e2e8f0] dark:border-[#343A40]">
                               <FileText className="h-5 w-5 text-[#007BFF]" />
                               <div className="text-xs font-bold text-[#343A40] dark:text-white truncate">biology_lecture_01.pdf</div>
                             </div>
                             <div className="flex-1 space-y-2 mt-2">
                               <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-full rounded-[2px]"></div>
                               <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-5/6 rounded-[2px]"></div>
                               <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-4/6 rounded-[2px]"></div>
                               <div className="h-2 bg-[#e9ecef] dark:bg-[#343A40] w-full rounded-[2px]"></div>
                             </div>
                           </div>
                           {/* Summary Mockup */}
                           <div className="bg-[#F8F9FA] dark:bg-[#1a1d20] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#212529] shadow-inner flex flex-col relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFC107] to-[#007BFF]"></div>
                             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e2e8f0] dark:border-[#343A40]">
                               <Sparkles className="h-4 w-4 text-[#FFC107]" />
                               <div className="text-xs font-bold text-[#343A40] dark:text-white">AI Extraction</div>
                             </div>
                             <div className="flex-1 flex flex-col gap-2">
                               <div className="bg-white dark:bg-[#343A40] p-2 rounded-[4px] border border-[#e2e8f0] dark:border-[#212529] flex items-center justify-between">
                                  <div className="text-[10px] font-bold text-[#343A40] dark:text-white">Key Concept 1</div>
                                  <CheckCircle className="h-3 w-3 text-[#28A745]" />
                               </div>
                               <div className="bg-white dark:bg-[#343A40] p-2 rounded-[4px] border border-[#e2e8f0] dark:border-[#212529] flex items-center justify-between">
                                  <div className="text-[10px] font-bold text-[#343A40] dark:text-white">Flashcards (12)</div>
                                  <ArrowRight className="h-3 w-3 text-[#007BFF]" />
                               </div>
                             </div>
                           </div>
                         </AnimatedGroup>
                       </div>
                     )}
                     {activeTab === 1 && (
                        <div className="w-full bg-white dark:bg-[#111827] text-[#343A40] dark:text-white p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1f293d] shadow-sm overflow-hidden flex flex-col transition-colors">
                          {/* Calendar Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-[#F8F9FA] dark:bg-[#1f293d] border border-[#e2e8f0] dark:border-transparent px-3 py-1 text-xs font-bold rounded-[4px] transition-colors">Today</div>
                              <div className="flex items-center gap-1 bg-[#F8F9FA] dark:bg-[#1f293d] border border-[#e2e8f0] dark:border-transparent px-2 py-1 rounded-[4px] transition-colors">
                                <div className="w-4 h-4 bg-white dark:bg-[#374151] border border-[#e2e8f0] dark:border-transparent rounded-[4px] flex items-center justify-center text-[8px] transition-colors">&lt;</div>
                                <div className="w-4 h-4 bg-white dark:bg-[#374151] border border-[#e2e8f0] dark:border-transparent rounded-[4px] flex items-center justify-center text-[8px] transition-colors">&gt;</div>
                              </div>
                              <div className="font-bold text-sm ml-2 hidden sm:block">August 2026</div>
                            </div>
                            <div className="flex bg-[#F8F9FA] dark:bg-[#1f293d] border border-[#e2e8f0] dark:border-transparent rounded-[4px] text-xs font-bold overflow-hidden transition-colors">
                              <div className="px-3 py-1">Week</div>
                              <div className="px-3 py-1 bg-[#007BFF] text-white">Month</div>
                            </div>
                          </div>
                          {/* Calendar Grid Header */}
                          <div className="grid grid-cols-7 gap-[1px] bg-[#e2e8f0] dark:bg-[#1f293d] border-t border-b border-[#e2e8f0] dark:border-[#1f293d] py-1 text-[8px] text-center font-bold text-[#6c757d] dark:text-gray-400 transition-colors">
                            <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                          </div>
                          {/* Calendar Grid Body */}
                          <div className="grid grid-cols-7 gap-[1px] bg-[#e2e8f0] dark:bg-[#1f293d] flex-1 transition-colors">
                            {Array.from({ length: 14 }).map((_, i) => (
                              <div key={i} className={`bg-white dark:bg-[#111827] p-1 flex flex-col gap-1 transition-colors ${i === 4 ? 'bg-[#F8F9FA] dark:bg-[#1e293b]' : ''} min-h-[40px]`}>
                                <div className={`text-[10px] font-bold text-center ${i === 4 ? 'w-4 h-4 mx-auto bg-[#007BFF] rounded-[4px] flex items-center justify-center text-white' : 'text-[#6c757d] dark:text-gray-300'}`}>
                                  {i + 2}
                                </div>
                                {i === 0 && (
                                  <div className="space-y-[2px] hidden sm:block">
                                    <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300"><span className="text-[#FFC107] font-bold">1:00</span> Final Review...</div>
                                    <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300">7:00 Sibukkkk</div>
                                  </div>
                                )}
                                {i === 1 && (
                                  <div className="space-y-[2px] hidden sm:block">
                                    <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300"><span className="text-[#007BFF] font-bold">• 17:00</span> Review Ma...</div>
                                    <div className="text-[6px] truncate text-[#6c757d] dark:text-gray-300"><span className="text-[#007BFF] font-bold">• 18:00</span> Latihan So...</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                     )}
                     {activeTab === 2 && (
                       <div className="w-full space-y-4">
                         <div className="bg-white dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm flex items-center justify-between">
                           <div>
                             <div className="font-bold text-[#343A40] dark:text-white">Calculus Midterm</div>
                             <div className="text-sm text-[#6c757d]">Due in 2 days</div>
                           </div>
                           <div className="bg-[#dc3545] text-white font-bold px-3 py-1 rounded-[4px]">98</div>
                         </div>
                         <div className="bg-white dark:bg-[#212529] p-4 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm flex items-center justify-between">
                           <div>
                             <div className="font-bold text-[#343A40] dark:text-white">History Essay</div>
                             <div className="text-sm text-[#6c757d]">Due in 5 days</div>
                           </div>
                           <div className="bg-[#FFC107] text-[#343A40] font-bold px-3 py-1 rounded-[4px]">75</div>
                         </div>
                       </div>
                     )}
                     {activeTab === 3 && (
                       <div className="w-full bg-[#F8F9FA] dark:bg-[#212529] p-6 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm relative text-left">
                         <div className="absolute left-8 top-6 bottom-6 w-1 bg-[#e2e8f0] dark:bg-[#343A40]"></div>
                         <div className="space-y-6 relative">
                           <div className="flex items-start gap-4">
                             <div className="w-4 h-4 rounded-[4px] bg-[#007BFF] mt-1 relative z-10 border-2 border-[#F8F9FA] dark:border-[#212529]"></div>
                             <div className="flex-1 bg-white dark:bg-[#343A40] p-3 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                               <div className="text-xs font-bold text-[#6c757d] mb-1">09:00 - 11:00</div>
                               <div className="font-bold text-[#343A40] dark:text-white">Deep Work: Calculus</div>
                             </div>
                           </div>
                           <div className="flex items-start gap-4">
                             <div className="w-4 h-4 rounded-[4px] bg-[#FFC107] mt-1 relative z-10 border-2 border-[#F8F9FA] dark:border-[#212529]"></div>
                             <div className="flex-1 bg-white dark:bg-[#343A40] p-3 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20]">
                               <div className="text-xs font-bold text-[#6c757d] mb-1">11:15 - 12:00</div>
                               <div className="font-bold text-[#343A40] dark:text-white">Review: History</div>
                             </div>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </TransitionPanel>
          </div>
        </div>
      </section>

      {/* 8. Benefits/Stats Section */}
      <section id="benefits" className="py-20 bg-[#F8F9FA] dark:bg-[#212529] border-y border-[#e2e8f0] dark:border-[#1a1d20]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <span className="text-[#007BFF] font-bold uppercase tracking-wider text-sm">{t.benefitsSection.sub}</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-8 text-[#343A40] dark:text-white">{t.benefitsSection.title}</h2>
              <div className="space-y-4">
                {t.benefitsSection.list.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-[#007BFF] shrink-0" />
                    <span className="font-semibold text-lg text-[#343A40] dark:text-[#F8F9FA]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2 w-full">
              <AnimatedGroup className="grid grid-cols-2 gap-6">
                {t.benefitsSection.stats.map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-[#343A40] p-8 rounded-[4px] border border-[#e2e8f0] dark:border-[#1a1d20] shadow-sm text-center">
                    <div className="text-4xl font-bold text-[#007BFF] mb-2">{stat.value}</div>
                    <div className="text-sm font-bold uppercase tracking-wider text-[#6c757d]">{stat.label}</div>
                  </div>
                ))}
              </AnimatedGroup>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-[#343A40]">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-[#343A40] dark:text-white">{t.faq.title}</h2>
          <Accordion 
            className="w-full space-y-4"
            items={t.faq.items.map(item => ({ title: item.q, content: item.a }))}
          />
        </div>
      </section>

      {/* 10. CTA Banner Section */}
      <section className="py-20 bg-[#007BFF] text-white">
        <div className="mx-auto max-w-[1280px] px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t.ctaSection.title}</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">{t.ctaSection.desc}</p>
          <div className="relative inline-block">
            <GlowEffect color="#007BFF">
              <button 
                onClick={() => { setAuthView("register"); setShowLoginModal(true); }}
                className="relative bg-white text-[#007BFF] font-bold px-8 py-4 rounded-[4px] text-lg hover:bg-[#F8F9FA] transition-colors w-full sm:w-auto z-10"
              >
                {t.ctaSection.cta}
              </button>
            </GlowEffect>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="bg-white dark:bg-[#212529] border-t border-[#e2e8f0] dark:border-[#1a1d20] py-8">
        <div className="mx-auto max-w-[1280px] px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoWithText size={24} />
            <span className="text-sm font-semibold text-[#6c757d] border-l border-[#e2e8f0] dark:border-[#343A40] pl-3">{t.footer.copy}</span>
          </div>
          <div className="flex items-center gap-6">
            {t.footer.links.map((link, idx) => (
              <a key={idx} href="#" className="text-sm font-semibold text-[#6c757d] hover:text-[#007BFF] transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
