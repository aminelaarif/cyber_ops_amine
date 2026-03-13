import { Box, Flex, HStack, Text, Avatar } from '@chakra-ui/react';
import { Bell } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function Header() {
  const { user } = useAuthStore();

  return (
    <Flex
      as="header"
      align="center"
      justify="flex-end"
      w="full"
      px="8"
      h="20"
      bg="rgba(15, 17, 21, 0.8)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="var(--border-color)"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <HStack gap="6">
        <Box position="relative" cursor="pointer" color="var(--text-muted)" _hover={{ color: 'white' }}>
          <Bell size={20} />
          <Box 
            position="absolute" 
            top="-1" 
            right="-1" 
            w="2" 
            h="2" 
            bg="var(--accent-red)" 
            borderRadius="full" 
            border="2px solid var(--bg-dark)"
          />
        </Box>
        
        <HStack gap="3" pl="6" borderLeft="1px solid" borderColor="var(--border-color)">
          <Box textAlign="right" display={{ base: 'none', md: 'block' }}>
            <Text fontSize="sm" fontWeight="600" color="white">{user?.name || 'Security Admin'}</Text>
            <Text fontSize="xs" color="var(--text-muted)">{user?.role || 'ADMIN'}</Text>
          </Box>
          <Box w="10" h="10" borderRadius="full" bg="var(--border-color)" overflow="hidden">
             <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'A'}&backgroundColor=06b6d4&textColor=ffffff`} alt="Avatar" />
          </Box>
        </HStack>
      </HStack>
    </Flex>
  );
}
