# 📱 Hướng dẫn Build APK Android cho File Storage App

## 🎯 Tổng quan

Dự án này đã được thiết lập để chuyển đổi ứng dụng web React thành ứng dụng Android APK sử dụng Capacitor. GitHub Actions sẽ tự động build APK khi bạn push code.

## 🚀 Cách sử dụng GitHub Actions

### 1. **Build tự động (Khuyên dùng)**

Chỉ cần push code lên GitHub:

```bash
git add .
git commit -m "Update app"
git push origin main
```

GitHub Actions sẽ tự động:
- Build web app từ React code
- Tạo Android project với Capacitor  
- Build APK file (debug và release)
- Upload APK dưới dạng artifacts
- Tạo GitHub Release với APK download

### 2. **Build thủ công với tùy chọn**

Vào GitHub repository → Actions → "Build Signed Android APK" → Run workflow

Chọn:
- **Version name**: Ví dụ `1.0.1`
- **Build type**: `debug` hoặc `release`

## 📁 Files đã được tạo

### ✅ GitHub Workflows
- `.github/workflows/build-android.yml` - Build tự động khi push
- `.github/workflows/build-signed-apk.yml` - Build thủ công có ký
- `.github/workflows/test-build.yml` - Test build cho PR

### ✅ Android Configuration  
- `capacitor.config.ts` - Cấu hình Capacitor
- `android/` - Toàn bộ Android project
- `android/app/src/main/AndroidManifest.xml` - Permissions và settings
- `android/app/src/main/res/values/strings.xml` - App name và metadata

### ✅ Build Scripts
- `scripts/build-android.sh` - Script build local (cần Java)
- `android/local.properties` - Android SDK path

### ✅ Documentation
- `README-Android.md` - Hướng dẫn chi tiết cho Android
- `BUILD_GUIDE.md` - File này

## 🔧 Thiết lập GitHub Secrets (cho signed APK)

Để build APK có chữ ký số (release), cần thiết lập secrets:

1. **Tạo keystore**:
```bash
keytool -genkey -v -keystore my-app-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

2. **Convert keystore thành base64**:
```bash
base64 my-app-key.keystore > keystore.base64.txt
```

3. **Thêm secrets vào GitHub**:
Vào repository → Settings → Secrets and variables → Actions:

- `KEYSTORE_BASE64`: Nội dung file keystore.base64.txt
- `KEYSTORE_PASSWORD`: Mật khẩu keystore  
- `KEY_ALIAS`: Alias của key (my-key-alias)
- `KEY_PASSWORD`: Mật khẩu key

## 📲 Cài đặt APK

1. **Tải APK**: Từ GitHub Releases hoặc Actions artifacts
2. **Bật cài đặt**: Trên Android, bật "Install from Unknown Sources"
3. **Cài đặt**: Mở APK file và cài đặt

## 🔍 Troubleshooting

### ❌ Build failed trên GitHub Actions
- Kiểm tra logs trong Actions tab
- Đảm bảo web build thành công bằng `npm run build`
- Xác nhận secrets đã thiết lập đúng (cho signed build)

### ❌ APK không cài đặt được  
- Kiểm tra "Install from Unknown Sources" đã bật
- Thử build debug APK trước release APK
- Đảm bảo thiết bị Android tương thích

### ❌ App crash khi mở
- Kiểm tra logs qua `adb logcat` hoặc Android Studio
- Đảm bảo backend server đang chạy (nếu cần)
- Xem lại permissions trong AndroidManifest.xml

## 🎛️ Cấu hình nâng cao

### App Icon
- Icon được tạo tự động từ AI: `attached_assets/generated_images/File_storage_app_icon_*.png`
- Để thay đổi: Replace files trong `android/app/src/main/res/mipmap-*/`

### App Name  
- Sửa trong `android/app/src/main/res/values/strings.xml`
- Hoặc `capacitor.config.ts`

### Permissions
- Sửa trong `android/app/src/main/AndroidManifest.xml`
- Hiện tại có: INTERNET, CAMERA, STORAGE, VIBRATE

### Package ID
- App ID: `com.filestorage.app`
- Sửa trong `capacitor.config.ts` nếu cần

## 🚀 Next Steps

1. **Push code lên GitHub** để trigger build đầu tiên
2. **Download APK** từ Actions artifacts hoặc Releases  
3. **Test trên thiết bị** Android thật
4. **Thiết lập signing** (nếu cần release ra store)
5. **Customize app** theo ý muốn

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra GitHub Actions logs
2. Tạo issue trong repository  
3. Đảm bảo đã follow đúng hướng dẫn

---

**Chú ý**: Build APK cần Java và Android SDK. GitHub Actions đã cài đặt sẵn tất cả, nên khuyên dùng GitHub Actions thay vì build local.