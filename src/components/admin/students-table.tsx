import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  Cake,
  Clock,
  CreditCard,
  GraduationCap,
  Mail,
  MinusCircle,
  Phone,
  PlusCircle,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import {
  useAppStore,
  type AdminStudent,
  type LessonModality,
  type StudentStatus,
} from "@/store/app-store";
import { teachers } from "@/store/admin-seeds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money } from "@/lib/format";

const ALL = "todos";

function statusBadge(status: StudentStatus) {
  switch (status) {
    case "activo":
      return <Badge className="bg-success/15 text-success hover:bg-success/20 border-0">Activo</Badge>;
    case "pausa":
      return <Badge className="bg-warning/20 text-warning-foreground hover:bg-warning/25 border-0">En Pausa</Badge>;
    case "baja":
      return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20 border-0">Baja</Badge>;
  }
}

function modalityBadge(modality: LessonModality) {
  if (modality.startsWith("Intensivo")) {
    return (
      <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[11px]">
        <Clock className="mr-1 h-3 w-3" />
        Intensivo (90m x1)
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-border bg-muted/60 text-foreground text-[11px]">
      <Clock className="mr-1 h-3 w-3" />
      Regular (45m x2)
    </Badge>
  );
}

function riskBadge(risk: number) {
  if (risk >= 70) {
    return (
      <Badge className="bg-destructive/15 text-destructive border-0">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Alto ({risk}%)
      </Badge>
    );
  }
  if (risk >= 30) {
    return (
      <Badge className="bg-warning/20 text-warning-foreground border-0">
        Medio ({risk}%)
      </Badge>
    );
  }
  return (
    <Badge className="bg-success/15 text-success border-0">
      Bajo ({risk}%)
    </Badge>
  );
}

export function StudentsTable() {
  const students = useAppStore((s) => s.adminStudents);
  const setStudentStatus = useAppStore((s) => s.setStudentStatus);
  const assignTeacher = useAppStore((s) => s.assignTeacher);
  const setStudentModality = useAppStore((s) => s.setStudentModality);
  const addStudentCredit = useAppStore((s) => s.addStudentCredit);
  const consumeStudentCredit = useAppStore((s) => s.consumeStudentCredit);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [teacherFilter, setTeacherFilter] = useState(ALL);
  const [modalityFilter, setModalityFilter] = useState(ALL);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      const matchSearch =
        search.trim() === "" ||
        st.name.toLowerCase().includes(search.toLowerCase()) ||
        st.family.toLowerCase().includes(search.toLowerCase()) ||
        st.instrument.toLowerCase().includes(search.toLowerCase()) ||
        st.email.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === ALL || st.status === statusFilter;
      const matchTeacher = teacherFilter === ALL || st.teacher === teacherFilter;
      const matchModality =
        modalityFilter === ALL ||
        (modalityFilter === "regular" && st.modality.startsWith("Regular")) ||
        (modalityFilter === "intensivo" && st.modality.startsWith("Intensivo"));

      return matchSearch && matchStatus && matchTeacher && matchModality;
    });
  }, [students, search, statusFilter, teacherFilter, modalityFilter]);

  const activeCount = students.filter((s) => s.status === "activo").length;
  const inactiveCount = students.filter((s) => s.status !== "activo").length;

  const selectedStudent = students.find((s) => s.id === selectedStudentId) ?? null;

  return (
    <div className="space-y-6">
      {/* Resumen superior */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Tile
          icon={UserCheck}
          label="Alumnos Activos"
          value={`${activeCount}`}
          hint="En clase regular o intensiva"
          tone="text-success"
        />
        <Tile
          icon={UserX}
          label="Alumnos Inactivos"
          value={`${inactiveCount}`}
          hint={`${students.filter((s) => s.status === "pausa").length} pausa, ${students.filter((s) => s.status === "baja").length} baja`}
          tone="text-warning"
        />
        <Tile
          icon={GraduationCap}
          label="Asistencia Promedio"
          value={`${Math.round(
            students.reduce((acc, s) => acc + s.attendanceRate, 0) / (students.length || 1),
          )}%`}
          hint="Promedio general mensual"
        />
        <Tile
          icon={AlertTriangle}
          label="En Riesgo de Deserción"
          value={`${students.filter((s) => s.risk >= 70).length}`}
          hint="Riesgo > 70%"
          alert={students.filter((s) => s.risk >= 70).length > 0}
        />
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno, apoderado, correo o instrumento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[11rem]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Estado: todos</SelectItem>
            <SelectItem value="activo">Activos ({activeCount})</SelectItem>
            <SelectItem value="pausa">En pausa</SelectItem>
            <SelectItem value="baja">Bajas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-[12rem]">
            <SelectValue placeholder="Modalidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Modalidad: todas</SelectItem>
            <SelectItem value="regular">Regular (8 clases / 45m)</SelectItem>
            <SelectItem value="intensivo">Intensivo (4 clases / 90m)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={teacherFilter} onValueChange={setTeacherFilter}>
          <SelectTrigger className="w-[13rem]">
            <SelectValue placeholder="Profesor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Profesor: todos</SelectItem>
            {teachers.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(search || statusFilter !== ALL || teacherFilter !== ALL || modalityFilter !== ALL) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setStatusFilter(ALL);
              setTeacherFilter(ALL);
              setModalityFilter(ALL);
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla de Alumnos */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Alumno / Apoderado</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Instrumento</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead className="w-[9rem]">Asistencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead className="text-right">Ficha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No se encontraron alumnos con los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((st) => (
                  <TableRow
                    key={st.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => setSelectedStudentId(st.id)}
                  >
                    <TableCell>
                      <div className="font-semibold">{st.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {st.family} · {st.level}
                      </div>
                    </TableCell>
                    <TableCell>{modalityBadge(st.modality)}</TableCell>
                    <TableCell className="text-sm font-medium">{st.instrument}</TableCell>
                    <TableCell className="text-sm">{st.teacher}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{st.attendanceRate}%</span>
                        </div>
                        <Progress value={st.attendanceRate} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(st.status)}</TableCell>
                    <TableCell>{riskBadge(st.risk)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentId(st.id);
                        }}
                      >
                        Ver Ficha
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Sheet Ficha del Alumno Ampliada */}
      <Sheet open={!!selectedStudent} onOpenChange={(o) => !o && setSelectedStudentId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedStudent && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl">{selectedStudent.name}</SheetTitle>
                  {statusBadge(selectedStudent.status)}
                </div>
                <SheetDescription>
                  {selectedStudent.family} · {selectedStudent.instrument} ({selectedStudent.level})
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 pt-5">
                {/* Modalidad y Horarios Oficiales */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Modalidad de Estudio (Vibra Music)
                    </span>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {selectedStudent.modality.includes("Regular") ? "2 veces/semana" : "1 vez/semana"}
                    </Badge>
                  </div>

                  <Select
                    value={selectedStudent.modality}
                    onValueChange={(v) => {
                      setStudentModality(selectedStudent.id, v as LessonModality);
                      toast.success(`Modalidad actualizada a ${v}`);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular (8 clases / 45 min)">
                        Regular: 8 clases/mes (2x semana, 45 min)
                      </SelectItem>
                      <SelectItem value="Intensivo (4 clases / 90 min)">
                        Intensivo: 4 clases/mes (1x semana, 90 min)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Contacto y Cumpleaños */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-border p-3.5 space-y-2 bg-card">
                    <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Datos de Contacto
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate">{selectedStudent.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <span>{selectedStudent.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-medium text-info">
                      <Cake className="h-3.5 w-3.5 text-warning" />
                      <span>Cumpleaños: {selectedStudent.birthdate}</span>
                    </p>
                  </div>

                  <div className="rounded-xl border border-border p-3.5 space-y-2 bg-card">
                    <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                      Contacto de Emergencia
                    </p>
                    <p className="font-bold">{selectedStudent.emergencyContact.name}</p>
                    <p className="text-muted-foreground">{selectedStudent.emergencyContact.relation}</p>
                    <p className="flex items-center gap-1.5 font-medium text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>{selectedStudent.emergencyContact.phone}</span>
                    </p>
                  </div>
                </div>

                {/* Estado y Profesor */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Estado del alumno</label>
                    <Select
                      value={selectedStudent.status}
                      onValueChange={(v) => {
                        setStudentStatus(selectedStudent.id, v as StudentStatus);
                        toast.success(`Estado actualizado a ${v}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="pausa">En pausa</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Profesor Asignado</label>
                    <Select
                      value={selectedStudent.teacher}
                      onValueChange={(v) => {
                        assignTeacher(selectedStudent.id, v);
                        toast.success(`Profesor asignado: ${v}`);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Registro de Créditos de Recuperación */}
                <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Créditos de Recuperación por Faltas
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Falta (+1 crédito) · Asistencia a recuperación (-1 crédito)
                      </p>
                    </div>
                    <span className="text-2xl font-bold tabular-nums text-primary">
                      {selectedStudent.makeupCredits}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        addStudentCredit(selectedStudent.id);
                        toast.info("Crédito registrado", {
                          description: "Se sumó 1 crédito por falta justificada.",
                        });
                      }}
                    >
                      <PlusCircle className="mr-1.5 h-3.5 w-3.5 text-warning" />
                      +1 Crédito (Falta)
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      disabled={selectedStudent.makeupCredits === 0}
                      onClick={() => {
                        consumeStudentCredit(selectedStudent.id);
                        toast.success("Crédito descontado", {
                          description: "El alumno asistió a su clase de recuperación.",
                        });
                      }}
                    >
                      <MinusCircle className="mr-1.5 h-3.5 w-3.5 text-success" />
                      -1 Crédito (Recuperada)
                    </Button>
                  </div>
                </div>

                {/* Historial de Asistencia y Notas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                      Asistencia Reciente ({selectedStudent.attendanceRate}%)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {selectedStudent.recentAttendance.map((att, idx) => (
                      <Badge
                        key={idx}
                        className={`capitalize border-0 ${
                          att === "presente"
                            ? "bg-success/20 text-success"
                            : att === "tarde"
                              ? "bg-warning/25 text-warning-foreground"
                              : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {att}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reportes de Avance del Profesor */}
                <div className="rounded-xl border border-border p-4 space-y-2 bg-card">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Reportes de Avance del Profesor
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Observaciones registradas para el seguimiento del alumno:
                  </p>
                  <div className="rounded-lg bg-muted/40 p-3 text-xs italic text-foreground">
                    "{selectedStudent.teacherNote}"
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  alert,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint: string;
  tone?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-4 w-4 ${alert ? "text-destructive" : tone ?? "text-primary"}`} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
    </div>
  );
}
