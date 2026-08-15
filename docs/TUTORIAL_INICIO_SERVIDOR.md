# Guía Definitiva de Inicio del Servidor Local (Vibra Music)

Este documento explica de forma práctica y comprobada cómo iniciar el servidor local en Windows evitando las restricciones de políticas de scripts de PowerShell (`PSSecurityException` / `npm.ps1`).

---

## 🚀 Método 1: Archivo de Inicio Rápido con 1 Doble Clic (Recomendado)

Se ha creado un script ejecutable directo en la raíz del proyecto llamado **`iniciar-servidor.bat`**.

1. Abre el Explorador de Archivos de Windows en la carpeta de tu proyecto (`C:\Users\USER\my music staff backend`).
2. Haz **doble clic** sobre el archivo **`iniciar-servidor.bat`**.
3. Se abrirá automáticamente la consola negra de Windows ejecutando el servidor en modo red (`0.0.0.0`).
4. Verás las URLs para ingresar:
   - En tu PC: `http://localhost:5173/`
   - En celular/red: `http://192.168.18.49:5173/`

---

## 💻 Método 2: Por Terminal de PowerShell

El motivo por el cual PowerShell falla al invocar `npm` es porque intenta ejecutar el archivo `npm.ps1`, el cual Windows bloquea por defecto por su Política de Ejecución (`Restricted ExecutionPolicy`).

### Opción A: Ejecutar usando `npm.cmd` (Sin tocar políticas de Windows)
Para evitar el archivo `.ps1`, debes llamar a la versión ejecutable `.cmd`:

```powershell
$env:PATH = "C:\Users\USER\node22\node-v22.14.0-win-x64;" + $env:PATH; npm.cmd run dev -- --host 0.0.0.0
```

### Opción B: Habilitar scripts en tu usuario de PowerShell (Una sola vez)
Si deseas poder escribir simplemente `npm run dev`:
1. Ejecuta este comando en PowerShell una sola vez:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```
2. A partir de ese momento, podrás ejecutar:
```powershell
npm run dev -- --host 0.0.0.0
```

---

## 🛑 ¿Cómo detener el servidor?
Presiona **`Ctrl + C`** en la ventana donde está corriendo y escribe `S` para confirmar.
