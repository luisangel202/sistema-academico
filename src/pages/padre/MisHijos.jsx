import { GraduationCap, Star, CheckSquare, FileText, Users } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";
import { usuarios, notas, tareas, materias } from "../../data/mockData";

export default function MisHijos() {
  const { user } = useAuth();
  
  // Obtener hijos del padre actual que estén matriculados y activos
  const misHijos = usuarios.filter(u => 
    user?.hijosIds?.includes(u.id) && 
    u.rol === "ESTUDIANTE" && 
    u.activo === true
  );

  // Si no hay hijos matriculados, mostrar mensaje
  if (misHijos.length === 0) {
    return (
      <div>
      <PageHeader
        title="Mis Hijos"
        subtitle="Información académica de tus hijos vinculados"
        icon={GraduationCap}
        color="#3b82f6"
      />
        
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sin hijos matriculados</h3>
          <p className="text-gray-500 text-sm">
            No tienes hijos matriculados actualmente en el sistema. 
            Comunícate con la secretaría académica para más información.
          </p>
        </div>
      </div>
    );
  }

  // Función para obtener información de un hijo específico
  const getHijoInfo = (hijoId) => {
    const hijo = usuarios.find(u => u.id === hijoId);
    const misNotas = notas.filter(n => n.estudianteId === hijoId);
    const misTareas = tareas.filter(t => t.cursoId === hijo.cursoId);
    const promedio = misNotas.length > 0
      ? (misNotas.reduce((a, b) => a + b.promedio, 0) / misNotas.length).toFixed(1)
      : "-";
    
    return { hijo, misNotas, misTareas, promedio };
  };

  return (
    <div>
      <PageHeader title="Mis Hijos" subtitle="Información académica de tus hijos vinculados" icon={GraduationCap} color="#3b82f6" />

      {/* Mostrar cada hijo matriculado */}
      {misHijos.map((hijo) => {
        const { misNotas, misTareas, promedio } = getHijoInfo(hijo.id);
        
        return (
          <div key={hijo.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                {hijo.avatar}
              </div>
              <div>
                <p className="text-xl font-black text-gray-800">{hijo.nombre}</p>
                <p className="text-sm text-gray-500">Grado {hijo.grado} · IE Rural El Progreso</p>
                <Badge label="Matriculado" variant="success" dot />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <Star size={20} className="text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-blue-700">{promedio}</p>
                <p className="text-xs text-blue-600 font-medium">Promedio período</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <CheckSquare size={20} className="text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-green-700">94%</p>
                <p className="text-xs text-green-600 font-medium">Asistencia</p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4 text-center border border-yellow-100">
                <FileText size={20} className="text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-yellow-700">{misTareas.filter(t => t.estado === "activa").length}</p>
                <p className="text-xs text-yellow-600 font-medium">Tareas pendientes</p>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-3">Notas por Materia</h3>
            <div className="flex flex-col gap-2">
              {misNotas.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <GraduationCap size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin notas registradas</p>
                </div>
              ) : (
                misNotas.map((n) => {
                  const materia = materias.find((m) => m.id === n.materiaId);
                  return (
                    <div key={n.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                      <p className="text-sm font-semibold text-gray-700">{materia?.nombre}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{n.nota1} · {n.nota2} · {n.nota3}</span>
                        <span className={`text-lg font-black ${n.promedio >= 3.5 ? "text-green-600" : n.promedio >= 3.0 ? "text-yellow-600" : "text-red-600"}`}>{n.promedio}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
