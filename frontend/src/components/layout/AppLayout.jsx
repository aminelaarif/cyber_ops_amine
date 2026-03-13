import { Box } from '@chakra-ui/react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAuthStore from '../../store/useAuthStore';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box minH="100vh" bg="var(--bg-dark)">
      <Sidebar />
      <Box ml="280px" transition="all 0.3s">
        <Header />
        <Box p="8" as="main">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
