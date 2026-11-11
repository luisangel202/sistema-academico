import { Construction } from "lucide-react";

export default function ComingSoon({ titulo = "Módulo en construcción" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <Construction size={32} className="text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{titulo}</h2>
      <p className="text-sm text-gray-400 max-w-xs">
        Este módulo está en desarrollo. Estará disponible próximamente.
      </p>
    </div>
  );
}
