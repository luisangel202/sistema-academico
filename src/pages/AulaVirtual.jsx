import { useState } from "react";
import { useInstState } from "../hooks/useInstState";
import { BookOpen, Download, FileText, Video, Link, Filter } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import { useAuth } from "../context/AuthContext";
import { materias, usuarios, cursos } from "../data/mockData";

const recursosIniciales = [
  { id:1, titulo:"Guía de álgebra - Capítulo 5", tipo:"PDF", materiaId:1, cursoId:2, docenteId:5, fecha:"2025-05-01", tamaño:"1.2 MB", descripcion:"Ejercicios resueltos y propuestos de álgebra básica." },
  { id:2, titulo:"Video: Ecosistemas colombianos", tipo:"VIDEO", materiaId:3, cursoId:2, docenteId:5, fecha:"2025-04-28", tamaño:"—", descripcion:"Documental sobre biodiversidad en Colombia." },
  { id:3, titulo:"Taller de comprensión lectora", tipo:"DOC", materiaId:2, cursoId:2, docenteId:6, fecha:"2025-04-25", tamaño:"0.8 MB", descripcion:"Lectura y preguntas de comprensión para el período 2." },
  { id:4, titulo:"Mapa conceptual - Revolución Industrial", tipo:"IMG", materiaId:4, cursoId:2, docenteId:6, fecha:"2025-05-03", tamaño:"0.4 MB", descripcion:"Mapa conceptual para estudiar el tema de historia." },
  { id:5, titulo:"Enlace: Khan Academy Matemáticas", tipo:"LINK", materiaId:1, cursoId:2, docenteId:5, fecha:"2025-05-05", tamaño:"—", descripcion:"Recurso externo para refuerzo de matemáticas." },
  { id:6, titulo:"Presentación: Célula y sus partes", tipo:"PPT", materiaId:3, cursoId:2, docenteId:5, fecha:"2025-04-20", tamaño:"3.5 MB", descripcion:"Presentación usada en clase sobre biología celular." },
];

const tipoIcono = {
  PDF:   { icon: FileText, color: "bg-red-100 text-red-600" },
  DOC:   { icon: FileText, color: "bg-blue-100 text-blue-600" },
  PPT:   { icon: FileText, color: "bg-orange-100 text-orange-600" },
  VIDEO: { icon: Video,    color: "bg-purple-100 text-purple-600" },
  LINK:  { icon: Link,     color: "bg-green-100 text-green-600" },
  IMG:   { icon: FileText, color: "bg-yellow-100 text-yellow-600" },
};

export default function AulaVirtual() {
  const { user } = useAuth();
  const [recursos] = useInstState("er_aula_virtual", recursosIniciales);
  const [search, setSearch] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  const misMaterias = materias.filter(m => m.cursoId === 2);

  const filtrados = recursos.filter(r => {
    const matchSearch = r.titulo.toLowerCase().includes(search.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchMateria = filtroMateria ? r.materiaId === Number(filtroMateria) : true;
    const matchTipo = filtroTipo ? r.tipo === filtroTipo : true;
    return matchSearch && matchMateria && matchTipo;
  });

  // Agrupar por materia
  const porMateria = misMaterias.map(m => ({
    materia: m,
    recursos: filtrados.filter(r => r.materiaId === m.id),
  })).filter(g => g.recursos.length > 0);

  return (
    <div>
      <PageHeader
        title="Aula Virtual"
        subtitle="Materiales y recursos académicos de tus materias"
      />

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar recurso..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"/>
        </div>
        <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todas las materias</option>
          {misMaterias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Todos los tipos</option>
          {["PDF","DOC","PPT","VIDEO","LINK","IMG"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Contenido por materia */}
      {porMateria.length > 0 ? (
        <div className="flex flex-col gap-8">
          {porMateria.map(({ materia, recursos: recsMateria }) => {
            const docente = usuarios.find(u => u.id === materia.docenteId);
            return (
              <div key={materia.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-blue-600"/>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{materia.nombre}</h3>
                    <p className="text-xs text-gray-400">Prof. {docente?.nombre} · {materia.intensidad}h/sem</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">{recsMateria.length} recurso(s)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recsMateria.map(r => {
                    const { icon: Icon, color } = tipoIcono[r.tipo] || tipoIcono.DOC;
                    return (
                      <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                            <Icon size={18}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{r.titulo}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge label={r.tipo} variant="info"/>
                              {r.tamaño !== "—" && <span className="text-xs text-gray-400">{r.tamaño}</span>}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{r.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{r.fecha}</span>
                          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-transparent border-0 cursor-pointer font-medium">
                            {r.tipo === "LINK" ? <><Link size={12}/> Abrir</> : <><Download size={12}/> Descargar</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30"/>
          <p>No se encontraron recursos con ese filtro</p>
        </div>
      )}
    </div>
  );
}
