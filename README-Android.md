# File Storage App - Android Build

Ứng dụng quản lý file được xây dựng từ React web app với Capacitor, có thể build thành APK Android.

## 🚀 Tính năng

- 📁 **Lưu trữ file an toàn**: Tất cả file được lưu trực tiếp trong database PostgreSQL
- 👤 **Xác thực người dùng**: Đăng ký và đăng nhập bảo mật
- 📱 **Giao diện mobile**: Tối ưu hóa cho thiết bị di động
- 🔒 **Bảo mật**: Mỗi người dùng chỉ truy cập được file của riêng mình
- 📋 **Quản lý file**: Upload, xem trước, và tải xuống file

## 🛠️ Build APK

### Tự động với GitHub Actions

1. **Build thông thường**: Push code lên branch `main` hoặc `master` để tự động build APK
2. **Build có ký**: Sử dụng workflow `Build Signed Android APK` với input version

### Build thủ công

```bash
# Cài đặt dependencies
npm install

# Build web app
npm run build

# Sync với Capacitor
npx cap sync android

# Mở Android Studio để build
npx cap open android
```

## 📱 Cài đặt APK

1. Tải APK từ GitHub Releases
2. Bật "Install from Unknown Sources" trên thiết bị Android
3. Cài đặt APK file

## 🔧 Cấu hình GitHub Secrets (cho build có ký)

Để build APK có chữ ký số, cần thiết lập các secrets sau trong GitHub repository:

```
KEYSTORE_BASE64     # Keystore file được encode base64
KEYSTORE_PASSWORD   # Mật khẩu keystore
KEY_ALIAS           # Alias của key
KEY_PASSWORD        # Mật khẩu key
```

### Tạo Keystore

```bash
keytool -genkey -v -keystore my-app-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### Encode Keystore thành Base64

```bash
base64 my-app-key.keystore > keystore.base64.txt
```

## 📋 Workflows có sẵn

### 1. Build Android APK (`build-android.yml`)
- Tự động chạy khi có push vào main/master
- Build cả debug và release APK
- Upload artifacts và tạo GitHub Release

### 2. Build Signed Android APK (`build-signed-apk.yml`)  
- Chạy thủ công với input version
- Có thể chọn build debug hoặc release
- Sử dụng keystore để ký APK (cho release)

## 🏗️ Cấu trúc dự án

```
├── android/                 # Android platform files (Capacitor)
├── client/                  # React frontend
├── server/                  # Express.js backend  
├── shared/                  # Shared types and schemas
├── .github/workflows/       # GitHub Actions workflows
├── capacitor.config.ts      # Capacitor configuration
└── README-Android.md        # Hướng dẫn này
```

## 🔍 Troubleshooting

### APK không cài đặt được
- Kiểm tra "Install from Unknown Sources" đã được bật
- Đảm bảo thiết bị hỗ trợ API level tương ứng

### Build failed trên GitHub Actions
- Kiểm tra logs của workflow
- Đảm bảo các secrets đã được thiết lập đúng (cho signed build)
- Xác nhận code build thành công locally

### App crash khi mở
- Kiểm tra permissions trong AndroidManifest.xml
- Đảm bảo server backend đang chạy (nếu cần kết nối)

## 📞 Hỗ trợ

Nếu gặp vấn đề khi build hoặc sử dụng app, hãy tạo issue trong GitHub repository.