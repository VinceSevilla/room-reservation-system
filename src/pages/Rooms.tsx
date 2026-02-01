import { useEffect, useState } from 'react';
import { Button, Group, Modal, Table, TextInput, NumberInput, Text, Card, Title, Center, Loader, Container, Box, Stack } from '@mantine/core';
import { supabase } from '../supabase';
import { useRole } from '../hooks/useRole';
import { useDisclosure } from '@mantine/hooks';

type Room = {
  id: string;
  name: string;
  capacity: number;
  location: string;
};

export default function Rooms() {
  const { role } = useRole();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [opened, setOpened] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('rooms').select('*');
    if (error) console.error('Error fetching rooms:', error);
    else setRooms(data || []);
    setLoading(false);
  };

  const saveRoom = async () => {
    if (!name || !capacity || !location) {
      alert('Please fill in all fields');
      return;
    }
    try {
      if (editingRoom) {
        const { error } = await supabase.from('rooms').update({ name, capacity, location }).eq('id', editingRoom.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rooms').insert({ name, capacity, location });
        if (error) throw error;
      }
      setOpened(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      alert(`Error saving room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomToDelete.id);
      if (error) throw error;
      closeDelete();
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(`Error deleting room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetForm = () => {
    setEditingRoom(null);
    setName('');
    setCapacity(undefined);
    setLocation('');
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) return <Center h={500}><Loader size="lg" /></Center>;

  return (
    <Container size="xl" fluid p={{ base: 'sm', sm: 'md', md: 'lg' }}>
      <Box mb={{ base: 'md', sm: 'lg', md: 'xl' }}>
        <Group justify="space-between" align={{ base: 'flex-start', sm: 'center' }} wrap="wrap" gap={{ base: 'sm', sm: 'md' }}>
          <Box>
            <Title order={1} fw={700} size="h2" mb="xs">
              Rooms Management
            </Title>
            <Text c="dimmed" size="md">
              View and manage all available rooms.
            </Text>
          </Box>
          {(role === 'admin' || role === 'staff') && (
            <Button size="md" onClick={() => setOpened(true)}>
              Add Room
            </Button>
          )}
        </Group>
      </Box>

      <Card withBorder shadow="sm" p={{ base: 'sm', sm: 'md', md: 'lg' }} radius="md">
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover verticalSpacing={{ base: 'xs', sm: 'md' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th><Text fw={600} size="sm">Name</Text></Table.Th>
                <Table.Th><Text fw={600} size="sm">Capacity</Text></Table.Th>
                <Table.Th><Text fw={600} size="sm">Location</Text></Table.Th>
                {(role === 'admin' || role === 'staff') && <Table.Th><Text fw={600} size="sm">Actions</Text></Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rooms.map((room) => (
                <Table.Tr key={room.id}>
                  <Table.Td><Text fw={500} ta="center" size="sm">{room.name}</Text></Table.Td>
                  <Table.Td><Text ta="center" size="sm">{room.capacity}</Text></Table.Td>
                  <Table.Td><Text ta="center" size="sm">{room.location}</Text></Table.Td>
                  {(role === 'admin' || role === 'staff') && (
                    <Table.Td>
                      <Group gap={{ base: 'xs', sm: 'xs' }} justify="center" wrap="wrap">
                        <Button size="xs" variant="light" onClick={() => { setEditingRoom(room); setName(room.name); setCapacity(room.capacity); setLocation(room.location); setOpened(true); }}>
                          Edit
                        </Button>
                        {role === 'admin' && (
                          <Button color="red" size="xs" variant="light" onClick={() => { setRoomToDelete(room); openDelete(); }}>
                            Delete
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Card>

      <Modal opened={opened} onClose={() => { setOpened(false); resetForm(); }} title={<Text fw={600} size="lg">{editingRoom ? 'Edit Room' : 'Add Room'}</Text>} size="sm">
        <Stack gap="md">
          <TextInput label="Room Name" value={name} onChange={(e) => setName(e.target.value)} required size="md" styles={{ label: { fontWeight: 500 } }} />
          <NumberInput label="Capacity" value={capacity} onChange={(value) => setCapacity(typeof value === 'number' ? value : undefined)} required min={1} size="md" styles={{ label: { fontWeight: 500 } }} />
          <TextInput label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required size="md" styles={{ label: { fontWeight: 500 } }} />
          <Group justify="flex-end" mt="md" gap={{ base: 'xs', sm: 'md' }}>
            <Button size="sm" variant="default" onClick={() => { setOpened(false); resetForm(); }}>Cancel</Button>
            <Button size="sm" onClick={saveRoom}>{editingRoom ? 'Update' : 'Add'}</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteOpened} onClose={closeDelete} title={<Text fw={600} size="lg">Delete Room</Text>} centered size="sm">
        <Text mb="lg">Are you sure you want to delete <strong>{roomToDelete?.name}</strong>? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeDelete}>Cancel</Button>
          <Button color="red" onClick={deleteRoom}>Delete</Button>
        </Group>
      </Modal>
    </Container>
  );
}
