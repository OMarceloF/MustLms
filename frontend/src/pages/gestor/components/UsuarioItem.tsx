import { Eye, Settings, Trash2 } from "lucide-react";


interface UsuarioItemProps {
  nome: string;
  foto_url?: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const UsuarioItem: React.FC<UsuarioItemProps> = ({
  nome,
  foto_url,
  onView,
  onEdit,
  onDelete,
}) => {
  const fotoUrl =
    foto_url && foto_url !== "" && foto_url !== "null" && foto_url !== undefined
      ? `/${foto_url}`
      : `/uploads/default-profile.png`;

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-gray-50 rounded-md mb-2 transition-all duration-200 ease-in-out hover:bg-gray-100">
      <div className="flex items-center">
        <img
          src={fotoUrl}
          alt={nome}
          className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-gray-300"
        />
        <span className="text-lg font-bold text-gray-800">{nome}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={onView} className="bg-none border-none cursor-pointer transition-all duration-200 ease-in-out hover:text-yellow-600">
          <Eye size={22} className="text-orange-600" />
        </button>
        <button onClick={onEdit} className="bg-none border-none cursor-pointer transition-all duration-200 ease-in-out hover:text-yellow-600">
          <Settings size={22} className="text-orange-600" />
        </button>
        <button onClick={onDelete} className="bg-none border-none cursor-pointer transition-all duration-200 ease-in-out hover:text-yellow-600">
          <Trash2 size={22} className="text-orange-600" />
        </button>
      </div>
    </div>
  );
};

export default UsuarioItem;
