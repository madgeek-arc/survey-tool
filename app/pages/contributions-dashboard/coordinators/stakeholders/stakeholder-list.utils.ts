import { Paging } from "../../../../../catalogue-ui/domain/paging";
import { Stakeholder } from "../../../../domain/userInfo";

/** Shared by the coordinator and administrator stakeholder pages. */

export interface StakeholderRow {
  stakeholder: Stakeholder;
  countryName: string;
  managers: number;
  contributors: number;
}

export interface ActiveFilter {
  key: string;
  name: string;
  value: string;
}

export interface CountryOption {
  label: string;
  value: string;
}

const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});

export function countryName(code: string): string {
  if (!code)
    return '';
  try {
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

export function toStakeholderRows(res: Paging<Stakeholder>): StakeholderRow[] {
  return (res?.results ?? []).map(stakeholder => ({
    stakeholder,
    countryName: countryName(stakeholder.country),
    managers: stakeholder.admins?.length ?? 0,
    contributors: stakeholder.members?.length ?? 0,
  }));
}

/** Prefers the backend facets; otherwise keeps every value seen so far so the options don't shrink while filtering. */
export function stakeholderFilterOptions(res: Paging<Stakeholder>, typeOptions: string[], countryOptions: CountryOption[]) {
  const results = res?.results ?? [];
  const typeFacet = res?.facets?.find(f => f.field === 'subType')?.values.map(v => v.value);
  const countryFacet = res?.facets?.find(f => f.field === 'country')?.values.map(v => v.value);
  const types = typeFacet ?? [...typeOptions, ...results.map(r => r.subType)];
  const countries = countryFacet ?? [...countryOptions.map(c => c.value), ...results.map(r => r.country)];
  return {
    typeOptions: [...new Set(types.filter(Boolean))].sort(),
    countryOptions: [...new Set(countries.filter(Boolean))]
      .map(value => ({value, label: countryName(value)}))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function stakeholderActiveFilters(selectedType: string, selectedCountry: string): ActiveFilter[] {
  const filters: ActiveFilter[] = [];
  if (selectedType)
    filters.push({key: 'subType', name: 'Type', value: selectedType});
  if (selectedCountry)
    filters.push({key: 'country', name: 'Country', value: countryName(selectedCountry)});
  return filters;
}
