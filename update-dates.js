import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener la fecha de hoy
const today = new Date();

// Función para formatear fecha en formato ISO
function formatDate(date) {
    return date.toISOString();
}

// Obtener TODOS los directorios de artículos (no solo los que empiezan con write-apology-letter)
const articlesDir = path.join(__dirname, 'src', 'content', 'articles');
const articleDirs = fs.readdirSync(articlesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort();

console.log(`Encontrados ${articleDirs.length} artículos para actualizar`);

let weekCounter = 0;

articleDirs.forEach(articleDir => {
    const indexPath = path.join(articlesDir, articleDir, 'index.md');
    
    if (fs.existsSync(indexPath)) {
        // Calcular la fecha (hoy menos las semanas correspondientes)
        const articleDate = new Date(today);
        articleDate.setDate(today.getDate() - (7 * weekCounter));
        
        const formattedDate = formatDate(articleDate);
        
        console.log(`Procesando: ${articleDir} - Fecha: ${formattedDate}`);
        
        // Leer el contenido del archivo
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // Buscar y reemplazar la línea de fecha usando regex
        const pattern = /date:\s*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
        const replacement = `date: ${formattedDate}`;
        
        if (pattern.test(content)) {
            const newContent = content.replace(pattern, replacement);
            
            // Escribir el contenido actualizado
            fs.writeFileSync(indexPath, newContent, 'utf8');
            console.log('  ✓ Fecha actualizada');
        } else {
            console.log(`  ⚠ No se encontró el patrón de fecha en ${articleDir}`);
        }
        
        weekCounter++;
    } else {
        console.log(`  ⚠ No se encontró index.md en ${articleDir}`);
    }
});

console.log('\nProceso completado. Se procesaron', weekCounter, 'artículos.');
const oldestDate = new Date(today);
oldestDate.setDate(today.getDate() - (7 * (weekCounter - 1)));
console.log('Fecha más antigua asignada:', oldestDate.toISOString().split('T')[0]); 