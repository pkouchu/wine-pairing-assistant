// tests/mocks/cellartracker.mock.ts
import type { Wine } from '@/types/wine';

export const SAMPLE_INVENTORY: Wine[] = [
  {
    name: 'Ridge Monte Bello',
    vintage: 2018,
    varietal: 'Cabernet Blend',
    location: 'Rack 1',
    quantity: 6,
    price: 89.99,
  },
  {
    name: 'Billecart-Salmon Brut Réserve',
    vintage: null,
    varietal: 'Chardonnay',
    location: 'Fridge',
    quantity: 2,
    price: 65,
  },
  {
    name: 'Domaine de la Romanée-Conti Vosne-Romanée',
    vintage: 2015,
    varietal: 'Pinot Noir',
    location: 'DRC Shelf',
    quantity: 1,
    price: 2800,
  },
  {
    name: 'Matthiasson Napa Valley Red',
    vintage: 2020,
    varietal: 'Red Blend',
    location: '',
    quantity: 3,
    price: null,
  },
  {
    name: 'Château Pichon Baron Longueville',
    vintage: 2019,
    varietal: 'Cabernet Sauvignon',
    location: 'Rack 2',
    quantity: 4,
    price: 120,
  },
];

export const MOCK_SYNC_RESPONSE = {
  wines: SAMPLE_INVENTORY,
  skipped: 0,
};
