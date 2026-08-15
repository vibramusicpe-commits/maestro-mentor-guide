# ADR 0021: Corrección de la Importación de `Input` en el Buscador del Histórico de Alumnos

- **Estado**: Aceptado
- **Fecha**: 2026-08-12
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto

Al abrir el módulo de **Horario de Clases (`/admin/agenda`)**, la consola reportó `ReferenceError: Input is not defined`. Esto ocurrió porque en el buscador del nuevo modal lateral de **Historial de Alumnos Reingresantes / Bajas** se utilizó la etiqueta `<Input />` sin haber incluido la línea de importación `import { Input } from "@/components/ui/input"`.

## Decisiones

1. **Importación Explícita de `<Input />`**:
   - Se añadió `import { Input } from "@/components/ui/input"` en `src/components/admin/agenda-board.tsx`.
2. **Validación de Compilación Nube / Local**:
   - Se ejecutó el comando `npm run build` confirmando 0 errores de compilación y empaquetamiento Nitro / Vite en Cloudflare.

## Consecuencias
- La pantalla `/admin/agenda` abre de forma fluida y sin ningún tipo de excepción.
- **El backend de Insforge y la base de datos están 100% seguros y estables**.
