@echo off
setlocal EnableExtensions

:: Verifica se já é administrador
net session >nul 2>&1
if %errorLevel% == 0 (goto :is_admin) else (goto :elevate)

:elevate
echo Solicitando privilégios de administrador...
:: Passa o diretório atual como parâmetro e reinicia como admin
set "originalDir=%cd%"
powershell -Command "Start-Process -FilePath 'cmd' -ArgumentList '/c \"\"%~f0\" --dir \"%originalDir%\"\"' -Verb RunAs"
exit /b

:is_admin
:: Configura o diretório original se foi passado como parâmetro
if "%~1" == "--dir" (cd /d "%~2")

:: =====================================
:: CONFIGURAÇÕES DO NODE (mesmo conteúdo)
:: =====================================

set "VSCODE_INSPECTOR_OPTIONS=::: {""inspectorIpc"":""\\\\\\.\\pipe\\node-cdp.17624-5c98ccb7-1.sock"",""deferredMode"":false,""waitForDebugger"":"""",""execPath"":""C:\\Program Files\\nodejs\\node.exe"",""onlyEntrypoint"":false,""autoAttachMode"":""always"",""fileCallback"":""C:\\Users\\Cooper\\AppData\\Local\\Temp\\node-debug-callback-b73034898f9a3a66""}"

echo Executando Servidor...
:: Executa e mantém a janela aberta em caso de erro
"C:\Program Files\nodejs\node.exe" ".\index.js" || (
    echo.
    echo [ERRO] A execução falhou. Verifique a mensagem acima.
    pause
)