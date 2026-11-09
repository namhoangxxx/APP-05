# APP05 — Chat Realtime

Ứng dụng React Native dùng Firebase Authentication và Realtime Database để trò chuyện giữa hai tài khoản.

## Chức năng

- Đăng ký, đăng nhập bằng email và mật khẩu.
- Home hiển thị cuộc trò chuyện gần đây và số tin chưa đọc.
- Danh bạ hiển thị trạng thái online/offline.
- Chat văn bản theo thời gian thực và chia sẻ vị trí.

## Chạy dự án

Cần Node.js >= 22.11.0, Android SDK và JDK tương thích với cấu hình Gradle của dự án.

```sh
npm ci
npm start
```

Mở terminal thứ hai, kết nối thiết bị hoặc khởi động Android Emulator:

```sh
npm run android
```

Với hai máy Android, cài ứng dụng trên cả hai và đăng nhập bằng hai tài khoản khác nhau. Nếu dùng Metro qua USB, chạy `adb -s <serial> reverse tcp:8081 tcp:8081` cho từng máy.

Để chạy iOS cần macOS và Xcode. Cài Ruby dependencies bằng `bundle install`, sau đó chạy `bundle exec pod install` trong thư mục `ios` và `npm run ios` từ thư mục gốc.

## Firebase

Cấu hình kết nối nằm tại `src/services/firebaseConfig.ts`. Bật Authentication Email/Password và tạo Realtime Database. Tệp `database.rules.json` chứa rules của dự án; áp dụng qua Firebase Console bằng tài khoản có quyền quản trị.

Dữ liệu được tổ chức dưới các nhánh `users`, `messages` và `conversations`. Hai thiết bị cần kết nối cùng Firebase project. Chia sẻ vị trí cần cấp quyền vị trí; với máy ảo hãy đặt tọa độ GPS mô phỏng.

## Kiểm tra

```sh
npx tsc --noEmit
```

Đã kiểm tra TypeScript và thử nghiệm hai máy ảo gửi tin hai chiều, hiển thị số chưa đọc, trạng thái online và tin vị trí.

Repo gồm mã nguồn, cấu hình cần thiết và ảnh/video minh chứng; không chứa node_modules, thư mục build, ios/Pods, ZIP hoặc công cụ phụ.

## Minh chứng

- [Đăng ký](docs/minh-chung/anh/01-dang-ky.png)
- [Home có số tin chưa đọc](docs/minh-chung/anh/02-home-chua-doc.png)
- [Danh bạ có trạng thái online](docs/minh-chung/anh/03-danh-ba-online.png)
- [Chat có tin văn bản và vị trí](docs/minh-chung/anh/04-chat-vi-tri.png)
- [Video hai máy ảo chat với nhau — khoảng 100 giây](docs/minh-chung/video/06-chat-hai-thiet-bi.mp4)

Video quay đồng thời hai máy ảo, đặt cạnh nhau để thấy tin nhắn truyền hai chiều và tin vị trí xuất hiện. Vị trí sử dụng GPS mô phỏng của Android Emulator.
