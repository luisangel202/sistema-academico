import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../styles/toggle.css';

export default function PasswordToggle({
  showPassword,
  onToggle,
  className = '',
  size = 'medium',
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onToggle();
  };

  const getButtonClass = () => {
    const baseClass = 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1 transition-all duration-200';
    const sizeClass = size === 'small' ? 'p-0.5' : size === 'large' ? 'p-1.5' : 'p-1';
    const pressClass = isPressed ? 'scale-90' : 'scale-100 hover:scale-105';
    const colorClass = showPassword ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-600';
    
    return [baseClass, sizeClass, pressClass, colorClass, className].filter(Boolean).join(' ');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={getButtonClass()}
      title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      {...props}
    >
      {showPassword ? (
        <EyeOff 
          size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
          className="transition-transform duration-200"
        />
      ) : (
        <Eye 
          size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
          className="transition-transform duration-200"
        />
      )}
    </button>
  );
}
