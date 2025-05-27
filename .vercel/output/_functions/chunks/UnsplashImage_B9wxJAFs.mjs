import { c as createAstro, a as createComponent, m as maybeRenderHead, b as addAttribute, r as renderTemplate } from './astro/server_Cb_NEMlC.mjs';

const $$Astro = createAstro("https://apologify.com");
const $$UnsplashImage = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$UnsplashImage;
  const { article } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<figure class="not-prose"> <div class="aspect-video overflow-hidden rounded-lg "> ${article.data.image && renderTemplate`<img${addAttribute(article.data.image, "src")}${addAttribute(article.data.title || "", "alt")} class="w-full object-cover" loading="lazy">`} </div> <figcaption class="text-right text-xs text-gray-400 mt-1">
Photo by ${article.data.photographer ? renderTemplate`<a href="{article.data.photographerUrl}?utm_source=ApologiesLetter&utm_medium=referral" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline"> ${article.data.photographer} </a>` : "Unknown photographer"} on <a href="https://unsplash.com?utm_source=ApologiesLetter&utm_medium=referral" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">Unsplash</a> </figcaption> </figure>`;
}, "C:/Users/pc02/projects/apologify.com/src/components/UnsplashImage.astro", void 0);

export { $$UnsplashImage as $ };
