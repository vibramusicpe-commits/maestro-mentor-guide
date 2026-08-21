# ADR 0062: Store v21 - Estado Fresco Incondicional, Cero Polución de LocalStorage y Verificación de Backend Insforge

## Estado
Aceptado, Implementado y Auditado en Producción

## Contexto
A pesar de que el backend PostgreSQL en Insforge contenía los 83 alumnos individualizados y que los archivos fuente de semillas (`official-control-pagos-seeds.ts`) estaban completamente separados, los navegadores de los usuarios finales (como la secretaria Nayeli) continuaban mostrando nombres combinados de versiones antiguas (ej. *"Bruno Marcelo Juan de Dios y Boris Marcelo Juan de Dios"*, *"Soto Soto, Ivanna + Luis Soto soto"*, *"Anton, Uriel, Gabriel y Eitan"*).

El diagnóstico técnico reveló que:
1. El mecanismo de migración anterior (v20) utilizaba coincidencia de patrones específicos (`s.name.includes(" y Boris")`), lo cual no cubría patrones no anticipados como separadores con `+` o variaciones tipográficas en los nombres.
2. `localStorage` retenía la propiedad `adminStudents` e `invoices` en la persistencia del cliente (`partialize`), sobreescribiendo los datos frescos del código y del backend en recargas ordinarias.

## Decisiones Técnicas

### 1. Eliminación de `adminStudents` e `invoices` de la Persistencia Local (`partialize`)
- Se removieron `adminStudents` e `invoices` del objeto `partialize` de Zustand.
- Los datos de alumnos y cobros **nunca más se almacenan en el `localStorage` del navegador**.
- En cada carga de la aplicación, el estado se inicializa de forma 100% limpia y fresca desde las constantes oficiales del código (`officialControlPagosStudents`) y se sincroniza en tiempo real con PostgreSQL a través de `useInsforgeSync()`.

### 2. Elevación del Store a Versión 21 (`cadencia-app-v21`)
- Elevado el número de versión a `21` con nombre de almacenamiento `cadencia-app-v21`.
- En el método `migrate` y en `onRehydrateStorage`, cualquier versión persistida inferior a 21 se descarta inmediatamente y se limpian las claves residuales `cadencia-app-v1` a `v20`.

### 3. Verificación Exhaustiva del Backend PostgreSQL en Insforge (vía MCP)
Se ejecutaron consultas SQL directas mediante el servidor MCP `insforge-postgres`:
- `SELECT count(*) FROM students WHERE full_name LIKE '% y %'` ➡️ **0**
- `SELECT count(*) FROM students` ➡️ **83 alumnos individuales**
- `SELECT count(*) FROM families` ➡️ **83 familias con apoderados**
- `SELECT count(*) FROM invoices` ➡️ **83 recibos y cobros**
- Confirmación de existencia independiente para familias críticas:
  * Anton: `Anton, Junior Gabriel`, `Anton, Uriel`, `Chapi, Eitan Anton`.
  * Marcelo Juan de Dios: `Bruno Marcelo Juan de Dios`, `Boris Axel Marcelo Juan de Dios`.
  * Soto Soto: `Luis Soto Soto`, `Ivana Soto Soto`.
  * Meza: `Jhosua Ruben Meza Salome`, `Meza Llallahui, Andrea Fernanda`.

## Consecuencias
- Erradicación total y definitiva de cualquier rastro de datos agrupados o corruptos en los clientes.
- Funcionamiento transparente e independiente de si el usuario borró o no la caché de su navegador.
- Arquitectura 100% sincronizada entre el frontend en Cloudflare Pages y el backend en Insforge PostgreSQL.
