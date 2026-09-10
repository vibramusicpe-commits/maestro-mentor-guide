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

2. **Overlay Autónomo `AutopilotTourOverlay`**:
   - Implementado en `src/components/admin/autopilot-tour-overlay.tsx` e integrado a nivel de layout global en `src/routes/admin.tsx`.
   - **Puntero SVG con degradado oficial**: Naranja intenso `#F47B20` y dorado `#FFB52E` con estela luminosa y animación física de clic.
   - **Tipeo Simulado en Vivo**: Funcionalidad asíncrona de escritura con temporizador dinámico adaptado a la velocidad seleccionada.
   - **Barra Flotante Inferior (HUD Controller)**:
     - ⏸️ / ▶️ Botón de Pausar / Reanudar (también accesible con la barra espaciadora).
     - ⏩ Conmutador de Velocidad (1x Normal / 1.8x Rápido).
     - ⏮️ / ⏭️ Salto manual entre pasos 1 al 6.
     - ❌ Botón "Salir / Tomar Control" (y tecla Escape) para cancelar inmediatamente la animación y devolver el control al usuario.

3. **6 Pasos Operativos Demostrados en Vivo**:
   - **Paso 1 (Alumnos)**: Desplazamiento a `/admin/alumnos`, clic en nuevo alumno, tipeo de Luciana Mendoza Gómez, Papá Carlos Mendoza (987 654 321), Mamá Rosa Huamán (984 123 456) y Abuela Elena Gómez (991 000 222).
   - **Paso 2 (Horarios)**: Desplazamiento a `/admin/agenda`, selección de par Lunes + Miércoles y visualización del aforo máximo de 5 alumnos.
   - **Paso 3 (Asistencia)**: Desplazamiento a Kardex y selección de falta "Justificada" con abono automático de +1 crédito de compensación.
   - **Paso 4 (Papelera)**: Apertura de la Papelera, filtro de "Leads de Reincorporación", copiado de mensaje de WhatsApp y botón "Restaurar Alumno".
   - **Paso 5 (Cobros)**: Desplazamiento a `/admin/facturacion`, conciliación en Soles PEN con Culqi y cambio de estado a Al Día.
   - **Paso 6 (Docentes en Sede)**: Retorno a `/admin`, demostración del reloj de fichaje de profesores en sede y resumen final.

4. **Acceso Dual en la Interfaz**:
   - Botón `🎮 Tour en Vivo (Autopiloto)` incorporado en la cabecera principal de `/admin`.
   - Botón directo `Iniciar Autopiloto en Vivo` disponible en el modal de "Personalizar Perfil".

## Consecuencias y Validación
* Ambas guías (la teórica y la interactiva con cursor) conviven armónicamente sin interferir con los datos de producción en PostgreSQL.
* El modo autopiloto es cancelable en cualquier instante sin dejar modales bloqueados.
* `npm run build` finalizado con 0 errores en compilación cliente y servidor Nitro.
