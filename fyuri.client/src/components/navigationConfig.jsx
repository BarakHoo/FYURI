import {
  Build,
  LocalShipping,
  Memory,
  RemoveRedEye,
  Thermostat,
  ViewComfy,
  ViewInAr,
  Visibility,
} from '@mui/icons-material';

export const primaryNavigationItems = [
  {
    id: 'home',
    path: '/',
    exact: true,
    label: { he: 'בית', en: 'Home' },
  },
  {
    id: 'about',
    path: '/about',
    exact: true,
    label: { he: 'מי אנחנו', en: 'About Us' },
  },
  {
    id: 'services',
    path: '/services',
    exact: true,
    label: { he: 'שירותי מעבדה', en: 'Lab Services' },
  },
  {
    id: 'contact',
    path: '/contact',
    exact: true,
    label: { he: 'צור קשר', en: 'Contact' },
  },
];

export const productNavigationGroups = [
  {
    id: 'vision',
    label: { he: 'מכשירי ראייה', en: 'Vision Devices' },
    items: [
      {
        id: 'monocular',
        value: 'monocular',
        path: '/products?category=monocular',
        label: { he: 'חד עיניים', en: 'Monoculars' },
        description: {
          he: 'מכשירי ראיית לילה חד עיניים',
          en: 'Single-eye night vision devices',
        },
        icon: Visibility,
      },
      {
        id: 'binocular',
        value: 'binocular',
        path: '/products?category=binocular',
        label: { he: 'דו עיניים', en: 'Binoculars' },
        description: {
          he: 'מכשירי ראיית לילה דו עיניים',
          en: 'Dual-eye night vision devices',
        },
        icon: RemoveRedEye,
      },
      {
        id: 'panoramic',
        value: 'panoramic',
        path: '/products?category=panoramic',
        label: { he: 'פנורמי', en: 'Panoramic' },
        description: {
          he: 'מערכות ראייה פנורמיות',
          en: 'Panoramic vision systems',
        },
        icon: ViewComfy,
      },
      {
        id: 'thermal',
        value: 'thermal',
        path: '/products?category=thermal',
        label: { he: 'תרמי', en: 'Thermal' },
        description: {
          he: 'מכשירי הדמיה תרמית וקליפ-און',
          en: 'Thermal imagers and clip-ons',
        },
        icon: Thermostat,
      },
    ],
  },
  {
    id: 'components',
    label: { he: 'רכיבים ואופטיקה', en: 'Components & Optics' },
    items: [
      {
        id: 'intensifier',
        value: 'intensifier',
        path: '/products?category=intensifier',
        label: { he: 'מגברי אור', en: 'Image Intensifiers' },
        description: {
          he: 'שפופרות Gen 2 ו-Gen 3',
          en: 'Gen 2 and Gen 3 tubes',
        },
        icon: Memory,
      },
      {
        id: 'housing',
        value: 'housing',
        path: '/products?category=housing',
        label: { he: 'גופים', en: 'Housings' },
        description: {
          he: 'גופים לחד עיני, דו עיני ופנורמי',
          en: 'Monocular, binocular, and panoramic housings',
        },
        icon: ViewInAr,
      },
      {
        id: 'optics',
        value: 'optics',
        path: '/products?category=optics',
        label: { he: 'עדשות ואופטיקה', en: 'Lenses & Optics' },
        description: {
          he: 'עדשות ואופטיקה מקצועית',
          en: 'Professional lenses and optics',
        },
        icon: Build,
      },
    ],
  },
  {
    id: 'accessories',
    label: { he: 'אביזרים', en: 'Accessories' },
    items: [
      {
        id: 'accessories',
        value: 'accessories',
        path: '/products?category=accessories',
        label: { he: 'אביזרים', en: 'Accessories' },
        description: {
          he: 'כבלים, סוללות וחלקי חילוף',
          en: 'Cables, batteries, and replacement parts',
        },
        icon: LocalShipping,
      },
    ],
  },
];

export const productCategories = productNavigationGroups.flatMap(
  (group) => group.items,
);
