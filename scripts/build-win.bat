@echo off
chcp 65001 >nul
setlocal

:: ========================================
::  Windows 构建 + 打包脚本
::  生成 Tauri 安装包（.msi / .exe）
:: ========================================

set "PROJECT_DIR=%~dp0.."
cd /d "%PROJECT_DIR%"

:: 读取版本号
for /f "tokens=2 delims=:, " %%a in ('findstr /c:"\"version\"" package.json') do (
    set "VERSION=%%~a"
    goto :got_version
)
:got_version

echo.
echo ========================================
echo   API-USE v%VERSION% Windows 构建
echo ========================================
echo.

:: 1. 执行 Tauri 构建
echo [1/3] 正在构建...
call pnpm tauri build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

:: 2. 定位构建产物
set "BUNDLE_DIR=%PROJECT_DIR%\src-tauri\target\release\bundle"
set "MSI_DIR=%BUNDLE_DIR%\msi"
set "NSIS_DIR=%BUNDLE_DIR%\nsis"

:: 3. 创建分发目录
set "DIST_DIR=%PROJECT_DIR%\dist-win"
if exist "%DIST_DIR%" rmdir /s /q "%DIST_DIR%"
mkdir "%DIST_DIR%"

:: 4. 复制安装包
echo.
echo [2/3] 复制安装包...

if exist "%MSI_DIR%" (
    for %%f in ("%MSI_DIR%\*.msi") do (
        copy "%%f" "%DIST_DIR%\" >nul
        echo   ✅ MSI: %%~nxf
    )
)

if exist "%NSIS_DIR%" (
    for %%f in ("%NSIS_DIR%\*.exe") do (
        copy "%%f" "%DIST_DIR%\" >nul
        echo   ✅ EXE: %%~nxf
    )
)

:: 5. 打包为 ZIP
echo.
echo [3/3] 打包中...
set "ZIP_NAME=API-USE-v%VERSION%-win.zip"
cd "%DIST_DIR%"
powershell -Command "Compress-Archive -Path '%DIST_DIR%\*' -DestinationPath '%PROJECT_DIR%\%ZIP_NAME%' -Force"
cd /d "%PROJECT_DIR%"

:: 6. 清理
rmdir /s /q "%DIST_DIR%"

echo.
echo ========================================
echo ✅ 打包完成！
echo 📦 输出：%PROJECT_DIR%\%ZIP_NAME%
echo ========================================
echo.
echo 分发方式：将 %ZIP_NAME% 发给用户
echo 用户操作：解压后双击 .msi 或 .exe 安装
echo.
echo 提示：用户首次安装可能出现 SmartScreen 提示
echo       点击"更多信息" → "仍要运行"即可
echo.
pause
