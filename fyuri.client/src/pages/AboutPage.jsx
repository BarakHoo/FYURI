import { Box, Button } from '@mui/material';
import {
  ArrowForward,
  BuildOutlined,
  ContactSupportOutlined,
  HandymanOutlined,
  Inventory2Outlined,
  ScienceOutlined,
  SettingsOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useLanguage } from '../context/LanguageContext';
import './EditorialPages.css';

function AboutPage() {
  const { t } = useLanguage();

  const pillars = [
    {
      number: '01',
      title: t({ he: 'מומחיות מעשית', en: 'Practical expertise' }),
      body: t({
        he: 'ניסיון מקצועי בציוד ראיית לילה, אופטיקה וטכנולוגיות מתקדמות.',
        en: 'Professional experience with night-vision equipment, optics and advanced technologies.',
      }),
      icon: ScienceOutlined,
    },
    {
      number: '02',
      title: t({ he: 'שירות וליווי', en: 'Service & support' }),
      body: t({
        he: 'תחזוקה, כיול ותיקון, עם ליווי לפני ואחרי הרכישה.',
        en: 'Maintenance, calibration and repair, with guidance before and after purchase.',
      }),
      icon: BuildOutlined,
    },
    {
      number: '03',
      title: t({ he: 'אמינות ואיכות', en: 'Reliability & quality' }),
      body: t({
        he: 'בחירת מוצרים לפי מפרטים בדוקים, לצד בדיקות איכות ותמיכה.',
        en: 'Products selected against verified specifications, alongside quality checks and support.',
      }),
      icon: SettingsOutlined,
    },
  ];

  const areas = [
    {
      number: '01',
      title: t({ he: 'מערכות ראיית לילה', en: 'Night-vision systems' }),
      body: t({
        he: 'מערכות חד־עיניות, דו־עיניות ופנורמיות, מסודרות לפי מבנה ויישום.',
        en: 'Monocular, binocular and panoramic systems organized by form factor and application.',
      }),
      image: '/images/banners/night-vision.jpg',
      alt: t({
        he: 'מערכת ראיית לילה פנורמית בתצוגת מוצר כחולה',
        en: 'Panoramic night-vision system in a blue product display',
      }),
      to: '/products?category=monocular',
      icon: VisibilityOutlined,
    },
    {
      number: '02',
      title: t({ he: 'מגברי אור', en: 'Image intensifiers' }),
      body: t({
        he: 'אפשרויות מגבר אור וזרחן לבנייה או להתאמה למערכת תואמת.',
        en: 'Tube and phosphor options for compatible systems and configurations.',
      }),
      image: '/images/banners/image-intensifier.jpg',
      alt: t({
        he: 'מגבר אור לראיית לילה בתצוגת מוצר',
        en: 'Night-vision image intensifier in a product display',
      }),
      to: '/products?category=intensifier',
      icon: SettingsOutlined,
    },
    {
      number: '03',
      title: t({ he: 'אופטיקה ורכיבים', en: 'Optics & components' }),
      body: t({
        he: 'עדשות, עיניות, גופים ואביזרים משלימים למערכות תואמות.',
        en: 'Objectives, eyepieces, housings and supporting accessories for compatible systems.',
      }),
      image: '/images/banners/optics.jpg',
      alt: t({
        he: 'עדשה אופטית למערכת ראיית לילה',
        en: 'Optical lens for a night-vision system',
      }),
      to: '/products?category=optics',
      icon: HandymanOutlined,
    },
    {
      number: '04',
      title: t({ he: 'תמיכת מעבדה', en: 'Lab support' }),
      body: t({
        he: 'תחזוקה, כיול, תיקונים ושדרוגים למערכות קיימות.',
        en: 'Maintenance, calibration, repairs and upgrades for existing systems.',
      }),
      image: '/images/banners/accessories.jpg',
      alt: t({
        he: 'אביזרי חיבור למערכת ראיית לילה בתצוגת מוצר',
        en: 'Night-vision mounting accessories in a product display',
      }),
      to: '/services',
      icon: BuildOutlined,
    },
  ];

  const process = [
    {
      number: '01',
      title: t({ he: 'מבינים את הצורך', en: 'Understand the requirement' }),
      body: t({
        he: 'מתחילים בשימוש המיועד ובדרישות מהמערכת.',
        en: 'Start with the intended use and the requirements of the system.',
      }),
    },
    {
      number: '02',
      title: t({ he: 'בוחרים תצורה', en: 'Select the configuration' }),
      body: t({
        he: 'משווים מבנה ורכיבים ובודקים התאמה ביניהם.',
        en: 'Compare the form factor and components, then verify compatibility.',
      }),
    },
    {
      number: '03',
      title: t({ he: 'בודקים ומלווים', en: 'Test & support' }),
      body: t({
        he: 'ממשיכים לבדיקה וליווי מקצועי לאורך חיי המוצר.',
        en: 'Continue through testing and professional support throughout the product life cycle.',
      }),
    },
  ];

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / אודות', en: 'FYURI / ABOUT' })}
      title={t({ he: 'מומחיות שרואים גם בחושך.', en: 'Expertise you can trust in the dark.' })}
      description={t({
        he: 'FYURI מספקת מערכות ראיית לילה, רכיבים ושירותי מעבדה ללקוחות ביטחוניים, מקצועיים ואזרחיים.',
        en: 'FYURI supplies night-vision systems, components and lab services for security, professional and civilian needs.',
      })}
      actions={(
        <>
          <Button component={RouterLink} to="/products" variant="contained" startIcon={<Inventory2Outlined />}>
            {t({ he: 'לצפייה בקטלוג', en: 'View catalog' })}
          </Button>
          <Button component={RouterLink} to="/contact" variant="outlined" startIcon={<ContactSupportOutlined />}>
            {t({ he: 'דברו עם מומחה', en: 'Talk to an expert' })}
          </Button>
        </>
      )}
    >
      <Box className="fy-editorial-page fy-editorial-page--about">
        <section
          className="fy-editorial-capabilities"
          aria-label={t({ he: 'היכולות של FYURI', en: 'FYURI capabilities' })}
        >
          <ul>
            {pillars.map((pillar) => {
              const PillarIcon = pillar.icon;
              return (
                <li key={pillar.number}>
                  <PillarIcon aria-hidden="true" />
                  <span className="fy-editorial-capabilities__number">{pillar.number}</span>
                  <div>
                    <strong>{pillar.title}</strong>
                    <span>{pillar.body}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="fy-editorial-section fy-editorial-feature" aria-labelledby="about-who-title">
          <div className="fy-editorial-feature__copy">
            <span className="fy-editorial-kicker">{t({ he: 'FYURI / מי אנחנו', en: 'FYURI / WHO WE ARE' })}</span>
            <h2 id="about-who-title">
              {t({
                he: 'מערכות, רכיבים ומעבדה תחת קורת גג אחת.',
                en: 'Systems, components and lab support in one place.',
              })}
            </h2>
            <p>
              {t({
                he: 'אנחנו מתמחים באספקת מכשירי ראיית לילה איכותיים, מגברי אור, אופטיקה מתקדמת ואביזרים נלווים. המטרה היא להתאים את המערכת ליישום האמיתי — לא רק למפרט על הנייר.',
                en: 'We specialize in quality night-vision devices, image intensifiers, advanced optics and supporting accessories. Our goal is to match the system to its real use—not only to a specification sheet.',
              })}
            </p>
            <p>
              {t({
                he: 'כל תהליך מתחיל בהבנת הצורך וממשיך בבחירת רכיבים, בדיקה וליווי מקצועי לאורך חיי המוצר.',
                en: 'Every engagement starts with understanding the requirement and continues through component selection, testing and professional support throughout the product life cycle.',
              })}
            </p>
            <div className="fy-editorial-tags" aria-label={t({ he: 'תחומי פעילות', en: 'Areas of work' })}>
              <span>{t({ he: 'מערכות', en: 'SYSTEMS' })}</span>
              <span>{t({ he: 'רכיבים', en: 'COMPONENTS' })}</span>
              <span>{t({ he: 'מעבדה', en: 'LAB' })}</span>
            </div>
          </div>

          <figure className="fy-editorial-feature__visual">
            <img
              src="/images/banners/night-vision.jpg"
              alt={t({
                he: 'מערכת ראיית לילה פנורמית בתצוגה מקצועית',
                en: 'Panoramic night-vision system in a professional display',
              })}
            />
            <figcaption>
              <span>FYURI / NIGHT SYSTEMS</span>
              <strong>{t({ he: 'בחירה לפי היישום', en: 'Selected for the application' })}</strong>
            </figcaption>
          </figure>
        </section>

        <section className="fy-editorial-section" aria-labelledby="about-areas-title">
          <header className="fy-editorial-section-heading">
            <div>
              <span className="fy-editorial-kicker">{t({ he: 'יכולות / 04', en: 'CAPABILITIES / 04' })}</span>
              <h2 id="about-areas-title">{t({ he: 'מה תמצאו ב־FYURI', en: 'What FYURI covers' })}</h2>
            </div>
            <p>
              {t({
                he: 'מעבר ישיר בין מערכת מלאה, רכיבים תואמים ותמיכת מעבדה.',
                en: 'Move directly between complete systems, compatible components and lab support.',
              })}
            </p>
          </header>

          <div className="fy-editorial-visual-grid">
            {areas.map((area) => {
              const AreaIcon = area.icon;
              return (
                <RouterLink className="fy-editorial-visual-card" to={area.to} key={area.number}>
                  <span className="fy-editorial-visual-card__media">
                    <img src={area.image} alt={area.alt} />
                    <span className="fy-editorial-visual-card__index">{area.number}</span>
                  </span>
                  <span className="fy-editorial-visual-card__body">
                    <span className="fy-editorial-visual-card__icon" aria-hidden="true">
                      <AreaIcon />
                    </span>
                    <span>
                      <strong>{area.title}</strong>
                      <span>{area.body}</span>
                    </span>
                    <ArrowForward className="fy-editorial-visual-card__arrow" aria-hidden="true" />
                  </span>
                </RouterLink>
              );
            })}
          </div>
        </section>

        <section className="fy-editorial-section fy-editorial-process-section" aria-labelledby="about-process-title">
          <header className="fy-editorial-section-heading">
            <div>
              <span className="fy-editorial-kicker">{t({ he: 'תהליך / 03', en: 'PROCESS / 03' })}</span>
              <h2 id="about-process-title">{t({ he: 'מהצורך למערכת הנכונה', en: 'From requirement to the right system' })}</h2>
            </div>
            <p>
              {t({
                he: 'גישה ברורה שמחברת בין שימוש, התאמת רכיבים ותמיכה.',
                en: 'A clear approach connecting intended use, component compatibility and support.',
              })}
            </p>
          </header>

          <ol className="fy-editorial-process">
            {process.map((step) => (
              <li key={step.number}>
                <span className="fy-editorial-process__number">{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="fy-editorial-cta" aria-labelledby="about-cta-title">
          <div>
            <span className="fy-editorial-kicker">{t({ he: 'השלב הבא', en: 'NEXT STEP' })}</span>
            <h2 id="about-cta-title">
              {t({ he: 'צריכים בדיקה, כיול או תיקון?', en: 'Need testing, calibration or repair?' })}
            </h2>
            <p>
              {t({
                he: 'הכירו את שירותי המעבדה או שלחו לנו את פרטי המכשיר.',
                en: 'Explore the lab capabilities or send us the details of your device.',
              })}
            </p>
          </div>
          <div className="fy-editorial-cta__actions">
            <Button component={RouterLink} to="/services" variant="contained" endIcon={<ArrowForward />}>
              {t({ he: 'שירותי המעבדה', en: 'Explore lab services' })}
            </Button>
            <Button component={RouterLink} to="/contact?service=lab" variant="outlined">
              {t({ he: 'פתיחת בקשה', en: 'Request service' })}
            </Button>
          </div>
        </section>
      </Box>
    </PublicPageShell>
  );
}

export default AboutPage;
