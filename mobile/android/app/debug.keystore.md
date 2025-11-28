# Debug Keystore

The debug.keystore file should be generated using the following command:

```bash
keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

This file is used for development builds only. For production releases, you must generate a proper release keystore.

## Default Debug Keystore Credentials
- Store Password: android
- Key Alias: androiddebugkey
- Key Password: android

**Note**: Never commit production keystores to version control!
