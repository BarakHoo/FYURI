import { Box, Container, Typography, Grid, Link as MuiLink, IconButton, Stack, Tooltip } from '@mui/material';
import { Link } from 'react-router';
import { WhatsApp, Facebook, Instagram } from '@mui/icons-material';
import { useLanguage } from '../context/LanguageContext';
import { useThemeMode } from '../context/ThemeContext';

function Footer() {
  const { t } = useLanguage();
  const { mode } = useThemeMode();

  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: mode === 'dark' ? '#050d15' : '#0d47a1', 
        color: 'white', 
        py: 6, 
        mt: 'auto'
      }}
    >
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t({ he: 'FYURI אמצעי ראיית לילה', en: 'FYURI Night Vision Systems' })}
            </Typography>
            <Typography variant="body2" color="grey.400">
              {t({ he: 'לראות מה שהחושך מסתיר', en: 'See What The Darkness Hides' })}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t({ he: 'קישורים', en: 'Links' })}
            </Typography>
            <MuiLink component={Link} to="/about" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              {t({ he: 'מי אנחנו', en: 'About Us' })}
            </MuiLink>
            <MuiLink component={Link} to="/services" color="inherit" display="block" sx={{ mb: 1, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              {t({ he: 'שירותי מעבדה', en: 'Lab Services' })}
            </MuiLink>
            <MuiLink component={Link} to="/contact" color="inherit" display="block" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              {t({ he: 'צור קשר', en: 'Contact' })}
            </MuiLink>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              {t({ he: 'צור קשר', en: 'Contact Us' })}
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ mb: 1 }}>
              {t({ he: 'טלפון: 054-477-0200', en: 'Phone: 054-477-0200' })}
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ mb: 3 }}>
              {t({ he: 'אימייל: info@fyuri.co.il', en: 'Email: info@fyuri.co.il' })}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ color: 'grey.300', mb: 0, textAlign: 'center' }}>
                {t({ he: 'עקבו אחרינו', en: 'Follow Us' })}
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="center">
              <Tooltip title="WhatsApp" arrow>
                <IconButton
                  component="a"
                  href="https://wa.me/972544770200"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    bgcolor: '#25D366',
                    color: 'white',
                    width: 45,
                    height: 45,
                    '&:hover': { 
                      bgcolor: '#20BD5C',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <WhatsApp sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Facebook" arrow>
                <IconButton
                  component="a"
                  href="https://www.facebook.com/FYURINV"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    bgcolor: '#1877f2',
                    color: 'white',
                    width: 45,
                    height: 45,
                    '&:hover': { 
                      bgcolor: '#145dbf',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(24, 119, 242, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Facebook sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Instagram" arrow>
                <IconButton
                  component="a"
                  href="https://www.instagram.com/fyuri.night.vision/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    color: 'white',
                    width: 45,
                    height: 45,
                    '&:hover': { 
                      background: 'linear-gradient(45deg, #d87e2d 0%, #d05c31 25%, #c71f38 50%, #b51d5a 75%, #a51078 100%)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(225, 48, 108, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Instagram sx={{ fontSize: 24 }} />
                </IconButton>
              </Tooltip>
            </Stack>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="body2" color="grey.500" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} FYURI. {t({ he: 'כל הזכויות שמורות.', en: 'All rights reserved.' })}
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
