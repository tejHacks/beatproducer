import { defineBrand } from './lib/brand-type';

export const brand = defineBrand({
  name: 'Beatpd',
  colors: { primary: '#7C3AED', primaryText: '#FFFFFF', accent: '#EC4899' },
  screens: [
    { name: 'index', title: 'Beatpd' },
    { name: 'intro', title: '', hideHeader: true },
  ],
});
