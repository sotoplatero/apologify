// The one map from design id to template component, shared by the live page
// (/sorry/[slug]), the sample preview (/demo) and the Social Studio render
// page (/studio/card). Add a new design here and in src/lib/themes.js.
import { canonicalThemeId } from "../../lib/themes.js";
import LetterTemplate from "./LetterTemplate.astro";
import EditorialTemplate from "./EditorialTemplate.astro";
import HandwrittenTemplate from "./HandwrittenTemplate.astro";
import VelvetTemplate from "./VelvetTemplate.astro";
import NightTemplate from "./NightTemplate.astro";
import MinimalTemplate from "./MinimalTemplate.astro";
import PostcardTemplate from "./PostcardTemplate.astro";
import WatercolorTemplate from "./WatercolorTemplate.astro";
import StatementTemplate from "./StatementTemplate.astro";
import NewspaperTemplate from "./NewspaperTemplate.astro";
import SwissTemplate from "./SwissTemplate.astro";
import CuteTemplate from "./CuteTemplate.astro";
import BoardingPassTemplate from "./BoardingPassTemplate.astro";
import KeepCalmTemplate from "./KeepCalmTemplate.astro";
import ZineTemplate from "./ZineTemplate.astro";

const TEMPLATES: Record<string, any> = {
  "classic": LetterTemplate,
  "editorial": EditorialTemplate,
  "handwritten": HandwrittenTemplate,
  "velvet": VelvetTemplate,
  "starry": NightTemplate,
  "minimal": MinimalTemplate,
  "postcard": PostcardTemplate,
  "watercolor": WatercolorTemplate,
  "formal": StatementTemplate,
  "newspaper": NewspaperTemplate,
  "swiss": SwissTemplate,
  "cute-duck": CuteTemplate,
  "boarding-pass": BoardingPassTemplate,
  // Retired from the pickers; kept for pages saved with them.
  "keep-calm": KeepCalmTemplate,
  "zine": ZineTemplate,
};

/** The template component for a design id (retired ids render their replacement). */
export function templateFor(id: string | null | undefined) {
  return TEMPLATES[canonicalThemeId(id ?? "")] ?? LetterTemplate;
}
