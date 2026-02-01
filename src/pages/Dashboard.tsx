import { useEffect, useState } from 'react';
import { Card, SimpleGrid, Text, Title, Container, Box } from '@mantine/core';
import { supabase } from '../supabase';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../context/useAuth';
import { ROLE } from '../types/roles';

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card withBorder shadow="sm" p="xl" radius="md">
      <Text size="sm" c="dimmed" fw={500} mb="xs" tt="uppercase">
        {label}
      </Text>
      <Title order={2} fw={700} size="h1">
        {value}
      </Title>
    </Card>
  );
}

export default function Dashboard() {
  const { role } = useRole();
  const { user } = useAuth();
  const [stats, setStats] = useState({ rooms: 0, reservations: 0, pending: 0, today: 0, upcoming: 0 });

  console.log('Dashboard rendering - role:', role, 'user:', user?.email);

  useEffect(() => {
    const load = async () => {
      if (!role || !user?.id) return;

      if (role === ROLE.Admin) {
        try {
          const [rooms, reservations, pending] = await Promise.all([
            supabase.from('rooms').select('id', { count: 'exact', head: true }),
            supabase.from('reservations').select('id', { count: 'exact', head: true }),
            supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          ]);
          setStats({ rooms: rooms.count ?? 0, reservations: reservations.count ?? 0, pending: pending.count ?? 0, today: 0, upcoming: 0 });
        } catch (error) {
          console.error('Error fetching admin stats:', error);
        }
      }

      if (role === ROLE.Student && user?.id) {
        try {
          const { count } = await supabase.from('reservations').select('id', { count: 'exact', head: true })
            .eq('user_id', user.id).gt('start_time', new Date().toISOString());
          setStats(s => ({ ...s, upcoming: count ?? 0 }));
        } catch (error) {
          console.error('Error fetching student stats:', error);
        }
      }
    };
    load();
  }, [role, user?.id]);

  return (
    <Container size="xl" fluid>
      <Box mb={{ base: 'md', sm: 'lg', md: 'xl' }}>
        <Title order={1} fw={700} size={{ base: 'h3', sm: 'h2', md: 'h2' }} mb="xs">
          Dashboard
        </Title>
        <Text c="dimmed" size={{ base: 'sm', sm: 'md' }}>
          Welcome back! Here's your overview.
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 3 }} spacing={{ base: 'md', sm: 'lg' }}>
        {role === ROLE.Admin && (
          <>
            <StatCard label="Total Rooms" value={stats.rooms} />
            <StatCard label="Total Reservations" value={stats.reservations} />
            <StatCard label="Pending Approvals" value={stats.pending} />
          </>
        )}
        {role === ROLE.Student && <StatCard label="My Upcoming Reservations" value={stats.upcoming} />}
      </SimpleGrid>
    </Container>
  );
}

