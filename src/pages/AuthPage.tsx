import { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Tabs, Button, TextInput, PasswordInput, Stack, Title, Text, Divider, Center, Loader, Box } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { supabase } from '../supabase';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      alert('Check your email for confirmation!');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError('');
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('=== GOOGLE SIGNIN START ===');
    setSigningIn(true);
    setError('');
    try {
      console.log('Step 1: About to call signInWithOAuth');
      const redirectUrl = `${window.location.origin}/auth`;
      console.log('Redirect URL:', redirectUrl);
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      console.log('Step 2: signInWithOAuth returned');
      console.log('Data:', data);
      console.log('Error:', err);
      if (err) throw err;
      console.log('Step 3: No error, OAuth should be processing');
    } catch (err) {
      console.error('=== GOOGLE SIGNIN ERROR ===');
      console.error('Error object:', err);
      setError(err instanceof Error ? err.message : 'Google sign in failed');
      setSigningIn(false);
    }
  };

  if (loading) {
    console.log('AuthPage loading state is true');
    return <Center h="100vh"><Loader size="lg" /></Center>;
  }

  console.log('AuthPage form is visible - rendering');
  console.log('handleGoogleSignIn function:', typeof handleGoogleSignIn);
  console.log('signingIn state:', signingIn);

  return (
    <Box style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
      <Container size={440}>
        <Card withBorder shadow="md" p={40} radius="md">
          <Title order={1} ta="center" fw={700} size="h2" mb="sm">
            Reservation System
          </Title>
          <Text ta="center" c="dimmed" size="md" mb={30}>
            University Room Scheduling
          </Text>

          <Tabs defaultValue="signin">
            <Tabs.List grow mb="lg">
              <Tabs.Tab value="signin" fw={500}>Sign In</Tabs.Tab>
              <Tabs.Tab value="signup" fw={500}>Sign Up</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="signin">
              <Stack gap="md">
                {error && (
                  <Text c="red" size="sm" ta="center" p="xs" style={{ backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
                    {error}
                  </Text>
                )}
                <form onSubmit={handleEmailSignIn}>
                  <Stack gap="md">
                    <TextInput
                      label="Email"
                      placeholder="you@example.com"
                      type="email"
                      size="md"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      required
                      styles={{ label: { fontWeight: 500, fontSize: '14px' } }}
                    />
                    <PasswordInput
                      label="Password"
                      placeholder="Your password"
                      size="md"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      required
                      styles={{ label: { fontWeight: 500, fontSize: '14px' } }}
                    />
                    <Button type="submit" fullWidth size="md" loading={signingIn} mt="sm">
                      Sign In
                    </Button>
                  </Stack>
                </form>
                <Divider label="Or continue with" labelPosition="center" />
                <Button
                  variant="default"
                  fullWidth
                  size="md"
                  leftSection={<IconBrandGoogle size={18} />}
                  onClick={() => {
                    console.log('Google button clicked!');
                    handleGoogleSignIn();
                  }}
                  loading={signingIn}
                >
                  Google
                </Button>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="signup">
              <Stack gap="md">
                {error && (
                  <Text c="red" size="sm" ta="center" p="xs" style={{ backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
                    {error}
                  </Text>
                )}
                <form onSubmit={handleEmailSignUp}>
                  <Stack gap="md">
                    <TextInput
                      label="Email"
                      placeholder="you@example.com"
                      type="email"
                      size="md"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      required
                      styles={{ label: { fontWeight: 500, fontSize: '14px' } }}
                    />
                    <PasswordInput
                      label="Password"
                      placeholder="Your password"
                      size="md"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      required
                      styles={{ label: { fontWeight: 500, fontSize: '14px' } }}
                    />
                    <Button type="submit" fullWidth size="md" loading={signingIn} mt="sm">
                      Create Account
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Container>
    </Box>
  );
}
