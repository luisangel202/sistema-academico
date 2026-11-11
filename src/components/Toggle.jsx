import { useState, useEffect } from 'react';
import '../styles/toggle.css';

export default function Toggle({
  checked = false,
  onChange,
  disabled = false,
  loading = false,
  size = 'medium',
  color = 'primary',
  icon = null,
  label = '',
  className = '',
  ...props
}) {
  const [isChecked, setIsChecked] = useState(checked);
  const [recentlyChanged, setRecentlyChanged] = useState(false);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled || loading) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    setRecentlyChanged(true);
    
    setTimeout(() => setRecentlyChanged(false), 600);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const getToggleClass = () => {
    const baseClass = 'toggle-button';
    const sizeClass = size === 'small' ? 'small' : size === 'large' ? 'large' : '';
    const colorClass = color === 'success' ? 'success' : color === 'warning' ? 'warning' : color === 'danger' ? 'danger' : '';
    const stateClass = isChecked ? 'active' : '';
    const specialClass = recentlyChanged ? 'recently-changed' : loading ? 'loading' : '';
    const iconClass = icon ? 'with-icon' : '';
    
    return [baseClass, sizeClass, colorClass, stateClass, specialClass, iconClass, className]
      .filter(Boolean)
      .join(' ');
  };

  const renderThumb = () => {
    if (icon && isChecked) {
      return (
        <span 
          className="toggle-thumb"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }
    return <span className="toggle-thumb" />;
  };

  if (label) {
    return (
      <div className="toggle-group">
        <label className="toggle-label">{label}</label>
        <button
          className={getToggleClass()}
          onClick={handleChange}
          disabled={disabled || loading}
          role="switch"
          aria-checked={isChecked}
          aria-label={label || 'Toggle'}
          {...props}
        >
          {renderThumb()}
        </button>
      </div>
    );
  }

  return (
    <button
      className={getToggleClass()}
      onClick={handleChange}
      disabled={disabled || loading}
      role="switch"
      aria-checked={isChecked}
      aria-label="Toggle"
      {...props}
    >
      {renderThumb()}
    </button>
  );
}
