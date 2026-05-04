import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Navbar
  marketplace: { en: 'Marketplace', vi: 'Thị trường' },
  resources: { en: 'Resources', vi: 'Tài nguyên' },
  network: { en: 'Network', vi: 'Mạng lưới' },
  searchDeals: { en: 'Search deals...', vi: 'Tìm kiếm thương vụ...' },
  listDeal: { en: 'List Deal', vi: 'Đăng thương vụ' },
  signIn: { en: 'Sign In', vi: 'Đăng nhập' },
  
  // Home
  heroBadge: { en: 'Institutional Grade M&A Marketplace', vi: 'Thị trường M&A cấp độ tổ chức' },
  heroTitle: { en: 'The Premier Platform', vi: 'Nền tảng hàng đầu' },
  heroSubtitle: { en: 'for Business Exchange', vi: 'để trao đổi doanh nghiệp' },
  heroDesc: { en: 'Securely list, discover, and acquire companies with our end-to-end M&A infrastructure. Trusted by 10k+ verified professionals.', vi: 'Niêm yết, khám phá và mua lại các công ty một cách an toàn với cơ sở hạ tầng M&A toàn diện. Được tin dùng bởi hơn 10.000 chuyên gia đã xác minh.' },
  searchPlaceholder: { en: 'Search deals, industries, or regions...', vi: 'Tìm kiếm thương vụ, ngành nghề hoặc khu vực...' },
  browseMarket: { en: 'Browse Marketplace', vi: 'Khám phá thị trường' },
  marketSilence: { en: 'Market Silence', vi: 'Thị trường tạm lắng' },
  marketSilenceDesc: { en: 'New institutional opportunities are processed daily. Check back shortly.', vi: 'Các cơ hội đầu tư mới được cập nhật hàng ngày. Vui lòng quay lại sau.' },
  
  // Profile
  editProfile: { en: 'Edit Profile', vi: 'Chỉnh sửa Hồ sơ' },
  profileUpdated: { en: 'Profile Updated', vi: 'Đã cập nhật Hồ sơ' },
  fullName: { en: 'Full Name', vi: 'Họ và tên' },
  saving: { en: 'Saving...', vi: 'Đang lưu...' },
  saveChanges: { en: 'Save Changes', vi: 'Lưu thay đổi' },
  unnamedProfessional: { en: 'Unnamed Professional', vi: 'Chuyên gia chưa tên' },
  
  // Metrics
  activeDealVol: { en: 'Active Deal Volume', vi: 'Tổng khối lượng thương vụ' },
  verifiedInvestors: { en: 'Verified Investors', vi: 'Nhà đầu tư đã xác minh' },
  dailyDealFlow: { en: 'Daily Deal Flow', vi: 'Thương vụ mới mỗi ngày' },
  avgCloseTime: { en: 'Avg Close Time', vi: 'Thời gian chốt trung bình' },
  
  // Recommended
  recommendedTitle: { en: 'Recommended Opportunities', vi: 'Cơ hội được đề xuất' },
  recommendedDesc: { en: 'AI-curated deals based on current market trends', vi: 'Các thương vụ được AI chọn lọc dựa trên xu hướng thị trường' },
  viewAll: { en: 'View All', vi: 'Xem tất cả' },
  details: { en: 'Details', vi: 'Chi tiết' },
  valuation: { en: 'Valuation', vi: 'Định giá' },
  revenue: { en: 'Revenue', vi: 'Doanh thu' },
  ebitda: { en: 'EBITDA', vi: 'Lợi nhuận gộp' },

  // Dashboard
  professionalWorkspace: { en: 'Professional Workspace', vi: 'Không gian làm việc Chuyên nghiệp' },
  portfolioOverview: { en: 'Portfolio overview for', vi: 'Tổng quan danh mục của' },
  createProposal: { en: 'Create Proposal', vi: 'Tạo Đề xuất' },
  activePipeline: { en: 'Active Pipeline', vi: 'Tiến trình Hoạt động' },
  networkReach: { en: 'Network Reach', vi: 'Phạm vi Mạng lưới' },
  assetValuation: { en: 'Asset Valuation', vi: 'Định giá Tài sản' },
  ndaCompletion: { en: 'NDA Completion', vi: 'Hoàn tất NDA' },
  portfolioLifecycle: { en: 'Portfolio Lifecycle', vi: 'Vòng đời Danh mục' },
  askingPrice: { en: 'Asking Price', vi: 'Giá yêu cầu' },
  updated: { en: 'Updated', vi: 'Cập nhật' },
  workspaceEmpty: { en: 'Workspace Empty', vi: 'Không gian trống' },
  workspaceEmptyDesc: { en: 'Initialize your deal pipeline to see analytics.', vi: 'Khởi tạo quy trình thương vụ của bạn để xem phân tích.' },
  
  // AI Matching
  aiIntelligence: { en: 'AI Intelligence Matching', vi: 'Kết nối Trí tuệ AI' },
  aiMatchingDesc: { en: "We've identified 4 high-confidence opportunities that align with your strategic thesis.", vi: "Chúng tôi đã xác định được 4 cơ hội tiềm năng cao phù hợp với định hướng chiến lược của bạn." },
  generateMatchingReport: { en: 'Generate Matching Report', vi: 'Tạo Báo cáo Kết nối' },
  
  // Marketing Assets
  marketingAssets: { en: 'Marketing Assets', vi: 'Tài sản Marketing' },
  bannerGenerator: { en: 'Banner Generator', vi: 'Tạo Banner Quảng bá' },
  marketingAssetsDesc: { en: 'Generate institutional-grade promotional materials for your deals.', vi: 'Tạo các tài liệu quảng bá chuyên nghiệp cho các thương vụ của bạn.' },
  
  // Activity
  recentActivity: { en: 'Recent Network Activity', vi: 'Hoạt động Mạng lưới Gần đây' },
  ndaSigned: { en: 'NDA Signed', vi: 'Đã ký NDA' },
  vdrRequested: { en: 'VDR Requested', vi: 'Yêu cầu VDR' },
  offerReceived: { en: 'Offer Received', vi: 'Đã nhận Đề nghị' },

  // Trends & Status
  upTrend: { en: 'Up 12%', vi: 'Tăng 12%' },
  verified: { en: 'Verified', vi: 'Đã xác minh' },
  newToday: { en: 'New today', vi: 'Mới hôm nay' },
  optimal: { en: 'Optimal', vi: 'Tối ưu' },
  listings: { en: 'Listings', vi: 'Niêm yết' },
  deals: { en: 'Deals', vi: 'Thương vụ' },
  thisWeek: { en: 'this week', vi: 'tuần này' },
  stable: { en: 'Stable', vi: 'Ổn định' },
  delete: { en: 'Delete', vi: 'Xóa' },
  confirm: { en: 'Confirm', vi: 'Xác nhận' },
  confirmDelete: { en: 'Are you sure you want to delete this deal permanently?', vi: 'Bạn có chắc chắn muốn xóa vĩnh viễn thương vụ này không?' },
  currencySymbol: { en: '$', vi: '₫' },
  deleteError: { en: 'Failed to delete deal. Please check your permissions.', vi: 'Xóa thương vụ thất bại. Vui lòng kiểm tra quyền hạn của bạn.' },
  fieldRequired: { en: 'This field is required', vi: 'Trường này là bắt buộc' },
  invalidAmount: { en: 'Please enter a valid amount', vi: 'Vui lòng nhập số tiền hợp lệ' },
  atLeastOneRevenue: { en: 'Please enter revenue for at least one year', vi: 'Vui lòng nhập doanh thu cho ít nhất một năm' },
  titleTooShort: { en: 'Title should be at least 10 characters', vi: 'Tiêu đề phải có ít nhất 10 ký tự' },
  descTooShort: { en: 'Description should be more detailed', vi: 'Mô tả cần chi tiết hơn' },
  archivingDeal: { en: 'Archiving Deal...', vi: 'Đang lưu trữ thương vụ...' },
  growth: { en: 'growth', vi: 'tăng trưởng' },
  ago: { en: 'ago', vi: 'trước' },
  hourShort: { en: 'h', vi: 'giờ' },
  yesterday: { en: 'Yesterday', vi: 'Hôm qua' },

  // Footer
  footerDesc: { 
    en: "The world's most trusted M&A ecosystem. Secure, verified, and AI-driven infrastructure for institutional capital.", 
    vi: "Hệ sinh thái M&A đáng tin cậy nhất thế giới. Cơ sở hạ tầng an toàn, đã xác minh và hỗ trợ bởi AI cho nguồn vốn tổ chức." 
  },
  platform: { en: 'Platform', vi: 'Nền tảng' },
  aiMatching: { en: 'AI Matching', vi: 'Kết nối AI' },
  vdrSecurity: { en: 'VDR Security', vi: 'Bảo mật VDR' },
  compliance: { en: 'Compliance', vi: 'Tuân thủ' },
  support: { en: 'Support', vi: 'Hỗ trợ' },
  privacyPolicy: { en: 'Privacy Policy', vi: 'Chính sách Bảo mật' },
  termsOfService: { en: 'Terms of Service', vi: 'Điều khoản Dịch vụ' },
  securityAudit: { en: 'Security Audit', vi: 'Kiểm toán Bảo mật' },
  contactAdvisor: { en: 'Contact Advisor', vi: 'Liên hệ Cố vấn' },
  footerCopyright: { en: '© 2026 Nexus M&A Enterprise. Singapore • Global.', vi: '© 2026 Nexus M&A Enterprise. Singapore • Toàn cầu.' },
  networkStatus: { en: 'Network Status', vi: 'Trạng thái mạng' },
  operational: { en: 'Operational', vi: 'Hoạt động bình thường' },

  // Create Deal Page
  institutionalListing: { en: 'Institutional Listing', vi: 'Niêm yết Hình thức Tổ chức' },
  createProposalDesc: { en: 'Create a high-fidelity M&A proposal', vi: 'Tạo hồ sơ M&A chuyên nghiệp' },
  identity: { en: 'Identity', vi: 'Danh tính' },
  financials: { en: 'Financials', vi: 'Tài chính' },
  strategyStep: { en: 'Strategy', vi: 'Chiến lược' },
  deployStep: { en: 'Deploy', vi: 'Triển khai' },
  listingTitle: { en: 'Professional Listing Title', vi: 'Tiêu đề Niêm yết Chuyên nghiệp' },
  listingTitlePlaceholder: { en: 'Ex: Project SolarFlare • Enterprise SaaS', vi: 'VD: Dự án SolarFlare • Doanh nghiệp SaaS' },
  industryCluster: { en: 'Industry Cluster', vi: 'Nhóm Ngành nghề' },
  entityCountry: { en: 'Entity Country', vi: 'Quốc gia Pháp nhân' },
  hqLocation: { en: 'HQ Location', vi: 'Địa điểm Trụ sở' },
  legalName: { en: 'Legal Entity Name', vi: 'Tên Pháp nhân Đầy đủ' },
  legalNamePlaceholder: { en: 'Full Registered Name', vi: 'Tên đăng ký đầy đủ' },
  taxIdLabel: { en: 'Tax ID / Registration', vi: 'Mã số Thuế / Đăng ký' },
  taxIdPlaceholder: { en: 'Business License #', vi: 'Số Giấy phép Kinh doanh' },
  transactionThesis: { en: 'Transaction thesis', vi: 'Định hướng Giao dịch' },
  acquisition100: { en: '100% Acquisition', vi: 'Mua lại 100%' },
  equityStake: { en: 'Equity Stake', vi: 'Chuyển nhượng Cổ phần' },
  fundraisingStep: { en: 'Growth Funding', vi: 'Huy động Vốn' },
  annualRevenueHistory: { en: 'Annual Revenue History (USD)', vi: 'Lịch sử Doanh thu (VND)' },
  yearLabel: { en: 'Year', vi: 'Năm' },
  targetValuation: { en: 'Target Evaluation ($)', vi: 'Định giá Mục tiêu (₫)' },
  expectedValue: { en: 'Expected Value', vi: 'Giá trị Mong đợi' },
  equityHandover: { en: 'Equity Handover (%)', vi: 'Chuyển giao Cổ phần (%)' },
  adjustedEbitda: { en: 'Adjusted EBITDA ($)', vi: 'EBITDA Điều chỉnh (₫)' },
  staffCount: { en: 'Staff Count', vi: 'Số lượng Nhân sự' },
  investmentThesis: { en: 'Investment Thesis & Reason for Transaction', vi: 'Định hướng Đầu tư & Lý do Giao dịch' },
  investmentThesisPlaceholder: { en: 'Explain the professional motivation behind this deal...', vi: 'Giải thích động lực chuyên môn đằng sau thương vụ này...' },
  growthRoadmap: { en: 'Expansion Roadmap / Growth Lever', vi: 'Lộ trình Mở rộng / Đòn bẩy Tăng trưởng' },
  growthRoadmapPlaceholder: { en: 'What are the immediate value drivers?', vi: 'Các nhân tố tạo giá trị tức thời là gì?' },
  aiAudit: { en: 'AI Intelligence Audit', vi: 'Kiểm toán Trí tuệ AI' },
  regenerateAnalysis: { en: 'Regenerate Analysis', vi: 'Tạo lại Phân tích' },
  generateDealSummaryBtn: { en: 'Generate Deal Summary', vi: 'Tạo Tóm tắt Thương vụ' },
  institutionalComplianceLabel: { en: 'Institutional Compliance', vi: 'Tuân thủ Quy định Tổ chức' },
  complianceWarningText: { en: 'By publishing, you confirm financial accuracy. False disclosure results in platform suspension.', vi: 'Bằng cách niêm yết, bạn xác nhận tính chính xác của tài chính. Thông tin sai lệch sẽ dẫn đến việc đình chỉ tài khoản.' },
  previousBtn: { en: 'Previous', vi: 'Quay lại' },
  continueBtn: { en: 'Continue', vi: 'Tiếp tục' },
  deployToMarketBtn: { en: 'Deploy to Market', vi: 'Đưa lên Thị trường' },

  // Industry Clusters
  techIndustry: { en: 'Technology', vi: 'Công nghệ' },
  consumerIndustry: { en: 'Consumer / Retail', vi: 'Tiêu dùng / Bán lẻ' },
  manufacturingIndustry: { en: 'Manufacturing', vi: 'Sản xuất' },
  logisticsIndustry: { en: 'Logistics', vi: 'Logistics' },
  healthcareIndustry: { en: 'Healthcare', vi: 'Y tế' },
  financeIndustry: { en: 'Finance', vi: 'Tài chính' },
  realEstateIndustry: { en: 'Real Estate', vi: 'Bất động sản' },
  educationIndustry: { en: 'Education', vi: 'Giáo dục' },
  energyIndustry: { en: 'Energy', vi: 'Năng lượng' },
  agricultureIndustry: { en: 'Agriculture', vi: 'Nông nghiệp' },
  mediaIndustry: { en: 'Media & Entertainment', vi: 'Truyền thông & Giải trí' },
  all: { en: 'All', vi: 'Tất cả' },

  // Deal Creation Form fields
  foundedYear: { en: 'Founded Year', vi: 'Năm Thành lập' },
  productsServices: { en: 'Products & Services', vi: 'Sản phẩm / Dịch vụ' },
  targetMarket: { en: 'Target Market', vi: 'Thị trường Mục tiêu' },
  founderEquity: { en: 'Founder Equity (%)', vi: 'Cổ phần Sáng lập viên (%)' },
  investorEquity: { en: 'Investor Equity (%)', vi: 'Cổ phần Nhà đầu tư (%)' },
  esopEquity: { en: 'ESOP Equity (%)', vi: 'Cổ phần ESOP (%)' },
  netProfit: { en: 'Net Profit ($)', vi: 'Lợi nhuận ròng (₫)' },
  growthRate: { en: 'Growth Rate (%)', vi: 'Tốc độ Tăng trưởng (%)' },
  verifiedListing: { en: 'Verified Listing', vi: 'Niêm yết đã xác minh' },
  founded: { en: 'Founded', vi: 'Thành lập năm' },
  equityOfferedLabel: { en: '% Equity Offered', vi: '% Cổ phần Chuyển nhượng' },
  annualRevenue: { en: 'Annual Revenue', vi: 'Doanh thu Hàng năm' },
  growthLabel: { en: 'Growth', vi: 'Tăng trưởng' },
  margin: { en: 'Margin', vi: 'Biên lợi nhuận' },
  fullTimeStaff: { en: 'Full-time staff', vi: 'Nhân sự toàn thời gian' },
  verifiedBuyersRequested: { en: 'Verified Buyers have requested access to the Virtual Data Room this month.', vi: 'Bên mua đã xác minh yêu cầu quyền truy cập vào VDR trong tháng này.' },
  overviewTab: { en: 'Overview', vi: 'Tổng quan' },
  executiveSummary: { en: 'Executive Summary', vi: 'Tóm tắt Điều hành' },
  idealBuyerProfile: { en: 'Ideal Buyer Profile', vi: 'Hồ sơ Bên mua Lý tưởng' },
  revenuePerformance: { en: 'Revenue Performance (3yr)', vi: 'Hiệu suất Doanh thu (3 năm)' },
  synergyAnalysis: { en: 'AI Synergy Analysis', vi: 'Phân tích Cộng hưởng AI' },
  synergyDescDefault: { en: 'Based on your acquisition thesis and historical investment patterns, this deal presents a 98.2% strategic match.', vi: 'Dựa trên định hướng thâu tóm và lịch sử đầu tư, thương vụ này có mức độ phù hợp chiến lược 98.2%.' },
  keySynergies: { en: 'Key Synergies', vi: 'Cộng hưởng Chính' },
  roiEstimation: { en: 'ROI Estimation', vi: 'Ước tính ROI' },
  projectedMultiple: { en: 'Projected Multiple', vi: 'Hệ số Dự kiến' },
  investmentActions: { en: 'Investment Actions', vi: 'Hành động Đầu tư' },
  submitOfferBtn: { en: 'Submit Acquisition Offer', vi: 'Gửi Đề nghị Mua lại' },
  offerSentBtn: { en: 'Offer Sent', vi: 'Đã gửi Đề nghị' },
  unlockVdr: { en: 'Unlock VDR', vi: 'Mở khóa VDR' },
  downloadTeaser: { en: 'Download Teaser (PDF)', vi: 'Tải Teaser (PDF)' },
  dealManager: { en: 'Deal Manager', vi: 'Quản lý Thương vụ' },
  principalAdvisor: { en: 'Principal M&A Advisor', vi: 'Cố vấn M&A Chính' },
  confidentialityGuard: { en: 'Confidentiality Guard', vi: 'Bảo vệ Bảo mật' },
  confidentialityDesc: { en: 'Detailed financial data, legal documents, and entity names are protected by an active NDA. Digital signatures verify identity.', vi: 'Dữ liệu tài chính chi tiết, tài liệu pháp lý và tên pháp nhân được bảo vệ bởi NDA. Chữ ký số dùng để xác minh danh tính.' },
  
  // Synergy Analysis
  techOverlap: { en: 'Technology Stack Overlap', vi: 'Chồng lấp Nền tảng Công nghệ' },
  marketExpansion: { en: 'Market Expansion', vi: 'Mở rộng Thị trường' },
  customerBaseIntegration: { en: 'Customer Base Integration', vi: 'Tích hợp Cơ sở Khách hàng' },
  operationalEfficiency: { en: 'Operational Efficiency', vi: 'Hiệu quả Vận hành' },

  // Marketing Center Page
  marketingCenterTitle: { en: 'Marketing Center', vi: 'Trung tâm Marketing' },
  genAssetsDesc: { en: 'Generate institutional-grade promotional assets for your listing.', vi: 'Tạo các tài sản quảng bá tiêu chuẩn quốc tế cho niêm yết của bạn.' },
  aiAutoCopy: { en: 'AI Auto-Copy', vi: 'Tự động soạn thảo AI' },
  assetPurposeLabel: { en: 'Asset Purpose', vi: 'Mục đích Tài sản' },
  librarySamplesLabel: { en: 'Library Samples', vi: 'Mẫu Thư viện' },
  livePreview: { en: 'Live Dynamic Preview', vi: 'Xem trước Trực tiếp' },
  yourHeadlineHere: { en: 'Your Institutional Headline Here', vi: 'Tiêu đề Chuyên nghiệp của bạn' },
  applyForAccess: { en: 'Apply for Access', vi: 'Đăng ký Truy cập' },
  viewOpportunityBtn: { en: 'View Opportunity', vi: 'Xem Cơ hội' },
  downloadHighResBtn: { en: 'Download High-Res', vi: 'Tải về Bản cao cấp' },
  exportedReady: { en: 'Exported Ready', vi: 'Đã Sẵn sàng' },
  assetConfiguration: { en: 'Asset Configuration', vi: 'Cấu hình Tài sản' },
  headlineText: { en: 'Headline Text', vi: 'Văn bản Tiêu đề' },
  describeOpportunityPlaceholder: { en: 'Describe the opportunity...', vi: 'Mô tả cơ hội...' },
  aestheticOverrides: { en: 'Aesthetic Overrides', vi: 'Tùy chỉnh Thẩm mỹ' },
  proTipShortUrl: { en: 'Pro Tip: Short URLs increase click-through rates by 24% for institutional assets.', vi: 'Mẹo: URL ngắn giúp tăng tỉ lệ nhấp chuột thêm 24% cho các tài sản chuyên nghiệp.' },
  promotion: { en: 'Promotion', vi: 'Quảng bá' },
  announcement: { en: 'Announcement', vi: 'Thông báo' },
  leadGeneration: { en: 'Lead Generation', vi: 'Tìm kiếm Cơ hội' },
  matching: { en: 'Matching', vi: 'Kết nối' },

  // Profile Setup / Onboarding
  onboarding: { en: 'Onboarding', vi: 'Khởi tạo' },
  onboardingDesc: { en: 'Configure your institutional identity and role within the network.', vi: 'Thiết lập danh tính và vai trò của bạn trong mạng lưới.' },
  networkRole: { en: 'Network Role', vi: 'Vai trò Mạng lưới' },
  investorAcquirer: { en: 'Investor / Acquirer', vi: 'Nhà đầu tư / Bên mua' },
  investorAcquirerDesc: { en: 'Seeking strategic opportunities or controlling stakes.', vi: 'Tìm kiếm các cơ hội chiến lược hoặc thâu tóm cổ phần.' },
  ownerPrincipal: { en: 'Owner / Principal', vi: 'Chủ sở hữu / Bên bán' },
  ownerPrincipalDesc: { en: 'Divesting assets or seeking late-stage growth capital.', vi: 'Thoái vốn tài sản hoặc tìm kiếm nguồn vốn tăng trưởng.' },
  strategicAdvisor: { en: 'Strategic Advisor', vi: 'Cố vấn Chiến lược' },
  strategicAdvisorDesc: { en: 'M&A, legal, or financial professional services.', vi: 'Dịch vụ chuyên môn về M&A, pháp lý hoặc tài chính.' },
  jurisdiction: { en: 'Jurisdiction', vi: 'Khu vực hoạt động' },
  completeSetup: { en: 'Enter Nexus M&A Workspace', vi: 'Vào Không gian Nexus M&A' },
  finalizingProfile: { en: 'Finalizing Profile...', vi: 'Đang hoàn tất hồ sơ...' },

  // Login
  loginTitleTop: { en: 'Institutional', vi: 'Niêm yết' },
  loginTitleBottom: { en: 'Infrastructure', vi: 'Cơ sở hạ tầng Tổ chức' },
  institutionalInfra: { en: 'Institutional Infrastructure', vi: 'Cơ sở hạ tầng Tổ chức' },
  platformOneLiner: { en: 'Precision-engineered M&A platform for the next generation of global capital markets.', vi: 'Nền tảng M&A được thiết kế chính xác cho thế hệ thị trường vốn toàn cầu tiếp theo.' },
  vdrFeatureTitle: { en: 'Virtual Data Rooms', vi: 'Phòng dữ liệu Ảo' },
  vdrFeatureDesc: { en: 'Enterprise-grade encryption with granular access.', vi: 'Mã hóa cấp doanh nghiệp với quyền truy cập chi tiết.' },
  globalDealFlowTitle: { en: 'Global Deal Flow', vi: 'Dòng thương vụ Toàn cầu' },
  globalDealFlowDesc: { en: 'Curated opportunities across 40+ strategic sectors.', vi: 'Các cơ hội được chọn lọc trong hơn 40 lĩnh vực chiến lược.' },
  strategicGuardTitle: { en: 'Strategic Guard', vi: 'Bảo vệ Chiến lược' },
  strategicGuardDesc: { en: 'Integrated NDA and verified identity systems.', vi: 'Tích hợp hệ thống NDA và xác minh danh tính.' },
  signInToNexus: { en: 'Sign in to Nexus', vi: 'Đăng nhập vào Nexus' },
  securePortal: { en: 'Secure portal for verified institutional participants.', vi: 'Cổng thông tin an toàn cho các thành viên tổ chức đã xác minh.' },
  continueWithGoogle: { en: 'Continue with Google', vi: 'Tiếp tục với Google' },
  standardSSO: { en: 'Standard SSO', vi: 'SSO Tiêu chuẩn' },
  institutionalLogin: { en: 'Institutional Login', vi: 'Đăng nhập Tổ chức' },
  auditNote: { en: 'Authorized Use Only. Activities are audited for compliance.', vi: 'Chỉ dành cho Người dùng được Ủy quyền. Các hoạt động đều được kiểm toán tuân thủ.' },

  // Dashboard & Activity
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tSector: (sector: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  const tSector = (sector: string) => {
    const map: { [key: string]: string } = {
      'Technology': 'techIndustry',
      'Consumer / Retail': 'consumerIndustry',
      'Manufacturing': 'manufacturingIndustry',
      'Logistics': 'logisticsIndustry',
      'Healthcare': 'healthcareIndustry',
      'Finance': 'financeIndustry'
    };
    const key = map[sector];
    return key ? t(key) : sector;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tSector }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
