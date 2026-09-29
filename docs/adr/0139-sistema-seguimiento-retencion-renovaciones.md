# ADR-0139: Sistema Integral de Seguimiento, Retención y Renovación de Ciclos

## Estado
Aceptado e Implementado

## Contexto
En Vibra Music Staff, el valor del ciclo de vida del alumno (LTV) y la sostenibilidad financiera dependen de la retención mes a mes. Anteriormente, cuando un alumno culminaba sus 8 clases (o 4 intensivas), la webapp cerraba el ciclo en el Kardex pero carecía de un embudo activo de seguimiento y renovación para Secretaría (Nayeli) y Dirección.

Existían además dos requerimientos institucionales innegociables:
1. **Cero Vacante de Cortesía**: En Vibra Music **no existe plazo de gracia o cortesía posterior al vencimiento**. Un turno docente (máximo 5 alumnos por sala) no puede quedar congelado esperando si el alumno renueva o no. Por ende, la comunicación preventiva debe realizarse con días de anticipación durante la fase **🟡 AMARILLA (1 ó 2 clases/créditos restantes)** para que el apoderado confirme continuidad antes de la última clase.
2. **Renovación Exclusiva con 0 Créditos Pendientes**: Un alumno solo puede renovar formalmente su ciclo cuando ha cumplido todas sus clases y recuperado sus inasistencias ($S_{pend} === 0$). El avance se cuenta por clases cumplidas y no se arrastran créditos anteriores; el nuevo mes arranca limpio con sus 8 clases nuevas.
3. **Orden Visual y Cero Saturación del Dashboard**: El dashboard principal (`/admin`) debe permanecer despejado. El seguimiento de retención vive en su propia pestaña dedicada **`[🔄 Seguimiento & Renovación]`** dentro de `/admin/alumnos`.

---

## Decisión de Arquitectura y Negocio

### 1. Motor Matemático de Retención (`computeStudentRetentionStatus`)
El cálculo de sesiones pendientes ($S_{pend}$) evalúa estrictamente:
$$S_{pend} = R_{pend} + M_{pend} + C_{unsched}$$
Donde:
- $R_{pend}$: Clases regulares pendientes en el ciclo.
- $M_{pend}$: Clases de recuperación ya agendadas pendientes de dictado.
- $C_{unsched}$: Créditos de recuperación acumulados por inasistencias que aún no han sido agendados.

### 2. Clasificación Canónica de Semáforo
- **⚪ GRIS (`pausa_baja`)**: Alumno con `status: "pausa"` o `status: "baja"`. Vacante liberada para nuevos prospectos. `canRenew: false`.
- **🟢 VERDE (`en_curso`)**: $S_{pend} > 2$. Progreso lectivo normal en sala. `canRenew: false`.
- **🟡 AMARILLO (`proximo_culminar`)**: $S_{pend} \in \{1, 2\}$. **Alerta Preventiva Obligatoria**: Contacto anticipado de secretaría por WhatsApp para consultar si continuará el siguiente mes y asegurar su horario en sala antes de que finalice la última clase. `canRenew: false`.
- **🔴 ROJO (`culminado`)**: $S_{pend} === 0$. Completó al 100% sus clases y créditos. Si confirmó previamente, se activa el botón `[🔄 Renovar Ciclo]`. Si no confirmó, su vacante se libera de inmediato para nuevos prospectos. `canRenew: true`.

### 3. Acción Atómica de Renovación (`renewStudentCycle`)
Ubicada en `src/store/app-store.ts`:
- Calcula automáticamente `newStartDate` (+1 día hábil tras `planEndDate`) y `newEndDate` (+1 mes en Regular 2x/Intensivo, +2 meses en Regular 1x/sem).
- Crea el nuevo recibo en `invoices` en estado `"pendiente"` y lo persiste en PostgreSQL vía `backgroundCreateInvoiceInDB`.
- Actualiza las fechas contractuales en `students` de PostgreSQL vía `backgroundSyncStudentToDB` y resetea `makeup_credits: 0`.
- Preserva su horario semanal y profesor en sala sin necesidad de reconfigurar la agenda.

### 4. Pestaña Dedicada `[🔄 Seguimiento & Renovación]`
- Ubicada en `src/routes/admin.alumnos.tsx` junto a `[Alumnos]`, `[Notas a Familias]` y `[Vacantes]`.
- Cuenta con un badge reactivo en vivo que indica la cantidad de alumnos que requieren atención (`proximo_culminar` + `culminado`).
- Muestra el componente `StudentRenewalsRetentionPanel` con métricas, filtros y acciones directas de WhatsApp y Renovación.

---

## Verificación y Resultados
1. **Pruebas Automatizadas (`scratch/test-retention-calculator.ts`)**:
   - Caso 1 (4/8 asistidas): `🟢 En Curso (4/8)` ($S_{pend} = 4$).
   - Caso 2 (6/8 asistidas, 2 pendientes): `🟡 Restan 2 clases` ($S_{pend} = 2$).
   - Caso 3 (Cielo Chamorro: 6 presentes, 2 faltas): `🟡 Restan 2 (2 créd.)` ($S_{pend} = 2$, `canRenew: false`).
   - Caso 4 (8/8 asistidas, 0 pendientes): `🔴 Culminado (8/8)` ($S_{pend} = 0$, `canRenew: true`).
   - Caso 5 (Pausa): `⚪ Pausa / Inactivo` (`canRenew: false`).
2. **Build de Producción**:
   - `npm run build` ejecutado exitosamente con 0 errores TypeScript y compresión SSR/Nitro en 530ms.
