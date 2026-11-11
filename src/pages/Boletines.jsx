import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";
import PageHeader from "../components/PageHeader";
import Badge from "../components/Badge";
import { useAuth } from "../context/AuthContext";
import { notas, materias, periodos } from "../data/mockData";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Boletines() {
  const { user } = useAuth();
  const periodosConNotas = periodos.filter((p) => p.estado !== "pendiente");

  // Función para generar y descargar PDF del boletín
  const descargarBoletinPDF = async (periodo, notasPeriodo, promedio) => {
    try {
      // Crear el contenido HTML para el PDF
      const contenidoHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Boletín Académico</h1>
            <h2 style="color: #6b7280; font-size: 18px; margin-bottom: 5px;">IE Rural El Progreso</h2>
            <p style="color: #6b7280; font-size: 14px;">${periodo.nombre}</p>
          </div>
          
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Estudiante:</strong> ${user.nombre}</p>
            <p style="margin: 5px 0;"><strong>Grado:</strong> ${user.grado}</p>
            <p style="margin: 5px 0;"><strong>Período:</strong> ${periodo.nombre} (${periodo.inicio} → ${periodo.fin})</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left; font-weight: bold;">Materia</th>
                <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center; font-weight: bold;">Nota 1</th>
                <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center; font-weight: bold;">Nota 2</th>
                <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center; font-weight: bold;">Nota 3</th>
                <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center; font-weight: bold;">Promedio</th>
                <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center; font-weight: bold;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${notasPeriodo.map(nota => {
                const materia = materias.find(m => m.id === nota.materiaId);
                const aprobado = nota.promedio >= 3.0;
                return `
                  <tr>
                    <td style="border: 1px solid #d1d5db; padding: 8px;">${materia?.nombre || 'N/A'}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${nota.nota1}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${nota.nota2}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${nota.nota3}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; font-weight: bold; color: ${aprobado ? '#059669' : '#dc2626'};">${nota.promedio}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">
                      <span style="background-color: ${aprobado ? '#d1fae5' : '#fee2e2'}; color: ${aprobado ? '#059669' : '#dc2626'}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        ${aprobado ? 'APROBADO' : 'REPROBADO'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div style="padding: 15px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
            <p style="margin: 5px 0; font-size: 16px;"><strong>Promedio del Período:</strong> <span style="color: ${promedio >= 3.0 ? '#059669' : '#dc2626'}; font-size: 18px;">${promedio}</span></p>
            <p style="margin: 5px 0;"><strong>Estado General:</strong> <span style="background-color: ${promedio >= 3.0 ? '#d1fae5' : '#fee2e2'}; color: ${promedio >= 3.0 ? '#059669' : '#dc2626'}; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${promedio >= 3.0 ? 'APROBADO' : 'REPROBADO'}</span></p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Documento generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
            <p>Sistema Académico IE Rural El Progreso</p>
          </div>
        </div>
      `;

      // Crear un elemento temporal para renderizar el HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contenidoHTML;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Convertir el HTML a canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      // Eliminar el elemento temporal
      document.body.removeChild(tempDiv);

      // Crear el PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // Ancho A4 en mm
      const pageHeight = 297; // Altura A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Descargar el PDF
      const fileName = `Boletin_${user.nombre.replace(/\s+/g, '_')}_${periodo.nombre.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Boletines"
        subtitle={`Informes académicos de ${user.nombre}`}
        icon={FileText}
        color="#3b82f6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {periodosConNotas.map((periodo) => {
          const notasPeriodo = notas.filter(
            (n) => n.estudianteId === user.id && n.periodoId === periodo.id
          );
          const promedio = notasPeriodo.length > 0
            ? (notasPeriodo.reduce((a, b) => a + b.promedio, 0) / notasPeriodo.length).toFixed(1)
            : null;
          const promedioNum = parseFloat(promedio);
          const aprobado = promedioNum >= 3.0;

          return (
            <div key={periodo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <p className="font-semibold text-gray-800">{periodo.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{periodo.inicio} → {periodo.fin}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={periodo.estado} variant={periodo.estado} dot />
                  {periodo.estado === "cerrado" && (
                    <button 
                      onClick={() => descargarBoletinPDF(periodo, notasPeriodo, promedio)}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-xl hover:bg-blue-700 transition border-0 cursor-pointer font-medium shadow-sm shadow-blue-200"
                    >
                      <Download size={12} /> PDF
                    </button>
                  )}
                </div>
              </div>

              {notasPeriodo.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-5 py-2.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Materia</th>
                          <th className="text-center px-3 py-2.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">N1</th>
                          <th className="text-center px-3 py-2.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">N2</th>
                          <th className="text-center px-3 py-2.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">N3</th>
                          <th className="text-center px-3 py-2.5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Prom.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {notasPeriodo.map((n) => {
                          const materia = materias.find((m) => m.id === n.materiaId);
                          const ok = n.promedio >= 3.0;
                          return (
                            <tr key={n.id} className="hover:bg-gray-50/80 transition">
                              <td className="px-5 py-2.5 text-gray-700 text-sm font-medium">{materia?.nombre}</td>
                              <td className="px-3 py-2.5 text-center text-xs text-gray-500">{n.nota1}</td>
                              <td className="px-3 py-2.5 text-center text-xs text-gray-500">{n.nota2}</td>
                              <td className="px-3 py-2.5 text-center text-xs text-gray-500">{n.nota3}</td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={`text-sm font-bold ${ok ? "text-green-600" : "text-red-500"}`}>
                                  {n.promedio}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer con promedio */}
                  <div className={`px-5 py-3.5 flex items-center justify-between border-t border-gray-100
                    ${aprobado ? "bg-green-50" : "bg-red-50"}`}>
                    <div className="flex items-center gap-2">
                      {aprobado
                        ? <TrendingUp size={16} className="text-green-600" />
                        : <TrendingDown size={16} className="text-red-500" />
                      }
                      <span className="text-xs font-medium text-gray-600">Promedio del período</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${aprobado ? "text-green-600" : "text-red-500"}`}>
                        {promedio}
                      </span>
                      <Badge label={aprobado ? "Aprobado" : "Reprobado"} variant={aprobado ? "success" : "danger"} dot />
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-5 py-12 text-center text-gray-400">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <FileText size={20} className="opacity-40" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Notas no disponibles</p>
                  <p className="text-xs mt-1">Las notas se publicarán al cerrar el período</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
