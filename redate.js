import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articlesDir = path.join(__dirname, 'src', 'content', 'articles');
const today = new Date();

fs.readdir(articlesDir, (err, slugs) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  slugs.forEach((slug, index) => {
    const filePath = path.join(articlesDir, slug, 'index.md');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }

      const article = matter(data);
      const newDate = new Date(today);
      newDate.setDate(today.getDate() - index);
      article.data.date = newDate;

      const updatedContent = matter.stringify(article.content, article.data);

      fs.writeFile(filePath, updatedContent, (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log(`Updated date for ${slug}/index.md`);
        }
      });
    });
  });
});