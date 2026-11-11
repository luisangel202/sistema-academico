import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, Download, Share2, Copy, CheckCircle, 
  ArrowRight, RefreshCw, Info, Globe,
  AlertCircle
} from 'lucide-react';

const InstalarApp = () => {
  const [copied, setCopied] = useState(false);
  
  // URL de la aplicación — usa la URL actual del navegador
  const currentUrl = window.location.origin;
  
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instala EduRural en tu Móvil</h1>
        <p className="text-gray-600">Escanea el código QR o sigue las instrucciones para instalar la aplicación</p>
      </div>

      {/* Aviso importante sobre desarrollo */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800 mb-1">¡Ahora con HTTPS!</h3>
            <p className="text-sm text-green-700">
              La aplicación ahora usa HTTPS. Escanea el QR y podrás instalarla como app nativa en tu dispositivo siguiendo las instrucciones del navegador.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Columna izquierda: QR */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
              <Smartphone size={40} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center">Escanea el Código QR</h2>
            <p className="text-gray-600 text-center text-sm mt-2">
              Usa la cámara de tu celular para escanear y acceder a la aplicación
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-inner mb-6">
            <QRCodeSVG
              value={currentUrl}
              size={220}
              level="H"
              includeMargin={false}
              className="mx-auto"
            />
          </div>

          {(currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1")) && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800 font-semibold mb-1">⚠ Estás en modo desarrollo local</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                El QR apunta a <strong>localhost</strong> — solo funciona en este dispositivo.
                Para que otros celulares puedan instalar la app debes publicarla primero en
                Netlify u otro hosting con HTTPS.
              </p>
            </div>
          )}

          <div className="w-full bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">URL de la aplicación:</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Columna derecha: Instrucciones */}
        <div className="space-y-6">
          {/* Instrucciones iOS */}
          <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${isIOS ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <Smartphone size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">iPhone / iPad</h3>
                <p className="text-sm text-gray-600">iOS Safari</p>
              </div>
              {isIOS && (
                <span className="ml-auto bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Tu dispositivo
                </span>
              )}
            </div>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Abre esta página en <strong>Safari</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Toca el botón <Share2 size={14} className="inline mx-1" /> <strong>Compartir</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Desliza hacia abajo y selecciona <strong>"Agregar a inicio"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Toca <strong>"Agregar"</strong> en la esquina superior derecha</span>
              </li>
            </ol>
          </div>

          {/* Instrucciones Android */}
          <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${isAndroid ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Android</h3>
                <p className="text-sm text-gray-600">Chrome / Edge</p>
              </div>
              {isAndroid && (
                <span className="ml-auto bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Tu dispositivo
                </span>
              )}
            </div>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Abre esta página en <strong>Chrome</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Toca el menú <span className="font-bold">⋮</span> (tres puntos)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Toca <strong>"Instalar"</strong> o <strong>"Agregar"</strong></span>
              </li>
            </ol>
          </div>

          {/* Beneficios */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Info size={20} />
              ¿Por qué instalarla?
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Acceso rápido desde tu pantalla de inicio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Funciona sin conexión a internet (offline)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Experiencia similar a una app nativa</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Notificaciones push (si las permites)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botón para refrescar QR si la URL cambia */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={18} />
          Actualizar página
        </button>
      </div>
    </div>
  );
};

export default InstalarApp;
