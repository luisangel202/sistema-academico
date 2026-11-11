import { useState } from "react";
import { Download, Filter, Edit, Trash2, UserPlus } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { usuarios, cursos, periodos } from "../../data/mockData";

export default function Listados() {
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroRol, setFiltroRol] = useState("ESTUDIANTE");
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [usuariosList, setUsuariosList] = useState(usuarios);

  const usuariosFiltrados = usuariosList.filter((u) => {
    const matchRol = filtroRol ? u.rol === filtroRol : true;
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) || u.documento.includes(search);
    return matchRol && matchSearch && u.institucionId === 1;
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      nombre: user.nombre,
      documento: user.documento,
      correo: user.correo,
      telefono: user.telefono || '',
      direccion: user.direccion || '',
      rol: user.rol,
      activo: user.activo
    });
    setShowEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setUsuariosList(usuariosList.map(u => 
      u.id === selectedUser.id 
        ? { ...u, ...editForm }
        : u
    ));
    setShowEditModal(false);
    setSelectedUser(null);
    setEditForm({});
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setUsuariosList(usuariosList.filter(u => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  return (
    <div>
      <PageHeader
        title="Listados"
        subtitle="Genera y descarga listados de estudiantes y docentes"
        icon={Download}
        color="#3b82f6"
        action={
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition border-0 cursor-pointer">
            <Download size={16} /> Exportar Excel
          </button>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="ESTUDIANTE">Estudiantes</option>
          <option value="DOCENTE">Docentes</option>
          <option value="PADRE">Padres</option>
          <option value="">Todos</option>
        </select>
        {filtroRol === "ESTUDIANTE" && (
          <select value={filtroCurso} onChange={(e) => setFiltroCurso(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Todos los cursos</option>
            {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">{usuariosFiltrados.length} registros encontrados</p>
          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-transparent border-0 cursor-pointer font-semibold">
            <Download size={13} /> Descargar PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Nombre</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Documento</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Correo</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuariosFiltrados.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">{u.avatar}</div>
                      <div>
                        <span className="font-semibold text-gray-800">{u.nombre}</span>
                        <div className="text-xs text-gray-400">{u.rol.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 font-mono text-xs hidden md:table-cell">{u.documento}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs hidden lg:table-cell">{u.correo}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={u.activo ? "Activo" : "Inactivo"} variant={u.activo ? "success" : "danger"} dot />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(u)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                        title="Editar usuario"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Usuario">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input 
                required 
                value={editForm.nombre} 
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
              <input 
                required 
                value={editForm.documento} 
                onChange={(e) => setEditForm({ ...editForm, documento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input 
                required 
                type="email" 
                value={editForm.correo} 
                onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                value={editForm.telefono} 
                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input 
                value={editForm.direccion} 
                onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select 
                required 
                value={editForm.rol} 
                onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="DOCENTE">Docente</option>
                <option value="PADRE">Padre</option>
                <option value="DIRECTOR_GRUPO">Director de Grupo</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="PSICOORIENTADOR">Psicoorientador</option>
                <option value="SECRETARIA">Secretaria</option>
                <option value="ADMIN_INSTITUCIONAL">Administrador Institucional</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select 
                required 
                value={editForm.activo} 
                onChange={(e) => setEditForm({ ...editForm, activo: e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => setShowEditModal(false)} 
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer"
            >
              Actualizar Usuario
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Eliminación">
        <div className="flex flex-col gap-4">
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-800">
              ¿Está seguro que desea eliminar al usuario <strong>{selectedUser?.nombre}</strong>?
            </p>
            <p className="text-xs text-red-600 mt-2">
              Esta acción eliminará permanentemente al usuario del sistema y no se puede deshacer.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
            <p><strong>Usuario:</strong> {selectedUser?.nombre}</p>
            <p><strong>Documento:</strong> {selectedUser?.documento}</p>
            <p><strong>Rol:</strong> {selectedUser?.rol?.replace('_', ' ')}</p>
            <p><strong>Estado:</strong> {selectedUser?.activo ? 'Activo' : 'Inactivo'}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setShowDeleteModal(false)} 
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmDelete} 
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 border-0 cursor-pointer"
            >
              Eliminar Usuario
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
