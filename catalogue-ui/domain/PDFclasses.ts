export class DocDefinition {
  header: Content;
  content: any[];
  styles: object;
  images: object;
  info: PdfMetadata;
  defaultStyle: object;

  constructor() {
    this.header = null;
    this.content = [];
    this.styles = {};
  }
}

export class Content {
  text: string;
  style: string[];
  width: number;

  constructor(text: string, style: string[], width?: number) {
    this.text = text;
    this.style = style;
    if (width)
      this.width = width;
  }
}

export class Columns {
  columns: any[];
  style: string[];

  constructor(style?: string[]) {
    this.columns = [];
    if (style)
        this.style = style;
  }
}

export class PdfImage {
  image: string;
  height: number;
  width: number;
  style: string[];

  constructor(image: string, height: number, width: number, style: string[]) {
    this.image = image;
    this.height = height;
    this.width = width;
    this.style = style;
  }
}

export class PdfSvg {
  svg: string
  height: number;
  width: number;
  style: string[];

  constructor(svg: string, height: number, width: number, style: string[]) {
    this.svg = svg;
    this.height = height;
    this.width = width;
    this.style = style;
  }
}

export class PdfTable {
  table: TableDefinition;
  styles: string[]

  constructor(table: TableDefinition, styles: string[]) {
    this.table = table;
    this.styles = styles;
  }
}

export class TableDefinition {
  body: any[][];
  widths: string[];
  heights: number[];

  constructor(body: any[][], widths: string[], heights?: number[]) {
    this.body = body;
    this.widths = widths;
    if (heights)
      this.heights = heights;
  }
}

export class PdfUnorderedList {
  ul: string[];
  type: string;
  markerColor: string;
  color: string;

  constructor(ul: string[], type?: string) {
    this.ul = ul;
    if (type)
      this.type = type;
  }
}

export class PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate: any;
  modDate: any;
  trapped: any;

  constructor(title: string) {
    this.title = title;
  }
}
