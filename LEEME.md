# JeanPaul — Tu portfolio

Primera versión local con fondo negro, cuadrícula gris, galería interactiva, All Works y Contact. Las ocho composiciones incluidas son muestras originales para probar la distribución; no son fotografías tuyas ni contenido de K95. No se ha publicado la web.

## Abrir

Haz doble clic en `Abrir portfolio.command`. Se abrirá el navegador con una dirección local HTTP. Mantén la ventana del servidor abierta mientras usas el portfolio. No abras `index.html` directamente: YouTube necesita que la página se sirva por HTTP o HTTPS. Mantén todos los archivos juntos.

## Cambiar fotografías y vídeos

1. Copia tus archivos dentro de `media/`. Puedes crear una carpeta por proyecto.
2. Abre `projects.js` con un editor de texto.
3. En cada proyecto cambia `title`, `year`, `description` y la ruta de `cover`.
4. En `media` añade las fotografías o vídeos que se mostrarán al abrirlo.
5. Guarda y recarga la página.

La portada se actualiza tanto en la galería inicial como en All Works. Las imágenes de la ficha se configuran por separado para permitir una portada distinta. Si solo quieres sustituir una foto ya configurada, reemplaza su archivo conservando el nombre y la extensión.

Ejemplo de proyecto fotográfico:

```js
{
  id: "retrato",
  title: "Retrato",
  category: "photography",
  year: "2026",
  cover: "media/retrato/portada.jpg",
  coverPosition: "50% 35%",
  description: "Texto sobre este proyecto.",
  media: [
    { type: "image", src: "media/retrato/01.jpg", alt: "Descripción de la imagen" },
    { type: "image", src: "media/retrato/02.jpg", alt: "Descripción de la segunda imagen" }
  ]
}
```

Ejemplo de vídeo con un still como portada:

```js
{
  id: "cortometraje",
  title: "Mi cortometraje",
  category: "film",
  year: "2026",
  cover: "media/corto/still.jpg",
  description: "Dirección, fotografía y montaje.",
  media: [
    { type: "video", src: "media/corto/pelicula.mp4", poster: "media/corto/still.jpg" },
    { type: "image", src: "media/corto/otro-still.jpg", alt: "Fotograma del cortometraje" }
  ]
}
```

Los proyectos se separan con comas. Su orden en el archivo determina el orden del portfolio. Puedes añadir o eliminar bloques; los contadores y filtros se actualizan automáticamente. Para el inicio, una selección de 6–12 proyectos funciona especialmente bien.

`coverPosition` controla el recorte de las miniaturas; las imágenes de la ficha se muestran completas. Usa JPG, PNG o WebP para las fotos, y MP4 H.264/AAC para máxima compatibilidad de vídeo. Para YouTube utiliza `{ type: "youtube", videoId: "ID_DEL_VIDEO" }`; los vídeos locales usan MP4/WebM. No reproduce vídeos automáticamente ni descarga los vídeos desde la portada.

Para que cargue rápido: portadas de unos 1600 px y preferiblemente menos de 500 KB; exporta copias web de los vídeos en lugar de usar originales de cámara. Estas cifras son orientativas.

## Contacto

Al principio de `projects.js`, rellena `email`, `instagram` y, si quieres, `vimeo`. Las redes necesitan la URL completa. Los campos vacíos no generan enlaces falsos. Mientras no haya correo, se muestra «Contact details coming soon».

## Aspecto e interacción

- `styles.css`: colores, cuadrícula, tamaños y adaptación móvil. El color y la intensidad de la cuadrícula están en `--line`.
- `index.html`: textos generales y estructura.
- `script.js`: galería, fichas y filtros; no necesitas editarlo para cambiar contenido.
- Arrastra, usa la rueda sobre la galería o las flechas para girar. Orbit y Spread cambian la distribución. Pulsa un proyecto para abrirlo; Escape lo cierra.
- La galería usa perspectiva CSS, sin bibliotecas externas. No es una reproducción exacta del motor 3D de K95.
- Las muestras de «Film» contienen solamente una imagen hasta que añadas tus vídeos.

La web funciona localmente. Para publicarla más adelante, todos estos archivos deben subirse juntos a un alojamiento de sitios estáticos.
