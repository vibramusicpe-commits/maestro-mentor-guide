# ADR 0085: Tour Autopiloto en Vivo con Cursor Guiado Autónomo para Secretaría

## Estado
Aceptado e Implementado

## Contexto
1. **Necesidad de Inducción Guiada Activa (TDAH-friendly)**: La dirección general observó que un modal estático o con diapositivas teóricas no resulta suficiente para perfiles con déficit de atención o personal nuevo de secretaría. Se requería una experiencia interactiva en vivo ("Autopiloto") donde un cursor virtual se desplace autónomamente por la pantalla real, interactúe con los botones, abra y cierre los modales y demuestre físicamente el uso del sistema.
2. **Preservación de la Guía Anterior**: Se solicitó explícitamente conservar la guía previa de inducción modal (`StaffOnboardingTutorial`) para mantener el contexto histórico y teórico, incorporando un botón independiente dedicado para este nuevo modo en vivo.
3. **Navegación Multi-Página Real (Opción A)**: El tour debía desplazarse físicamente a través de las rutas reales (`/admin/alumnos`, `/admin/agenda`, `/admin/facturacion`, `/admin`) usando el enrutador de TanStack Router.
4. **Tipeo en Vivo con Mayúsculas Iniciales**: En los campos de formulario, el cursor debía escribir carácter por carácter (efecto máquina de escribir) respetando estrictamente que los nombres y apellidos inicien con mayúsculas por respeto y gramática (`Luciana Mendoza Gómez`, `Carlos Mendoza`, `Rosa Huamán`, `Elena Gómez`).
5. **Énfasis en Eliminación y Papelera de Alumnos**: Demostrar el funcionamiento de la Papelera inteligente (`DeletedStudentsTrashModal`), la segmentación de "Leads de Reincorporación" (alumnos dados de baja por falta de pago o retiro voluntario), el copiado de mensajes de WhatsApp y la restauración a la lista activa en un solo clic.

## Decisiones Técnicas

1. **Gestor de Estado Dedicado `useAutopilotStore`**:
   - Creado en `src/store/autopilot-store.ts` utilizando Zustand.
   - Administra el paso actual (0..5), posición reactiva del cursor `(x, y)`, coordenadas y disparadores del efecto onda de clic (*ripple*), multiplicador de velocidad (1x / 1.8x), estado de pausa y mensajes informativos.

2. **Overlay Autónomo 100% DOM-Nativo `AutopilotTourOverlay`**:
   - Implementado en `src/components/admin/autopilot-tour-overlay.tsx` e integrado a nivel de layout global en `src/routes/admin.tsx`.
   - **Cero Modales Ficticios**: Se eliminaron por completo las tarjetas simuladas dentro del overlay. El cursor interactúa directamente con los componentes reales (`NewStudentDialog`, `DeletedStudentsTrashModal`, `StudentAttendanceKardex`, `AgendaBoard`).
   - **Anclaje Dinámico `data-tour`**: Posicionamiento en vivo mediante `document.querySelector(...).getBoundingClientRect()`, garantizando alineación milimétrica en cualquier resolución o nivel de zoom.
   - **Puntero SVG con degradado oficial**: Naranja intenso `#F47B20` y dorado `#FFB52E` con estela luminosa y animación física de clic expansivo (*ripple*).
   - **Tipeo en Vivo en Inputs Reales**: Inyección reactiva nativa mediante el descriptor de `HTMLInputElement.prototype.value`, permitiendo ver cómo los campos de React se completan carácter a carácter en tiempo real respetando mayúsculas iniciales.
   - **Barra Flotante Inferior (HUD Controller)**:
     - ⏸️ / ▶️ Botón de Pausar / Reanudar (también con la barra espaciadora).
     - ⏩ Conmutador de Velocidad (1x Normal / 1.8x Rápido).
     - ⏮️ / ⏭️ Salto manual entre pasos 1 al 6 con cierre automático de modales intermedios.
     - ❌ Botón "Salir / Tomar Control" (y tecla Escape) para cancelar inmediatamente la animación y devolver el control al usuario sin dejar formularios bloqueados.

3. **7 Pasos Operativos Demostrados sobre la Interfaz Real**:
   - **Paso 1 (Directorio - Registro)**: Desplazamiento a `/admin/alumnos`, clic real en `+ Registrar Nuevo Alumno` que abre el Sheet auténtico, tipeo real en los campos de Luciana Mendoza Gómez, Carlos Mendoza (987 654 321), Rosa Huamán (984 123 456) y Elena Gómez (991 000 222), y cierre seguro con el botón Cancelar.
   - **Paso 2 (Horario del Alumno - + Horario)**: En `/admin/alumnos`, clic real en el botón `+ Horario` de la fila del alumno, apertura del diálogo `ScheduleStudentForm`, foco y clic en `🔗 Días Pareados (Oficial)` (Lunes jala Miércoles / Martes jala Jueves), foco y clic en `⚙️ Modo Personalizado` (horarios libres ej. Miércoles + Sábado con aforo máx de 5 alumnos por profesor), y cierre seguro con Cancelar.
   - **Paso 3 (Agenda General y Aforo)**: Desplazamiento a `/admin/agenda`, foco sobre las celdas pareadas de la Agenda y explicación del aforo estricto de 5 alumnos por profesor.
   - **Paso 4 (Asistencia y Kardex)**: Retorno a `/admin/alumnos`, apertura del Kardex real desde la fila de un alumno, foco sobre el botón "Justificada" (+1 crédito de recuperación automático) y cierre limpio.
   - **Paso 5 (Papelera y Restauración)**: Clic real en el botón `Papelera` que abre el auténtico diálogo `DeletedStudentsTrashModal`, clic en la pestaña real `🎯 Leads Reincorporación`, demostración de filtros por motivo y botón verde `Restaurar Alumno` en 1 clic, y cierre con el botón `Cerrar Papelera`.
   - **Paso 6 (Cobros)**: Desplazamiento a `/admin/facturacion`, foco sobre los recibos en Soles PEN y pasarela oficial Culqi.
   - **Paso 7 (Docentes en Sede)**: Retorno a `/admin`, foco sobre el widget en vivo de asistencia docente en sede y conclusión.

4. **Acceso Dual en la Interfaz**:
   - Botón `🎮 Tour en Vivo (Autopiloto)` incorporado en la cabecera principal de `/admin`.
   - Botón directo `Iniciar Autopiloto en Vivo` disponible en el modal de "Personalizar Perfil".

## Consecuencias y Validación
* El tour opera 100% sobre la interfaz real, sin desincronizaciones de coordenadas ni ventanas duplicadas.
* Ambas guías (la teórica y la interactiva con cursor) conviven armónicamente.
* `npm run build` finalizado con 0 errores en compilación cliente y servidor Nitro.
