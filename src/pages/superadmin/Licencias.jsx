import { useState } from "react";
import { usePersistedState } from "../../hooks/usePersistedState";
import { Shield, CheckCircle, XCircle, Edit } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { instituciones } from "../../data/mockData";

export default function Licencias() {
  const [lista, setLista] = usePersistedState("er_instituciones", instituciones);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  const abrirEditar = (inst) => {
    setEditando(inst.id);
    setForm({ licencia: inst.licencia, vencimiento: inst.vencimiento });
  };

  const guardar = (e) => {
    e.preventDefault();
    setLista(lista.map((i) => i.id === editando ? { ...i, ...form } : i));
    setEditando(null);
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Licencias"
        subtitle="Administra las licencias de cada institución"
        icon={Shield}
        color="#7c3aed"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total licencias",       value: lista.length,                                          color: "bg-blue-50 text-blue-700 border-blue-100"   },
          { label: "Premium activas",       value: lista.filter(i => i.licencia === "premium" && i.activa).length, color: "bg-purple-50 text-purple-700 border-purple-100" },
          { label: "Vencidas / inactivas",  value: lista.filter(i => !i.activa).length,                  color: "bg-red-50 text-red-700 border-red-100"       },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 border ${s.color}`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-sm mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Institución</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Tipo</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Vencimiento</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left px-5 py-3 text-gray-400 font-bold text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lista.map((inst) => {
                const vencida = new Date(inst.vencimiento) < new Date();
                return (
                  <tr key={inst.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-800">{inst.nombre}</p>
                      <p className="text-xs text-gray-400 font-mono">{inst.codigo}</p>
                    </td>
                    <td className="px-5 py-3.5"><Badge label={inst.licencia} variant={inst.licencia} dot /></td>
                    <td className="px-5 py-3.5">
                      <span className={vencida ? "text-red-600 font-semibold" : "text-gray-600"}>{inst.vencimiento}</span>
                      {vencida && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">Vencida</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {inst.activa
                        ? <span className="flex items-center gap-1.5 text-green-600 text-xs font-semibold"><CheckCircle size={13} /> Activa</span>
                        : <span className="flex items-center gap-1.5 text-red-500 text-xs font-semibold"><XCircle size={13} /> Inactiva</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => abrirEditar(inst)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer">
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)} title="Editar Licencia">
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de licencia</label>
            <select value={form.licencia || ""} onChange={(e) => setForm({ ...form, licencia: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="basica">Básica</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
            <input type="date" value={form.vencimiento || ""} onChange={(e) => setForm({ ...form, vencimiento: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditando(null)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancelar</button>
            <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 border-0 cursor-pointer">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
