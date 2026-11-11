import { BookOpen, Star, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { materias, usuarios, notas } from "../../data/mockData";

export default function MisMaterias() {
  const { user } = useAuth();
  const misMaterias = materias.filter((m) => m.cursoId === user.cursoId);

  return (
    <div>
      <PageHeader
        title="Mis Materias"
        subtitle={`${user.nombre} · ${user.grado} · Período 2 — 2025`}
        icon={BookOpen}
        color="#3b82f6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {misMaterias.map((m) => {
          const docente = usuarios.find((u) => u.id === m.docenteId);
          const nota = notas.find((n) => n.estudianteId === user.id && n.materiaId === m.id);
          return (
            <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ border: "1.5px solid #bfdbfe" }}>
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{m.nombre}</p>
                  <p className="text-xs text-gray-400 font-mono">{m.codigo}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-green-50 rounded-lg flex items-center justify-center text-[10px]">👨‍🏫</span>
                  {docente?.nombre || "Sin docente"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-400" />
                  {m.intensidad} horas/semana
                </span>
              </div>
              {nota && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Star size={11} className="text-yellow-500" /> Promedio actual
                  </span>
                  <span className={`text-lg font-black ${nota.promedio >= 3.5 ? "text-green-600" : nota.promedio >= 3.0 ? "text-yellow-600" : "text-red-600"}`}>
                    {nota.promedio}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
