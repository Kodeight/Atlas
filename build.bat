cd "C:\Users\WinTen\Documents\web dev projects\atlas"
npm run build > build.log 2>&1
echo Exit code: %errorlevel%
type build.log | findstr "error" && echo "BUILD HAS ERRORS" || echo "BUILD SUCCEEDED"