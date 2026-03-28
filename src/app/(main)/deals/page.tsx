'use client';

import * as React from 'react';
import { useSessionStore, isUserAdmin, isUserDeveloper, isUserBroker } from '@/entities/auth/model/store';
import { BrokerDealsView } from './broker-deals-view';
import { DeveloperDealsView } from './developer-deals-view';
import { AdminDealsView } from './admin-deals-view';

export default function DealsPage() {
  const user = useSessionStore((s) => s.user);
  const isDev = isUserDeveloper(user);
  const isAdm = isUserAdmin(user);

  if (isAdm) return <AdminDealsView />;
  if (isDev) return <DeveloperDealsView />;
  return <BrokerDealsView />;
}
