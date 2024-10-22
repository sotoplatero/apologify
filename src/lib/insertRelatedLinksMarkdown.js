import { getCollection } from 'astro:content';

export async function insertRelatedLinksMarkdown(content, currentSlug) {
  const allArticles = await getCollection('articles');
  const otherArticles = allArticles.filter(article => article.slug !== currentSlug);
  
  // Seleccionar aleatoriamente dos artículos
  const relatedArticles = otherArticles.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  // Dividir el contenido en líneas
  const lines = content.split('\n');
  
  // Función para insertar un enlace en una posición aleatoria
  const insertLink = (article) => {
    // Encontrar una posición válida para insertar el enlace
    let position;
    do {
        position = Math.floor(Math.random() * lines.length);
    } while (lines[position].trim().startsWith('#') || lines[position].trim() === '');
    
    const linkMarkdown = `\n> *Artículo relacionado: [${article.data.title}](/articles/${article.slug})*\n`;
    lines.splice(position, 0, linkMarkdown);

  };
  
  // Insertar los dos enlaces
  relatedArticles.forEach(insertLink);
  
  // Unir las líneas de nuevo
  return lines.join('\n');
}
