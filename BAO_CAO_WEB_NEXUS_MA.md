# Báo cáo website Nexus M&A

## 1. Thông tin chung

**Tên website:** Nexus M&A  
**Đường dẫn triển khai:** https://nexusn4.vercel.app  
**Loại hệ thống:** Nền tảng marketplace cho hoạt động mua bán, sáp nhập doanh nghiệp và gọi vốn.  
**Đối tượng sử dụng:** Chủ doanh nghiệp, nhà đầu tư, bên mua chiến lược, cố vấn M&A và các tổ chức tài chính.

Nexus M&A được xây dựng như một nền tảng số hỗ trợ đăng tải thương vụ, tìm kiếm cơ hội đầu tư, quản lý hồ sơ doanh nghiệp, xem thông tin tài chính và tạo tài sản marketing cho thương vụ. Website hướng tới trải nghiệm chuyên nghiệp, bảo mật và phù hợp với bối cảnh giao dịch M&A.

## 2. Mục tiêu của website

Website được thiết kế nhằm giải quyết các nhu cầu chính trong quá trình kết nối M&A:

- Giúp bên bán đăng tải thông tin doanh nghiệp và thương vụ một cách có cấu trúc.
- Giúp nhà đầu tư xem danh sách cơ hội đang được công bố.
- Hỗ trợ trình bày dữ liệu tài chính, định giá, tăng trưởng và lý do giao dịch.
- Cung cấp khu vực quản lý riêng cho người dùng sau khi đăng nhập.
- Tích hợp AI để tạo tóm tắt thương vụ, hỗ trợ phần mô tả chuyên nghiệp.
- Tạo tài sản marketing phục vụ quảng bá thương vụ.

## 3. Công nghệ sử dụng

Website được xây dựng theo mô hình frontend hiện đại:

- **React 19:** Xây dựng giao diện theo component.
- **TypeScript:** Tăng độ an toàn kiểu dữ liệu và giảm lỗi trong quá trình phát triển.
- **Vite:** Công cụ build nhanh cho ứng dụng React.
- **React Router DOM:** Điều hướng giữa các trang như trang chủ, đăng nhập, dashboard, tạo thương vụ và chi tiết thương vụ.
- **Tailwind CSS:** Xây dựng giao diện responsive, nhất quán và dễ tùy chỉnh.
- **Firebase Authentication:** Đăng nhập bằng Google.
- **Cloud Firestore:** Lưu trữ dữ liệu người dùng, công ty, thương vụ, tài liệu và đề nghị mua.
- **Google GenAI:** Hỗ trợ tạo tóm tắt thương vụ bằng AI.
- **Vercel:** Triển khai website production.

## 4. Cấu trúc chức năng chính

### 4.1. Trang chủ Marketplace

Trang chủ hiển thị vai trò như một sàn cơ hội M&A. Người dùng có thể xem phần giới thiệu nền tảng, các chỉ số tổng quan và danh sách thương vụ đã công bố.

Các thành phần chính:

- Hero giới thiệu nền tảng.
- Thanh tìm kiếm thương vụ, ngành nghề hoặc khu vực.
- Các chỉ số tổng quan như khối lượng thương vụ, nhà đầu tư đã xác minh, số thương vụ mới và thời gian chốt trung bình.
- Khu vực “Cơ hội được đề xuất”.
- Danh sách thương vụ công khai với ngành nghề, doanh thu, EBITDA, tăng trưởng và định giá.

### 4.2. Đăng nhập

Website sử dụng Google Sign-In thông qua Firebase Authentication. Sau khi đăng nhập, người dùng được chuyển đến dashboard hoặc trang thiết lập hồ sơ nếu chưa có profile.

Luồng đăng nhập:

1. Người dùng bấm đăng nhập.
2. Firebase mở popup đăng nhập Google.
3. Hệ thống xác thực tài khoản.
4. Website kiểm tra hồ sơ người dùng trong Firestore.
5. Nếu chưa có hồ sơ, chuyển đến trang thiết lập profile.

### 4.3. Thiết lập hồ sơ

Trang thiết lập hồ sơ dùng để xác định vai trò người dùng trong hệ thống:

- Nhà đầu tư hoặc bên mua.
- Chủ doanh nghiệp hoặc bên bán.
- Cố vấn chiến lược.

Hồ sơ bao gồm thông tin cơ bản như tên, email, quốc gia, loại người dùng và trạng thái KYC.

### 4.4. Dashboard

Dashboard là khu vực làm việc riêng cho người dùng đã đăng nhập. Trang này hiển thị danh sách thương vụ của người dùng, trạng thái danh mục và các chỉ số hoạt động.

Các chức năng chính:

- Xem danh sách thương vụ đã tạo.
- Truy cập nhanh vào trang tạo thương vụ mới.
- Xóa thương vụ.
- Xem tổng quan pipeline.
- Truy cập trung tâm marketing.
- Xem các chỉ số như số listing, phạm vi mạng lưới, định giá tài sản và tiến độ NDA.

### 4.5. Tạo thương vụ

Trang tạo thương vụ là một form nhiều bước, giúp bên bán nhập dữ liệu có cấu trúc.

Các nhóm thông tin:

- **Danh tính doanh nghiệp:** Tên thương vụ, ngành nghề, quốc gia, pháp nhân, mã đăng ký, năm thành lập.
- **Thông tin giao dịch:** Loại thương vụ gồm mua lại 100%, chuyển nhượng cổ phần hoặc gọi vốn.
- **Tài chính:** Doanh thu 3 năm, EBITDA, lợi nhuận ròng, tốc độ tăng trưởng, định giá mục tiêu.
- **Chiến lược:** Lý do bán/gọi vốn và kế hoạch tăng trưởng.
- **AI audit:** Tạo tóm tắt thương vụ bằng AI.
- **Triển khai:** Lưu công ty và thương vụ lên Firestore, trạng thái mặc định là `published`.

### 4.6. Chi tiết thương vụ

Trang chi tiết thương vụ cung cấp thông tin chuyên sâu cho từng cơ hội.

Nội dung chính:

- Tên thương vụ, ngành nghề, vị trí, năm thành lập.
- Giá chào bán, tỷ lệ cổ phần, doanh thu, EBITDA và số nhân sự.
- Tổng quan điều hành.
- Lộ trình tăng trưởng.
- Hồ sơ bên mua lý tưởng.
- Biểu đồ doanh thu 3 năm.
- Phân tích AI synergy.
- Nút gửi đề nghị mua.
- Khu vực mở khóa VDR/NDA mô phỏng.

### 4.7. Trung tâm Marketing

Marketing Center hỗ trợ tạo banner hoặc tài sản quảng bá cho thương vụ.

Chức năng chính:

- Chọn mẫu banner theo ngành.
- Lọc theo mục đích như quảng bá, thông báo hoặc tìm kiếm lead.
- Tùy chỉnh headline.
- Xem preview trực tiếp.
- Mô phỏng tải bản chất lượng cao.

## 5. Mô hình dữ liệu

Website sử dụng các nhóm dữ liệu chính:

### 5.1. UserProfile

Lưu thông tin người dùng:

- UID
- Email
- Tên hiển thị
- Ảnh đại diện
- Vai trò: buyer, seller, advisor hoặc admin
- Quốc gia
- Trạng thái KYC
- Ngày tạo và cập nhật

### 5.2. Company

Lưu thông tin doanh nghiệp:

- Tên pháp lý
- Mã số đăng ký hoặc mã thuế
- Quốc gia
- Năm thành lập
- Ngành nghề
- Sản phẩm/dịch vụ
- Thị trường mục tiêu
- Cấu trúc sở hữu

### 5.3. Deal

Lưu thông tin thương vụ:

- Người bán
- Công ty liên quan
- Tiêu đề thương vụ
- Ngành nghề
- Địa điểm
- Loại giao dịch
- Trạng thái
- Doanh thu, EBITDA, lợi nhuận, tăng trưởng
- Định giá và tỷ lệ cổ phần
- Lý do giao dịch và kế hoạch tương lai
- Tóm tắt AI

### 5.4. Offer

Lưu đề nghị mua:

- ID thương vụ
- ID người mua
- Số tiền đề nghị
- Tỷ lệ cổ phần
- Trạng thái đề nghị
- Thời gian tạo

## 6. Bảo mật và phân quyền

Website đã có các lớp bảo mật cơ bản:

- Đăng nhập bằng Firebase Authentication.
- Route bảo vệ cho dashboard, profile, tạo thương vụ và marketing center.
- Người chưa đăng nhập sẽ được chuyển đến trang login.
- Người chưa có profile sẽ được chuyển đến trang thiết lập hồ sơ.
- Firestore rules được cấu hình trong dự án để kiểm soát quyền truy cập dữ liệu.
- Vercel Authentication đã được tắt để người dùng công khai có thể truy cập website.

Một điểm cần chú ý là cấu hình Firebase cần thêm domain `nexusn4.vercel.app` vào Authorized domains để Google Login hoạt động ổn định.

## 7. Triển khai

Website được triển khai trên Vercel với tên miền:

https://nexusn4.vercel.app

Cấu hình triển khai:

- Build command: `npm run build`
- Framework: Vite
- Output: thư mục `dist`
- Có cấu hình rewrite trong `vercel.json` để hỗ trợ React Router khi refresh các route con.
- Có cấu hình public deployment để hạn chế lỗi bị yêu cầu đăng nhập Vercel.

## 8. Ưu điểm

- Giao diện chuyên nghiệp, phù hợp chủ đề tài chính và M&A.
- Có đầy đủ luồng chính: xem marketplace, đăng nhập, tạo hồ sơ, tạo thương vụ, xem chi tiết, quản lý dashboard.
- Sử dụng Firebase giúp phát triển nhanh và có xác thực Google sẵn.
- Dữ liệu thương vụ được mô hình hóa khá rõ ràng.
- Có tích hợp AI để hỗ trợ tạo nội dung thương vụ.
- Đã triển khai online trên Vercel, dễ truy cập và chia sẻ.

## 9. Hạn chế hiện tại

- Một số tính năng như NDA, VDR, tải tài liệu và tải banner hiện mới ở mức mô phỏng giao diện.
- Chưa có hệ thống upload tài liệu thật.
- Chưa có quy trình duyệt thương vụ trước khi công bố.
- Chưa có phân quyền chi tiết giữa buyer, seller, advisor và admin ở toàn bộ thao tác.
- Chưa có trang quản trị admin.
- Chưa có bộ lọc marketplace nâng cao theo ngành, định giá, quốc gia hoặc quy mô giao dịch.
- Tính năng AI phụ thuộc vào biến môi trường `GEMINI_API_KEY`.
- Một số nội dung tiếng Việt cần tiếp tục chuẩn hóa để đồng nhất văn phong.

## 10. Đề xuất cải tiến

Trong giai đoạn tiếp theo, website nên được nâng cấp theo các hướng sau:

- Thêm chức năng upload và quản lý tài liệu VDR thật.
- Xây dựng quy trình NDA điện tử trước khi mở dữ liệu nhạy cảm.
- Thêm bộ lọc và tìm kiếm nâng cao trên marketplace.
- Tạo trang admin để duyệt thương vụ, quản lý người dùng và kiểm tra KYC.
- Tách quyền rõ ràng giữa buyer, seller, advisor và admin.
- Bổ sung thông báo khi có offer mới hoặc khi trạng thái thương vụ thay đổi.
- Tối ưu bundle bằng code splitting để giảm kích thước file JavaScript production.
- Hoàn thiện responsive UI trên mobile.
- Chuẩn hóa toàn bộ bản dịch tiếng Việt theo kiểu viết hoa đầu câu.
- Bổ sung logging và monitoring cho lỗi đăng nhập, lỗi Firestore và lỗi AI.

## 11. Kết luận

Nexus M&A là một website marketplace M&A có nền tảng chức năng tương đối đầy đủ cho phiên bản đầu tiên. Hệ thống đã có các luồng quan trọng như đăng nhập, thiết lập hồ sơ, đăng thương vụ, xem chi tiết thương vụ, dashboard quản lý và tạo tài sản marketing. Việc sử dụng React, Firebase và Vercel giúp website dễ triển khai, dễ mở rộng và phù hợp với mô hình sản phẩm MVP.

Tuy nhiên, để trở thành một nền tảng M&A hoàn chỉnh, website cần tiếp tục phát triển các chức năng chuyên sâu như phân quyền, duyệt giao dịch, upload tài liệu, VDR thật, NDA điện tử, quản trị admin và bảo mật dữ liệu tài chính. Với nền tảng hiện tại, dự án có khả năng mở rộng tốt và phù hợp để tiếp tục phát triển thành một sản phẩm thực tế.
