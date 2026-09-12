# ADR 0089: Control de Geolocalización GPS Puntual en Fichajes de Sede y Registro Horario para Karla (Secretaría), Sergio (Dirección) y Fabricio (Marketing)

## Estado
Aceptado

## Contexto
1. **Problema de Auditoría en Fichaje Docente**:
   La Dirección reportó que algunos docentes marcaban su turno de asistencia a las 8:50 a.m. desde su casa o mientras viajaban en transporte público hacia la academia, antes de haber llegado físicamente a la Sede Miraflores.
   Se requería un mecanismo de auditoría geográfica sin invadir la privacidad de los profesores (sin rastreo continuo por GPS en el camino, únicamente captura en el instante exacto de marcar entrada o salida).

2. **Gestión de Fichaje del Personal Administrativo y Marketing**:
   Además de los docentes (Nathaly, Jeremy, Fernando), el personal de administración requería registrar sus jornadas laborales:
   - **Karla**: Secretaría / Staff operativo.
   - **Sergio**: Dirección Ejecutiva / Socio.
   - **Fabricio**: Marketing / Growth y Estrategia.

## Decisiones Tomadas

1. **Captura GPS Puntual y Fórmula Haversine (`src/lib/services/geolocation.service.ts`)**:
   - **Una única llamada puntual**: Se utiliza `navigator.geolocation.getCurrentPosition(...)` solo cuando el usuario pulsa *"Fichar Entrada"*, *"Iniciar Jornada"*, *"Salir"* o *"Finalizar Turno"*. No se ejecutan `watchPosition` ni procesos en segundo plano.
   - **Coordenadas Oficiales de Sede**: Sede Miraflores (`-12.1215`, `-77.0295`) con un radio de tolerancia de 250 metros para absorción de señal en interiores.
   - **Clasificación Automática**:
     - `🟢 En Sede`: Si la distancia calculada es <= 250 metros.
     - `📍 Fuera de Sede`: Si la distancia supera los 250 metros (ej. 4.2 km). Genera automáticamente enlace a Google Maps (`https://www.google.com/maps?q={lat},{lng}`) para auditoría de Dirección.
     - `⚠️ Sin GPS`: Si el dispositivo no tiene GPS o se deniegan los permisos, el turno no se bloquea pero queda registrado como no verificado.

2. **Persistencia Estructurada en PostgreSQL (`public.teacher_time_logs`)**:
   - Para no romper contratos de base de datos ni requerir migraciones DDL invasivas, el campo `origin_device` (`text`) se utiliza para almacenar un payload JSON estructurado:
     ```json
     {
       "device": "kiosk_mobile",
       "in": {
         "lat": -12.1215,
         "lng": -77.0295,
         "accuracy": 15,
         "distanceMeters": 42,
         "status": "en_sede",
         "timestamp": "2026-09-12T14:00:00.000Z",
         "googleMapsUrl": "https://www.google.com/maps?q=-12.1215,-77.0295",
         "sedeName": "Sede Miraflores"
       },
       "out": { ... }
     }
     ```
   - La función `parseShiftLocation()` decodifica tanto el nuevo formato JSON como registros de texto plano anteriores (`"kiosk_mobile"`), garantizando 100% de compatibilidad hacia atrás.

3. **Inclusión de Karla, Sergio y Fabricio en la Plataforma**:
   - **PostgreSQL (`public.users`)**:
     - Karla: `00000000-0000-0000-0000-000000000008`, rol `staff`, email `karla@vibramusic.pe`.
     - Sergio: `00000000-0000-0000-0000-000000000007`, rol `super_admin`, email `sergio@vibramusic.pe`.
     - Fabricio: `00000000-0000-0000-0000-000000000009`, rol `staff`, email `fabricio@vibramusic.pe`.
   - **Login Rápido (`src/routes/index.tsx`)**:
     - Se añadieron los perfiles en `adminProfiles` con contraseñas maestras y etiquetas claras de rol.
   - **Widget de Fichaje en Cabecera (`src/components/admin/admin-shift-clock-widget.tsx`)**:
     - Montado en la barra superior de `/admin`, permitiendo a cualquier miembro administrativo iniciar, pausar y finalizar jornada con GPS y cronómetro en vivo.
   - **Kardex y Reportes CSV (`src/routes/admin.control-horario.tsx`)**:
     - Incluye columnas e insignias de Geocontrol GPS para entrada y salida.
     - Permite filtrar por profesor, Karla, Sergio y Fabricio.
     - La exportación a CSV añade las columnas `Geocontrol GPS Entrada` y `Geocontrol GPS Salida`.

## Consecuencias y Validación
- **Auditoría Transparente**: Dirección puede verificar instantáneamente si un fichaje se hizo en la sede o de forma remota, con enlace a Google Maps y metros de distancia.
- **Respeto a la Privacidad**: Cero seguimiento constante en el camino; el GPS solo se activa ante la acción intencional de marcar.
- **Validación Técnica**: Compilación con `npm run build` exitosa (0 errores de TypeScript y Nitro preset) y verificación directa en PostgreSQL mediante PostgREST e Insforge MCP.
