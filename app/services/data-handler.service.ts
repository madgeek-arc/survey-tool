import { Injectable } from '@angular/core';
import { RawData } from '../domain/raw-data';
import { CountryTableData } from '../domain/country-table-data';
import {CategorizedAreaData, Series} from "../domain/categorizedAreaData";
import {FundingForEOSCSums} from "../domain/funding-for-eosc";
import {isNumeric} from "rxjs/internal-compatibility";
import {SeriesMapbubbleDataOptions, SeriesMapbubbleOptions} from "highcharts";
import {SeriesMapDataOptions} from "highcharts/highmaps";

@Injectable ()
export class DataHandlerService {

  public convertRawDataToTableData(rawData: RawData) {

    const tableData: CountryTableData[] = [];

    for (const series of rawData.datasets) {

      for (const rowResult of series.series.result) {

        const countryTableData: CountryTableData = new CountryTableData();
        if (series.series.query.name === 'eosc.obs.question17') {
          countryTableData.hasAppointedMandatedOrganization = rowResult.row[1];
        }
        if (series.series.query.name === 'eosc.obs.question3' || series.series.query.name === 'eosc.obs.question4'
          || series.series.query.name === 'eosc.obs.question9' || series.series.query.name === 'eosc.obs.question10'
          || series.series.query.name === 'eosc.obs.question14' || series.series.query.name === 'eosc.obs.question15'
          || series.series.query.name === 'eosc.obs.question16' || series.series.query.name === 'eosc.obs.question18'
          || series.series.query.name === 'eosc.obs.question19' || series.series.query.name === 'eosc.obs.question20') {
          countryTableData.EOSCRelevantPoliciesInPlace = rowResult.row.slice(3);
        }
        if (series.series.query.name === 'eosc.obs.question20') {
          countryTableData.mapPointData = Array(3).fill(null).concat(rowResult.row.slice(3, 11).concat(rowResult.row.slice(12)));
        }

        countryTableData.dedicatedFinancialContributionsToEOSCLinkedToPolicies = rowResult.row[1];

        countryTableData.name = rowResult.row[0];
        countryTableData.code = rowResult.row[0];
        tableData.push(countryTableData);
      }
    }

    return tableData;
  }

  public convertRawDataToMapPoint(rawData: RawData) {
    const tableData: CountryTableData[] = [];

    for (const series of rawData.datasets) {

      for (const rowResult of series.series.result) {

        const countryTableData: CountryTableData = new CountryTableData();
        if (series.series.query.name === 'eosc.obs.question5') {
          if (rowResult.row[1] === 'Yes')
            countryTableData.mapPointData.push(rowResult.row[1]);
          else
            continue;
        }
        if (series.series.query.name === 'eosc.obs.question14') {
          if (rowResult.row[1] === 'true')
            countryTableData.mapPointData.push(rowResult.row[1]);
          else
            continue;
        }
        if (series.series.query.name === 'eosc.obs.question16') {
          if (rowResult.row[2] === 'true')
            countryTableData.mapPointData.push(rowResult.row[2]);
          else
            continue;
        }
        countryTableData.name = rowResult.row[0];
        countryTableData.code = rowResult.row[0];
        tableData.push(countryTableData);
      }
    }
    return tableData;
  }

  public convertRawDataToCategorizedAreasData(rawData: RawData) {

    const mapData: CategorizedAreaData = new CategorizedAreaData();
    let mapSeries: Series[] = [];
    // mapSeries.push(new Series('In'));
    for (const series of rawData.datasets) {
      for (const rowResult of series.series.result) {
        // console.log(rowResult);
        if (rowResult.row[1] === null || rowResult.row[1] === 'null') {
          let found = false;
          for (const series of mapSeries) {
            if (series.name === 'Awaiting data') {
              found = true;
              series.data.push(rowResult.row[0]);
            }
          }
          if (!found) {
            mapSeries.push(new Series('Awaiting data', false));
            mapSeries[mapSeries.length-1].data.push(rowResult.row[0]);
          }
        } else {
          let found = false;
          for (const series of mapSeries) {
            if (series.name === rowResult.row[1]) {
              found = true;
              series.data.push(rowResult.row[0]);
            }
          }
          if (!found) {
            mapSeries.push(new Series(rowResult.row[1], false));
            mapSeries[mapSeries.length-1].data.push(rowResult.row[0]);
          }
        }

      }
      mapData.series = mapSeries;
    }

    return mapData
  }

  public covertRawDataToColorAxisMap(rawData: RawData) {
    let tmpDataArray: (number | SeriesMapDataOptions | [string, number])[] = [];
    for (const data of rawData.datasets[0].series.result) {
      if (isNumeric(data.row[1]))
        tmpDataArray.push([data.row[0].toLowerCase(), parseFloat(data.row[1])])
    }
    // console.log(tmpDataArray);
    return tmpDataArray;
  }

  public convertRawDataToFundingForEOSCSums(rawData: RawData) {

    let fundingForEOSCSums: FundingForEOSCSums = new FundingForEOSCSums();

    for (const series of rawData.datasets) {

      if (series.series.query.name.includes('eosc.obs.question6.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.totalFundingForEOSC = rowResult.row[0];
        }

      } else if (series.series.query.name.includes('eosc.obs.question7.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.fundingToOrganisationsInEOSCA = rowResult.row[0];
        }

      } else if (series.series.query.name.includes('eosc.obs.question8.sum')) {

        for (const rowResult of series.series.result) {
          fundingForEOSCSums.fundingToOrganisationsOutsideEOSCA = rowResult.row[0];
        }
      }

    }

    return fundingForEOSCSums;
  }

  public convertRawDataToFundingForEOSCSumsCustom(rawData: RawData) {
    let fundingForEOSCSums: FundingForEOSCSums = new FundingForEOSCSums();
    for (const series of rawData.datasets) {
      if (series.series.query.name.includes('eosc.obs.question6')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.totalFundingForEOSC = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();

      } else if (series.series.query.name.includes('eosc.obs.question7')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.fundingToOrganisationsInEOSCA = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();

      } else if (series.series.query.name.includes('eosc.obs.question8')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.fundingToOrganisationsOutsideEOSCA = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      } else if (series.series.query.name.includes('eosc.obs.question11')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.earmarkedContributions = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      } else if (series.series.query.name.includes('eosc.obs.question12')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.nonEarmarkedContributions = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      } else if (series.series.query.name.includes('eosc.obs.question13')) {
        let sum = 0.0;
        for (const rowResult of series.series.result) {
          if (isNumeric(rowResult.row[1])) {
            sum += +rowResult.row[1];
          }
        }
        fundingForEOSCSums.structuralInvestmentFunds = (Math.round((sum + Number.EPSILON) * 100) / 100).toString();
      }
    }
    return fundingForEOSCSums;
  }

  public convertRawDataToBubbleMapSeries(rawData: RawData) {
    let series = [];
    for (const dataset of rawData.datasets) {
      let dataOptions:SeriesMapbubbleDataOptions[] = [];
      for (const row of dataset.series.result) {
        if (isNumeric(row.row[1])) {
          let data: SeriesMapbubbleDataOptions = new class implements SeriesMapbubbleDataOptions {
            id: string;
            name: string;
            z: number | null;
          };
          data.id = row.row[0];
          data.name = row.row[0];
          data.z = +row.row[1];
          dataOptions.push(data);
        }
      }
      series.push(dataOptions);
    }
    // console.log(series);
    return series;
  }

  isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    // @ts-ignore
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

  public convertRawDataToPercentageTableData(rawData: RawData, eoscSBCountries: string[]) {

    const mapTableData: Map<string, CountryTableData> = new Map();

    for (const series of rawData.datasets) {

      if (series.series.query.name.includes('oso.results.oa_percentage.affiliated.peer_reviewed.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliatedPeerReviewed = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliatedPeerReviewed = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      } else if (series.series.query.name.includes('oso.results.oa_percentage.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliated = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsAffiliated = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      } else if (series.series.query.name.includes('oso.results.oa_percentage.deposited.peer_reviewed.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDepositedPeerReviewed = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDepositedPeerReviewed = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      } else if (series.series.query.name.includes('oso.results.oa_percentage.deposited.bycountry')) {
        for (const rowResult of series.series.result) {

          // remove unwanted countries
          if (!eoscSBCountries.includes(rowResult.row[4])) {
            continue;
          }

          if (mapTableData.has(rowResult.row[4])) {
            const countryTableData = mapTableData.get(rowResult.row[4]);
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDeposited = Number(rowResult.row[0]);
            }
          } else {
            const countryTableData: CountryTableData = new CountryTableData();
            if (rowResult.row[0] !== 'NaN') {
              countryTableData.oaSharePublicationsDeposited = Number(rowResult.row[0]);
            }
            countryTableData.name = rowResult.row[3];
            countryTableData.code = rowResult.row[4];
            mapTableData.set(rowResult.row[4], countryTableData);
          }
        }
      }
    }

    const tableData: CountryTableData[] = [];

    mapTableData.forEach((value: CountryTableData, key: string) => {
      // console.log(key, value);
      tableData.push(value);
    });

    return tableData;
  }

}
