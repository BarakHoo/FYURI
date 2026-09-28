import { Typography, Box, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import useSeo from '../hooks/useSeo';

function AboutPage() {
  const { t } = useLanguage();

  useSeo({
    title: t({ he: 'מי אנחנו', en: 'About Us' }),
    description: t({
      he: 'FYURI ראיית לילה – לראות את מה שהחושך מסתיר. פתרונות מתקדמים לרכישה, שדרוג ותיקון של אמצעי ראיית לילה.',
      en: 'FYURI Night Vision – see what the dark hides. Advanced solutions for purchasing, upgrading and repairing night vision equipment.',
    }),
  });

  const highlights = [
    { he: 'מגוון רחב של אמצעי ראיית לילה', en: 'A wide range of night vision devices' },
    { he: 'ציוד ייחודי ופתרונות מותאמים אישית', en: 'Unique equipment and custom-tailored solutions' },
    { he: 'שירותי בניית מערכות קאסטום בהתאם לדרישות הלקוח', en: 'Custom system builds to customer specifications' },
    { he: 'מעבדת שירות ותיקונים מתקדמת', en: 'Advanced service and repair lab' },
    { he: 'טכנולוגיות מתקדמות בתחום ראיית הלילה', en: 'Cutting-edge night vision technologies' },
    { he: 'מחירים תחרותיים בשוק', en: 'Competitive market pricing' },
    { he: 'שירות אישי וליווי צמוד', en: 'Personal service and close guidance' },
  ];

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        {t({ he: 'FYURI ראיית לילה — לראות את מה שהחושך מסתיר', en: 'FYURI Night Vision — See What the Dark Hides' })}
      </Typography>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="body1" paragraph>
          <strong>{t({ he: 'FYURI ראיית לילה', en: 'FYURI Night Vision' })}</strong>{' '}
          {t({
            he: 'הוא המקום להשיג יתרון אמיתי — היכולת לראות מבלי להיראות. ב-FYURI אנו מציעים פתרונות מתקדמים לראיית לילה, המאפשרים למשתמשים ליהנות מטכנולוגיות מתקדמות ואיכותיות, שעד לא מזמן היו שמורות לגופים וליחידות ייעודיות.',
            en: 'is where you gain a real advantage — the ability to see without being seen. At FYURI we offer advanced night vision solutions that give users access to high-quality, cutting-edge technologies that until recently were reserved for dedicated organizations and units.'
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'FYURI היא הכתובת לרכישה, שדרוג ותיקון של אמצעי ראיית לילה באיכות הגבוהה ביותר, והכול תוך מתן שירות אישי והתאמה לצורכי הלקוח.',
            en: 'FYURI is the destination for purchasing, upgrading and repairing night vision equipment of the highest quality — all with personal service tailored to each customer\'s needs.'
          })}
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {t({ he: 'החזון והמשימה', en: 'Vision & Mission' })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'במציאות מורכבת, שבה ההתמודדות עם איומים ואתגרים בלתי צפויים היא הכרחית, אנו ב-FYURI ראיית לילה מבינים את המחויבות לספק אמצעים מתקדמים ואמינים, שנועדו לסייע בשמירה על חיי אדם ברגעים המכריעים.',
            en: 'In a complex reality where facing unexpected threats and challenges is unavoidable, we at FYURI Night Vision understand the commitment to provide advanced, reliable equipment designed to help protect lives in the decisive moments.'
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'מערכות ראיית הלילה שלנו מלוות את לקוחותינו בתנאים מאתגרים בשטח, ומאפשרות תפעול מדויק, הגנה ושליטה במצבים שבהם כל שנייה חשובה.',
            en: 'Our night vision systems accompany our customers in demanding field conditions, enabling precise operation, protection and control in situations where every second counts.'
          })}
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {t({ he: 'הטכנולוגיה מאחורי FYURI', en: 'The Technology Behind FYURI' })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'ל-FYURI גישה לטכנולוגיות ראיית לילה מהמתקדמות ביותר בשוק, כולל טכנולוגיות ',
            en: 'FYURI has access to some of the most advanced night vision technologies on the market, including '
          })}
          <strong>{t({ he: 'דור 2+ ודור 3', en: 'Gen 2+ and Gen 3' })}</strong>
          {t({
            he: ' מהאיכות הגבוהה ביותר.',
            en: ' technologies of the highest quality.'
          })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'אנו מספקים פתרונות במגוון רחב של רמות ביצוע, תוך הקפדה על התאמת המערכות לצרכים הייחודיים של כל לקוח. לצד מערכות ראיית לילה ברמה הגבוהה ביותר, אנו מציעים אביזרים ופתרונות טכניים המשלימים את חוויית המשתמש ומספקים את היכולת והביצועים הנדרשים בתנאי שטח.',
            en: 'We provide solutions across a wide range of performance levels, carefully matching each system to the unique needs of every customer. Alongside top-tier night vision systems, we offer accessories and technical solutions that complete the user experience and deliver the capability and performance required in the field.'
          })}
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {t({ he: 'רק אצל FYURI ראיית לילה', en: 'Only at FYURI Night Vision' })}
        </Typography>
        <List disablePadding>
          {highlights.map((item, index) => (
            <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t(item)} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 4, my: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {t({ he: 'הלקוחות שלנו', en: 'Our Customers' })}
        </Typography>
        <Typography variant="body1" paragraph>
          {t({ he: 'לקוחותינו כוללים ', en: 'Our customers include ' })}
          <strong>
            {t({
              he: 'יחידות צבאיות, צוותי חירום, כיתות כוננות, חברות אבטחה ולקוחות פרטיים בעלי התאמה',
              en: 'military units, emergency teams, rapid-response squads, security companies and qualified private customers'
            })}
          </strong>
          .
        </Typography>
        <Typography variant="body1" paragraph>
          {t({
            he: 'אנו גאים לספק פתרונות ראיית לילה מקצועיים למגוון רחב של צרכים, ולסייע ללקוחותינו להגיע מוכנים ובטוחים לפעילות אפקטיבית בתנאים מבצעיים שונים.',
            en: 'We are proud to deliver professional night vision solutions for a wide range of needs, helping our customers arrive prepared and confident for effective activity across diverse operational conditions.'
          })}
        </Typography>
      </Paper>
    </Box>
  );
}

export default AboutPage;
