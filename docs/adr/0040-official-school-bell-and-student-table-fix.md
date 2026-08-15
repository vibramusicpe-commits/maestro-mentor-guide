# ADR 0040: Corrección de Imports y Automatización de Timbre Escolar Oficial

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
1. Se produjo un error `ReferenceError: KeyRound is not defined` en `students-table.tsx` al omitirse la importación de `KeyRound` y `Lock`.
2. Se solicitó utilizar el archivo de audio físico oficial `public/school bell.mp3` para el timbre de clases.
3. Se requirió que el timbre cuente con:
   - Configuración accesible mediante un icono de ajustes.
   - Disparo automático configurable al inicio y fin de cada bloque según el cronograma de la academia:
     - **Lunes a Viernes (Turno Tarde)**: 16:00, 16:45, 17:30, 18:15, 19:00, 19:45.
     - **Sábados (Turno Mañana)**: 09:00, 09:45, 10:30, 11:15, 12:00, 12:45, 13:30.

## Decisiones
1. En `src/components/admin/students-table.tsx`:
   - Se importaron `KeyRound` y `Lock` desde `lucide-react`.
2. En `src/store/app-store.ts`:
   - Se agregó `chimeSettings` (con toggle de autoPlay, volumen y selector) y la acción `playOfficialChime()` que reproduce `/school bell.mp3`.
3. En `src/components/admin/agenda-board.tsx`:
   - Se añadió un botón con icono de engranaje (`Settings2`) al lado del botón de timbre.
   - Se implementó un modal Dialog para ajustar el volumen, probar el sonido y encender/apagar el timbre automático.
   - Se configuró el `useEffect` de monitoreo en tiempo real que emite el timbre automáticamente en el segundo exacto de inicio/fin de cada franja horaria.

## Consecuencias
- Cero errores en `/admin/alumnos`.
- Timbre escolar oficial integrado, configurable y 100% automatizado para la operación de secretaría.
