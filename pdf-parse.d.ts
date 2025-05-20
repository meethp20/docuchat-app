declare module 'pdf-parse' {
  interface PDFParseOptions {
    version?: string;
    max?: number;
    pagerender?: (pageData: any) => any;
    password?: string;
    verbosity?: number;
    disableWorker?: boolean;
    disableFontFace?: boolean;
    disableRange?: boolean;
    disableStream?: boolean;
    disableAutoFetch?: boolean;
    disableCreateObjectURL?: boolean;
    disableWebGL?: boolean;
    cMapUrl?: string;
    cMapPacked?: boolean;
    useSystemFonts?: boolean;
    isEvalSupported?: boolean;
    fontExtraProperties?: boolean;
  }

  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
    text: string;
  }

  function pdfParse(
    dataBuffer: Buffer | ArrayBuffer | Uint8Array,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>;

  export = pdfParse;
}