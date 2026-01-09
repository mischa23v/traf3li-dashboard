#!/usr/bin/env node

/**
 * Frontend Structure Extractor
 *
 * Automatically scans all frontend files and extracts:
 * - Pages/Routes
 * - Components
 * - Hooks
 * - API Services
 * - Query Keys
 * - Constants/Routes
 *
 * Outputs to docs/FRONTEND_STRUCTURE.md and docs/frontend-structure.json
 *
 * Usage: node scripts/extractFrontend.js
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const OUTPUT_MD = path.join(__dirname, '../docs/FRONTEND_STRUCTURE.md');
const OUTPUT_JSON = path.join(__dirname, '../docs/frontend-structure.json');

// Ensure docs directory exists
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

// Results storage
const results = {
    pages: [],
    components: [],
    hooks: [],
    services: [],
    queryKeys: [],
    routes: [],
    features: {},
    stats: {
        totalPages: 0,
        totalComponents: 0,
        totalHooks: 0,
        totalServices: 0,
        totalFeatures: 0
    }
};

/**
 * Recursively get all files matching extensions
 */
function getAllFiles(dir, extensions = ['.tsx', '.ts'], fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and hidden directories
            if (!file.startsWith('.') && file !== 'node_modules') {
                getAllFiles(filePath, extensions, fileList);
            }
        } else if (extensions.some(ext => file.endsWith(ext))) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

/**
 * Extract component/hook name and props from file
 */
function extractComponentInfo(filePath, content) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(SRC_DIR, filePath);

    const info = {
        name: fileName,
        path: relativePath,
        type: 'component',
        exports: [],
        imports: [],
        props: null,
        hooks: []
    };

    // Detect if it's a hook
    if (fileName.startsWith('use') || fileName.startsWith('Use')) {
        info.type = 'hook';
    }

    // Extract exports
    const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g);
    for (const match of exportMatches) {
        info.exports.push(match[1]);
    }

    // Extract named exports
    const namedExports = content.matchAll(/export\s+\{\s*([^}]+)\s*\}/g);
    for (const match of namedExports) {
        const names = match[1].split(',').map(n => n.trim().split(' ')[0]);
        info.exports.push(...names);
    }

    // Extract interface/type for props
    const propsMatch = content.match(/interface\s+(\w+Props)\s*\{([^}]+)\}/s);
    if (propsMatch) {
        info.props = {
            name: propsMatch[1],
            definition: propsMatch[2].trim()
        };
    }

    // Extract hooks used
    const hookMatches = content.matchAll(/\buse[A-Z]\w+/g);
    const hooksUsed = new Set();
    for (const match of hookMatches) {
        hooksUsed.add(match[0]);
    }
    info.hooks = Array.from(hooksUsed);

    // Extract API calls
    const apiMatches = content.matchAll(/(?:api|apiClient|fetch)\s*\.\s*(get|post|put|patch|delete)\s*[<(]\s*['"`]([^'"`]+)['"`]/gi);
    info.apiCalls = [];
    for (const match of apiMatches) {
        info.apiCalls.push({
            method: match[1].toUpperCase(),
            endpoint: match[2]
        });
    }

    return info;
}

/**
 * Extract route definitions from routes file
 */
function extractRoutes(filePath, content) {
    const routes = [];

    // Match route definitions like: list: '/dashboard/tasks'
    const routeMatches = content.matchAll(/(\w+)\s*:\s*['"`]([^'"`]+)['"`]/g);
    for (const match of routeMatches) {
        routes.push({
            name: match[1],
            path: match[2]
        });
    }

    // Match function routes like: detail: (id: string) => `/dashboard/tasks/${id}`
    const funcRouteMatches = content.matchAll(/(\w+)\s*:\s*\([^)]*\)\s*=>\s*[`'"]([^`'"]+)[`'"]/g);
    for (const match of funcRouteMatches) {
        routes.push({
            name: match[1],
            path: match[2],
            dynamic: true
        });
    }

    return routes;
}

/**
 * Extract query keys from query-keys file
 */
function extractQueryKeys(filePath, content) {
    const queryKeys = [];

    // Match query key definitions
    const keyMatches = content.matchAll(/(\w+)\s*:\s*(?:\[[^\]]+\]|\([^)]*\)\s*=>\s*\[[^\]]+\]|['"`][^'"`]+['"`])/g);
    for (const match of keyMatches) {
        queryKeys.push({
            name: match[1],
            definition: match[0]
        });
    }

    return queryKeys;
}

/**
 * Extract page components (route components)
 */
function extractPages(dir) {
    const pagesDir = path.join(dir, 'routes');
    if (!fs.existsSync(pagesDir)) return;

    const files = getAllFiles(pagesDir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const info = extractComponentInfo(file, content);
        info.type = 'page';

        // Extract route path from file structure
        const relativePath = path.relative(pagesDir, file);
        info.routePath = '/' + relativePath
            .replace(/\\/g, '/')
            .replace(/\.tsx?$/, '')
            .replace(/\/index$/, '')
            .replace(/\$(\w+)/g, ':$1')
            .replace(/_/g, '-');

        results.pages.push(info);
    }
}

/**
 * Extract all hooks
 */
function extractHooks(dir) {
    const hooksDir = path.join(dir, 'hooks');
    if (!fs.existsSync(hooksDir)) return;

    const files = getAllFiles(hooksDir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const info = extractComponentInfo(file, content);
        info.type = 'hook';

        // Extract what the hook returns
        const returnMatch = content.match(/return\s*\{([^}]+)\}/s);
        if (returnMatch) {
            info.returns = returnMatch[1]
                .split(',')
                .map(r => r.trim().split(':')[0].trim())
                .filter(r => r && !r.includes('//'));
        }

        results.hooks.push(info);
    }
}

/**
 * Extract feature modules
 */
function extractFeatures(dir) {
    const featuresDir = path.join(dir, 'features');
    if (!fs.existsSync(featuresDir)) return;

    const featureDirs = fs.readdirSync(featuresDir).filter(f => {
        const fullPath = path.join(featuresDir, f);
        return fs.statSync(fullPath).isDirectory();
    });

    for (const feature of featureDirs) {
        const featurePath = path.join(featuresDir, feature);
        const featureInfo = {
            name: feature,
            components: [],
            pages: [],
            hooks: [],
            hasIndex: false
        };

        // Check subdirectories
        const subdirs = ['components', 'pages', 'hooks', 'views'];
        for (const subdir of subdirs) {
            const subdirPath = path.join(featurePath, subdir);
            if (fs.existsSync(subdirPath)) {
                const files = getAllFiles(subdirPath);
                for (const file of files) {
                    const content = fs.readFileSync(file, 'utf-8');
                    const info = extractComponentInfo(file, content);

                    if (subdir === 'components') {
                        featureInfo.components.push(info);
                        results.components.push({ ...info, feature });
                    } else if (subdir === 'pages' || subdir === 'views') {
                        info.type = 'page';
                        featureInfo.pages.push(info);
                    } else if (subdir === 'hooks') {
                        info.type = 'hook';
                        featureInfo.hooks.push(info);
                    }
                }
            }
        }

        // Check for index file
        if (fs.existsSync(path.join(featurePath, 'index.ts')) ||
            fs.existsSync(path.join(featurePath, 'index.tsx'))) {
            featureInfo.hasIndex = true;
        }

        results.features[feature] = featureInfo;
    }
}

/**
 * Extract shared components
 */
function extractComponents(dir) {
    const componentsDir = path.join(dir, 'components');
    if (!fs.existsSync(componentsDir)) return;

    const files = getAllFiles(componentsDir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const info = extractComponentInfo(file, content);

        // Categorize by subdirectory
        const relativePath = path.relative(componentsDir, file);
        const category = relativePath.split(path.sep)[0];
        info.category = category === info.name + '.tsx' ? 'root' : category;

        results.components.push(info);
    }
}

/**
 * Extract services/API layer
 */
function extractServices(dir) {
    const servicesDir = path.join(dir, 'services');
    const libDir = path.join(dir, 'lib');
    const apiDir = path.join(dir, 'api');

    const searchDirs = [servicesDir, libDir, apiDir].filter(d => fs.existsSync(d));

    for (const searchDir of searchDirs) {
        const files = getAllFiles(searchDir);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const fileName = path.basename(file);

            // Skip non-API files
            if (!content.includes('api') && !content.includes('fetch') && !content.includes('axios')) {
                continue;
            }

            const info = {
                name: fileName,
                path: path.relative(SRC_DIR, file),
                endpoints: []
            };

            // Extract API endpoints
            const apiMatches = content.matchAll(/(?:api|apiClient|axios|fetch)\s*\.\s*(get|post|put|patch|delete)\s*[<(]\s*['"`]([^'"`]+)['"`]/gi);
            for (const match of apiMatches) {
                info.endpoints.push({
                    method: match[1].toUpperCase(),
                    path: match[2]
                });
            }

            // Extract endpoint strings
            const endpointStrings = content.matchAll(/['"`](\/api\/[^'"`]+)['"`]/g);
            for (const match of endpointStrings) {
                if (!info.endpoints.some(e => e.path === match[1])) {
                    info.endpoints.push({
                        method: 'UNKNOWN',
                        path: match[1]
                    });
                }
            }

            if (info.endpoints.length > 0) {
                results.services.push(info);
            }
        }
    }
}

/**
 * Extract constants and routes
 */
function extractConstants(dir) {
    const constantsDir = path.join(dir, 'constants');
    if (!fs.existsSync(constantsDir)) return;

    // Routes file
    const routesFile = path.join(constantsDir, 'routes.ts');
    if (fs.existsSync(routesFile)) {
        const content = fs.readFileSync(routesFile, 'utf-8');
        results.routes = extractRoutes(routesFile, content);
    }

    // Query keys file
    const libDir = path.join(dir, 'lib');
    const queryKeysFile = path.join(libDir, 'query-keys.ts');
    if (fs.existsSync(queryKeysFile)) {
        const content = fs.readFileSync(queryKeysFile, 'utf-8');
        results.queryKeys = extractQueryKeys(queryKeysFile, content);
    }
}

/**
 * Generate Markdown documentation
 */
function generateMarkdown() {
    let md = `# Frontend Structure Documentation

> Auto-generated on ${new Date().toISOString().split('T')[0]}
> Run \`npm run docs:frontend\` to regenerate

## Summary

| Category | Count |
|----------|-------|
| Features/Modules | ${Object.keys(results.features).length} |
| Pages | ${results.pages.length} |
| Components | ${results.components.length} |
| Hooks | ${results.hooks.length} |
| Services | ${results.services.length} |
| Routes Defined | ${results.routes.length} |

---

## Table of Contents

- [Features/Modules](#featuresmodules)
- [Pages](#pages)
- [Shared Components](#shared-components)
- [Hooks](#hooks)
- [Services/API](#servicesapi)
- [Routes](#routes)

---

## Features/Modules

`;

    // Features
    const sortedFeatures = Object.entries(results.features)
        .sort((a, b) => a[0].localeCompare(b[0]));

    for (const [name, feature] of sortedFeatures) {
        const totalItems = feature.components.length + feature.pages.length + feature.hooks.length;
        md += `### ${name}\n\n`;
        md += `| Type | Count |\n|------|-------|\n`;
        md += `| Components | ${feature.components.length} |\n`;
        md += `| Pages/Views | ${feature.pages.length} |\n`;
        md += `| Hooks | ${feature.hooks.length} |\n\n`;

        if (feature.components.length > 0) {
            md += `**Components:**\n`;
            for (const comp of feature.components) {
                md += `- \`${comp.name}\``;
                if (comp.props) md += ` (Props: ${comp.props.name})`;
                md += `\n`;
            }
            md += `\n`;
        }

        if (feature.pages.length > 0) {
            md += `**Pages/Views:**\n`;
            for (const page of feature.pages) {
                md += `- \`${page.name}\`\n`;
            }
            md += `\n`;
        }

        if (feature.hooks.length > 0) {
            md += `**Hooks:**\n`;
            for (const hook of feature.hooks) {
                md += `- \`${hook.name}\`\n`;
            }
            md += `\n`;
        }

        md += `---\n\n`;
    }

    // Pages
    md += `## Pages\n\n`;
    md += `| Page | Route Path | Hooks Used |\n`;
    md += `|------|------------|------------|\n`;
    for (const page of results.pages.sort((a, b) => a.routePath.localeCompare(b.routePath))) {
        const hooksStr = page.hooks.slice(0, 3).join(', ') + (page.hooks.length > 3 ? '...' : '');
        md += `| ${page.name} | \`${page.routePath}\` | ${hooksStr} |\n`;
    }
    md += `\n---\n\n`;

    // Shared Components
    md += `## Shared Components\n\n`;
    const componentsByCategory = {};
    for (const comp of results.components) {
        const cat = comp.category || 'uncategorized';
        if (!componentsByCategory[cat]) componentsByCategory[cat] = [];
        componentsByCategory[cat].push(comp);
    }

    for (const [category, components] of Object.entries(componentsByCategory).sort()) {
        md += `### ${category}\n\n`;
        for (const comp of components.sort((a, b) => a.name.localeCompare(b.name))) {
            md += `- **${comp.name}**`;
            if (comp.props) md += ` - Props: \`${comp.props.name}\``;
            md += `\n`;
        }
        md += `\n`;
    }
    md += `---\n\n`;

    // Hooks
    md += `## Hooks\n\n`;
    md += `| Hook | Returns | API Calls |\n`;
    md += `|------|---------|------------|\n`;
    for (const hook of results.hooks.sort((a, b) => a.name.localeCompare(b.name))) {
        const returns = hook.returns ? hook.returns.slice(0, 3).join(', ') : '-';
        const apiCalls = hook.apiCalls?.length || 0;
        md += `| \`${hook.name}\` | ${returns} | ${apiCalls} |\n`;
    }
    md += `\n---\n\n`;

    // Services
    md += `## Services/API\n\n`;
    for (const service of results.services.sort((a, b) => a.name.localeCompare(b.name))) {
        md += `### ${service.name}\n\n`;
        md += `**Path:** \`${service.path}\`\n\n`;
        if (service.endpoints.length > 0) {
            md += `| Method | Endpoint |\n|--------|----------|\n`;
            for (const ep of service.endpoints) {
                md += `| ${ep.method} | \`${ep.path}\` |\n`;
            }
        }
        md += `\n`;
    }
    md += `---\n\n`;

    // Routes
    md += `## Routes\n\n`;
    md += `| Name | Path | Dynamic |\n`;
    md += `|------|------|--------|\n`;
    for (const route of results.routes) {
        md += `| ${route.name} | \`${route.path}\` | ${route.dynamic ? '✓' : ''} |\n`;
    }

    return md;
}

/**
 * Main execution
 */
function main() {
    console.log('🔍 Scanning frontend structure...\n');

    // Extract all data
    extractPages(SRC_DIR);
    extractHooks(SRC_DIR);
    extractFeatures(SRC_DIR);
    extractComponents(SRC_DIR);
    extractServices(SRC_DIR);
    extractConstants(SRC_DIR);

    // Calculate stats
    results.stats = {
        totalFeatures: Object.keys(results.features).length,
        totalPages: results.pages.length,
        totalComponents: results.components.length,
        totalHooks: results.hooks.length,
        totalServices: results.services.length,
        totalRoutes: results.routes.length
    };

    // Generate outputs
    const markdown = generateMarkdown();
    fs.writeFileSync(OUTPUT_MD, markdown);
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));

    // Print summary
    console.log('📊 Frontend Structure Summary');
    console.log('═'.repeat(50));
    console.log(`  Features/Modules:  ${results.stats.totalFeatures}`);
    console.log(`  Pages:             ${results.stats.totalPages}`);
    console.log(`  Components:        ${results.stats.totalComponents}`);
    console.log(`  Hooks:             ${results.stats.totalHooks}`);
    console.log(`  Services:          ${results.stats.totalServices}`);
    console.log(`  Routes:            ${results.stats.totalRoutes}`);
    console.log('═'.repeat(50));

    // Top features by component count
    console.log('\n📦 Top Features by Component Count:');
    const topFeatures = Object.entries(results.features)
        .map(([name, f]) => ({ name, count: f.components.length + f.pages.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    for (const f of topFeatures) {
        console.log(`  ${f.name.padEnd(25)} ${f.count} items`);
    }

    console.log(`\n✅ Generated:`);
    console.log(`   ${OUTPUT_MD}`);
    console.log(`   ${OUTPUT_JSON}`);
    console.log(`\n💡 Add to package.json: "docs:frontend": "node scripts/extractFrontend.js"`);
}

main();
