@echo off
setlocal EnableExtensions

:: Captura o nome de usuário
set /p usuario=Digite o nome de usuário: 

:: Captura a senha de forma segura
set "psCommand=powershell -Command "$p=read-host 'Digite a senha' -AsSecureString; $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($p); [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)""

for /f "delims=" %%a in ('%psCommand%') do set "senha=%%a"

:: Executa o script Node
echo Adicionando usuário...
node "criador_de_usuarios.js" "%usuario%" "%senha%" || (
    echo.
    echo [ERRO] Falha ao adicionar usuário
)

pause