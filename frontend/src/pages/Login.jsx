import { useState } from 'react';
import { Box, Button, Input, Text, VStack, HStack, Tabs } from '@chakra-ui/react';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="var(--bg-dark)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      backgroundImage="radial-gradient(ellipse at 20% 50%, rgba(6, 182, 212, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)"
    >
      <Box
        w="420px"
        bg="var(--bg-card)"
        borderRadius="2xl"
        border="1px solid"
        borderColor="var(--border-color)"
        p="10"
        boxShadow="0 25px 50px rgba(0,0,0,0.5)"
      >
        <VStack gap="8">
          {/* Logo */}
          <VStack gap="3">
            <HStack gap="2">
              <ShieldAlert size={36} color="var(--accent-cyan)" />
              <Text fontSize="2xl" fontWeight="bold" color="white">
                Cyber<Box as="span" color="var(--accent-cyan)">Ops</Box>
              </Text>
            </HStack>
            <Text color="var(--text-muted)" fontSize="sm" textAlign="center">
              Security Operations Center
            </Text>
          </VStack>

          {/* Mode Toggle */}
          <HStack gap="0" bg="var(--bg-dark)" borderRadius="lg" p="1" w="full">
            {['login', 'register'].map((m) => (
              <Button
                key={m}
                flex={1}
                size="sm"
                bg={mode === m ? 'var(--border-color)' : 'transparent'}
                color={mode === m ? 'white' : 'var(--text-muted)'}
                borderRadius="md"
                fontWeight={mode === m ? '600' : '400'}
                onClick={() => { setMode(m); setError(''); }}
                _hover={{ color: 'white' }}
                transition="all 0.2s"
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </Button>
            ))}
          </HStack>

          {/* Form */}
          <Box as="form" w="full" onSubmit={handleSubmit}>
            <VStack gap="4">
              {mode === 'register' && (
                <Box w="full">
                  <Text color="var(--text-muted)" fontSize="xs" mb="1.5" fontWeight="500">FULL NAME</Text>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    bg="var(--bg-dark)"
                    border="1px solid var(--border-color)"
                    color="white"
                    _placeholder={{ color: 'var(--text-muted)' }}
                    _focus={{ borderColor: 'var(--accent-cyan)', boxShadow: '0 0 0 1px var(--accent-cyan)' }}
                    borderRadius="lg"
                    required
                  />
                </Box>
              )}
              <Box w="full">
                <Text color="var(--text-muted)" fontSize="xs" mb="1.5" fontWeight="500">EMAIL</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  bg="var(--bg-dark)"
                  border="1px solid var(--border-color)"
                  color="white"
                  _placeholder={{ color: 'var(--text-muted)' }}
                  _focus={{ borderColor: 'var(--accent-cyan)', boxShadow: '0 0 0 1px var(--accent-cyan)' }}
                  borderRadius="lg"
                  required
                />
              </Box>
              <Box w="full">
                <Text color="var(--text-muted)" fontSize="xs" mb="1.5" fontWeight="500">PASSWORD</Text>
                <Box position="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    bg="var(--bg-dark)"
                    border="1px solid var(--border-color)"
                    color="white"
                    _placeholder={{ color: 'var(--text-muted)' }}
                    _focus={{ borderColor: 'var(--accent-cyan)', boxShadow: '0 0 0 1px var(--accent-cyan)' }}
                    borderRadius="lg"
                    pr="12"
                    required
                  />
                  <Box
                    position="absolute"
                    right="3"
                    top="50%"
                    transform="translateY(-50%)"
                    cursor="pointer"
                    color="var(--text-muted)"
                    _hover={{ color: 'white' }}
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Box>
                </Box>
              </Box>

              {error && (
                <Box
                  w="full"
                  bg="rgba(239, 68, 68, 0.1)"
                  border="1px solid rgba(239, 68, 68, 0.3)"
                  borderRadius="lg"
                  p="3"
                >
                  <Text color="var(--accent-red)" fontSize="sm">{error}</Text>
                </Box>
              )}

              <Button
                type="submit"
                w="full"
                bg="var(--accent-cyan)"
                color="var(--bg-dark)"
                fontWeight="bold"
                borderRadius="lg"
                h="11"
                loading={loading}
                _hover={{ opacity: 0.9, transform: 'translateY(-1px)', boxShadow: '0 10px 30px rgba(6,182,212,0.3)' }}
                transition="all 0.2s"
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </VStack>
          </Box>

          <Text fontSize="xs" color="var(--text-muted)" textAlign="center">
            🔒 Encrypted connection · SOC Platform v1.0
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
