#!/usr/bin/env node

/**
 * Frontend Structure Extractor - Complete Edition
 *
 * Automatically scans all frontend files and extracts:
 * - Pages/Routes
 * - Components
 * - Hooks
 * - API Services & Endpoints
 * - TypeScript Types & Interfaces (Entity Shapes)
 * - Request/Response Types
 * - Enums
 * - Query Keys
 * - Constants/Routes
 * - Zod Schemas
 *
 * Outputs to docs/FRONTEND_STRUCTURE.md and docs/frontend-structure.json
 *
 * Usage: node scripts/extractFrontend.cjs
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
    types: [],
    interfaces: [],
    enums: [],
    schemas: [],
    queryKeys: [],
    routes: [],
    apiEndpoints: [],
    requestTypes: [],
    responseTypes: [],
    features: {},
    stats: {}
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
 * Extract TypeScript interfaces from content
 */
function extractInterfaces(content, filePath) {
    const interfaces = [];
    const relativePath = path.relative(SRC_DIR, filePath);

    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
        const name = match[1];
        const extends_ = match[2] ? match[2].trim() : null;
        const body = match[3].trim();

        const fields = [];
        const fieldRegex = /(\w+)(\?)?:\s*([^;]+);?/g;
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(body)) !== null) {
            fields.push({
                name: fieldMatch[1],
                optional: !!fieldMatch[2],
                type: fieldMatch[3].trim()
            });
        }

        interfaces.push({
            name,
            extends: extends_,
            fields,
            path: relativePath,
            isExported: content.includes(`export interface ${name}`) || content.includes(`export { ${name}`)
        });
    }

    return interfaces;
}

/**
 * Extract TypeScript type aliases from content
 */
function extractTypes(content, filePath) {
    const types = [];
    const relativePath = path.relative(SRC_DIR, filePath);

    const typeRegex = /(?:export\s+)?type\s+(\w+)(?:<[^>]+>)?\s*=\s*([^;]+);/g;
    let match;

    while ((match = typeRegex.exec(content)) !== null) {
        const name = match[1];
        const definition = match[2].trim();

        let kind = 'alias';
        if (definition.includes('|')) kind = 'union';
        else if (definition.includes('&')) kind = 'intersection';
        else if (definition.startsWith('{')) kind = 'object';
        else if (definition.includes('=>')) kind = 'function';

        types.push({
            name,
            definition: definition.length > 200 ? definition.substring(0, 200) + '...' : definition,
            kind,
            path: relativePath,
            isExported: content.includes(`export type ${name}`)
        });
    }

    return types;
}

/**
 * Extract enums from content
 */
function extractEnums(content, filePath) {
    const enums = [];
    const relativePath = path.relative(SRC_DIR, filePath);

    const enumRegex = /(?:export\s+)?(?:const\s+)?enum\s+(\w+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = enumRegex.exec(content)) !== null) {
        const name = match[1];
        const body = match[2].trim();

        const values = [];
        const valueRegex = /(\w+)\s*(?:=\s*['"`]?([^,'"}`\n]+)['"`]?)?/g;
        let valueMatch;
        while ((valueMatch = valueRegex.exec(body)) !== null) {
            if (valueMatch[1]) {
                values.push({
                    key: valueMatch[1].trim(),
                    value: valueMatch[2] ? valueMatch[2].trim() : null
                });
            }
        }

        enums.push({
            name,
            values,
            path: relativePath,
            isExported: content.includes(`export enum ${name}`) || content.includes(`export const enum ${name}`)
        });
    }

    // Also extract const object enums
    const constEnumRegex = /(?:export\s+)?const\s+(\w+)\s*=\s*\{([^}]+)\}\s*as\s+const/g;
    while ((match = constEnumRegex.exec(content)) !== null) {
        const name = match[1];
        const body = match[2].trim();

        const values = [];
        const valueRegex = /(\w+)\s*:\s*['"`]([^'"`]+)['"`]/g;
        let valueMatch;
        while ((valueMatch = valueRegex.exec(body)) !== null) {
            values.push({
                key: valueMatch[1],
                value: valueMatch[2]
            });
        }

        if (values.length > 0) {
            enums.push({
                name,
                values,
                path: relativePath,
                isConst: true,
                isExported: content.includes(`export const ${name}`)
            });
        }
    }

    return enums;
}

/**
 * Extract Zod schemas from content
 */
function extractSchemas(content, filePath) {
    const schemas = [];
    const relativePath = path.relative(SRC_DIR, filePath);

    const schemaRegex = /(?:export\s+)?const\s+(\w+(?:Schema|Validator))\s*=\s*z\.(object|array|string|number|enum)\s*\(/gs;
    let match;

    while ((match = schemaRegex.exec(content)) !== null) {
        const name = match[1];
        const type = match[2];

        schemas.push({
            name,
            type,
            path: relativePath,
            isExported: content.includes(`export const ${name}`)
        });
    }

    return schemas;
}

/**
 * Extract API endpoints from hooks and services
 */
function extractApiEndpoints(content, filePath) {
    const endpoints = [];
    const relativePath = path.relative(SRC_DIR, filePath);

    const patterns = [
        /api\s*\.\s*(get|post|put|patch|delete)\s*<([^>]+)>\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /api\s*\.\s*(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /apiClient\s*\.\s*(get|post|put|patch|delete)\s*[<(]\s*['"`]([^'"`]+)['"`]/gi,
        /fetch\s*\(\s*['"`](\/api\/[^'"`]+)['"`]/gi,
        /axios\s*\.\s*(get|post|put|patch|delete)\s*[<(]\s*['"`]([^'"`]+)['"`]/gi,
    ];

    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            let method, endpoint, responseType;

            if (match.length === 4) {
                method = match[1].toUpperCase();
                responseType = match[2];
                endpoint = match[3];
            } else if (match.length === 3) {
                method = match[1].toUpperCase();
                endpoint = match[2];
            } else if (match.length === 2) {
                method = 'GET';
                endpoint = match[1];
            }

            if (endpoint) {
                endpoints.push({
                    method: method || 'UNKNOWN',
                    endpoint,
                    responseType: responseType || null,
                    source: relativePath
                });
            }
        }
    }

    // Template literals
    const templatePattern = /api\s*\.\s*(get|post|put|patch|delete)\s*[<(][^`]*`([^`]+)`/gi;
    let tmatch;
    while ((tmatch = templatePattern.exec(content)) !== null) {
        endpoints.push({
            method: tmatch[1].toUpperCase(),
            endpoint: tmatch[2].replace(/\$\{[^}]+\}/g, ':param'),
            source: relativePath,
            dynamic: true
        });
    }

    return endpoints;
}

/**
 * Extract request/response types
 */
function extractRequestResponseTypes(content, filePath) {
    const relativePath = path.relative(SRC_DIR, filePath);
    const requests = [];
    const responses = [];

    const requestRegex = /(?:export\s+)?(?:interface|type)\s+(\w*(?:Request|Payload|Input|Params|Args|CreateDTO|UpdateDTO)\w*)\s*[={]/g;
    let match;
    while ((match = requestRegex.exec(content)) !== null) {
        requests.push({ name: match[1], path: relativePath });
    }

    const responseRegex = /(?:export\s+)?(?:interface|type)\s+(\w*(?:Response|Result|Output|Data|DTO)\w*)\s*[={]/g;
    while ((match = responseRegex.exec(content)) !== null) {
        responses.push({ name: match[1], path: relativePath });
    }

    return { requests, responses };
}

/**
 * Extract component info
 */
function extractComponentInfo(filePath, content) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative(SRC_DIR, filePath);

    const info = {
        name: fileName,
        path: relativePath,
        type: 'component',
        exports: [],
        props: null,
        hooks: [],
        apiCalls: []
    };

    if (fileName.startsWith('use') || fileName.startsWith('Use')) {
        info.type = 'hook';
    }

    const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g);
    for (const match of exportMatches) {
        info.exports.push(match[1]);
    }

    const propsMatch = content.match(/interface\s+(\w+Props)\s*(?:extends\s+[^{]+)?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
    if (propsMatch) {
        const fields = [];
        const fieldRegex = /(\w+)(\?)?:\s*([^;]+);/g;
        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(propsMatch[2])) !== null) {
            fields.push({
                name: fieldMatch[1],
                optional: !!fieldMatch[2],
                type: fieldMatch[3].trim()
            });
        }
        info.props = { name: propsMatch[1], fields };
    }

    const hookMatches = content.matchAll(/\buse[A-Z]\w+/g);
    const hooksUsed = new Set();
    for (const match of hookMatches) {
        hooksUsed.add(match[0]);
    }
    info.hooks = Array.from(hooksUsed);

    info.apiCalls = extractApiEndpoints(content, filePath);

    return info;
}

/**
 * Extract routes
 */
function extractRoutes(content) {
    const routes = [];

    const routeMatches = content.matchAll(/(\w+)\s*:\s*['"`]([^'"`]+)['"`]/g);
    for (const match of routeMatches) {
        routes.push({ name: match[1], path: match[2] });
    }

    const funcRouteMatches = content.matchAll(/(\w+)\s*:\s*\([^)]*\)\s*=>\s*[`'"]([^`'"]+)[`'"]/g);
    for (const match of funcRouteMatches) {
        routes.push({ name: match[1], path: match[2], dynamic: true });
    }

    return routes;
}

/**
 * Extract query keys
 */
function extractQueryKeys(content) {
    const queryKeys = [];

    const keyMatches = content.matchAll(/(\w+)\s*:\s*(\[[^\]]+\]|\([^)]*\)\s*=>\s*\[[^\]]+\])/g);
    for (const match of keyMatches) {
        queryKeys.push({ name: match[1], definition: match[2] });
    }

    return queryKeys;
}

/**
 * Scan all TypeScript files
 */
function extractAllTypes(dir) {
    const files = getAllFiles(dir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');

        results.interfaces.push(...extractInterfaces(content, file));
        results.types.push(...extractTypes(content, file));
        results.enums.push(...extractEnums(content, file));
        results.schemas.push(...extractSchemas(content, file));
        results.apiEndpoints.push(...extractApiEndpoints(content, file));

        const reqRes = extractRequestResponseTypes(content, file);
        results.requestTypes.push(...reqRes.requests);
        results.responseTypes.push(...reqRes.responses);
    }
}

/**
 * Extract pages
 */
function extractPages(dir) {
    const pagesDir = path.join(dir, 'routes');
    if (!fs.existsSync(pagesDir)) return;

    const files = getAllFiles(pagesDir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const info = extractComponentInfo(file, content);
        info.type = 'page';

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
 * Extract hooks
 */
function extractHooks(dir) {
    const hooksDir = path.join(dir, 'hooks');
    if (!fs.existsSync(hooksDir)) return;

    const files = getAllFiles(hooksDir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const info = extractComponentInfo(file, content);
        info.type = 'hook';

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
 * Extract features
 */
function extractFeatures(dir) {
    const featuresDir = path.join(dir, 'features');
    if (!fs.existsSync(featuresDir)) return;

    const featureDirs = fs.readdirSync(featuresDir).filter(f => {
        return fs.statSync(path.join(featuresDir, f)).isDirectory();
    });

    for (const feature of featureDirs) {
        const featurePath = path.join(featuresDir, feature);
        const featureInfo = {
            name: feature,
            components: [],
            pages: [],
            hooks: [],
            types: [],
            hasIndex: false
        };

        const subdirs = ['components', 'pages', 'hooks', 'views', 'types'];
        for (const subdir of subdirs) {
            const subdirPath = path.join(featurePath, subdir);
            if (fs.existsSync(subdirPath)) {
                const files = getAllFiles(subdirPath);
                for (const file of files) {
                    const content = fs.readFileSync(file, 'utf-8');

                    if (subdir === 'components') {
                        const info = extractComponentInfo(file, content);
                        featureInfo.components.push(info);
                        results.components.push({ ...info, feature });
                    } else if (subdir === 'pages' || subdir === 'views') {
                        const info = extractComponentInfo(file, content);
                        info.type = 'page';
                        featureInfo.pages.push(info);
                    } else if (subdir === 'hooks') {
                        const info = extractComponentInfo(file, content);
                        info.type = 'hook';
                        featureInfo.hooks.push(info);
                    } else if (subdir === 'types') {
                        featureInfo.types.push(...extractInterfaces(content, file));
                    }
                }
            }
        }

        featureInfo.hasIndex = fs.existsSync(path.join(featurePath, 'index.ts')) ||
            fs.existsSync(path.join(featurePath, 'index.tsx'));

        results.features[feature] = featureInfo;
    }
}

/**
 * Extract components
 */
function extractComponents(dir) {
    const componentsDir = path.join(dir, 'components');
    if (!fs.existsSync(componentsDir)) return;

    const files = getAllFiles(componentsDir);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const info = extractComponentInfo(file, content);

        const relativePath = path.relative(componentsDir, file);
        info.category = relativePath.split(path.sep)[0];

        results.components.push(info);
    }
}

/**
 * Extract services
 */
function extractServices(dir) {
    const searchDirs = ['services', 'lib', 'api'].map(d => path.join(dir, d)).filter(fs.existsSync);

    for (const searchDir of searchDirs) {
        const files = getAllFiles(searchDir);

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const fileName = path.basename(file);

            if (!content.includes('api') && !content.includes('fetch') && !content.includes('axios')) continue;

            const endpoints = extractApiEndpoints(content, file);
            if (endpoints.length > 0) {
                results.services.push({
                    name: fileName,
                    path: path.relative(SRC_DIR, file),
                    endpoints
                });
            }
        }
    }
}

/**
 * Extract constants
 */
function extractConstants(dir) {
    const routesFile = path.join(dir, 'constants', 'routes.ts');
    if (fs.existsSync(routesFile)) {
        results.routes = extractRoutes(fs.readFileSync(routesFile, 'utf-8'));
    }

    const queryKeysFile = path.join(dir, 'lib', 'query-keys.ts');
    if (fs.existsSync(queryKeysFile)) {
        results.queryKeys = extractQueryKeys(fs.readFileSync(queryKeysFile, 'utf-8'));
    }
}

/**
 * Generate Markdown
 */
function generateMarkdown() {
    const uniqueEndpoints = new Map();
    for (const ep of results.apiEndpoints) {
        const key = `${ep.method}:${ep.endpoint}`;
        if (!uniqueEndpoints.has(key)) uniqueEndpoints.set(key, ep);
    }

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
| **Interfaces (Entity Shapes)** | ${results.interfaces.length} |
| **Type Aliases** | ${results.types.length} |
| **Enums** | ${results.enums.length} |
| **Zod Schemas** | ${results.schemas.length} |
| **API Endpoints** | ${uniqueEndpoints.size} |
| **Request Types** | ${results.requestTypes.length} |
| **Response Types** | ${results.responseTypes.length} |
| Routes Defined | ${results.routes.length} |
| Query Keys | ${results.queryKeys.length} |

---

## Table of Contents

- [Features/Modules](#featuresmodules)
- [Entity Interfaces](#entity-interfaces)
- [Type Aliases](#type-aliases)
- [Enums](#enums)
- [Zod Schemas](#zod-schemas)
- [API Endpoints](#api-endpoints)
- [Request/Response Types](#requestresponse-types)
- [Pages](#pages)
- [Hooks](#hooks)
- [Routes](#routes)
- [Query Keys](#query-keys)

---

## Features/Modules

`;

    for (const [name, feature] of Object.entries(results.features).sort()) {
        md += `### ${name}\n`;
        md += `| Type | Count |\n|------|-------|\n`;
        md += `| Components | ${feature.components.length} |\n`;
        md += `| Pages/Views | ${feature.pages.length} |\n`;
        md += `| Hooks | ${feature.hooks.length} |\n`;
        md += `| Types | ${feature.types.length} |\n\n`;

        if (feature.components.length > 0) {
            md += `**Components:** ${feature.components.map(c => `\`${c.name}\``).join(', ')}\n\n`;
        }
        if (feature.pages.length > 0) {
            md += `**Pages:** ${feature.pages.map(p => `\`${p.name}\``).join(', ')}\n\n`;
        }
        md += `---\n\n`;
    }

    // Entity Interfaces
    md += `## Entity Interfaces\n\n`;
    md += `| Interface | Fields | Extends | Path |\n`;
    md += `|-----------|--------|---------|------|\n`;
    const entityInterfaces = results.interfaces
        .filter(i => !i.name.includes('Props') && !i.name.includes('State') && i.isExported)
        .slice(0, 300);
    for (const intf of entityInterfaces) {
        md += `| \`${intf.name}\` | ${intf.fields.length} | ${intf.extends || '-'} | ${intf.path} |\n`;
    }
    if (results.interfaces.length > 300) {
        md += `\n*... and ${results.interfaces.length - 300} more*\n`;
    }
    md += `\n---\n\n`;

    // Type Aliases
    md += `## Type Aliases\n\n`;
    md += `| Type | Kind | Definition |\n`;
    md += `|------|------|------------|\n`;
    for (const type of results.types.filter(t => t.isExported).slice(0, 200)) {
        const shortDef = type.definition.length > 50 ? type.definition.substring(0, 50) + '...' : type.definition;
        md += `| \`${type.name}\` | ${type.kind} | \`${shortDef}\` |\n`;
    }
    md += `\n---\n\n`;

    // Enums
    md += `## Enums\n\n`;
    for (const enumDef of results.enums.filter(e => e.isExported).slice(0, 100)) {
        md += `### ${enumDef.name}${enumDef.isConst ? ' (const)' : ''}\n`;
        md += `**Path:** \`${enumDef.path}\`\n\n`;
        md += `| Key | Value |\n|-----|-------|\n`;
        for (const val of enumDef.values.slice(0, 15)) {
            md += `| ${val.key} | ${val.value || 'auto'} |\n`;
        }
        if (enumDef.values.length > 15) md += `| ... | +${enumDef.values.length - 15} more |\n`;
        md += `\n`;
    }
    md += `---\n\n`;

    // Zod Schemas
    md += `## Zod Schemas\n\n`;
    md += `| Schema | Type | Path |\n`;
    md += `|--------|------|------|\n`;
    for (const schema of results.schemas) {
        md += `| \`${schema.name}\` | ${schema.type} | ${schema.path} |\n`;
    }
    md += `\n---\n\n`;

    // API Endpoints
    md += `## API Endpoints\n\n`;
    md += `| Method | Endpoint | Response Type | Source |\n`;
    md += `|--------|----------|---------------|--------|\n`;
    const sortedEndpoints = Array.from(uniqueEndpoints.values())
        .sort((a, b) => a.endpoint.localeCompare(b.endpoint));
    for (const ep of sortedEndpoints.slice(0, 500)) {
        md += `| ${ep.method} | \`${ep.endpoint}\` | ${ep.responseType || '-'} | ${ep.source} |\n`;
    }
    if (sortedEndpoints.length > 500) {
        md += `\n*... and ${sortedEndpoints.length - 500} more endpoints*\n`;
    }
    md += `\n---\n\n`;

    // Request/Response Types
    md += `## Request/Response Types\n\n`;
    md += `### Request Types (${results.requestTypes.length})\n`;
    md += `| Type | Path |\n|------|------|\n`;
    for (const req of results.requestTypes.slice(0, 150)) {
        md += `| \`${req.name}\` | ${req.path} |\n`;
    }
    md += `\n### Response Types (${results.responseTypes.length})\n`;
    md += `| Type | Path |\n|------|------|\n`;
    for (const res of results.responseTypes.slice(0, 150)) {
        md += `| \`${res.name}\` | ${res.path} |\n`;
    }
    md += `\n---\n\n`;

    // Pages
    md += `## Pages\n\n`;
    md += `| Page | Route | Hooks Used |\n`;
    md += `|------|-------|------------|\n`;
    for (const page of results.pages.sort((a, b) => a.routePath.localeCompare(b.routePath))) {
        const hooks = page.hooks.slice(0, 3).join(', ') + (page.hooks.length > 3 ? '...' : '');
        md += `| ${page.name} | \`${page.routePath}\` | ${hooks} |\n`;
    }
    md += `\n---\n\n`;

    // Hooks
    md += `## Hooks\n\n`;
    md += `| Hook | Returns | API Calls |\n`;
    md += `|------|---------|------------|\n`;
    for (const hook of results.hooks.sort((a, b) => a.name.localeCompare(b.name))) {
        const returns = hook.returns ? hook.returns.slice(0, 3).join(', ') : '-';
        md += `| \`${hook.name}\` | ${returns} | ${hook.apiCalls?.length || 0} |\n`;
    }
    md += `\n---\n\n`;

    // Routes
    md += `## Routes\n\n`;
    md += `| Name | Path | Dynamic |\n`;
    md += `|------|------|--------|\n`;
    for (const route of results.routes) {
        md += `| ${route.name} | \`${route.path}\` | ${route.dynamic ? '✓' : ''} |\n`;
    }
    md += `\n---\n\n`;

    // Query Keys
    md += `## Query Keys\n\n`;
    md += `| Key | Definition |\n`;
    md += `|-----|------------|\n`;
    for (const key of results.queryKeys.slice(0, 200)) {
        const shortDef = key.definition.length > 60 ? key.definition.substring(0, 60) + '...' : key.definition;
        md += `| ${key.name} | \`${shortDef}\` |\n`;
    }

    return md;
}

/**
 * Main
 */
function main() {
    console.log('🔍 Scanning frontend structure...\n');

    extractAllTypes(SRC_DIR);
    extractPages(SRC_DIR);
    extractHooks(SRC_DIR);
    extractFeatures(SRC_DIR);
    extractComponents(SRC_DIR);
    extractServices(SRC_DIR);
    extractConstants(SRC_DIR);

    // Dedupe endpoints
    const uniqueEndpoints = new Map();
    for (const ep of results.apiEndpoints) {
        uniqueEndpoints.set(`${ep.method}:${ep.endpoint}`, ep);
    }

    results.stats = {
        totalFeatures: Object.keys(results.features).length,
        totalPages: results.pages.length,
        totalComponents: results.components.length,
        totalHooks: results.hooks.length,
        totalServices: results.services.length,
        totalInterfaces: results.interfaces.length,
        totalTypes: results.types.length,
        totalEnums: results.enums.length,
        totalSchemas: results.schemas.length,
        totalApiEndpoints: uniqueEndpoints.size,
        totalRequestTypes: results.requestTypes.length,
        totalResponseTypes: results.responseTypes.length,
        totalRoutes: results.routes.length,
        totalQueryKeys: results.queryKeys.length
    };

    fs.writeFileSync(OUTPUT_MD, generateMarkdown());
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));

    console.log('📊 Frontend Structure Summary');
    console.log('═'.repeat(50));
    console.log(`  Features/Modules:      ${results.stats.totalFeatures}`);
    console.log(`  Pages:                 ${results.stats.totalPages}`);
    console.log(`  Components:            ${results.stats.totalComponents}`);
    console.log(`  Hooks:                 ${results.stats.totalHooks}`);
    console.log(`  Services:              ${results.stats.totalServices}`);
    console.log('─'.repeat(50));
    console.log(`  Interfaces:            ${results.stats.totalInterfaces}`);
    console.log(`  Type Aliases:          ${results.stats.totalTypes}`);
    console.log(`  Enums:                 ${results.stats.totalEnums}`);
    console.log(`  Zod Schemas:           ${results.stats.totalSchemas}`);
    console.log('─'.repeat(50));
    console.log(`  API Endpoints:         ${results.stats.totalApiEndpoints}`);
    console.log(`  Request Types:         ${results.stats.totalRequestTypes}`);
    console.log(`  Response Types:        ${results.stats.totalResponseTypes}`);
    console.log('─'.repeat(50));
    console.log(`  Routes:                ${results.stats.totalRoutes}`);
    console.log(`  Query Keys:            ${results.stats.totalQueryKeys}`);
    console.log('═'.repeat(50));

    console.log(`\n✅ Generated:`);
    console.log(`   ${OUTPUT_MD}`);
    console.log(`   ${OUTPUT_JSON}`);
}

main();
