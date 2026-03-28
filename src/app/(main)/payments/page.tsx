'use client';

import * as React from 'react';
import { useSessionStore, isUserDeveloper } from '@/entities/auth/model/store';
import { BrokerPaymentsView } from './broker-payments-view';
import { DeveloperPaymentsView } from './developer-payments-view';

export default function PaymentsPage() {
  const user = useSessionStore((s) => s.user);
  const isDev = isUserDeveloper(user);

  if (isDev) return <DeveloperPaymentsView />;
  return <BrokerPaymentsView />;
}
