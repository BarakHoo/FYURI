import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Email, Facebook, Instagram, Phone, WhatsApp } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  const companyLinks = [
    { to: '/about', label: t({ he: 'אודות FYURI', en: 'About FYURI' }) },
    { to: '/services', label: t({ he: 'שירותי מעבדה', en: 'Lab Services' }) },
    { to: '/contact', label: t({ he: 'צור קשר', en: 'Contact' }) },
  ];
  const productLinks = [
    { to: '/products', label: t({ he: 'כל המוצרים', en: 'All Products' }) },
    { to: '/products?category=monocular', label: t({ he: 'חד עיניות', en: 'Monoculars' }) },
    { to: '/products?category=binocular', label: t({ he: 'דו עיניות', en: 'Binoculars' }) },
    { to: '/products?category=thermal', label: t({ he: 'מערכות תרמיות', en: 'Thermal Systems' }) },
    { to: '/builder', label: t({ he: 'בניית מכשיר', en: 'Build Your Device' }) },
  ];

  return (
    <Box component="footer" className="fy-public-footer">
      <Box className="fy-public-footer__inner">
        <Box className="fy-public-footer__grid">
          <Box>
            <Box
              component={RouterLink}
              to="/"
              aria-label={t({ he: 'FYURI, דף הבית', en: 'FYURI, home' })}
              sx={{
                display: 'block',
                width: 'fit-content',
                '&:focus-visible': {
                  outline: '2px solid #42baf2',
                  outlineOffset: 4,
                },
              }}
            >
              <Box
                component="img"
                className="fy-public-footer__logo"
                src="/images/logos/fyuri-logo-transparent.png"
                alt="FYURI"
                width="230"
                height="64"
                loading="lazy"
                decoding="async"
              />
            </Box>
            <Typography sx={{ mt: 1.5, maxWidth: 360, color: '#91a5b0', lineHeight: 1.65 }}>
              {t({
                he: 'מערכות ראיית לילה, רכיבים ושירותי מעבדה מקצועיים — עם ליווי אמיתי לפני ואחרי הרכישה.',
                en: 'Professional night-vision systems, components and lab services—with real guidance before and after purchase.',
              })}
            </Typography>
          </Box>

          <Box>
            <p className="fy-public-footer__title">{t({ he: 'מערכות', en: 'Systems' })}</p>
            <Box component="nav" aria-label={t({ he: 'קישורי מוצרים', en: 'Product links' })} className="fy-public-footer__links">
              {productLinks.map((item) => (
                <RouterLink key={item.to} to={item.to}>{item.label}</RouterLink>
              ))}
            </Box>
          </Box>

          <Box>
            <p className="fy-public-footer__title">{t({ he: 'החברה', en: 'Company' })}</p>
            <Box component="nav" aria-label={t({ he: 'קישורי חברה', en: 'Company links' })} className="fy-public-footer__links">
              {companyLinks.map((item) => (
                <RouterLink key={item.to} to={item.to}>{item.label}</RouterLink>
              ))}
            </Box>
          </Box>

          <Box>
            <p className="fy-public-footer__title">{t({ he: 'תמיכה וקשר', en: 'Support & Contact' })}</p>
            <Box className="fy-public-footer__links">
              <Box component="a" href="tel:+972544770200" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                054-477-0200
              </Box>
              <Box component="a" href="mailto:info@fyuri.co.il" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                info@fyuri.co.il
              </Box>
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Tooltip title="WhatsApp">
                <IconButton
                  component="a"
                  href="https://wa.me/972544770200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  sx={{ color: '#dce8ee', border: '1px solid #213846' }}
                >
                  <WhatsApp />
                </IconButton>
              </Tooltip>
              <Tooltip title="Facebook">
                <IconButton
                  component="a"
                  href="https://www.facebook.com/FYURINV"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  sx={{ color: '#dce8ee', border: '1px solid #213846' }}
                >
                  <Facebook />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram">
                <IconButton
                  component="a"
                  href="https://www.instagram.com/fyuri.night.vision/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  sx={{ color: '#dce8ee', border: '1px solid #213846' }}
                >
                  <Instagram />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>

        <Box className="fy-public-footer__bottom">
          <span>© {new Date().getFullYear()} FYURI. {t({ he: 'כל הזכויות שמורות.', en: 'All rights reserved.' })}</span>
          <span>{t({ he: 'אין תשלום באתר — נציג יצור קשר להשלמת ההזמנה.', en: 'No online payment—our team will contact you to finalize your order.' })}</span>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;
