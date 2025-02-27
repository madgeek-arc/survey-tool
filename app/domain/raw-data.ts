export class RawData {
  datasets: Datasets[] = [];
}

export class Datasets {
  series: SeriesItem = new SeriesItem();
}

export class SeriesItem {
  query: Query;
  result: Row[];

  constructor() {
    this.query = new Query();
    this.result = [];
  }
}

export class Query {
  name: string;
  parameters: string[];
  filters: string;
  select: string;
  entity: string;
  profile: string;
  limit: number;
  orderBy: string;

  constructor() {
    this.name = '';
    this.parameters = [];
    this.select = '';
    this.entity = '';
    this.profile = '';
    this.limit = 0;
    this.orderBy = '';
    this.filters = '';
  }
}

export class Row {
  row: string[] = [];
}

export class Data {
  data: [][] = [];
}

export class ChartData {
  xAxis_categories: string[] = [];
  dataSeriesNames: string[] = [];
  dataSeriesTypes: string[] = [];
  drilldown: any = null;
  series: SeriesData[] = [];
}

class SeriesData {
  data: number[] = [];
}
