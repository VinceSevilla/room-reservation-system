import { AppShell, Button, Group, Text, Stack, NavLink, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/useAuth';
import { supabase } from '../supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { IconLogout, IconHome, IconCalendar, IconDoor, IconClipboard, IconSettings, IconUsers } from '@tabler/icons-react';
import { ROLE } from '../types/roles';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { user } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      // Clear only Supabase-related keys, not everything
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/auth', { replace: true });
    }
  };

  const navItems = [
    { label: 'Dashboard', icon: IconHome, path: '/dashboard' },
    ...(role === ROLE.Student ? [{ label: 'Create Reservation', icon: IconClipboard, path: '/create-reservation' }] : []),
    { label: 'Calendar', icon: IconCalendar, path: '/calendar' },
    { label: 'Rooms', icon: IconDoor, path: '/rooms' },
    { label: 'Reservations', icon: IconClipboard, path: '/reservations' },
    ...(role === ROLE.Admin ? [{ label: 'Admin', icon: IconSettings, path: '/admin' }] : []),
    ...(role === ROLE.Staff || role === ROLE.Admin ? [{ label: 'Staff', icon: IconUsers, path: '/staff' }] : []),
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (mobileOpened) {
      toggleMobile();
    }
  };

  return (
    <AppShell 
      header={{ height: 60 }} 
      navbar={{ 
        width: 280, 
        breakpoint: 'sm', 
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened } 
      }} 
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Group gap="xs">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
            <Text fw={700} size={{ base: 'sm', sm: 'lg' }} style={{ whiteSpace: 'nowrap' }}>
              UNI RESERVATION
            </Text>
          </Group>
          <Group gap={{ base: 'xs', sm: 'md' }}>
            <Text size="sm" visibleFrom="sm">
              {user?.email}
            </Text>
            <Button size="xs" variant="light" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={16} />}
              onClick={() => handleNavClick(item.path)}
              active={location.pathname === item.path}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}