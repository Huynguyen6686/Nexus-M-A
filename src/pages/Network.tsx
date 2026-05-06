import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Handshake,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { canCreateDeal } from '../lib/rbac';

export default function Network() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const vi = language === 'vi';

  const lanes = vi ? [
    {
      title: 'Bên mua',
      desc: 'Tìm thương vụ phù hợp, gửi đề nghị mua lại và yêu cầu mở VDR.',
      action: 'Khám phá thị trường',
      href: '/',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Bên bán',
      desc: 'Đăng thương vụ, chuẩn hóa hồ sơ và theo dõi tiến trình duyệt.',
      action: 'Đăng thương vụ',
      href: '/deals/new',
      icon: Building2,
    },
    {
      title: 'Cố vấn',
      desc: 'Hỗ trợ giao dịch, chuẩn bị tài liệu và kết nối các bên phù hợp.',
      action: 'Tạo tài sản marketing',
      href: '/marketing',
      icon: ShieldCheck,
    },
  ] : [
    {
      title: 'Buyers',
      desc: 'Discover matching deals, submit acquisition offers, and request VDR access.',
      action: 'Browse marketplace',
      href: '/',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Sellers',
      desc: 'List deals, standardize profiles, and track review progress.',
      action: 'List a deal',
      href: '/deals/new',
      icon: Building2,
    },
    {
      title: 'Advisors',
      desc: 'Support transactions, prepare materials, and connect qualified parties.',
      action: 'Create marketing assets',
      href: '/marketing',
      icon: ShieldCheck,
    },
  ];

  const operatingFlow = vi ? [
    'Người dùng đăng nhập và chọn vai trò mạng lưới nếu là tài khoản mới.',
    'Admin kiểm tra vai trò, KYC và quyền truy cập dữ liệu.',
    'Bên mua, bên bán và cố vấn tương tác theo đúng quyền đã được phân tách.',
  ] : [
    'Users sign in and choose a network role only when the account is new.',
    'Admin reviews roles, KYC, and data access permissions.',
    'Buyers, sellers, and advisors interact through separated permissions.',
  ];

  const primaryHref = !user ? '/login' : canCreateDeal(profile) ? '/deals/new' : '/';
  const primaryLabel = !user
    ? (vi ? 'Đăng nhập để tham gia' : 'Sign in to join')
    : canCreateDeal(profile)
      ? (vi ? 'Đăng thương vụ' : 'List a deal')
      : (vi ? 'Khám phá thị trường' : 'Browse marketplace');

  return (
    <div className="space-y-12 pb-24">
      <section className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-3xl space-y-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold tracking-wider text-blue-700">
            <UsersRound className="h-3.5 w-3.5" />
            {vi ? 'Mạng lưới giao dịch' : 'Transaction network'}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            {vi ? 'Kết nối đúng vai trò trong hệ sinh thái M&A' : 'Connect through clear M&A roles'}
          </h1>
          <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-500">
            {vi
              ? 'Mạng lưới giúp tách quyền giữa bên mua, bên bán, cố vấn và admin để mỗi người chỉ nhìn thấy chức năng phù hợp.'
              : 'The network separates buyer, seller, advisor, and admin permissions so every participant sees the right workflows.'}
          </p>
          <Link to={primaryHref} className="professional-btn inline-flex h-12 items-center gap-2 px-6">
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {lanes.map((lane, index) => (
          <motion.div
            key={lane.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/40"
          >
            <lane.icon className="mb-6 h-7 w-7 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-950">{lane.title}</h2>
            <p className="mt-2 min-h-[48px] text-sm font-medium leading-relaxed text-slate-500">{lane.desc}</p>
            <Link to={lane.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600">
              {lane.action}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-10 border-y border-slate-200 py-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Handshake className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-950">
            {vi ? 'Cách mạng lưới vận hành' : 'How the network operates'}
          </h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            {vi
              ? 'Vai trò mạng lưới không chỉ là nhãn hiển thị. Nó quyết định quyền đăng thương vụ, gửi đề nghị, duyệt KYC và quản trị dữ liệu.'
              : 'Network role is more than a label. It controls listing, offer submission, KYC review, and data administration.'}
          </p>
        </div>
        <div className="space-y-4">
          {operatingFlow.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + index * 0.05 }}
              className="flex gap-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                {index + 1}
              </div>
              <p className="pt-1 text-sm font-semibold leading-relaxed text-slate-700">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl bg-slate-900 p-8 text-white md:grid-cols-3">
        {[
          { label: vi ? 'Vai trò tách biệt' : 'Separated roles', value: '4', icon: BadgeCheck },
          { label: vi ? 'Luồng duyệt admin' : 'Admin review flow', value: 'KYC', icon: ShieldCheck },
          { label: vi ? 'Truy cập theo quyền' : 'Permissioned access', value: 'VDR', icon: UsersRound },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-4">
            <item.icon className="h-6 w-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs font-bold tracking-wider text-slate-400">{item.label}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
