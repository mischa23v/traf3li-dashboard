import { text, image, barcodes, line, rectangle, ellipse, table } from '@pdfme/schemas'
import type { Plugin } from '@pdfme/common'

/**
 * PDFMe Plugin Registry
 *
 * This module provides a centralized registry of all available PDFMe plugins
 * for use in PDF template generation and editing.
 */

/**
 * Get the complete plugin registry for PDFMe
 *
 * @returns Object containing all available plugins mapped by their display names
 */
export const getPlugins = (): Record<string, Plugin> => ({
  // Text plugin
  Text: text,

  // Image plugin
  Image: image,

  // Table plugin
  Table: table,

  // Barcode plugins
  QRCode: barcodes.qrcode,
  Barcode: barcodes.code128,
  Code39: barcodes.code39,
  Code93: barcodes.code93,
  EAN13: barcodes.ean13,
  EAN8: barcodes.ean8,
  UPCA: barcodes.upca,
  UPCE: barcodes.upce,
  ITF14: barcodes.itf14,

  // Shape plugins
  Line: line,
  Rectangle: rectangle,
  Ellipse: ellipse,
})

/**
 * Get plugins for the Designer component
 * The Designer needs all plugins for template editing
 */
export const getDesignerPlugins = () => getPlugins()

/**
 * Get plugins for the Viewer/Generator components
 * Can be a subset if you want to restrict what can be rendered
 */
export const getViewerPlugins = () => getPlugins()

// Export individual plugins for selective use
export { text, image, barcodes, line, rectangle, ellipse, table }

// Export commonly used barcode types separately for convenience
export const qrcode = barcodes.qrcode
export const code128 = barcodes.code128
export const code39 = barcodes.code39
export const code93 = barcodes.code93
export const ean13 = barcodes.ean13
export const ean8 = barcodes.ean8
export const upca = barcodes.upca
export const upce = barcodes.upce
export const itf14 = barcodes.itf14
