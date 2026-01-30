@echo off
echo ============================================
echo Probando guardar producto con valores dinamicos
echo ============================================
echo.

REM Get session cookie (you'll need to replace this with actual cookie)
set COOKIE=wtrebol.sid=s%%3Aj%%3A%%7B%%22passport%%22%%3A%%7B%%22user%%22%%3A%%22679e8c8a8b9c8d8e8f8a8b8c%%22%%7D%%7D.signature

echo Enviando producto con category="test-dynamic" y condition="test-dynamic"...
echo.

curl -X POST http://localhost:5000/api/content ^
  -H "Content-Type: application/json" ^
  -H "Cookie: %COOKIE%" ^
  -d "{\"type\":\"product\",\"title\":\"Test Dynamic Fields\",\"category\":\"test-dynamic\",\"condition\":\"test-dynamic\",\"price\":100000,\"isActive\":true}"

echo.
echo ============================================
echo Si ves "success: true" - FUNCIONO!
echo Si ves "ValidationError" - Aun hay problema
echo ============================================
pause
