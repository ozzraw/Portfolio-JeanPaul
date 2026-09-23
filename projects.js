/* TU CONTENIDO — cambia este archivo; no hace falta editar el diseño.
 * Guarda tus archivos en media/ y usa rutas como "media/retrato-01.jpg".
 * cover: la foto o still que se ve en la portada y en All Works.
 * coverPosition: encuadre de la portada, por ejemplo "50% 30%".
 * category: "photography" o "film".
 * media: todas las imágenes y vídeos de la ficha, en orden.
 * Vídeo: { type: "video", src: "media/pelicula.mp4", poster: "media/still.jpg" }
 * Imagen: { type: "image", src: "media/foto.jpg", alt: "Descripción de la foto" }
 * Añade o quita proyectos copiando o eliminando un bloque completo.
 */
window.PORTFOLIO = {
  email: "", // Añade tu correo aquí para activar el enlace de contacto.
  instagram: "", // URL completa de tu perfil.
  vimeo: "", // URL completa de tu perfil (opcional).
  projects: [
    {"id": "01", "title": "ik-multimedia", "category": "photography", "year": "2026", "cover": "media/ik-multimedia.jpg", "coverPosition": "50% 50%", "description": "", "media": [{"type": "youtube", "videoId": "aMBxUyYj3PM", "shareId": "k9FQ30ekUUUvmAkf"}, {"type": "image", "src": "media/ik-multimedia.jpg", "alt": "ik-multimedia"}]},
    {"id": "02", "title": "Secuencia final (Short film)", "category": "film", "year": "2026", "cover": "media/secuencia-final.jpeg", "description": "", "media": [{"type": "youtube", "videoId": "7OwPkIUNjuA", "shareId": "hbaiY63BXI2pEvLg"}]},
    {"id": "03", "title": "illojuan-066", "category": "photography", "year": "2026", "cover": "media/illojuan-066.jpg", "coverPosition": "50% 50%", "description": "", "media": [{"type": "youtube", "videoId": "z965sp3qnMA", "shareId": "f3C617d1inLpgMyd"}, {"type": "image", "src": "media/illojuan-066.jpg", "alt": "illojuan-066"}]},
    { id: "04", title: "Sequence 04", category: "film", year: "2026", cover: "media/demo/04.svg", description: "Still de muestra. Añade tu vídeo a la lista media para reproducirlo aquí.", media: [{ type: "image", src: "media/demo/04.svg", alt: "Still de muestra 04" }] },
    {"id": "05", "title": "SONAR - RiuzForzaXFitness", "category": "photography", "year": "2026", "cover": "media/FitnessxRiusforza-sonar.jpg", "coverPosition": "50% 50%", "description": "", "media": [{"type": "youtube", "videoId": "rn0o_8MqyXo", "shareId": "HWzPHM-auLxn2Vcy"}, {"type": "image", "src": "media/FitnessxRiusforza-sonar.jpg", "alt": "SONAR - RiuzForzaXFitness"}]},
    {"id": "06", "title": "Akrilla IzaTKM Nusaar 3000 Show", "category": "photography", "year": "2026", "cover": "media/Akrilla IzaTKM Nusaar 3000 Show_1.10.1.jpg", "coverPosition": "50% 50%", "description": "", "media": [{"type": "image", "src": "media/Akrilla IzaTKM Nusaar 3000 Show_1.10.1.jpg", "alt": "Akrilla IzaTKM Nusaar 3000 Show"}]},
    { id: "07", title: "Sequence 07", category: "film", year: "2026", cover: "media/demo/07.svg", description: "Still de muestra. Añade tu vídeo a la lista media para reproducirlo aquí.", media: [{ type: "image", src: "media/demo/07.svg", alt: "Still de muestra 07" }] },
    {"id": "08", "title": "vx1000", "category": "photography", "year": "2026", "cover": "media/vx1000.png", "coverPosition": "50% 50%", "description": "", "media": [{"type": "image", "src": "media/vx1000.png", "alt": "vx1000"}]}
  ]
};
