'use client';

import * as React from 'react';
import { useSessionStore, isUserDeveloper, isUserAdmin } from '@/entities/auth/model/store';
import { BrokerPaymentsView } from './broker-payments-view';
import { DeveloperPaymentsView } from './developer-payments-view';
import { AdminPaymentsView } from './admin-payments-view';

export default function PaymentsPage() {
  const user = useSessionStore((s) => s.user);

  if (isUserAdmin(user)) return <AdminPaymentsView />;
  if (isUserDeveloper(user)) return <DeveloperPaymentsView />;
  return <BrokerPaymentsView />;
}
