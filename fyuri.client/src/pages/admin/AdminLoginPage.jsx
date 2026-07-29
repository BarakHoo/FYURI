import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useAdminAuth } from '../../context/AdminAuthContext';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, enableTwoFactor, verifyTwoFactor } = useAdminAuth();

  const [stage, setStage] = useState('credentials'); // credentials | setup-2fa | verify-2fa
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      setPendingToken(result.pendingToken);
      if (result.setupRequired) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setStage('setup-2fa');
      } else {
        setStage('verify-2fa');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await enableTwoFactor(pendingToken, code);
      navigate('/fyuri-admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyTwoFactor(pendingToken, code);
      navigate('/fyuri-admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeStep = stage === 'credentials' ? 0 : 1;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
          FYURI Admin
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>Sign In</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verification</StepLabel>
          </Step>
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {stage === 'credentials' && (
          <Box component="form" onSubmit={handleCredentialsSubmit}>
            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoFocus
            />
            <TextField
              fullWidth
              required
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        )}

        {stage === 'setup-2fa' && (
          <Box component="form" onSubmit={handleSetupSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scan this QR code with Google Authenticator, Authy, or any TOTP app to set up
              two-factor authentication.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {qrCode && (
                <img src={qrCode} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
              )}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'center', mb: 2, wordBreak: 'break-all' }}
            >
              Manual entry key: {secret}
            </Typography>
            <TextField
              fullWidth
              required
              label="Enter 6-digit code to confirm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
              autoFocus
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Verifying...' : 'Enable 2FA & Sign In'}
            </Button>
          </Box>
        )}

        {stage === 'verify-2fa' && (
          <Box component="form" onSubmit={handleVerifySubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the 6-digit code from your authenticator app.
            </Typography>
            <TextField
              fullWidth
              required
              label="Authentication Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
              autoFocus
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default AdminLoginPage;
