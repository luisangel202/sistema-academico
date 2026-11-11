import { useState, useEffect } from "react";
import { usePersistedState } from "../../hooks/usePersistedState";
import {
  Plus, CheckCircle, XCircle, Edit, Building2,
  MapPin, Phone, Mail, User, BookOpen, FileText, Globe,
  ChevronDown, ChevronUp, Save, Eye, Users, GraduationCap
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ImageUploader from "../../components/ImageUploader";
import { instituciones as dataInst } from "../../data/mockData";
import { useImages } from "../../context/ImageContext";
import { useBulkSelect } from "../../hooks/useBulkSelect";
import { Checkbox, BulkBar, SelectAllBar, ConfirmDeleteModal } from "../../components/BulkActions";
import { useToast } from "../../components/Toast";
import { useImportContext } from "../../context/ImportContext";

const DEPARTAMENTOS = [
  "Amazonas","Antioquia","Arauca","Atlantico","Bolivar","Boyaca","Caldas",
  "Caqueta","Casanare","Cauca","Cesar","Choco","Cordoba","Cundinamarca",
  "Guainia","Guaviare","Huila","La Guajira","Magdalena","Meta","Narino",
  "Norte de Santander","Putumayo","Quindio","Risaralda","San Andres",
  "Santander","Sucre","Tolima","Valle del Cauca","Vaupes","Vichada",
];

const NIVELES = [
  { value: "preescolar", label: "Preescolar" },
  { value: "primaria",   label: "Basica Primaria" },
  { value: "secundaria", label: "Basica Secundaria" },
  { value: "media",      label: "Media" },
  { value: "clei",       label: "CLEI (Adultos)" },
];

const MODELOS = [
  "Convencional","Escuela Nueva","Postprimaria","SAT",
  "Aceleracion del Aprendizaje","Telesecundaria","Caminar en Secundaria","Otro",
];

const JORNADAS = ["manana","tarde","noche","completa","fin de semana"];

const FORM_INICIAL = {
  codigo:"", codigoDANE:"", nit:"", codigoSecretaria:"",
  nombre:"", naturaleza:"oficial", caracter:"academico", jornadas:[],
  departamento:"Antioquia", municipio:"", zona:"rural", direccion:"", barrio:"",
  telefono:"", correo:"", sitioWeb:"",
  rector:"", rectordocumento:"", rectorcorreo:"", rectortelefono:"", rectorresolucion:"",
  niveles:[], grados:[], sedes:1, modeloPedagogico:"Escuela Nueva",
  resolucionAprobacion:"", secretariaEducacion:"", codigoETC:"",
  licencia:"basica",
};

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 hover:bg-white transition";

function Seccion({ titulo, icono: Icono, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition border-0 cursor-pointer">
        <div className="flex items-center gap-2.5">
          <Icono size={16} className="text-blue-600" />
          <span className="font-semibold text-sm text-gray-800">{titulo}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>}
    </div>
  );
}

function Campo({ label, required, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function Instituciones() {
  const [instituciones, setInstituciones] = usePersistedState("er_instituciones", dataInst);
  const [search, setSearch]               = useState("");
  const [filtroActiva, setFiltroActiva]   = useState("");
  const [filtroLicencia, setFiltroLicencia] = useState("");
  const [showModal, setShowModal]         = useState(false);
  const [showDetalle, setShowDetalle]     = useState(false);
  const [instSeleccionada, setInstSeleccionada] = useState(null);
  const [editLogoInst, setEditLogoInst]   = useState(null);
  const [form, setForm]                   = useState(FORM_INICIAL);
  const [tabForm, setTabForm]             = useState("identificacion");
  const { getLogo, setLogo }              = useImages();
  const toast = useToast();
  const { pendingImport, consumePending } = useImportContext();

  const handleImport = (rows) => {
    let importados = 0;
    rows.forEach((row) => {
      const nombre = row.nombre || row.Nombre || row.institucion || "";
      if (!nombre) return;
      setInstituciones(prev => [...prev, {
        id: Date.now() + importados,
        nombre,
        codigo: row.codigo || row.Codigo || "",
        codigoDANE: row.codigoDANE || row.DANE || "",
        nit: row.nit || "",
        naturaleza: row.naturaleza || "oficial",
        caracter: row.caracter || "academico",
        departamento: row.departamento || row.Departamento || "Antioquia",
        municipio: row.municipio || row.Municipio || "",
        zona: row.zona || "rural",
        direccion: row.direccion || "",
        telefono: row.telefono || "",
        correo: row.correo || "",
        rector: row.rector || row.Rector || "",
        licencia: row.licencia || "basica",
        activa: true,
        vencimiento: "2026-12-31",
        estudiantes: 0,
        docentes: 0,
        sedes: Number(row.sedes || 1),
      }]);
      importados++;
    });
    if (importados > 0) toast.success(`${importados} instituci�n(es) importada(s)`);
    else toast.error("No se encontraron filas v�lidas (requiere nombre)");
  };

  useEffect(() => {
    if (pendingImport?.destinationId === "instituciones") {
      handleImport(pendingImport.data);
      consumePending();
    }
  }, [pendingImport]);

  const filtered = instituciones.filter((i) => {
    const matchSearch = !search ||
      i.nombre.toLowerCase().includes(search.toLowerCase()) ||
      i.codigo.toLowerCase().includes(search.toLowerCase()) ||
      (i.codigoDANE || "").includes(search) ||
      (i.municipio || "").toLowerCase().includes(search.toLowerCase());
    const matchActiva   = filtroActiva   === "" ? true : String(i.activa) === filtroActiva;
    const matchLicencia = filtroLicencia === "" ? true : i.licencia === filtroLicencia;
    return matchSearch && matchActiva && matchLicencia;
  });

  const bulk = useBulkSelect(filtered);
  const [confirmDel, setConfirmDel] = useState(false);

  const eliminarSeleccionados = () => {
    const count = bulk.count;
    bulk.removeSelected(setInstituciones);
    setConfirmDel(false);
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleArr = (key, val) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter(x => x !== val)
        : [...prev[key], val],
    }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const nueva = {
      ...form,
      id: Date.now(),
      activa: true,
      vencimiento: "2026-12-31",
      estudiantes: 0,
      docentes: 0,
      sedes: Number(form.sedes) || 1,
    };
    setInstituciones([...instituciones, nueva]);
    setShowModal(false);
    setForm(FORM_INICIAL);
    setTabForm("identificacion");
  };

  const toggleActiva = (id) =>
    setInstituciones(instituciones.map(i => i.id === id ? { ...i, activa: !i.activa } : i));

  const abrirDetalle = (inst) => { setInstSeleccionada(inst); setShowDetalle(true); };

  const TABS = [
    { id: "identificacion", label: "Identificacion", icon: FileText },
    { id: "ubicacion",      label: "Ubicacion",      icon: MapPin },
    { id: "contacto",       label: "Contacto",       icon: Phone },
    { id: "rector",         label: "Rector",         icon: User },
    { id: "academico",      label: "Academico",      icon: BookOpen },
    { id: "normativo",      label: "Normativo",      icon: GraduationCap },
    { id: "sistema",        label: "Sistema",        icon: Globe },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Instituciones"
        subtitle="Gestiona las instituciones educativas registradas en la plataforma"
        action={
          <button onClick={() => { setShowModal(true); setForm(FORM_INICIAL); setTabForm("identificacion"); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition border-0 cursor-pointer shadow-sm shadow-blue-200">
            <Plus size={15} /> Nueva Institucion
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-52">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, codigo DANE, municipio..."
            className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={filtroActiva} onChange={e => setFiltroActiva(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
        <select value={filtroLicencia} onChange={e => setFiltroLicencia(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="">Todas las licencias</option>
          <option value="premium">Premium</option>
          <option value="basica">Basica</option>
        </select>
      </div>
      <p className="text-xs text-gray-400">{filtered.length} institucion(es)</p>

      {bulk.count > 0 && (
        <BulkBar count={bulk.count} label="instituci�n"
          onDelete={() => setConfirmDel(true)} onClear={bulk.clear} />
      )}

      <SelectAllBar allSelected={bulk.allSelected} someSelected={bulk.someSelected}
        count={filtered.length} onToggleAll={bulk.toggleAll} label="instituci�n" />

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3 w-10"></th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Institucion</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Ubicacion</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Rector</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Licencia</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden sm:table-cell">Vencimiento</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Usuarios</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Estado</th>
                <th className="text-left px-5 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inst) => (
                <tr key={inst.id} className="hover:bg-blue-50/20 transition">
                  <td className="px-5 py-4"><Checkbox checked={bulk.selected.has(inst.id)} onChange={() => bulk.toggle(inst.id)} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {getLogo(inst.id) ? (
                        <img src={getLogo(inst.id)} alt="logo"
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} className="text-blue-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate max-w-48">{inst.nombre}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400 font-mono">{inst.codigo}</span>
                          {inst.codigoDANE && (
                            <span className="text-xs text-gray-300">|</span>
                          )}
                          {inst.codigoDANE && (
                            <span className="text-xs text-gray-400">DANE: {inst.codigoDANE}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-gray-700">{inst.municipio}, {inst.departamento}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{inst.zona || "rural"}</p>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-700">{inst.rector || "Sin asignar"}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge label={inst.licencia} variant={inst.licencia === "premium" ? "purple" : "gray"} dot />
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-sm hidden sm:table-cell">{inst.vencimiento}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users size={12} /> {inst.estudiantes}</span>
                      <span className="flex items-center gap-1"><User size={12} /> {inst.docentes}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {inst.activa ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                        <CheckCircle size={13} /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                        <XCircle size={13} /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => abrirDetalle(inst)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                        title="Ver detalle">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => setEditLogoInst(inst)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition bg-transparent border-0 cursor-pointer"
                        title="Editar logo">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => toggleActiva(inst.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg transition border-0 cursor-pointer font-medium ${
                          inst.activa
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}>
                        {inst.activa ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-400 text-sm">
                    <Building2 size={28} className="mx-auto mb-2 opacity-30" />
                    No se encontraron instituciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal detalle */}
      <Modal open={showDetalle} onClose={() => setShowDetalle(false)} title="Detalle de Institucion" size="lg">
        {instSeleccionada && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              {getLogo(instSeleccionada.id) ? (
                <img src={getLogo(instSeleccionada.id)} alt="logo"
                  className="w-16 h-16 rounded-2xl object-cover border border-blue-200 flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={28} className="text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{instSeleccionada.nombre}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{instSeleccionada.municipio}, {instSeleccionada.departamento}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge label={instSeleccionada.licencia} variant={instSeleccionada.licencia === "premium" ? "purple" : "gray"} dot />
                  <Badge label={instSeleccionada.activa ? "Activa" : "Inactiva"} variant={instSeleccionada.activa ? "success" : "danger"} dot />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { label: "Codigo", value: instSeleccionada.codigo },
                { label: "Codigo DANE", value: instSeleccionada.codigoDANE },
                { label: "NIT", value: instSeleccionada.nit },
                { label: "Naturaleza", value: instSeleccionada.naturaleza },
                { label: "Caracter", value: instSeleccionada.caracter },
                { label: "Zona", value: instSeleccionada.zona },
                { label: "Direccion", value: instSeleccionada.direccion },
                { label: "Telefono", value: instSeleccionada.telefono },
                { label: "Correo", value: instSeleccionada.correo },
                { label: "Rector", value: instSeleccionada.rector },
                { label: "Modelo Pedagogico", value: instSeleccionada.modeloPedagogico },
                { label: "Sedes", value: instSeleccionada.sedes },
                { label: "Resolucion Aprobacion", value: instSeleccionada.resolucionAprobacion },
                { label: "Secretaria Educacion", value: instSeleccionada.secretariaEducacion },
                { label: "Estudiantes", value: instSeleccionada.estudiantes },
                { label: "Docentes", value: instSeleccionada.docentes },
              ].map(({ label, value }) => value ? (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-gray-800 font-medium mt-0.5">{value}</p>
                </div>
              ) : null)}
            </div>

            {instSeleccionada.niveles?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Niveles educativos</p>
                <div className="flex flex-wrap gap-2">
                  {instSeleccionada.niveles.map(n => (
                    <span key={n} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium capitalize">{n}</span>
                  ))}
                </div>
              </div>
            )}

            {instSeleccionada.jornadas?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Jornadas</p>
                <div className="flex flex-wrap gap-2">
                  {instSeleccionada.jornadas.map(j => (
                    <span key={j} className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium capitalize">{j}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal logo */}
      <Modal open={!!editLogoInst} onClose={() => setEditLogoInst(null)}
        title={editLogoInst ? "Logo � " + editLogoInst.nombre : ""}>
        {editLogoInst && (
          <div className="flex flex-col items-center gap-5 py-2">
            <ImageUploader
              currentImage={getLogo(editLogoInst.id)}
              onImage={(url) => setLogo(editLogoInst.id, url)}
              onRemove={() => setLogo(editLogoInst.id, null)}
              shape="square" size={120}
              placeholder={<Building2 size={40} className="text-blue-400" />}
              label="Cargar logo"
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">{editLogoInst.nombre}</p>
              <p className="text-xs text-gray-400">{editLogoInst.codigo}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 w-full">
              El logo aparecera en el sidebar y documentos generados. Recomendado: PNG o SVG con fondo transparente.
            </div>
            <button onClick={() => setEditLogoInst(null)}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer">
              Listo
            </button>
          </div>
        )}
      </Modal>

      {/* Modal crear institucion */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva Institucion" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">

          {/* Tabs de navegacion */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setTabForm(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border-0 cursor-pointer flex-shrink-0
                  ${tabForm === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab: Identificacion */}
          {tabForm === "identificacion" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nombre oficial *</label>
                <input required value={form.nombre} onChange={e => f("nombre", e.target.value)}
                  placeholder="Institucion Educativa Rural..." className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Codigo interno *</label>
                <input required value={form.codigo} onChange={e => f("codigo", e.target.value)}
                  placeholder="IE004" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Codigo DANE</label>
                <input value={form.codigoDANE} onChange={e => f("codigoDANE", e.target.value)}
                  placeholder="105045000123" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">NIT</label>
                <input value={form.nit} onChange={e => f("nit", e.target.value)}
                  placeholder="890.980.123-4" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Codigo Secretaria</label>
                <input value={form.codigoSecretaria} onChange={e => f("codigoSecretaria", e.target.value)}
                  placeholder="ANT-004" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Naturaleza</label>
                <select value={form.naturaleza} onChange={e => f("naturaleza", e.target.value)} className={inputCls}>
                  <option value="oficial">Oficial</option>
                  <option value="privada">Privada</option>
                  <option value="concesion">Concesion</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Caracter</label>
                <select value={form.caracter} onChange={e => f("caracter", e.target.value)} className={inputCls}>
                  <option value="academico">Academico</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="tecnico-academico">Tecnico-Academico</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Jornadas</label>
                <div className="flex flex-wrap gap-2">
                  {JORNADAS.map(j => (
                    <button key={j} type="button" onClick={() => toggleArr("jornadas", j)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer transition capitalize
                        ${form.jornadas.includes(j) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {j}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Ubicacion */}
          {tabForm === "ubicacion" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Departamento *</label>
                <select required value={form.departamento} onChange={e => f("departamento", e.target.value)} className={inputCls}>
                  {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Municipio *</label>
                <input required value={form.municipio} onChange={e => f("municipio", e.target.value)}
                  placeholder="Apartado" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Zona</label>
                <select value={form.zona} onChange={e => f("zona", e.target.value)} className={inputCls}>
                  <option value="rural">Rural</option>
                  <option value="urbana">Urbana</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Barrio / Vereda</label>
                <input value={form.barrio} onChange={e => f("barrio", e.target.value)}
                  placeholder="Vereda El Progreso" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Direccion</label>
                <input value={form.direccion} onChange={e => f("direccion", e.target.value)}
                  placeholder="Km 5 via Apartado-Turbo" className={inputCls} />
              </div>
            </div>
          )}

          {/* Tab: Contacto */}
          {tabForm === "contacto" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Telefono</label>
                <input value={form.telefono} onChange={e => f("telefono", e.target.value)}
                  placeholder="6048520001" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Correo institucional *</label>
                <input required type="email" value={form.correo} onChange={e => f("correo", e.target.value)}
                  placeholder="ie.nombre@edu.gov.co" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Sitio web</label>
                <input value={form.sitioWeb} onChange={e => f("sitioWeb", e.target.value)}
                  placeholder="https://www.ie-nombre.edu.co" className={inputCls} />
              </div>
            </div>
          )}

          {/* Tab: Rector */}
          {tabForm === "rector" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nombre del rector *</label>
                <input required value={form.rector} onChange={e => f("rector", e.target.value)}
                  placeholder="Nombre completo" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Cedula</label>
                <input value={form.rectordocumento} onChange={e => f("rectordocumento", e.target.value)}
                  placeholder="71234567" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Telefono</label>
                <input value={form.rectortelefono} onChange={e => f("rectortelefono", e.target.value)}
                  placeholder="3001234567" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Correo</label>
                <input type="email" value={form.rectorcorreo} onChange={e => f("rectorcorreo", e.target.value)}
                  placeholder="rector@ie.edu.co" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Resolucion de nombramiento</label>
                <input value={form.rectorresolucion} onChange={e => f("rectorresolucion", e.target.value)}
                  placeholder="Res. 001234 de 2022" className={inputCls} />
              </div>
            </div>
          )}

          {/* Tab: Academico */}
          {tabForm === "academico" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Niveles educativos</label>
                <div className="flex flex-wrap gap-2">
                  {NIVELES.map(n => (
                    <button key={n.value} type="button" onClick={() => toggleArr("niveles", n.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer transition
                        ${form.niveles.includes(n.value) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Numero de sedes</label>
                <input type="number" min="1" value={form.sedes} onChange={e => f("sedes", e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Modelo pedagogico</label>
                <select value={form.modeloPedagogico} onChange={e => f("modeloPedagogico", e.target.value)} className={inputCls}>
                  {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Tab: Normativo */}
          {tabForm === "normativo" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Resolucion de aprobacion</label>
                <input value={form.resolucionAprobacion} onChange={e => f("resolucionAprobacion", e.target.value)}
                  placeholder="Res. 005678 de 2018" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Secretaria de Educacion</label>
                <input value={form.secretariaEducacion} onChange={e => f("secretariaEducacion", e.target.value)}
                  placeholder="Secretaria de Educacion de Antioquia" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Codigo ETC</label>
                <input value={form.codigoETC} onChange={e => f("codigoETC", e.target.value)}
                  placeholder="ANT" className={inputCls} />
              </div>
            </div>
          )}

          {/* Tab: Sistema */}
          {tabForm === "sistema" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Tipo de licencia</label>
                <select value={form.licencia} onChange={e => f("licencia", e.target.value)} className={inputCls}>
                  <option value="basica">Basica</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 sm:col-span-2">
                La fecha de vencimiento se asignara automaticamente a 31/12/2026. Puede modificarse desde el modulo de Licencias.
              </div>
            </div>
          )}

          {/* Navegacion entre tabs */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button type="button"
              onClick={() => {
                const idx = TABS.findIndex(t => t.id === tabForm);
                if (idx > 0) setTabForm(TABS[idx - 1].id);
              }}
              disabled={tabForm === TABS[0].id}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer bg-white disabled:opacity-40 disabled:cursor-not-allowed">
              Anterior
            </button>
            <span className="text-xs text-gray-400">
              {TABS.findIndex(t => t.id === tabForm) + 1} / {TABS.length}
            </span>
            {tabForm === TABS[TABS.length - 1].id ? (
              <button type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer shadow-sm shadow-blue-200">
                <Save size={14} /> Crear Institucion
              </button>
            ) : (
              <button type="button"
                onClick={() => {
                  const idx = TABS.findIndex(t => t.id === tabForm);
                  if (idx < TABS.length - 1) setTabForm(TABS[idx + 1].id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 border-0 cursor-pointer">
                Siguiente
              </button>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal open={confirmDel} count={bulk.count} itemLabel="instituci�n"
        onConfirm={eliminarSeleccionados} onCancel={() => setConfirmDel(false)} />
    </div>
  );
}
