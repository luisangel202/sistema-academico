import { useRef } from "react";
import { Camera, Upload, Trash2 } from "lucide-react";

/**
 * Componente reutilizable para cargar imágenes.
 *
 * Props:
 *  - currentImage: string | null  — data URL de la imagen actual
 *  - onImage: (dataURL) => void   — callback cuando se selecciona una imagen
 *  - onRemove: () => void         — callback para eliminar la imagen
 *  - shape: "circle" | "square"  — forma del preview (default: "circle")
 *  - size: number                 — tamaño en px del preview (default: 80)
 *  - placeholder: string          — texto/iniciales cuando no hay imagen
 *  - label: string                — etiqueta del botón de carga
 *  - accept: string               — tipos de archivo aceptados
 *  - className: string            — clases extra para el contenedor
 */
export default function ImageUploader({
  currentImage,
  onImage,
  onRemove,
  shape = "circle",
  size = 80,
  placeholder = "",
  label = "Cambiar imagen",
  accept = "image/png,image/jpeg,image/webp,image/svg+xml",
  className = "",
}) {
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => onImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const radius = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Preview */}
      <div
        className={`relative flex-shrink-0 cursor-pointer group`}
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        title="Haz clic o arrastra una imagen"
      >
        {currentImage ? (
          <img
            src={currentImage}
            alt="preview"
            className={`w-full h-full object-cover ${radius} border-2 border-gray-200`}
          />
        ) : (
          <div
            className={`w-full h-full ${radius} bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-transparent`}
            style={{ fontSize: size * 0.3 }}
          >
            {placeholder}
          </div>
        )}

        {/* Overlay al hover */}
        <div className={`absolute inset-0 ${radius} bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center`}>
          <Camera size={size * 0.25} className="text-white" />
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {/* Botones */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border-0 cursor-pointer transition"
        >
          <Upload size={12} />
          {label}
        </button>
        {currentImage && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg border-0 cursor-pointer transition"
            title="Eliminar imagen"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">PNG, JPG, SVG · máx. 2 MB</p>
    </div>
  );
}
