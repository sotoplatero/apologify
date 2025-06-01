import type { AstroIntegration } from "astro";
import { readdir, cp, access } from "node:fs/promises";
import * as path from "node:path";

export function sitemapCopier(): AstroIntegration {
	return {
		name: "sitemap-copier",
		hooks: {
			"astro:build:done": async ({ logger }) => {
				const buildLogger = logger.fork("sitemap-copier");
				buildLogger.info("Copying xml files from dist to vercel out");
				
				try {
					// Check both possible locations for sitemap files
					const possibleDirs = ["./dist", "./dist/client"];
					let sourceDir = null;
					
					for (const dir of possibleDirs) {
						try {
							await access(dir);
							const files = await readdir(dir);
							const xmlFiles = files.filter(
								(file) =>
									path.extname(file).toLowerCase() === ".xml" &&
									path.basename(file).toLowerCase().startsWith("sitemap")
							);
							if (xmlFiles.length > 0) {
								sourceDir = dir;
								buildLogger.info(`Found sitemap files in ${dir}: ${xmlFiles.join(", ")}`);
								break;
							}
						} catch (error) {
							// Directory doesn't exist or can't be read, continue
						}
					}
					
					if (!sourceDir) {
						buildLogger.warn("No sitemap files found in dist or dist/client directories");
						return;
					}
					
					const files = await readdir(sourceDir);
					const xmlFiles = files.filter(
						(file) =>
							path.extname(file).toLowerCase() === ".xml" &&
							path.basename(file).toLowerCase().startsWith("sitemap")
					);
					
					if (xmlFiles.length === 0) {
						buildLogger.warn("No sitemap files found to copy");
						return;
					}
					
					// Ensure the vercel output directory exists
					const vercelStaticDir = "./.vercel/output/static";
					try {
						await access(vercelStaticDir);
					} catch {
						buildLogger.warn("Vercel output directory not found, skipping copy");
						return;
					}
					
					for (const file of xmlFiles) {
						const sourcePath = path.join(sourceDir, file);
						const destPath = path.join(vercelStaticDir, file);
						await cp(sourcePath, destPath);
						buildLogger.info(`Copied ${file} to vercel output`);
					}
					
					buildLogger.info("All XML files copied successfully");
				} catch (error) {
					buildLogger.error(`Error copying files: ${error}`);
				}
			}
		}
	};
} 