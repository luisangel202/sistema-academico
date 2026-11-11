import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../data/permissions";
import PageHeader from "../../components/PageHeader";
import { LayoutDashboard, Construction } from "lucide-react";

export default function GenericDashboard() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={ROLE_LABELS[user?.rol]}
        icon={LayoutDashboard}
        color="#3b82f6"
      />
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
          <Construction size={28} className="text-blue-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-700">Bienvenido, {user?.nombre?.split(" ")[0]}</p>
          <p className="text-sm text-gray-400 mt-1">Este módulo está en construcción</p>
        </div>
      </div>
    </div>
  );
}
