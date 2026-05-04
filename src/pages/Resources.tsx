import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileCheck2,
  FileText,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Resources() {
  const { language } = useLanguage();
  const vi = language === 'vi';

  const guides = vi ? [
    {
      title: 'Chuẩn bị hồ sơ niêm yết',
      desc: 'Các thông tin tối thiểu cần có trước khi đưa thương vụ lên thị trường.',
      items: ['Pháp nhân và mã số thuế', 'Doanh thu 3 năm', 'Luận điểm giao dịch'],
      icon: FileText,
    },
    {
      title: 'Kiểm tra KYC và phân quyền',
      desc: 'Quy trình xác minh người mua, người bán, cố vấn và quản trị viên.',
      items: ['Vai trò mạng lưới', 'Trạng thái KYC', 'Quyền truy cập VDR'],
      icon: ShieldCheck,
    },
    {
      title: 'Bảo mật VDR và NDA',
      desc: 'Những nguyên tắc trước khi chia sẻ tài liệu nhạy cảm cho bên mua.',
      items: ['NDA', 'Tài liệu tài chính', 'Lịch sử truy cập'],
      icon: LockKeyhole,
    },
  ] : [
    {
      title: 'Listing preparation',
      desc: 'Minimum information required before bringing a deal to market.',
      items: ['Legal entity and tax ID', '3-year revenue', 'Transaction thesis'],
      icon: FileText,
    },
    {
      title: 'KYC and role control',
      desc: 'Verification flow for buyers, sellers, advisors, and admins.',
      items: ['Network role', 'KYC status', 'VDR access'],
      icon: ShieldCheck,
    },
    {
      title: 'VDR and NDA security',
      desc: 'Rules before sharing sensitive documents with buyers.',
      items: ['NDA', 'Financial documents', 'Access history'],
      icon: LockKeyhole,
    },
  ];

  const checklist = vi ? [
    'Tiêu đề thương vụ rõ ràng, không quá dài.',
    'Doanh thu, EBITDA và định giá đã được nhập trong giới hạn hợp lệ.',
    'Tóm tắt điều hành và lộ trình tăng trưởng có xuống dòng dễ đọc.',
    'Trạng thái thương vụ được admin duyệt trước khi xuất bản.',
    'Tài khoản có đúng vai trò: bên mua, bên bán, cố vấn hoặc quản trị viên.',
  ] : [
    'Deal title is clear and not too long.',
    'Revenue, EBITDA, and valuation are entered within valid limits.',
    'Executive summary and growth roadmap wrap cleanly.',
    'Deal status is reviewed by admin before publishing.',
    'Account has the correct buyer, seller, advisor, or admin role.',
  ];

  return (
    <div className="space-y-12 pb-24">
      <section className="border-b border-slate-200 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-700">
            <BookOpenCheck className="h-3.5 w-3.5" />
            {vi ? 'Trung tâm tài nguyên' : 'Resource center'}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {vi ? 'Tài liệu vận hành M&A' : 'M&A operating resources'}
          </h1>
          <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-500">
            {vi
              ? 'Tập hợp checklist, quy trình và chuẩn dữ liệu giúp đăng thương vụ, kiểm tra KYC và bảo vệ tài liệu nhạy cảm.'
              : 'Checklists, workflows, and data standards for listing deals, reviewing KYC, and protecting sensitive documents.'}
          </p>
        </motion.div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {guides.map((guide, index) => (
          <motion.article
            key={guide.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <guide.icon className="mb-6 h-7 w-7 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-950">{guide.title}</h2>
            <p className="mt-2 min-h-[48px] text-sm font-medium leading-relaxed text-slate-500">{guide.desc}</p>
            <div className="mt-6 space-y-3">
              {guide.items.map(item => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {item}
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-10 border-y border-slate-200 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-950">
            {vi ? 'Checklist trước khi xuất bản' : 'Pre-publish checklist'}
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            {vi
              ? 'Dùng phần này để rà lại thương vụ trước khi gửi admin duyệt hoặc đưa lên thị trường.'
              : 'Use this list before submitting a deal for admin review or publishing it to the marketplace.'}
          </p>
        </div>
        <div className="space-y-3">
          {checklist.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + index * 0.04 }}
              className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <span className="text-blue-600">{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-slate-900 p-8 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{vi ? 'Sẵn sàng đăng thương vụ?' : 'Ready to list a deal?'}</h2>
          <p className="mt-2 text-sm font-medium text-slate-300">
            {vi ? 'Bắt đầu từ hồ sơ chuẩn để giảm lỗi khi admin duyệt.' : 'Start with a clean profile to reduce admin review issues.'}
          </p>
        </div>
        <Link to="/deals/new" className="professional-btn inline-flex h-12 items-center justify-center gap-2 bg-blue-600 px-6 hover:bg-blue-700">
          {vi ? 'Đăng thương vụ' : 'List deal'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
