import { createContext, useContext, useState, useCallback } from "react";

// Almacena imágenes en memoria como data URLs
// logos[institucionId] = dataURL
// avatars[usuarioId]   = dataURL

const ImageContext = createContext(null);

export function ImageProvider({ children }) {
  const [logos, setLogos]   = useState({});
  const [avatars, setAvatars] = useState({});

  const setLogo = useCallback((institucionId, dataURL) => {
    setLogos((prev) => ({ ...prev, [institucionId]: dataURL }));
  }, []);

  const setAvatar = useCallback((usuarioId, dataURL) => {
    setAvatars((prev) => ({ ...prev, [usuarioId]: dataURL }));
  }, []);

  const getLogo   = (institucionId) => logos[institucionId]   || null;
  const getAvatar = (usuarioId)     => avatars[usuarioId]     || null;

  return (
    <ImageContext.Provider value={{ logos, avatars, setLogo, setAvatar, getLogo, getAvatar }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error("useImages must be used inside ImageProvider");
  return ctx;
}
