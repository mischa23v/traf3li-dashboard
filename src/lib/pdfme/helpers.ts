import { Template, BLANK_PDF } from '@pdfme/common';

/**
 * Returns a blank A4 template with default settings
 */
export function getBlankTemplate(): Template {
  return {
    basePdf: BLANK_PDF,
    schemas: [
      {
        // Empty schema for a blank template
      },
    ],
  };
}

/**
 * Downloads a PDF file in the browser
 * @param pdf - The PDF content as a Uint8Array
 * @param filename - The name for the downloaded file
 */
export function downloadPdf(pdf: Uint8Array, filename: string): void {
  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a template as a JSON file
 * @param template - The template object to download
 * @param filename - The name for the downloaded file
 */
export function downloadTemplate(template: Template, filename: string): void {
  const json = JSON.stringify(template, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reads a file and returns its content as text
 * @param file - The file to read
 * @returns Promise that resolves with the file content as a string
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Converts a base64 string to a Uint8Array
 * @param base64 - The base64 string to convert
 * @returns The converted Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  // Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
  const base64String = base64.split(',')[1] || base64;

  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Converts a Uint8Array to a base64 string
 * @param uint8Array - The Uint8Array to convert
 * @returns The base64 string representation
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binaryString = '';
  const len = uint8Array.byteLength;

  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binaryString);
}
