/**
 * HIMALAYAN CODERS PVT. LTD.
 * Executive Admin Dashboard & Content Management System
 * Handles Authentication, Leads, Applications, Portfolio, Blog & Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initAdminTabs();
  loadDashboardData();
  initAdminActions();
});

// Default Mock Data if empty
function ensureSeedData() {
  if (!localStorage.getItem('himalayan_inquiries')) {
    const defaultInquiries = [
      {
        id: 'INQ-882104',
        name: 'Alexander Wright',
        email: 'a.wright@apextechholdings.com',
        phone: '+1 (415) 890-4421',
        company: 'Apex Tech Holdings Inc.',
        service: 'Artificial Intelligence (AI)',
        budget: '$25,000 - $50,000',
        details: 'Looking for a dedicated AI development team to architect a custom Generative AI customer intelligence engine integrated with our internal CRM.',
        date: 'Nov 10, 2026',
        status: 'In Review'
      },
      {
        id: 'INQ-773912',
        name: 'Pooja Verma',
        email: 'p.verma@fincrestcap.in',
        phone: '+91 98201 55432',
        company: 'FinCrest Capital',
        service: 'Django Development',
        budget: '₹15,00,000 - ₹25,00,000',
        details: 'Need a high-performance Django REST Framework backend for our neo-banking financial aggregation platform.',
        date: 'Nov 09, 2026',
        status: 'New'
      },
      {
        id: 'INQ-649021',
        name: 'David Lindqvist',
        email: 'd.lind@nordiclogistics.se',
        phone: '+46 8 505 23 100',
        company: 'Nordic Freight & Logistics',
        service: 'AWS & Cloud Computing',
        budget: '$15,000 - $30,000',
        details: 'Zero-downtime migration of 14 on-premise microservices to AWS Elastic Kubernetes Service with automated Terraform provisioning.',
        date: 'Nov 07, 2026',
        status: 'Contacted'
      }
    ];
    localStorage.setItem('himalayan_inquiries', JSON.stringify(defaultInquiries));
  }

  if (!localStorage.getItem('himalayan_applications')) {
    const defaultApps = [
      {
        id: 'APP-9912',
        name: 'Rohan Sharma',
        email: 'rohan.sharma.dev@gmail.com',
        phone: '+91 98112 33456',
        position: 'Senior Python / Django Architect',
        experience: '5.5 Years',
        portfolio: 'https://github.com/rohansharma-py',
        date: 'Nov 10, 2026',
        status: 'Interview Scheduled',
        notes: 'Strong knowledge of Django REST, Celery, and PostgreSQL optimization.'
      },
      {
        id: 'APP-9844',
        name: 'Elena Rostova',
        email: 'elena.rostova@ailabs.org',
        phone: '+44 20 7946 0192',
        position: 'Lead AI / Machine Learning Engineer',
        experience: '6 Years',
        portfolio: 'https://huggingface.co/erostova',
        date: 'Nov 08, 2026',
        status: 'Screening',
        notes: 'Published papers in NLP and LangChain orchestration.'
      }
    ];
    localStorage.setItem('himalayan_applications', JSON.stringify(defaultApps));
  }
}

function initAdminAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const loginOverlay = document.getElementById('adminLoginOverlay');
  const adminMain = document.getElementById('adminMainContent');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  const isAuthenticated = sessionStorage.getItem('himalayan_admin_auth') === 'true';

  if (isAuthenticated) {
    loginOverlay?.classList.add('hidden');
    adminMain?.classList.remove('hidden');
  } else {
    loginOverlay?.classList.remove('hidden');
    adminMain?.classList.add('hidden');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('adminUsername')?.value;
      const pass = document.getElementById('adminPassword')?.value;

      if ((user === 'admin' && pass === 'himalayan2026') || (user === 'sapna' && pass === 'himalayan2026')) {
        sessionStorage.setItem('himalayan_admin_auth', 'true');
        loginOverlay.classList.add('hidden');
        adminMain.classList.remove('hidden');
        loadDashboardData();
        showToast('Authenticated', 'Welcome back, Executive Administrator.');
      } else {
        const errorEl = document.getElementById('loginError');
        if (errorEl) {
          errorEl.classList.remove('hidden');
          errorEl.innerText = 'Invalid executive credentials. Use admin / himalayan2026';
        }
      }
    });
  }

  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('himalayan_admin_auth');
    location.reload();
  });
}

function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const panels = document.querySelectorAll('.admin-tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      tabBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('text-slate-400', 'hover:bg-slate-800');
      });
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('text-slate-400', 'hover:bg-slate-800');

      panels.forEach(p => {
        if (p.id === target) {
          p.classList.remove('hidden');
        } else {
          p.classList.add('hidden');
        }
      });
    });
  });
}

function loadDashboardData() {
  ensureSeedData();

  const inquiries = JSON.parse(localStorage.getItem('himalayan_inquiries') || '[]');
  const applications = JSON.parse(localStorage.getItem('himalayan_applications') || '[]');

  // Update Stats Cards
  const totalInquiriesEl = document.getElementById('statTotalInquiries');
  const pendingInquiriesEl = document.getElementById('statPendingInquiries');
  const totalAppsEl = document.getElementById('statTotalApplications');

  if (totalInquiriesEl) totalInquiriesEl.innerText = inquiries.length;
  if (pendingInquiriesEl) {
    const pending = inquiries.filter(i => i.status === 'New' || i.status === 'In Review').length;
    pendingInquiriesEl.innerText = pending;
  }
  if (totalAppsEl) totalAppsEl.innerText = applications.length;

  // Render Inquiries Table
  renderInquiriesTable(inquiries);

  // Render Applications Table
  renderApplicationsTable(applications);
}

function renderInquiriesTable(inquiries) {
  const tbody = document.getElementById('inquiriesTableBody');
  if (!tbody) return;

  if (inquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500">No client inquiries found.</td></tr>`;
    return;
  }

  tbody.innerHTML = inquiries.map((item, index) => {
    let statusBadge = 'bg-blue-900/60 text-blue-300 border-blue-500/40';
    if (item.status === 'New') statusBadge = 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40 animate-pulse';
    else if (item.status === 'Contacted') statusBadge = 'bg-purple-900/60 text-purple-300 border-purple-500/40';
    else if (item.status === 'Closed') statusBadge = 'bg-slate-800 text-slate-400 border-slate-700';

    return `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
        <td class="py-4 px-4 font-mono text-xs text-blue-400 font-semibold">${item.id}</td>
        <td class="py-4 px-4 font-medium text-white">
          <div>${item.name}</div>
          <div class="text-xs text-slate-400">${item.company}</div>
        </td>
        <td class="py-4 px-4 text-xs text-slate-300">
          <div>${item.email}</div>
          <div class="text-slate-500">${item.phone}</div>
        </td>
        <td class="py-4 px-4">
          <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/80 border border-blue-800 text-blue-300">
            ${item.service}
          </span>
          <div class="text-[11px] text-slate-400 mt-1">${item.budget}</div>
        </td>
        <td class="py-4 px-4 text-xs text-slate-400">${item.date}</td>
        <td class="py-4 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge}">
            ${item.status}
          </span>
        </td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <button onclick="updateInquiryStatus(${index}, 'Contacted')" class="p-1.5 rounded bg-blue-900/40 text-blue-300 hover:bg-blue-800 hover:text-white transition" title="Mark as Contacted">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </button>
            <button onclick="deleteInquiry(${index})" class="p-1.5 rounded bg-rose-900/30 text-rose-300 hover:bg-rose-800 hover:text-white transition" title="Archive">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderApplicationsTable(applications) {
  const tbody = document.getElementById('applicationsTableBody');
  if (!tbody) return;

  if (applications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-500">No applicant submissions found.</td></tr>`;
    return;
  }

  tbody.innerHTML = applications.map((item, index) => {
    return `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
        <td class="py-4 px-4 font-mono text-xs text-blue-400 font-semibold">${item.id}</td>
        <td class="py-4 px-4 font-medium text-white">${item.name}</td>
        <td class="py-4 px-4 text-xs text-slate-300">
          <div>${item.email}</div>
          <div class="text-slate-500">${item.phone}</div>
        </td>
        <td class="py-4 px-4 text-xs font-semibold text-blue-300">${item.position}</td>
        <td class="py-4 px-4 text-xs text-slate-300">${item.experience}</td>
        <td class="py-4 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-900/40 border border-emerald-500/30 text-emerald-300">
            ${item.status}
          </span>
        </td>
        <td class="py-4 px-4 text-right">
          <a href="${item.portfolio}" target="_blank" class="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-blue-600 text-xs font-medium inline-flex items-center gap-1 transition">
            View Profile
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// Global functions for inline actions
window.updateInquiryStatus = (index, newStatus) => {
  const inquiries = JSON.parse(localStorage.getItem('himalayan_inquiries') || '[]');
  if (inquiries[index]) {
    inquiries[index].status = newStatus;
    localStorage.setItem('himalayan_inquiries', JSON.stringify(inquiries));
    loadDashboardData();
    showToast('Status Updated', `Inquiry status changed to ${newStatus}.`);
  }
};

window.deleteInquiry = (index) => {
  if (confirm('Archive this client inquiry record?')) {
    const inquiries = JSON.parse(localStorage.getItem('himalayan_inquiries') || '[]');
    inquiries.splice(index, 1);
    localStorage.setItem('himalayan_inquiries', JSON.stringify(inquiries));
    loadDashboardData();
    showToast('Record Archived', 'Inquiry removed from active pipeline.');
  }
};

function initAdminActions() {
  // Export Leads to CSV
  const exportBtn = document.getElementById('exportLeadsBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const inquiries = JSON.parse(localStorage.getItem('himalayan_inquiries') || '[]');
      if (!inquiries.length) {
        alert('No inquiries to export.');
        return;
      }
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Budget', 'Details', 'Date', 'Status'];
      const rows = inquiries.map(i => [
        `"${i.id}"`, `"${i.name}"`, `"${i.email}"`, `"${i.phone}"`, `"${i.company}"`,
        `"${i.service}"`, `"${i.budget}"`, `"${i.details.replace(/"/g, '""')}"`, `"${i.date}"`, `"${i.status}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `himalayan_leads_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Export Generated', 'Leads successfully downloaded as CSV.');
    });
  }

  // Quick Post Creator Form
  const newBlogForm = document.getElementById('adminNewBlogForm');
  if (newBlogForm) {
    newBlogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Article Published', 'New technology insight is now indexed and live on the blog.');
      newBlogForm.reset();
    });
  }

  // Quick Project Creator Form
  const newProjectForm = document.getElementById('adminNewProjectForm');
  if (newProjectForm) {
    newProjectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Project Added', 'Case study successfully added to the portfolio showcase.');
      newProjectForm.reset();
    });
  }
}
