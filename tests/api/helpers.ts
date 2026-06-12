export function buildMockTabPayload(): string {
  const header = 'iWine\tVintage\tWine\tLocale\tCountry\tRegion\tAppellation\tProducer\tType\tColor\tCategory\tVarietal\tMasterVarietal\tDesignation\tVineyard\tiWines\tSize\tPrice\tValuation\tChangePct\tBeginConsume\tEndConsume\tCT\tMyPrice\tWA\tWS\tAD\tDC\tJH\tJeb\tRP\tBin\tQuantity\tPending\tInBasement\tIN\tiuser';
  const row = '123\t2018\tRidge Monte Bello\tUSA\tUSA\tCalifornia\tSanta Cruz\tRidge\tWine\tRed\tWine\tCabernet Blend\tCabernet Sauvignon\t\t\t1\t750ml\t89.99\t\t\t\t\t\t\t\t\t\t\t\t\t\tRack 1\t6\t0\t6\t6\t999';
  return `${header}\n${row}`;
}

export function buildEmptyTabPayload(): string {
  return 'iWine\tVintage\tWine\tLocale\tCountry\tRegion\tAppellation\tProducer\tType\tColor\tCategory\tVarietal\tMasterVarietal\tDesignation\tVineyard\tiWines\tSize\tPrice\tValuation\tChangePct\tBeginConsume\tEndConsume\tCT\tMyPrice\tWA\tWS\tAD\tDC\tJH\tJeb\tRP\tBin\tQuantity\tPending\tInBasement\tIN\tiuser';
}
