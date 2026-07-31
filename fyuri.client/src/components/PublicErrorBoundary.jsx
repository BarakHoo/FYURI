import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { RefreshOutlined, ViewListOutlined } from '@mui/icons-material';

class PublicErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, details) {
    console.error('Public route failed to render:', error, details);
  }

  componentDidUpdate(previousProps) {
    if (
      this.state.error
      && previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const isHebrew = this.props.language === 'he';

    return (
      <Box className="fy-public-page">
        <Box className="fy-public-stage">
          <Box className="fy-public-content">
            <Box className="fy-panel fy-public-empty" role="alert">
              <span className="fy-section-kicker">FYURI / RECOVERY</span>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 900, mb: 1.5 }}>
                {isHebrew ? 'העמוד לא נטען כראוי.' : 'This page did not load correctly.'}
              </Typography>
              <Typography className="fy-muted" sx={{ maxWidth: 560, mx: 'auto', lineHeight: 1.65 }}>
                {isHebrew
                  ? 'אפשר לנסות לטעון מחדש. אם התקלה נמשכת, חזרו לקטלוג והמשיכו משם.'
                  : 'Try reloading the page. If the issue continues, return to the catalog and continue from there.'}
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<RefreshOutlined />}
                  onClick={() => window.location.reload()}
                >
                  {isHebrew ? 'טעינה מחדש' : 'Reload page'}
                </Button>
                <Button
                  component="a"
                  href="/products"
                  variant="outlined"
                  startIcon={<ViewListOutlined />}
                >
                  {isHebrew ? 'חזרה לקטלוג' : 'Return to catalog'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default PublicErrorBoundary;
