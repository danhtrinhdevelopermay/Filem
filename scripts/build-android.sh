#!/bin/bash

# Build Android APK Script
# Sử dụng: ./scripts/build-android.sh [debug|release]

BUILD_TYPE=${1:-debug}

echo "🚀 Bắt đầu build Android APK..."
echo "📁 Build type: $BUILD_TYPE"

# Kiểm tra dependencies
if ! command -v node &> /dev/null; then
    echo "❌ Node.js không được cài đặt"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm không được cài đặt"
    exit 1
fi

# Cài đặt dependencies
echo "📦 Cài đặt dependencies..."
npm install

# Build web app
echo "🌐 Build web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build web app thất bại"
    exit 1
fi

# Sync Capacitor
echo "🔄 Sync Capacitor files..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync thất bại"
    exit 1
fi

# Kiểm tra Android project
if [ ! -f "android/gradlew" ]; then
    echo "❌ Android project chưa được thiết lập"
    exit 1
fi

# Set permissions cho gradlew
chmod +x android/gradlew

# Build APK
echo "🏗️  Build APK ($BUILD_TYPE)..."
cd android

if [ "$BUILD_TYPE" = "release" ]; then
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
else
    ./gradlew assembleDebug  
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

if [ $? -eq 0 ]; then
    if [ -f "$APK_PATH" ]; then
        echo "✅ Build thành công!"
        echo "📱 APK được tạo tại: android/$APK_PATH"
        
        # Di chuyển APK ra ngoài thư mục root
        mkdir -p ../build
        cp "$APK_PATH" "../build/file-storage-app-$BUILD_TYPE.apk"
        echo "📁 APK đã được copy vào: build/file-storage-app-$BUILD_TYPE.apk"
        
        # Hiển thị thông tin APK
        echo ""
        echo "📋 Thông tin APK:"
        ls -lh "../build/file-storage-app-$BUILD_TYPE.apk"
        echo ""
        echo "🎉 Hoàn thành! Bạn có thể cài đặt APK trên thiết bị Android."
    else
        echo "❌ APK không được tạo tại đường dẫn mong đợi"
        exit 1
    fi
else
    echo "❌ Build APK thất bại"
    exit 1
fi