interface Link {
  keyword: string;
  url: string;
  title: string;
}

export function insertLinks(content: string, links: Link[]): string {
  let modifiedContent = content;

  links.forEach(link => {
    const regex = new RegExp(`\\b${link.keyword}\\b`, 'gi');
    modifiedContent = modifiedContent.replace(regex, `<a href="${link.url}" title="${link.title}">${link.keyword}</a>`);
  });

  return modifiedContent;
}
