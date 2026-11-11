import { BookOpen, Users, Star } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";
import { materias, cursos, periodos } from "../../data/mockData";

export default function MisCursos() {
  const { user } = useAuth();
  const misMaterias = materias.filter((m) => m.docenteId === user?.id);
  const misCursosIds = [...new Set(misMaterias.map((m) => m.cursoId))];
  const misCursos = cursos.filter((c) => misCursosIds.includes(c.id));

  return (
    <div>
      <PageHeader
        title="Mis Cursos"
        subtitle="Cursos y materias asignados este período"
        icon={BookOpen}
        color="#3b82f6"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {misCursos.map((curso) => {
          const materiasDelCurso = misMaterias.filter((m) => m.cursoId === curso.id);
          const periodo = periodos.find((p) => p.id === curso.periodoId);
          return (
            <div key={curso.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"
                  style={{ border: "1.5px solid #bfdbfe" }}>
                  <BookOpen size={22} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{curso.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Users size={12} /> {curso.estudiantes} estudiantes</span>
                    <Badge label={periodo?.estado || "pendiente"} variant={periodo?.estado || "pendiente"} dot />
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Materias que dicto</p>
              <div className="flex flex-col gap-2">
                {materiasDelCurso.map((m) => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 hover:bg-gray-100 transition">
                    <div className="flex items-center gap-2">
                      <Star size={13} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">{m.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{m.intensidad}h/sem</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
