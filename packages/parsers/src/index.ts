import type { ParserField, ParserProfile } from "@gpbm/shared";

export type ParsedBillFields = {
  customer_name?: string;
  customer_mobile?: string;
  bill_number?: string;
  bill_date?: string;
  bill_amount?: number;
};

export type ParseBillInput = {
  business_id: string;
  store_id: string;
  parser_profile: ParserProfile;
  pdf_path: string;
  pdf_text: string;
};

export type ParseBillResult = {
  ok: boolean;
  fields: ParsedBillFields;
  confidence: number;
  missing_fields: ParserField[];
  error_message?: string;
};

export interface PdfBillParser {
  parse(input: ParseBillInput): Promise<ParseBillResult>;
}

export class GenericPdfBillParser implements PdfBillParser {
  async parse(input: ParseBillInput): Promise<ParseBillResult> {
    const mobile = input.pdf_text.match(/(?:\+91|91)?[6-9]\d{9}/)?.[0];
    const billNumber = input.pdf_text.match(/(?:bill|invoice)\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z0-9\-]+)/i)?.[1];
    const amountMatch = input.pdf_text.match(/(?:total|amount|grand total)\s*[:\-]?\s*(?:rs\.?|inr)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
    const fields: ParsedBillFields = {
      customer_mobile: mobile,
      bill_number: billNumber,
      bill_amount: amountMatch ? Number(amountMatch[1]) : undefined
    };
    const missing_fields = input.parser_profile.required_fields.filter((field) => fields[field] === undefined);

    return {
      ok: missing_fields.length === 0,
      fields,
      confidence: missing_fields.length === 0 ? 0.82 : 0.35,
      missing_fields,
      error_message: missing_fields.length ? "Required bill fields could not be extracted safely." : undefined
    };
  }
}
