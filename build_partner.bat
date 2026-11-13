@echo off
set NODE_OPTIONS=--max-old-space-size=4096
cd /d C:\helper\mobile\android
call C:\helper\mobile\android\gradlew.bat assemblePartnerRelease -PreactNativeArchitectures=arm64-v8a --no-daemon
