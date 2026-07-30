import { Typography, Box, Button, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useRef, useEffect } from 'react';
import Logo from '../components/Logo';

function HomePage() {
  const { language, t } = useLanguage();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure video plays and loops properly
      video.play().catch(err => console.log('Video autoplay prevented:', err));

      // Add ended event listener to restart video when it finishes
      const handleVideoEnd = () => {
        video.currentTime = 0;
        video.play().catch(err => console.log('Video restart failed:', err));
      };

      video.addEventListener('ended', handleVideoEnd);

      return () => {
        video.removeEventListener('ended', handleVideoEnd);
      };
    }
  }, []);

  const categories = [
    { 
      titleHe: 'אמצעי ראיית לילה', 
      titleEn: 'Night Vision Devices',
      descHe: 'מכשירי ראיית לילה מתקדמים',
      descEn: 'Advanced night vision equipment',
      image: '/images/banners/night-vision.jpg',
      category: 'monocular'
    },
    { 
      titleHe: 'מגברי אור', 
      titleEn: 'Image Intensifier Tubes',
      descHe: 'שפופרות איכותיות בדרגות שונות',
      descEn: 'Quality tubes in various generations',
      image: '/images/banners/image-intensifier.jpg',
      category: 'intensifier'
    },
    { 
      titleHe: 'אופטיקה', 
      titleEn: 'Optics',
      descHe: 'עדשות ומערכות אופטיות',
      descEn: 'Lenses and optical systems',
      image: '/images/banners/optics.jpg',
      category: 'optics'
    },
    { 
      titleHe: 'אביזרים', 
      titleEn: 'Accessories',
      descHe: 'אביזרים נלווים ומתקנים',
      descEn: 'Related accessories and mounts',
      image: '/images/banners/accessories.jpg',
      category: 'accessories'
    },
  ];

  return (
    <Box sx={{ }}>
      {/* Hero Section with Video Background */}
      <Box
        sx={{
          position: 'relative',
          height: 'calc(85vh + var(--site-header-height))',
          minHeight: '650px',
          width: '100%',
          marginTop: 'calc(0px - var(--site-header-height))',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          mb: 6,
        }}
      >
        {/* Video Background */}
        <Box
          ref={videoRef}
          component="video"
          autoPlay
          muted
          loop
          playsInline
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            objectFit: 'cover',
            objectPosition: 'center center',
          }}
        >
          <source src="/videos/tactical-nvg.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
        </Box>

        {/* Dark overlay for better text readability */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        />

        {/* Hero Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
              filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.8))'
            }}
          >
            <Logo height={100} />
          </Box>
          <Typography 
            variant="h4" 
            paragraph 
            sx={{ 
              fontWeight: 300, 
              mb: 4,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            {t({ he: 'אמצעי ראיית לילה מתקדמים', en: 'Advanced Night Vision Systems' })}
          </Typography>
          <Typography 
            variant="h6" 
            paragraph 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              mb: 5, 
              opacity: 0.95,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {t({ 
              he: 'מובילים בתחום ציוד ראיית לילה, מגברי אור ושירותי מעבדה מקצועיים',
              en: 'Leaders in night vision equipment, image intensifier tubes and professional lab services'
            })}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/products"
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                }
              }}
            >
              {t({ he: 'צפה בקטלוג', en: 'View Catalog' })}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/contact"
              sx={{ 
                borderColor: 'white',
                borderWidth: 2,
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { 
                  borderColor: 'white',
                  borderWidth: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 12px rgba(255,255,255,0.2)',
                }
              }}
            >
              {t({ he: 'צור קשר', en: 'Contact Us' })}
            </Button>
          </Box>
        </Container>
      </Box>
                  {/* Categories Section - Clean card design */}
                  <Container sx={{ py: 6 }}>
                    <Typography 
                      variant="h3" 
                      component="h2" 
                      gutterBottom 
                      align="center" 
                      sx={{ mb: 6, fontWeight: 600 }}
                    >
                      {t({ he: 'הקטגוריות שלנו', en: 'Our Categories' })}
                    </Typography>
                    <Grid container spacing={4}>
                      {categories.map((category, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                          <Card
                            component={RouterLink}
                            to={`/products?category=${category.category}`}
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              textAlign: 'center',
                              transition: 'all 0.3s ease',
                              textDecoration: 'none',
                              border: '1px solid',
                              borderColor: 'divider',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: 4,
                                borderColor: 'primary.main',
                              },
                            }}
                          >
                            {category.image && (
                              <CardMedia
                                component="img"
                                height="200"
                                image={category.image}
                                alt={language === 'he' ? category.titleHe : category.titleEn}
                                sx={{
                                  objectFit: 'cover',
                                  filter: 'brightness(0.7)',
                                }}
                              />
                            )}
                            <CardContent sx={{ 
                              flexGrow: 1, 
                              p: 4, 
                              position: category.image ? 'absolute' : 'relative',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              zIndex: 1,
                              backgroundColor: category.image ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                            }}>
                              {!category.image && (
                                <Box sx={{ color: 'primary.main', mb: 2 }}>
                                  {category.icon}
                                </Box>
                              )}
                              <Typography 
                                variant="h6" 
                                gutterBottom 
                                sx={{ 
                                  fontWeight: 600,
                                  ...(category.image && {
                                    color: 'white',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                  }),
                                }}
                              >
                                {language === 'he' ? category.titleHe : category.titleEn}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{
                                  ...(category.image ? {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                                  } : {
                                    color: 'text.secondary',
                                  }),
                                }}
                              >
                                {language === 'he' ? category.descHe : category.descEn}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Container>

                  {/* Why FYURI Section */}
                  <Box sx={{ bgcolor: 'background.paper', py: 8, mt: 6 }}>
                    <Container>
                      <Typography 
                        variant="h3" 
                        component="h2" 
                        gutterBottom 
                        align="center" 
                        sx={{ mb: 6, fontWeight: 600 }}
                      >
                        {t({ he: 'למה FYURI?', en: 'Why FYURI?' })}
                      </Typography>
                      <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                              {t({ he: 'ניסיון וידע', en: 'Experience & Knowledge' })}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {t({ 
                                he: 'צוות מקצועי עם ניסיון רב בתחום ציוד ראיית לילה',
                                en: 'Professional team with extensive experience in night vision equipment'
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                              {t({ he: 'שירות מעבדה', en: 'Lab Services' })}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              {t({ 
                                he: 'שירותי תחזוקה, כיול ותיקון במעבדה מקצועית',
                                en: 'Maintenance, calibration and repair services in professional lab'
                              })}
                            </Typography>
                          </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                  {t({ he: 'ליווי מקצועי', en: 'Professional Guidance' })}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t({ 
                    he: 'ייעוץ והכוונה למוצר המתאים ביותר לצרכים שלך',
                    en: 'Consultation and guidance to find the best product for your needs'
                  })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;
