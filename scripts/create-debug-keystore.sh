#!/bin/bash

# Create debug keystore for APK signing
# This will create a debug.keystore for development use

KEYSTORE_PATH="android/app/debug.keystore"
KEY_ALIAS="androiddebugkey"
KEY_PASSWORD="android"
STORE_PASSWORD="android"

echo "Creating debug keystore for APK signing..."

# Remove existing keystore if present
if [ -f "$KEYSTORE_PATH" ]; then
    rm "$KEYSTORE_PATH"
    echo "Removed existing debug keystore"
fi

# Create new debug keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS" \
    -storepass "$STORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=Debug,OU=Debug,O=Debug,L=Debug,S=Debug,C=US"

if [ $? -eq 0 ]; then
    echo "✅ Debug keystore created successfully at: $KEYSTORE_PATH"
else
    echo "❌ Failed to create debug keystore"
    exit 1
fi

echo "Keystore details:"
echo "  File: $KEYSTORE_PATH"
echo "  Alias: $KEY_ALIAS"
echo "  Store Password: $STORE_PASSWORD"
echo "  Key Password: $KEY_PASSWORD"