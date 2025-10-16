import React from 'react';

interface integrationUrl {
  path: string;
  role: 'connect' | 'disconnect' | 'check';
}

export default interface Integration {
  name: string;
  logo: React.ReactNode;
}
