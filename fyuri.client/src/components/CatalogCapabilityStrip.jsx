import {
  HeadsetMicOutlined,
  PrecisionManufacturingOutlined,
  ReceiptLongOutlined,
  ScienceOutlined,
  TuneOutlined,
} from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';

const defaultCapabilities = [
  {
    icon: PrecisionManufacturingOutlined,
    title: {
      he: 'מערכות ורכיבים',
      en: 'Systems & Components',
    },
    detail: {
      he: 'מכשירים, אופטיקה וחלקים מקצועיים',
      en: 'Devices, optics and professional parts',
    },
  },
  {
    icon: ScienceOutlined,
    title: {
      he: 'שירותי מעבדה',
      en: 'Lab Services',
    },
    detail: {
      he: 'בדיקה, תחזוקה, תיקון ושדרוג',
      en: 'Testing, maintenance, repair and upgrades',
    },
  },
  {
    icon: TuneOutlined,
    title: {
      he: 'התאמת רכיבים',
      en: 'Compatibility First',
    },
    detail: {
      he: 'כל רכיב נבדק מול המערכת',
      en: 'Every component matched to the system',
    },
  },
  {
    icon: HeadsetMicOutlined,
    title: {
      he: 'ליווי מקצועי',
      en: 'Expert Guidance',
    },
    detail: {
      he: 'לפני הבחירה ולאחריה',
      en: 'Before and after your selection',
    },
  },
  {
    icon: ReceiptLongOutlined,
    title: {
      he: 'הזמנה בתיאום',
      en: 'Request-Based Ordering',
    },
    detail: {
      he: 'ללא חיוב מקוון באתר',
      en: 'No online payment is processed',
    },
  },
];

function CatalogCapabilityStrip({ items = defaultCapabilities }) {
  const { t } = useLanguage();

  return (
    <section
      className="fy-capability-strip"
      aria-label={t({ he: 'יכולות ושירותים', en: 'Capabilities and services' })}
    >
      <ul>
        {items.map((item) => {
          const CapabilityIcon = item.icon;

          return (
            <li key={item.title.en}>
              <CapabilityIcon aria-hidden="true" />
              <span>
                <strong>{t(item.title)}</strong>
                <small>{t(item.detail)}</small>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default CatalogCapabilityStrip;
