import { r as renderers } from './chunks/_@astro-renderers_DSKGcwIg.mjs';
import { c as createExports } from './chunks/entrypoint_DHRyYuOD.mjs';
import { manifest } from './manifest_BY7VPmn7.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/_actions/_---path_.astro.mjs');
const _page2 = () => import('./pages/404.astro.mjs');
const _page3 = () => import('./pages/500.astro.mjs');
const _page4 = () => import('./pages/about.astro.mjs');
const _page5 = () => import('./pages/articles/_slug_.astro.mjs');
const _page6 = () => import('./pages/articles/_---page_.astro.mjs');
const _page7 = () => import('./pages/contact.astro.mjs');
const _page8 = () => import('./pages/examples/_recipient_/_slug_.astro.mjs');
const _page9 = () => import('./pages/examples/_recipient_.astro.mjs');
const _page10 = () => import('./pages/examples.astro.mjs');
const _page11 = () => import('./pages/examples/_---page_.astro.mjs');
const _page12 = () => import('./pages/generator.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.8.0_@types+node@22._488da0f7fe1db44f83d148c27853ce31/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["node_modules/.pnpm/astro@5.8.0_@types+node@22._488da0f7fe1db44f83d148c27853ce31/node_modules/astro/dist/actions/runtime/route.js", _page1],
    ["src/pages/404.astro", _page2],
    ["src/pages/500.astro", _page3],
    ["src/pages/about.astro", _page4],
    ["src/pages/articles/[slug].astro", _page5],
    ["src/pages/articles/[...page].astro", _page6],
    ["src/pages/contact.astro", _page7],
    ["src/pages/examples/[recipient]/[slug].astro", _page8],
    ["src/pages/examples/[recipient]/index.astro", _page9],
    ["src/pages/examples/index.astro", _page10],
    ["src/pages/examples/[...page].astro", _page11],
    ["src/pages/generator/index.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_astro-internal_actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "e429c5c9-c802-4c15-8bfb-b8f0e17688cf",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
