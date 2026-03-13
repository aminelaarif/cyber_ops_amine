import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import React from 'react';

export function Provider(props) {
  return (
    <ChakraProvider value={defaultSystem}>
      {props.children}
    </ChakraProvider>
  )
}
