import { Box, Flex, IconButton, Text, Icon } from '@chakra-ui/react';
import { Home, ShieldAlert, Settings, Menu, LogOut, Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

// Note: Simple Lucide icons wrapped for Chakra
const NavItem = ({ icon: IconComponent, label, to, active }) => {
  const navigate = useNavigate();
  return (
    <Flex
      align="center"
      p="3"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      bg={active ? "var(--bg-card)" : "transparent"}
      color={active ? "white" : "var(--text-muted)"}
      borderRight={active ? "3px solid var(--accent-cyan)" : "3px solid transparent"}
      _hover={{
        bg: 'var(--bg-card)',
        color: 'white',
      }}
      onClick={() => navigate(to)}
      transition="all 0.2s"
    >
      <Icon as={IconComponent} boxSize="5" mr="4" />
      <Text fontSize="sm" fontWeight={active ? "600" : "500"}>{label}</Text>
    </Flex>
  );
};

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      w="280px"
      borderRight="1px solid"
      borderColor="var(--border-color)"
      bg="var(--bg-dark)"
      h="100vh"
      position="fixed"
      left="0"
      top="0"
      display="flex"
      flexDirection="column"
    >
      <Flex h="20" alignItems="center" mx="6" mb="6" borderBottom="1px solid" borderColor="var(--border-color)">
        <Icon as={ShieldAlert} boxSize="8" color="var(--accent-cyan)" mr="3" />
        <Text fontSize="xl" fontWeight="bold" letterSpacing="tight" color="white">
          Cyber<Box as="span" color="var(--accent-cyan)">Ops</Box>
        </Text>
      </Flex>

      <Box flex="1" mt="2">
        <NavItem 
          icon={Home} 
          label="Dashboard" 
          to="/" 
          active={location.pathname === '/'} 
        />
        <NavItem 
          icon={Activity} 
          label="Network Activity" 
          to="/network" 
          active={location.pathname.startsWith('/network')} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          to="/settings" 
          active={location.pathname === '/settings'} 
        />
      </Box>

      <Box pb="6" pt="4" borderTop="1px solid" borderColor="var(--border-color)">
        <Flex
          align="center"
          p="3"
          mx="4"
          borderRadius="lg"
          cursor="pointer"
          color="var(--accent-red)"
          _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }}
          onClick={handleLogout}
          transition="all 0.2s"
        >
          <Icon as={LogOut} boxSize="5" mr="4" />
          <Text fontSize="sm" fontWeight="500">Log Out</Text>
        </Flex>
      </Box>
    </Box>
  );
}
