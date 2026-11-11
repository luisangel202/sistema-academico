import { GraduationCap, Star, Users, Eye, AlertCircle } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";
import { usuarios, notas, materias } from "../../data/mockData";

export default function NotasPadre() {
  const { user } = useAuth();
  
  // Obtener SOLO los hijos del padre actual que estén matriculados y activos
  const misHijos = usuarios.filter(u => 
    user?.hijosIds?.includes(u.id) && 
    u.rol === "ESTUDIANTE" && 
    u.activo === true
  );

  // Si no hay hijos matriculados, mostrar mensaje
  if (misHijos.length === 0) {
    return (
      <div>
        <PageHeader title="Notas de Mis Hijos" subtitle="Consulta el rendimiento académico de tus hijos" />
        
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

  return (
    <div>
      <PageHeader 
        title="Notas de Mis Hijos" 
        subtitle="Consulta el rendimiento académico de tus hijos matriculados" 
      />

      {/* Mostrar cada hijo matriculado con sus notas */}
      {misHijos.map((hijo) => {
        // Obtener SOLO las notas de este hijo específico
        const notasHijo = notas.filter(n => n.estudianteId === hijo.id);
        const promedio = notasHijo.length > 0
          ? (notasHijo.reduce((a, b) => a + b.promedio, 0) / notasHijo.length).toFixed(1)
          : "-";
        
        return (
          <div key={hijo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            {/* Header del hijo */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {hijo.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{hijo.nombre}</h3>
                  <p className="text-sm text-gray-500">Grado {hijo.grado} · IE Rural El Progreso</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label="Matriculado" variant="success" />
                  <div className="flex items-center gap-1 text-blue-600">
                    <Eye size={16} />
                    <span className="text-sm font-medium">Solo lectura</span>
                  </div>
                </div>
              </div>
              
              {/* Resumen académico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Star size={20} className="text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{promedio}</p>
                  <p className="text-xs text-blue-600">Promedio general</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <GraduationCap size={20} className="text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{notasHijo.length}</p>
                  <p className="text-xs text-green-600">Materias registradas</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <AlertCircle size={20} className="text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-700">
                    {notasHijo.filter(n => n.promedio >= 3.5).length}
                  </p>
                  <p className="text-xs text-purple-600">Materias aprobadas</p>
                </div>
              </div>
            </div>

            {/* Lista de notas del hijo */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap size={18} />
                Notas por Materia
              </h4>
              
              {notasHijo.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <GraduationCap size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin notas registradas para este período</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notasHijo.map((nota) => {
                    const materia = materias.find(m => m.id === nota.materiaId);
                    return (
                      <div 
                        key={nota.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">
                              {materia?.nombre?.charAt(0) || 'M'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{materia?.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {nota.nota1} · {nota.nota2} · {nota.nota3}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-lg font-bold ${
                              nota.promedio >= 3.5 ? "text-green-600" : 
                              nota.promedio >= 3.0 ? "text-yellow-600" : "text-red-600"
                            }`}>
                              {nota.promedio}
                            </span>
                            <p className="text-xs text-gray-400">Definitiva</p>
                          </div>
                          
                          {/* Indicador visual de rendimiento */}
                          <div className={`w-3 h-3 rounded-full ${
                            nota.promedio >= 3.5 ? "bg-green-500" : 
                            nota.promedio >= 3.0 ? "bg-yellow-500" : "bg-red-500"
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer informativo */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Eye size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <strong>Modo de solo lectura:</strong> Como acudiente, solo puedes visualizar las notas de tu hijo. 
                    Para cualquier consulta o aclaración sobre las calificaciones, comunícate con el docente de la materia 
                    o la coordinación académica.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
