// lib/__tests__/cellartracker.test.ts
import { describe, it, expect } from 'vitest';
import { parseTabExport, buildExportUrl } from '../cellartracker';

const SAMPLE_TAB = `iWine\tVintage\tWine\tLocale\tCountry\tRegion\tAppellation\tProducer\tType\tColor\tCategory\tVarietal\tMasterVarietal\tDesignation\tVineyard\tiWines\tSize\tPrice\tValuation\tChangePct\tBeginConsume\tEndConsume\tCT\tMyPrice\tWA\tWS\tAD\tDC\tJH\tJeb\tRP\tBin\tQuantity\tPending\tInBasement\tIN\tiuser
123\t2018\tRidge Monte Bello\tUSA\tUSA\tCalifornia\tSanta Cruz Mountains\tRidge\tWine\tRed\tWine\tCabernet Blend\tCabernet Sauvignon\t\t\t1\t750ml\t89.99\t95.00\t5.6\t2025\t2040\t97\t89.99\t\t\t\t\t\t\t\tRack 1\t6\t0\t6\t6\t999
456\tN.V.\tBillecart-Salmon Brut Réserve\tFrance\tFrance\tChampagne\tChampagne\tBillecart-Salmon\tWine\tWhite\tWine\tChardonnay\tChardonnay\t\t\t1\t750ml\t65.00\t70.00\t7.7\t\t\tChampagne NV\t65.00\t\t\t\t\t\t\t\tFridge\t2\t0\t2\t2\t999
789\t2015\tDomaine de la Romanée-Conti Vosne-Romanée\tFrance\tFrance\tBurgundy\tVosne-Romanée\tDRC\tWine\tRed\tWine\tPinot Noir\tPinot Noir\t\t\t1\t750ml\t2800.00\t3100.00\t10.7\t2025\t2045\t100\t2800.00\t\t\t\t\t\t\t\tDRC Shelf\t1\t0\t1\t1\t999
999\t2020\tMatthiasson Napa Valley Red\tUSA\tUSA\tCalifornia\tNapa Valley\tMatthiasson\tWine\tRed\tWine\tRed Blend\tRed Blend\t\t\t1\t750ml\t\t\t\t2024\t2032\t\t\t\t\t\t\t\t\t\t\t3\t0\t3\t3\t999`;

describe('parseTabExport', () => {
  it('parses standard bottles with all fields', () => {
    const result = parseTabExport(SAMPLE_TAB);
    expect(result.wines).toHaveLength(4);
    expect(result.skipped).toBe(0);

    const ridge = result.wines[0];
    expect(ridge).toBeDefined();
    expect(ridge!.name).toBe('Ridge Monte Bello');
    expect(ridge!.vintage).toBe(2018);
    expect(ridge!.varietal).toBe('Cabernet Blend');
    expect(ridge!.location).toBe('Rack 1');
    expect(ridge!.quantity).toBe(6);
    expect(ridge!.price).toBe(89.99);
  });

  it('parses NV bottles with vintage as null', () => {
    const result = parseTabExport(SAMPLE_TAB);
    const nv = result.wines[1];
    expect(nv).toBeDefined();
    expect(nv!.vintage).toBeNull();
    expect(nv!.name).toBe('Billecart-Salmon Brut Réserve');
  });

  it('preserves diacritics in wine names', () => {
    const result = parseTabExport(SAMPLE_TAB);
    const drc = result.wines[2];
    expect(drc).toBeDefined();
    expect(drc!.name).toBe('Domaine de la Romanée-Conti Vosne-Romanée');
  });

  it('handles missing price as null', () => {
    const result = parseTabExport(SAMPLE_TAB);
    const matthiasson = result.wines[3];
    expect(matthiasson).toBeDefined();
    expect(matthiasson!.price).toBeNull();
  });

  it('skips rows with missing required fields and counts them', () => {
    const badRow = `iWine\tVintage\tWine\tLocale\tCountry\tRegion\tAppellation\tProducer\tType\tColor\tCategory\tVarietal\tMasterVarietal\tDesignation\tVineyard\tiWines\tSize\tPrice\tValuation\tChangePct\tBeginConsume\tEndConsume\tCT\tMyPrice\tWA\tWS\tAD\tDC\tJH\tJeb\tRP\tBin\tQuantity\tPending\tInBasement\tIN\tiuser
\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t0\t0\t0\t0\t999`;
    const result = parseTabExport(badRow);
    expect(result.wines).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('returns empty wines array for header-only input', () => {
    const headerOnly = `iWine\tVintage\tWine\tLocale\tCountry\tRegion\tAppellation\tProducer\tType\tColor\tCategory\tVarietal\tMasterVarietal\tDesignation\tVineyard\tiWines\tSize\tPrice\tValuation\tChangePct\tBeginConsume\tEndConsume\tCT\tMyPrice\tWA\tWS\tAD\tDC\tJH\tJeb\tRP\tBin\tQuantity\tPending\tInBasement\tIN\tiuser`;
    const result = parseTabExport(headerOnly);
    expect(result.wines).toHaveLength(0);
    expect(result.skipped).toBe(0);
  });
});

describe('buildExportUrl', () => {
  it('builds the correct CellarTracker export URL', () => {
    const url = buildExportUrl('pkouchu');
    expect(url).toBe(
      'https://www.cellartracker.com/list.asp?iUserOverride=pkouchu&Table=List&fInStock=1&format=tab'
    );
  });
});
