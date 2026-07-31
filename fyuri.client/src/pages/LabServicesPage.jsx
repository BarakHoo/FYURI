import { Box, Button, Link } from '@mui/material';
import {
  Build,
  ContactSupportOutlined,
  Email,
  Phone,
  Settings,
  TaskAltOutlined,
  Visibility,
  WhatsApp,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import PublicPageShell from '../components/PublicPageShell';
import { useLanguage } from '../context/LanguageContext';
import './EditorialPages.css';

function LabServicesPage() {
  const { t } = useLanguage();

  const services = [
    {
      number: '01',
      title: t({ he: 'תחזוקה ואחזקה', en: 'Maintenance & care' }),
      description: t({
        he: 'ניקוי, איטום ותחזוקה שוטפת למכשירי ראיית לילה.',
        en: 'Cleaning, sealing and ongoing maintenance for night-vision devices.',
      }),
      image: '/images/banners/accessories.jpg',
      alt: t({
        he: 'אביזרי חיבור וכבלים למערכת ראיית לילה',
        en: 'Night-vision mounting accessories and cables',
      }),
      icon: Build,
    },
    {
      number: '02',
      title: t({ he: 'כיול ובדיקה', en: 'Calibration & testing' }),
      description: t({
        he: 'כיול אופטי מדויק ובדיקות תקינות ואיכות קפדניות.',
        en: 'Precise optical calibration plus rigorous function and quality testing.',
      }),
      image: '/images/banners/optics.jpg',
      alt: t({
        he: 'עדשה אופטית למערכת ראיית לילה',
        en: 'Optical lens for a night-vision system',
      }),
      icon: Settings,
    },
    {
      number: '03',
      title: t({ he: 'תיקונים ושדרוגים', en: 'Repairs & upgrades' }),
      description: t({
        he: 'איתור תקלות, החלפת רכיבים ושדרוג מערכות קיימות.',
        en: 'Fault diagnosis, component replacement and upgrades for existing systems.',
      }),
      image: '/images/banners/image-intensifier.jpg',
      alt: t({
        he: 'מגבר אור לראיית לילה בתצוגת מוצר',
        en: 'Night-vision image intensifier in a product display',
      }),
      icon: Visibility,
    },
  ];

  const serviceItems = [
    { he: 'בדיקות תקינות מקיפות', en: 'Comprehensive functionality tests' },
    { he: 'כיול אופטי מדויק', en: 'Precise optical calibration' },
    { he: 'החלפת מגברי אור', en: 'Image intensifier replacement' },
    { he: 'תיקון מערכות אלקטרוניות', en: 'Electronic-system repair' },
    { he: 'ניקוי ואיטום', en: 'Cleaning and sealing' },
    { he: 'שדרוגים והתאמות', en: 'Upgrades and modifications' },
    { he: 'בדיקות נזקים', en: 'Damage assessment' },
    { he: 'הערכת שווי', en: 'Valuation' },
  ];

  const serviceProcess = [
    {
      number: '01',
      title: t({ he: 'מתארים את המכשיר', en: 'Describe the device' }),
      body: t({
        he: 'שלחו את דגם המכשיר ותיאור קצר של התקלה או השירות הנדרש.',
        en: 'Send the device model and a short description of the issue or requested service.',
      }),
    },
    {
      number: '02',
      title: t({ he: 'משלימים פרטים', en: 'Clarify the details' }),
      body: t({
        he: 'נציג יחזור אליכם עם שאלות המשך במידת הצורך.',
        en: 'A representative will follow up with additional questions when needed.',
      }),
    },
    {
      number: '03',
      title: t({ he: 'מקבלים הנחיות', en: 'Receive instructions' }),
      body: t({
        he: 'לאחר השלמת הפרטים תקבלו הנחיות למסירת המכשיר.',
        en: 'Once the details are clear, you will receive device delivery instructions.',
      }),
    },
  ];

  return (
    <PublicPageShell
      eyebrow={t({ he: 'FYURI / מעבדה', en: 'FYURI / LAB' })}
      title={t({ he: 'בדיקה, כיול ותיקון ברמת מערכת.', en: 'Testing, calibration and repair at system level.' })}
      description={t({
        he: 'מעבדה מקצועית למערכות ראיית לילה — מאבחון ראשוני ועד טיפול ברכיבים, איטום וכיול.',
        en: 'Professional support for night-vision systems—from initial diagnosis to component work, sealing and calibration.',
      })}
      actions={(
        <>
          <Button
            component={RouterLink}
            to="/contact?service=lab"
            variant="contained"
            startIcon={<ContactSupportOutlined />}
          >
            {t({ he: 'פתיחת בקשת שירות', en: 'Request lab service' })}
          </Button>
          <Button
            component="a"
            href="https://wa.me/972544770200?text=I%20need%20FYURI%20lab%20service"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            startIcon={<WhatsApp />}
          >
            WhatsApp
          </Button>
        </>
      )}
    >
      <Box className="fy-editorial-page fy-editorial-page--lab">
        <section
          className="fy-editorial-capabilities"
          aria-label={t({ he: 'יכולות המעבדה', en: 'Lab capabilities' })}
        >
          <ul>
            {services.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <li key={service.number}>
                  <ServiceIcon aria-hidden="true" />
                  <span className="fy-editorial-capabilities__number">{service.number}</span>
                  <div>
                    <strong>{service.title}</strong>
                    <span>{service.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="fy-editorial-section" aria-labelledby="lab-capabilities-title">
          <header className="fy-editorial-section-heading">
            <div>
              <span className="fy-editorial-kicker">{t({ he: 'שירותי מעבדה / 03', en: 'LAB SERVICES / 03' })}</span>
              <h2 id="lab-capabilities-title">
                {t({ he: 'טיפול במערכת וברכיבים שלה', en: 'Support for the system and its components' })}
              </h2>
            </div>
            <p>
              {t({
                he: 'שלושה תחומי שירות מרכזיים למכשירי ראיית לילה קיימים.',
                en: 'Three core service areas for existing night-vision devices.',
              })}
            </p>
          </header>

          <div className="fy-editorial-service-grid">
            {services.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <article className="fy-editorial-service-card" key={service.number}>
                  <div className="fy-editorial-service-card__media">
                    <img src={service.image} alt={service.alt} />
                    <span>{service.number}</span>
                  </div>
                  <div className="fy-editorial-service-card__body">
                    <span className="fy-editorial-service-card__icon" aria-hidden="true">
                      <ServiceIcon />
                    </span>
                    <span className="fy-editorial-kicker">{t({ he: 'יכולת מעבדה', en: 'LAB CAPABILITY' })}</span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="fy-editorial-section fy-editorial-scope" aria-labelledby="lab-scope-title">
          <div className="fy-editorial-scope__list">
            <span className="fy-editorial-kicker">{t({ he: 'היקף השירות / 08', en: 'SERVICE SCOPE / 08' })}</span>
            <h2 id="lab-scope-title">{t({ he: 'שירותי המעבדה כוללים', en: 'Our lab services include' })}</h2>
            <ul>
              {serviceItems.map((item, index) => (
                <li key={item.en}>
                  <span className="fy-editorial-scope__index">{String(index + 1).padStart(2, '0')}</span>
                  <TaskAltOutlined aria-hidden="true" />
                  <span>{t(item)}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="fy-editorial-contact-card" aria-labelledby="lab-arrange-title">
            <div className="fy-editorial-contact-card__visual" aria-hidden="true">
              <img src="/images/banners/tactical-nvg-poster.webp" alt="" />
              <span>FYURI / LAB SUPPORT</span>
            </div>
            <div className="fy-editorial-contact-card__body">
              <span className="fy-editorial-kicker">{t({ he: 'תיאום שירות', en: 'ARRANGE SERVICE' })}</span>
              <h2 id="lab-arrange-title">
                {t({ he: 'ספרו לנו מה המכשיר צריך.', en: 'Tell us what the device needs.' })}
              </h2>
              <p>
                {t({
                  he: 'שלחו תיאור קצר של המכשיר והתקלה. נציג יחזור אליכם עם שאלות המשך והנחיות למסירה.',
                  en: 'Send a short description of the device and issue. We will follow up with questions and delivery instructions.',
                })}
              </p>
              <div className="fy-editorial-contact-card__links">
                <Link href="tel:+972544770200" underline="none" color="inherit">
                  <Phone aria-hidden="true" />
                  <span dir="ltr">054-477-0200</span>
                </Link>
                <Link href="mailto:info@fyuri.co.il" underline="none" color="inherit">
                  <Email aria-hidden="true" />
                  <span dir="ltr">info@fyuri.co.il</span>
                </Link>
              </div>
              <Button component={RouterLink} to="/contact?service=lab" variant="contained" fullWidth>
                {t({ he: 'שליחת בקשת שירות', en: 'Send a service request' })}
              </Button>
            </div>
          </aside>
        </section>

        <section className="fy-editorial-section fy-editorial-process-section" aria-labelledby="lab-process-title">
          <header className="fy-editorial-section-heading">
            <div>
              <span className="fy-editorial-kicker">{t({ he: 'לפני המסירה / 03', en: 'BEFORE DELIVERY / 03' })}</span>
              <h2 id="lab-process-title">{t({ he: 'כך מתחילים בקשת שירות', en: 'How a service request begins' })}</h2>
            </div>
            <p>
              {t({
                he: 'התחילו בתיאור קצר; את פרטי ההמשך נשלים יחד.',
                en: 'Begin with a short description; we will clarify the remaining details together.',
              })}
            </p>
          </header>

          <ol className="fy-editorial-process">
            {serviceProcess.map((step) => (
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

        <section className="fy-editorial-cta" aria-labelledby="lab-cta-title">
          <div>
            <span className="fy-editorial-kicker">FYURI / LAB</span>
            <h2 id="lab-cta-title">
              {t({ he: 'מוכנים לפתוח בקשת שירות?', en: 'Ready to start a service request?' })}
            </h2>
            <p>
              {t({
                he: 'שלחו את פרטי המכשיר והתקלה דרך טופס יצירת הקשר או WhatsApp.',
                en: 'Send the device and issue details through the contact form or WhatsApp.',
              })}
            </p>
          </div>
          <div className="fy-editorial-cta__actions">
            <Button component={RouterLink} to="/contact?service=lab" variant="contained">
              {t({ he: 'פתיחת בקשה', en: 'Request service' })}
            </Button>
            <Button
              component="a"
              href="https://wa.me/972544770200?text=I%20need%20FYURI%20lab%20service"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<WhatsApp />}
            >
              WhatsApp
            </Button>
          </div>
        </section>
      </Box>
    </PublicPageShell>
  );
}

export default LabServicesPage;
