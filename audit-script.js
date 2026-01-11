// Comprehensive Audit Script for Traf3li Dashboard
// Run this in browser console to audit all pages

const routes = [
  // Home
  { name: 'Overview', url: '/', section: 'Home' },
  { name: 'Calendar', url: '/dashboard/calendar', section: 'Home' },
  { name: 'Appointments', url: '/dashboard/appointments', section: 'Home' },

  // Productivity
  { name: 'Tasks List', url: '/dashboard/tasks/list', section: 'Productivity' },
  { name: 'Reminders', url: '/dashboard/tasks/reminders', section: 'Productivity' },
  { name: 'Events', url: '/dashboard/tasks/events', section: 'Productivity' },
  { name: 'Gantt Chart', url: '/dashboard/tasks/gantt', section: 'Productivity' },

  // Messages
  { name: 'Messages', url: '/dashboard/messages/chat', section: 'Messages' },

  // Clients & Communication
  { name: 'CRM Dashboard', url: '/dashboard/crm', section: 'Clients' },
  { name: 'Clients', url: '/dashboard/clients', section: 'Clients' },
  { name: 'Contacts', url: '/dashboard/contacts', section: 'Clients' },
  { name: 'Organizations', url: '/dashboard/organizations', section: 'Clients' },
  { name: 'Leads', url: '/dashboard/crm/leads', section: 'Clients' },
  { name: 'CRM Transactions', url: '/dashboard/crm/transactions', section: 'Clients' },
  { name: 'Team Members', url: '/dashboard/staff', section: 'Clients' },

  // Sales
  { name: 'Sales Pipeline', url: '/dashboard/crm/pipeline', section: 'Sales' },
  { name: 'Products', url: '/dashboard/crm/products', section: 'Sales' },
  { name: 'Quotes', url: '/dashboard/crm/quotes', section: 'Sales' },
  { name: 'Campaigns', url: '/dashboard/crm/campaigns', section: 'Sales' },
  { name: 'Referrals', url: '/dashboard/crm/referrals', section: 'Sales' },
  { name: 'Activity Log', url: '/dashboard/crm/activities', section: 'Sales' },
  { name: 'Email Marketing', url: '/dashboard/crm/email-marketing', section: 'Sales' },
  { name: 'WhatsApp', url: '/dashboard/crm/whatsapp', section: 'Sales' },

  // Business
  { name: 'Cases', url: '/dashboard/cases', section: 'Business' },
  { name: 'Case Pipeline', url: '/dashboard/cases/pipeline', section: 'Business' },
  { name: 'Documents', url: '/dashboard/documents', section: 'Business' },
  { name: 'My Services', url: '/dashboard/jobs/my-services', section: 'Business' },
  { name: 'Browse Jobs', url: '/dashboard/jobs/browse', section: 'Business' },

  // Finance
  { name: 'Finance Dashboard', url: '/dashboard/finance/overview', section: 'Finance' },
  { name: 'Invoices', url: '/dashboard/finance/invoices', section: 'Finance' },
  { name: 'Payments', url: '/dashboard/finance/payments', section: 'Finance' },
  { name: 'Expenses', url: '/dashboard/finance/expenses', section: 'Finance' },
  { name: 'Transactions', url: '/dashboard/finance/transactions', section: 'Finance' },
  { name: 'Time Tracking', url: '/dashboard/finance/time-tracking', section: 'Finance' },

  // HR (subset - too many to list all)
  { name: 'Employees', url: '/dashboard/hr/employees', section: 'HR' },
  { name: 'Attendance', url: '/dashboard/hr/attendance', section: 'HR' },
  { name: 'Leave', url: '/dashboard/hr/leave', section: 'HR' },
  { name: 'Payroll', url: '/dashboard/hr/payroll', section: 'HR' },

  // Library
  { name: 'Laws', url: '/dashboard/knowledge/laws', section: 'Library' },
  { name: 'Judgments', url: '/dashboard/knowledge/judgments', section: 'Library' },
  { name: 'Forms', url: '/dashboard/knowledge/forms', section: 'Library' },
];

const results = [];

async function auditPage(route, index) {
  console.log(`[${index + 1}/${routes.length}] Auditing: ${route.name}`);

  window.location.href = route.url;

  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = {
    ...route,
    finalUrl: window.location.href,
    redirected: window.location.href !== route.url,
    errors: window.errorDebug?.getAll?.() || [],
    pageTitle: document.title,
  };

  results.push(result);
  return result;
}

async function runAudit() {
  for (let i = 0; i < routes.length; i++) {
    await auditPage(routes[i], i);
  }

  console.log('Audit complete!');
  console.log(results);

  // Download results
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-results.json';
  a.click();
}

// Run the audit
runAudit();
