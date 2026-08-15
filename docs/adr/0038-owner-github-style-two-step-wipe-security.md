# ADR 0038: Doble Filtro de Seguridad Estilo GitHub para Vaciado de Horarios y Alumnos Exclusivo de la Dueña

- **Estado**: Aceptado
- **Fecha**: 2026-08-13
- **Autores**: Antigravity AI & Equipo Vibra Music

## Contexto
- Las acciones destructivas como **Vaciar Todo el Horario** o **Vaciar Todo el Directorio de Alumnos** conllevan un riesgo operacional crítico si se ejecutan por error.
- Secretaría (`Nayeli`) no debe tener acceso a borrar de manera masiva la base de datos de clases o alumnos; esta atribución corresponde exclusivamente a la Dueña / Dirección (`super_admin`).
- Se requirió implementar un esquema de confirmación estricto de dos factores inspirado en la eliminación de repositorios de GitHub.

## Decisiones
1. En `src/components/admin/agenda-board.tsx` y `src/components/admin/students-table.tsx`:
   - El botón **`Vaciar Horario`** y **`Vaciar Directorio`** solo se renderiza si `activeRole === "super_admin"`.
   - Para Nayeli (`staff`), se muestra un aviso informativo bloqueado: *"Vaciado reservado a Dirección"*.
   - Al hacer clic como Dueña, no se realiza un simple `confirm()`, sino que se abre un modal de seguridad con **2 Filtros Obligatorios**:
     1. **Filtro 1**: Debe ingresar su **Contraseña de Dirección**.
     2. **Filtro 2 (GitHub Style)**: Debe escribir exactamente la frase de confirmación en mayúsculas (`VACIAR HORARIO VIBRA` o `VACIAR ALUMNOS VIBRA`).
     3. El botón de confirmación permanece **deshabilitado** hasta que ambos requisitos se cumplan con exactitud.

## Consecuencias
- Cero riesgo de borrado accidental por clics rápidos o equivocaciones de secretaría.
- Máxima protección de los datos de la academia garantizada.
