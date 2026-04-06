import { PDFDocument } from 'pdf-lib';
import { getSupabaseService } from './supabase';
import fs from 'fs';
import path from 'path';

/**
 * 🚀 PDF GENERATION ENGINE v2.0 (Dynamic Mapping)
 * No more hardcoded fields. Everything is data-driven from Supabase.
 */
export class PdfEngine {
  private static templatesDir = path.join(process.cwd(), 'public', 'plantillas');

  /**
   * Generates all required PDFs for a specific Claim (Tramite)
   */
  static async generateExpediente(tramiteId: string) {
    const supabase = getSupabaseService();

    // 1. Fetch full context (Claim + Siniestro + Metadata)
    const { data: tramite, error: tError } = await supabase
      .from('tramites')
      .select(`
        *,
        siniestro:siniestros (*),
        facturas (*)
      `)
      .eq('id', tramiteId)
      .single();

    if (tError || !tramite) throw new Error(`Tramite ${tramiteId} not found`);

    // 2. Fetch User Data (Profiles/Roles)
    const { data: user } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', tramite.siniestro?.user_id)
      .single();

    // 3. Identify which templates to apply
    // We look for active templates matching the tramite type (e.g. 'reembolso' -> 'SRGMM', 'CARTA_REMESA')
    const { data: templates } = await supabase
      .from('pdf_templates')
      .select('*')
      .eq('is_active', true);

    if (!templates || templates.length === 0) {
      console.warn('⚠️ No active PDF templates found in DB. Falling back to basics.');
      return [];
    }

    const context = { tramite, siniestro: tramite.siniestro, facturas: tramite.facturas, user };
    const results: { name: string; buffer: Uint8Array }[] = [];

    // 4. Process each template dynamically
    for (const tpl of templates) {
      // Logic: Only apply CARTA_REMESA if it's a reimbursement
      if (tpl.type === 'CARTA_REMESA' && tramite.tipo !== 'reembolso') continue;

      console.log(`📑 Generating PDF: ${tpl.name} (${tpl.type})...`);
      const buffer = await this.fillDynamicTemplate(tpl.id, tpl.file_path, context);
      results.push({ name: `${tpl.type}_${tramiteId.slice(0, 5)}.pdf`, buffer });
    }

    return results;
  }

  /**
   * Core logic to fill any PDF form using DB mappings
   */
  private static async fillDynamicTemplate(templateId: string, fileName: string, context: any) {
    const supabase = getSupabaseService();
    
    // Load PDF template from storage or local path
    const filePath = path.join(this.templatesDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found: ${filePath}`);
    }

    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // Fetch mappings from DB
    const { data: mappings } = await supabase
      .from('pdf_field_mappings')
      .select('*')
      .eq('template_id', templateId)
      .eq('is_active', true);

    if (!mappings) return await pdfDoc.save();

    // Apply each mapping
    for (const map of mappings) {
      const rawValue = this.resolveValue(context, map.source_entity, map.source_field);
      const value = this.applyTransform(rawValue, map.transform_rule);

      if (map.field_type === 'checkbox') {
        this.safeCheck(form, map.pdf_field_name, value === true || String(value) === 'true');
      } else {
        this.safeSetText(form, map.pdf_field_name, value);
      }
    }

    // Special logic for Repeatable Rows (e.g. Invoices)
    // If mappings include pattern logic, we could handle it here. 
    // For now, let's keep it simple.

    form.flatten();
    return await pdfDoc.save();
  }

  private static resolveValue(data: any, entity: string, field: string) {
    const source = data[entity];
    if (!source) return null;
    
    // Support dot notation: e.g. "siniestro.rfc" or "facturas.0.importe"
    return field.split('.').reduce((obj, key) => obj?.[key], source);
  }

  private static applyTransform(value: any, rule: string | null) {
    if (!rule) return value;
    if (value === null || value === undefined) return '';

    const [action, param] = rule.includes(':') ? rule.split(':') : [rule, null];

    switch (action) {
      case 'uppercase': return String(value).toUpperCase();
      case 'lowercase': return String(value).toLowerCase();
      case 'split': 
        return String(value).split(' ')[Number(param)] || '';
      case 'split_rest':
        return String(value).split(' ').slice(Number(param)).join(' ') || '';
      case 'date_day': return new Date(value).getDate();
      case 'date_month': return new Date(value).getMonth() + 1;
      case 'date_year': return new Date(value).getFullYear();
      case 'compare': return value === param;
      case 'currency': return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
      default: return value;
    }
  }

  private static safeSetText(form: any, name: string, val: any) {
    try { form.getTextField(name).setText(String(val || '')); } catch (e) {}
  }

  private static safeCheck(form: any, name: string, check: boolean) {
    try { 
      const cb = form.getCheckBox(name);
      if (check) cb.check(); else cb.uncheck();
    } catch (e) {}
  }
}
