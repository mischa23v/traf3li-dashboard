# PDFMe GitHub Repository Analysis
## Real-World Implementation Patterns and Best Practices

---

## 1. Repository Structure Overview

The pdfme project is organized as a **TypeScript monorepo** with the following structure:

```
pdfme/
├── packages/          # Core library packages
│   ├── common/       # Shared utilities and types
│   ├── schemas/      # Built-in schema plugins
│   ├── generator/    # PDF generation engine
│   ├── ui/          # Designer, Form, Viewer components
│   ├── converter/   # Format conversion utilities
│   └── manipulator/ # PDF manipulation tools
├── playground/       # Interactive demo application
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── plugins/
│   │   └── helper.ts
│   ├── public/
│   │   └── template-assets/  # 23+ example templates
│   └── package.json
├── website/          # Documentation site
└── scripts/          # Build and utility scripts
```

### Technology Stack
- **Language:** TypeScript
- **Build Tool:** Vite
- **Testing:** Jest with Puppeteer (E2E)
- **Styling:** Tailwind CSS
- **Framework:** React 18.2.0
- **Router:** React Router 6.18.0
- **Error Tracking:** Sentry

---

## 2. Example Projects & Playground Structure

### 2.1 Playground Application Architecture

The playground is a **full-featured React application** demonstrating all pdfme capabilities:

**File: `playground/src/App.tsx`**
```tsx
import { Routes, Route, useSearchParams } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Designer from "./routes/Designer";
import FormAndViewer from "./routes/FormAndViewer";
import Templates from "./routes/Templates";
import Header from "./components/Header";

export default function App() {
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get("embed") === "true";

  return (
    <div className="min-h-screen flex flex-col">
      {!isEmbedded && <Header />}
      <Routes>
        <Route path={"/"} element={<Designer />} />
        <Route path={"/designer"} element={<Designer />} />
        <Route path="/form-viewer" element={<FormAndViewer />} />
        <Route path="/templates" element={<Templates isEmbedded={isEmbedded} />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}
```

**Key Patterns:**
- Conditional rendering for embedded mode (via query params)
- Centralized routing with React Router
- Toast notifications for user feedback
- Separate routes for each major feature

### 2.2 Source Code Organization

```
playground/src/
├── components/
│   ├── Header.tsx         # Navigation bar with version display
│   ├── NavBar.tsx        # Responsive navigation controls
│   └── ExternalButton.tsx # Reusable button component
├── routes/
│   ├── Designer.tsx      # Template design interface
│   ├── FormAndViewer.tsx # PDF form filling + viewing
│   └── Templates.tsx     # Template gallery
├── plugins/
│   ├── index.ts          # Plugin registry
│   └── signature.ts      # Custom signature plugin
├── helper.ts             # Utility functions
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

---

## 3. Demo App Deep Dive

### 3.1 Designer Route Pattern

**File: `playground/src/routes/Designer.tsx`**

**Initialization Pattern:**
```tsx
import { useRef, useEffect, useCallback, useState } from "react";
import { Designer } from "@pdfme/ui";
import { Template, checkTemplate, BLANK_PDF } from "@pdfme/common";
import { getFontsData, getPlugins } from "../helper";

function DesignerRoute() {
  const designerRef = useRef<HTMLDivElement>(null);
  const designer = useRef<Designer | null>(null);
  const [searchParams] = useSearchParams();

  const buildDesigner = useCallback(async () => {
    // Load template from URL params, localStorage, or use blank
    let template: Template = getBlankTemplate();

    if (searchParams.get("template")) {
      template = await getTemplateById(searchParams.get("template")!);
    } else if (localStorage.getItem("template")) {
      template = JSON.parse(localStorage.getItem("template")!);
    }

    // Initialize Designer
    designer.current = new Designer({
      domContainer: designerRef.current!,
      template,
      options: {
        font: getFontsData(),
        lang: 'en', // or user preference
        theme: {
          token: {
            colorPrimary: '#25c2a0',
          },
        },
        icons: {
          multiVariableText: '<svg>...</svg>',
        },
      },
      plugins: getPlugins(),
    });
  }, [searchParams]);

  useEffect(() => {
    buildDesigner();
    return () => designer.current?.destroy();
  }, [buildDesigner]);

  return <div ref={designerRef} style={{ width: '100%', height: '100vh' }} />;
}
```

**Key Features:**
- Template persistence via localStorage
- URL-based template loading
- Proper cleanup on unmount
- Custom theming support
- Multi-language support

### 3.2 Form & Viewer Pattern

**File: `playground/src/routes/FormAndViewer.tsx`**

```tsx
import { Form, Viewer } from "@pdfme/ui";
import { getInputFromTemplate } from "@pdfme/common";

function FormAndViewerRoute() {
  const uiRef = useRef<HTMLDivElement>(null);
  const ui = useRef<Form | Viewer | null>(null);
  const [mode, setMode] = useState<'form' | 'viewer'>('form');

  const buildUi = useCallback(async () => {
    const template = getTemplate(); // from storage/URL
    const inputs = getInputFromTemplate(template);

    const UiComponent = mode === 'form' ? Form : Viewer;

    ui.current = new UiComponent({
      domContainer: uiRef.current!,
      template,
      inputs,
      options: {
        font: getFontsData(),
        lang: 'en',
      },
      plugins: getPlugins(),
    });
  }, [mode]);

  useEffect(() => {
    buildUi();
    return () => ui.current?.destroy();
  }, [buildUi]);

  // Switch between form and viewer
  const toggleMode = () => {
    setMode(prev => prev === 'form' ? 'viewer' : 'form');
  };

  return (
    <div>
      <button onClick={toggleMode}>
        Switch to {mode === 'form' ? 'Viewer' : 'Form'}
      </button>
      <div ref={uiRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
}
```

### 3.3 Template Gallery Pattern

**File: `playground/src/routes/Templates.tsx`**

**Template Loading:**
```tsx
const [templates, setTemplates] = useState<TemplateData[]>([]);

useEffect(() => {
  // Load template index
  fetch('/template-assets/index.json')
    .then(res => res.json())
    .then(data => setTemplates(data));
}, []);

// Navigate to designer with template
const openInDesigner = (templateId: string) => {
  navigate(`/designer?template=${templateId}`);
};

// Generate shareable URL
const getShareableUrl = (templateId: string, ui: 'designer' | 'form-viewer') => {
  return `https://pdfme.com/template-design?ui=${ui}&template=${templateId}`;
};
```

**Template Assets Structure:**
```
public/template-assets/
├── index.json              # Template metadata
├── invoice/
│   ├── template.json      # Template definition
│   └── thumbnail.png      # Preview image
├── certificate-blue/
│   ├── template.json
│   └── thumbnail.png
└── ...
```

---

## 4. Common Patterns & Best Practices

### 4.1 Helper Utilities

**File: `playground/src/helper.ts`**

**Font Management:**
```typescript
import { Font, getDefaultFont } from '@pdfme/common';

export const getFontsData = (): Font => ({
  ...getDefaultFont(),
  'PinyonScript-Regular': {
    fallback: false,
    data: 'https://fonts.gstatic.com/s/pinyonscript/v22/6xKpdSJbL9-e9LuoeQiDRQR8aOLQO4bhiDY.ttf',
  },
  NotoSerifJP: {
    fallback: false,
    data: 'https://fonts.gstatic.com/s/notoserifjp/v30/xn71YHs72GKoTvER4Gn3b5eMRtWGkp6o7MjQ2bwxOubAILO5wBCU.ttf',
  },
  NotoSansJP: {
    fallback: false,
    data: 'https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75vY0rw-oME.ttf',
  },
});
```

**File Operations:**
```typescript
export const readFile = (
  file: File | null,
  type: 'text' | 'dataURL' | 'arrayBuffer'
) => {
  return new Promise<string | ArrayBuffer>((resolve) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e?.target?.result && file !== null) {
        resolve(e.target.result);
      }
    });

    if (file !== null) {
      if (type === 'text') fileReader.readAsText(file);
      else if (type === 'dataURL') fileReader.readAsDataURL(file);
      else if (type === 'arrayBuffer') fileReader.readAsArrayBuffer(file);
    }
  });
};

export const downloadJsonFile = (json: unknown, title: string) => {
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};
```

**Template Operations:**
```typescript
export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target?.files?.[0]) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((template) => {
        if (!currentRef) return;
        currentRef.updateTemplate(template);
      })
      .catch((error) => {
        alert(`Invalid template file.\n${error}`);
      });
  }
};

export const getBlankTemplate = (): Template => ({
  schemas: [{}],
  basePdf: {
    width: 210,   // A4 width in mm
    height: 297,  // A4 height in mm
    padding: [20, 10, 20, 10], // top, right, bottom, left
  },
});

export const getTemplateById = async (templateId: string): Promise<Template> => {
  const template = await fetch(`/template-assets/${templateId}/template.json`)
    .then(res => res.json());
  checkTemplate(template);
  return template as Template;
};
```

**PDF Generation:**
```typescript
import { generate } from '@pdfme/generator';

export const generatePDF = async (
  currentRef: Designer | Form | Viewer | null
) => {
  if (!currentRef) return;

  const template = currentRef.getTemplate();
  const options = currentRef.getOptions();
  const inputs = typeof (currentRef as Viewer | Form).getInputs === 'function'
    ? (currentRef as Viewer | Form).getInputs()
    : getInputFromTemplate(template);

  try {
    const pdf = await generate({
      template,
      inputs,
      options: {
        font: getFontsData(),
        lang: options.lang,
        title: 'pdfme',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  } catch (error) {
    alert(error + '\n\nCheck the console for full stack trace');
    throw error;
  }
};
```

**Multi-language Support:**
```typescript
export const translations: { label: string; value: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'th', label: 'Thai' },
  { value: 'pl', label: 'Polish' },
  { value: 'it', label: 'Italian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
];
```

### 4.2 Plugin System

**File: `playground/src/plugins/index.ts`**

```typescript
import {
  multiVariableText,
  text,
  barcodes,
  image,
  svg,
  line,
  table,
  rectangle,
  ellipse,
  dateTime,
  date,
  time,
  select,
  checkbox,
  radioGroup,
} from '@pdfme/schemas';
import { signature } from './signature';

export const getPlugins = () => {
  return {
    Text: text,
    'Multi-Variable Text': multiVariableText,
    Table: table,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    Image: image,
    SVG: svg,
    Signature: signature,
    QR: barcodes.qrcode,
    DateTime: dateTime,
    Date: date,
    Time: time,
    Select: select,
    Checkbox: checkbox,
    RadioGroup: radioGroup,
    EAN13: barcodes.ean13,
    Code128: barcodes.code128,
  };
};
```

### 4.3 Custom Plugin Pattern

**File: `playground/src/plugins/signature.ts`**

```typescript
import { Plugin, Schema, ZOOM } from '@pdfme/common';
import SignaturePad from 'signature_pad';
import { image } from '@pdfme/schemas';

interface Signature extends Schema {}

const getEffectiveScale = (element: HTMLElement | null) => {
  let scale = 1;
  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const transform = style.transform;
    if (transform && transform !== 'none') {
      const localScale = parseFloat(
        transform.match(/matrix\((.+)\)/)?.[1].split(', ')[3] || '1'
      );
      scale *= localScale;
    }
    element = element.parentElement;
  }
  return scale;
};

export const signature: Plugin<Signature> = {
  // UI rendering for Designer, Form, and Viewer modes
  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode, i18n } = arg;

    // Create canvas for signature
    const canvas = document.createElement('canvas');
    canvas.width = schema.width * ZOOM;
    canvas.height = schema.height * ZOOM;

    // Handle scale transformations
    const resetScale = 1 / getEffectiveScale(rootElement);
    canvas.getContext('2d')!.scale(resetScale, resetScale);

    // Initialize signature pad
    const signaturePad = new SignaturePad(canvas);

    try {
      value
        ? signaturePad.fromDataURL(value, { ratio: resetScale })
        : signaturePad.clear();
    } catch (e) {
      console.error(e);
    }

    // Mode-specific behavior
    if (mode === 'viewer' || (mode === 'form' && schema.readOnly)) {
      signaturePad.off(); // Read-only mode
    } else {
      signaturePad.on(); // Editable mode

      // Add clear button
      const clearButton = document.createElement('button');
      clearButton.style.position = 'absolute';
      clearButton.style.zIndex = '1';
      clearButton.textContent = i18n('signature.clear') || 'x';
      clearButton.addEventListener('click', () => {
        onChange?.({ key: 'content', value: '' });
      });
      rootElement.appendChild(clearButton);

      // Save signature on stroke end
      signaturePad.addEventListener('endStroke', () => {
        const data = signaturePad.toDataURL('image/png');
        onChange?.(data && { key: 'content', value: data });
      });
    }

    rootElement.appendChild(canvas);
  },

  // PDF rendering (reuse image plugin)
  pdf: image.pdf,

  // Property panel configuration
  propPanel: {
    schema: {},
    defaultSchema: {
      name: '',
      type: 'signature',
      content: 'data:image/png;base64,...',
      position: { x: 0, y: 0 },
      width: 62.5,
      height: 37.5,
    },
  },
};
```

**Plugin Structure Requirements:**
1. **ui**: Async function for DOM rendering (Designer, Form, Viewer modes)
2. **pdf**: Function for PDF rendering (can delegate to existing schemas)
3. **propPanel**: Configuration interface with schema and defaultSchema

---

## 5. Template Structure Examples

### 5.1 Real-World Invoice Template

Example from `playground/public/template-assets/invoice/template.json`:

```json
{
  "schemas": [
    {
      "logo": {
        "type": "svg",
        "position": { "x": 15, "y": 15 },
        "width": 20,
        "height": 20,
        "content": "<svg>...</svg>",
        "readOnly": true
      },
      "title": {
        "type": "text",
        "position": { "x": 140, "y": 15 },
        "width": 50,
        "height": 15,
        "content": "INVOICE",
        "fontSize": 40,
        "alignment": "right"
      },
      "customerInfo": {
        "type": "text",
        "position": { "x": 15, "y": 45 },
        "width": 80,
        "height": 30,
        "content": "Billed to:\nImani Olowe\n123 Main St\nNew York, NY 10001"
      },
      "invoiceMetadata": {
        "type": "multiVariableText",
        "position": { "x": 110, "y": 45 },
        "width": 80,
        "height": 20,
        "content": "Invoice No. 12345\nDate: 16 June 2025\nDue Date: 30 June 2025"
      },
      "itemsTable": {
        "type": "table",
        "position": { "x": 15, "y": 80 },
        "width": 180,
        "height": 100,
        "head": ["Item", "Qty", "Unit Price", "Total"],
        "content": [
          ["Eggshell Camisole Top", "1", "$123", "$123"],
          ["Cuban Collar Shirt", "2", "$127", "$254"]
        ]
      },
      "subtotal": {
        "type": "text",
        "position": { "x": 150, "y": 185 },
        "width": 40,
        "height": 8,
        "content": "Subtotal: $377",
        "alignment": "right"
      },
      "tax": {
        "type": "text",
        "position": { "x": 150, "y": 195 },
        "width": 40,
        "height": 8,
        "content": "Tax (10%): $37.70",
        "alignment": "right",
        "dynamicFontSize": {
          "min": 8,
          "max": 12,
          "fit": "vertical"
        }
      },
      "total": {
        "type": "text",
        "position": { "x": 150, "y": 205 },
        "width": 40,
        "height": 10,
        "content": "Total: $414.70",
        "fontColor": "#25c2a0",
        "fontSize": 14,
        "fontWeight": "bold",
        "alignment": "right"
      },
      "thankYou": {
        "type": "text",
        "position": { "x": 15, "y": 230 },
        "width": 180,
        "height": 10,
        "content": "Thank you for your business!",
        "alignment": "center"
      },
      "paymentInfo": {
        "type": "text",
        "position": { "x": 15, "y": 245 },
        "width": 90,
        "height": 25,
        "content": "Payment Information:\nBank: ABC Bank\nAccount: 1234567890\nRouting: 987654321"
      }
    }
  ],
  "basePdf": {
    "width": 210,
    "height": 297,
    "padding": [20, 20, 20, 20]
  }
}
```

### 5.2 Blank Template Pattern

```typescript
import { Template, BLANK_PDF } from '@pdfme/common';

// Option 1: Using BLANK_PDF constant
const template: Template = {
  basePdf: BLANK_PDF,
  schemas: [
    {
      myField: {
        type: 'text',
        position: { x: 10, y: 10 },
        width: 50,
        height: 10,
        content: 'Default text',
      },
    },
  ],
};

// Option 2: Manual dimensions
const template: Template = {
  basePdf: {
    width: 210,   // A4 width in mm
    height: 297,  // A4 height in mm
    padding: [10, 10, 10, 10],
  },
  schemas: [
    {
      // Schema definitions
    },
  ],
};

// Option 3: Using existing PDF
const template: Template = {
  basePdf: 'data:application/pdf;base64,JVBERi0xLjQK...',
  schemas: [
    {
      // Schema definitions
    },
  ],
};
```

### 5.3 Schema Types Reference

**Available Schema Types:**
- `text`: Single-line or multi-line text
- `multiVariableText`: Text with variable substitution
- `image`: Image fields (PNG, JPG)
- `svg`: SVG graphics
- `table`: Data tables with headers
- `line`: Lines and dividers
- `rectangle`: Rectangle shapes
- `ellipse`: Circular/elliptical shapes
- `qrcode`: QR code generation
- `ean13`, `code128`: Barcode types
- `dateTime`, `date`, `time`: Date/time pickers
- `select`: Dropdown selections
- `checkbox`: Checkbox inputs
- `radioGroup`: Radio button groups
- `signature`: Signature capture (custom plugin)

**Common Schema Properties:**
```typescript
{
  name: string;              // Unique identifier
  type: string;              // Schema type
  position: { x: number; y: number; }; // Position in mm
  width: number;             // Width in mm
  height: number;            // Height in mm
  content?: string;          // Default/initial value
  readOnly?: boolean;        // Make field non-editable
  fontSize?: number;         // Font size in pt
  fontColor?: string;        // Hex color code
  fontName?: string;         // Font family
  alignment?: 'left' | 'center' | 'right';
  characterSpacing?: number; // Letter spacing
  lineHeight?: number;       // Line height multiplier
  rotate?: number;           // Rotation angle (0-360)
  opacity?: number;          // Opacity (0-1)
}
```

---

## 6. Recommended Folder Structure

### 6.1 For Frontend Applications

Based on the playground structure:

```
src/
├── components/
│   ├── pdf/
│   │   ├── PdfDesigner.tsx     # Designer wrapper
│   │   ├── PdfForm.tsx         # Form wrapper
│   │   ├── PdfViewer.tsx       # Viewer wrapper
│   │   └── PdfGenerator.tsx    # Generation logic
│   ├── ui/
│   │   ├── NavBar.tsx
│   │   ├── TemplateCard.tsx
│   │   └── LanguageSwitcher.tsx
│   └── modals/
│       └── HelpModal.tsx
├── lib/
│   ├── pdfme/
│   │   ├── config.ts           # Font, theme config
│   │   ├── plugins.ts          # Plugin registry
│   │   ├── helpers.ts          # Utility functions
│   │   └── templates.ts        # Template operations
│   └── utils/
│       └── file.ts             # File operations
├── hooks/
│   ├── usePdfDesigner.ts       # Designer hook
│   ├── usePdfForm.ts           # Form hook
│   └── useTemplates.ts         # Template management
├── types/
│   └── pdfme.ts                # Type definitions
├── assets/
│   └── templates/              # Template JSON files
│       ├── invoice/
│       │   ├── template.json
│       │   └── thumbnail.png
│       └── certificate/
│           ├── template.json
│           └── thumbnail.png
└── pages/
    ├── DesignerPage.tsx
    ├── FormPage.tsx
    ├── ViewerPage.tsx
    └── TemplatesPage.tsx
```

### 6.2 Configuration Files

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['@pdfme/common', '@pdfme/ui', '@pdfme/generator', '@pdfme/schemas'],
  },
});
```

**package.json:**
```json
{
  "name": "pdfme-app",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "@pdfme/common": "^5.0.0",
    "@pdfme/ui": "^5.0.0",
    "@pdfme/generator": "^5.0.0",
    "@pdfme/schemas": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

---

## 7. Development Workflow

### 7.1 Monorepo Development (for contributors)

```bash
# Clone and setup
git clone https://github.com/pdfme/pdfme.git
cd pdfme
npm install
npm run build

# Start watch mode in separate terminals
cd packages/common && npm run dev
cd packages/schemas && npm run dev
cd packages/generator && npm run dev
cd packages/ui && npm run dev

# Run playground
cd playground
npm install
npm run dev  # http://localhost:5173
```

### 7.2 Testing Pattern

```bash
# Run all tests
npm run test

# Update snapshots
npm run test:update-snapshots

# E2E tests with Puppeteer
cd playground
npm run test
```

---

## 8. Real-World Usage Patterns

### 8.1 Initialize Designer

```typescript
import { Designer } from '@pdfme/ui';
import { Template, BLANK_PDF } from '@pdfme/common';
import { text, image, qrcode } from '@pdfme/schemas';

const template: Template = {
  basePdf: BLANK_PDF,
  schemas: [{}],
};

const designer = new Designer({
  domContainer: document.getElementById('designer')!,
  template,
  options: {
    font: {
      ...getDefaultFont(),
      MyCustomFont: {
        fallback: false,
        data: 'https://example.com/font.ttf',
      },
    },
    lang: 'en',
    theme: {
      token: {
        colorPrimary: '#25c2a0',
      },
    },
  },
  plugins: {
    Text: text,
    Image: image,
    QR: qrcode,
  },
});

// Get template
const currentTemplate = designer.getTemplate();

// Update template
designer.updateTemplate(newTemplate);

// Save template
localStorage.setItem('template', JSON.stringify(designer.getTemplate()));

// Destroy
designer.destroy();
```

### 8.2 Initialize Form

```typescript
import { Form } from '@pdfme/ui';
import { getInputFromTemplate } from '@pdfme/common';

const form = new Form({
  domContainer: document.getElementById('form')!,
  template,
  inputs: getInputFromTemplate(template),
  options: {
    font: getFontsData(),
    lang: 'en',
  },
  plugins: getPlugins(),
});

// Get user inputs
const userInputs = form.getInputs();

// Set inputs programmatically
form.setInputs([{ name: 'John', email: 'john@example.com' }]);

// Destroy
form.destroy();
```

### 8.3 Generate PDF

```typescript
import { generate } from '@pdfme/generator';

const pdf = await generate({
  template,
  inputs: [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
  ],
  options: {
    font: getFontsData(),
    lang: 'en',
    title: 'My Document',
  },
  plugins: getPlugins(),
});

// Download PDF
const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'document.pdf';
link.click();
URL.revokeObjectURL(url);
```

### 8.4 Template Loading from Server

```typescript
// Fetch template by ID
const loadTemplate = async (templateId: string) => {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    const template = await response.json();

    // Validate template
    checkTemplate(template);

    return template as Template;
  } catch (error) {
    console.error('Failed to load template:', error);
    throw error;
  }
};

// Use in component
useEffect(() => {
  loadTemplate('invoice-001')
    .then(template => {
      designer.current?.updateTemplate(template);
    });
}, []);
```

### 8.5 Dynamic Font Loading

```typescript
const loadCustomFont = async (url: string) => {
  const response = await fetch(url);
  const fontData = await response.arrayBuffer();
  return fontData;
};

const fonts: Font = {
  ...getDefaultFont(),
  'Custom-Font': {
    fallback: false,
    data: await loadCustomFont('https://example.com/font.ttf'),
  },
};
```

---

## 9. Common Issues & Solutions

### 9.1 Memory Management

**Problem:** Designer/Form/Viewer instances persist after component unmount

**Solution:**
```typescript
useEffect(() => {
  const instance = new Designer({ /* ... */ });

  return () => {
    instance.destroy(); // Always cleanup
  };
}, []);
```

### 9.2 Template Validation

**Problem:** Invalid templates cause runtime errors

**Solution:**
```typescript
import { checkTemplate } from '@pdfme/common';

try {
  checkTemplate(template);
  designer.updateTemplate(template);
} catch (error) {
  console.error('Invalid template:', error);
  alert('Template validation failed');
}
```

### 9.3 Font Loading

**Problem:** Custom fonts not rendering

**Solution:**
```typescript
// Ensure fonts are loaded before initialization
const fonts = await loadFonts();

const designer = new Designer({
  options: { font: fonts },
  // ...
});
```

---

## 10. Key Takeaways

### Best Practices from pdfme Repository:

1. **Modular Architecture**: Separate concerns (Designer, Form, Viewer, Generator)
2. **Type Safety**: Leverage TypeScript for all configurations
3. **Plugin System**: Extend functionality without modifying core
4. **Template Persistence**: Use localStorage + URL params for state
5. **Cleanup**: Always destroy instances on unmount
6. **Validation**: Validate templates before use
7. **Error Handling**: Wrap operations in try-catch blocks
8. **Font Management**: Centralize font configuration
9. **Multi-language**: Support i18n from the start
10. **Template Gallery**: Provide examples for users

### Performance Considerations:

- Use caching for expensive operations
- Implement lazy loading for templates
- Optimize font loading (only load needed fonts)
- Destroy instances when not needed
- Use Web Workers for heavy PDF generation

---

## 11. Additional Resources

- **Official Documentation:** https://pdfme.com/docs/getting-started
- **GitHub Repository:** https://github.com/pdfme/pdfme
- **Live Playground:** https://playground.pdfme.com/
- **Discord Community:** Discord link in playground help modal
- **Issue Tracker:** https://github.com/pdfme/pdfme/issues

---

## 12. Example Templates Available

The repository includes 23+ production-ready templates:

**Business Documents:**
- invoice, invoice-blue, invoice-green, invoice-white
- invoice-ja-simple, invoice-ja-simple-landscape
- new-sale-quotation
- quotes

**Certificates:**
- certificate-black, certificate-blue, certificate-gold, certificate-white

**Labels:**
- address-label-6, address-label-10, address-label-30
- location-arrow, location-number

**Marketing:**
- z-fold-brochure

**Specialized:**
- pedigree
- hihokensha-shikaku-shutoku-todoke (Japanese forms)

**QR Templates:**
- qr-lines, qr-title

**Blank:**
- a4-blank

All templates follow the same structure with `template.json` and `thumbnail.png` files.
