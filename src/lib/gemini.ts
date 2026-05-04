function compactCurrency(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 'chưa công bố';
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function generateLocalDealSummary(dealData: any) {
  const title = dealData?.title || 'Thương vụ này';
  const industry = dealData?.industry || 'ngành đã chọn';
  const revenue = dealData?.financials?.revenue || [];
  const latestRevenue = Number(revenue[revenue.length - 1]) || 0;
  const strategy = dealData?.strategy?.reasonForSale || 'có định hướng giao dịch rõ ràng';
  const roadmap = dealData?.strategy?.futurePlans || 'có dư địa mở rộng sau giao dịch';

  return `${title} là cơ hội M&A trong lĩnh vực ${industry}, với doanh thu gần nhất khoảng ${compactCurrency(latestRevenue)}. ${strategy} Điểm hấp dẫn chính nằm ở khả năng mở rộng quy mô, tối ưu vận hành và khai thác lộ trình tăng trưởng: ${roadmap}`;
}

export async function generateDealSummary(dealData: any) {
  return generateLocalDealSummary(dealData);
}

export async function calculateMatchScore(investorProfile: any, dealData: any) {
  const interests = investorProfile?.interests || [];
  const dealIndustry = dealData?.industry || '';
  const score = interests.includes(dealIndustry) ? 86 : 64;

  return {
    score,
    explanation: interests.includes(dealIndustry)
      ? 'Nhà đầu tư có khẩu vị phù hợp với ngành của thương vụ.'
      : 'Mức phù hợp trung bình, cần thêm dữ liệu về khẩu vị đầu tư.',
  };
}
