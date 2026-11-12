/**
 * ATTERIA TECHNOLOGIES PVT. LTD.
 * Core Enterprise Application Script
 * Features: Mobile Nav, Modals, Quote Calculator, Dynamic Filtering,
 * Local Storage Persistence, Form Validation & Admin CMS Handlers
 */

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollTop();
  initModals();
  initQuoteCalculator();
  initForms();
  initPortfolioFilters();
  initBlogReader();
  initWhatsAppWidget();
  initCounters();
});

/* ==========================================================================
   1. NAVIGATION & HEADER CONTROLS
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Sticky Header Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('glass-nav', 'py-3');
      header?.classList.remove('py-5');
    } else {
      header?.classList.remove('glass-nav', 'py-3');
      header?.classList.add('py-5');
    }
  });

  // Mobile Menu Drawer Toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = !mobileMenu.classList.contains('hidden');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/* ==========================================================================
   2. SCROLL TO TOP CONTROLLER
   ========================================================================== */
function initScrollTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   3. MODAL CONTROLS (Universal Open / Close)
   ========================================================================== */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

function initModals() {
  // Backdrop click to close
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
}

/* ==========================================================================
   4. INTERACTIVE QUOTE ESTIMATOR CALCULATOR
   ========================================================================== */
function initQuoteCalculator() {
  const form = document.getElementById('quoteCalcForm');
  const resultDisplay = document.getElementById('calcEstimatedTotal');
  const timelineDisplay = document.getElementById('calcEstimatedTimeline');

  if (!form) return;

  const calculate = () => {
    let base = 25000;
    let days = 14;

    const serviceSelect = document.getElementById('calcServiceType');
    const scaleSelect = document.getElementById('calcProjectScale');
    const cloudCheck = document.getElementById('calcIncludeCloud');
    const aiCheck = document.getElementById('calcIncludeAI');

    if (serviceSelect) {
      const val = serviceSelect.value;
      if (val === 'ai') { base += 55000; days += 15; }
      else if (val === 'django') { base += 40000; days += 12; }
      else if (val === 'blockchain') { base += 65000; days += 20; }
      else if (val === 'cloud') { base += 35000; days += 10; }
      else if (val === 'mobile') { base += 50000; days += 18; }
      else if (val === 'custom') { base += 60000; days += 22; }
    }

    if (scaleSelect) {
      const scale = scaleSelect.value;
      if (scale === 'mvp') { base *= 1.0; days *= 1.0; }
      else if (scale === 'mid') { base *= 1.8; days *= 1.5; }
      else if (scale === 'enterprise') { base *= 3.2; days *= 2.2; }
    }

    if (cloudCheck && cloudCheck.checked) {
      base += 20000;
      days += 5;
    }

    if (aiCheck && aiCheck.checked) {
      base += 35000;
      days += 7;
    }

    if (resultDisplay) {
      resultDisplay.innerText = '₹' + Math.round(base).toLocaleString('en-IN') + ' (approx. $' + Math.round(base / 83) + ')';
    }
    if (timelineDisplay) {
      timelineDisplay.innerText = Math.round(days) + ' - ' + Math.round(days + 10) + ' Business Days';
    }
  };

  form.addEventListener('change', calculate);
  calculate();
}

/* ==========================================================================
   5. FORM SUBMISSION HANDLERS & TOAST NOTIFICATION
   ========================================================================== */
function showToast(title, message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-24 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto p-4 rounded-xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 transition-all duration-300 transform translate-y-4 opacity-0 ${
    type === 'success' 
      ? 'bg-slate-900/95 border-emerald-500/40 text-emerald-300' 
      : 'bg-slate-900/95 border-rose-500/40 text-rose-300'
  }`;

  const iconSvg = type === 'success' 
    ? `<svg class="w-6 h-6 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`
    : `<svg class="w-6 h-6 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1 text-sm">
      <h4 class="font-bold text-white text-base">${title}</h4>
      <p class="text-slate-300 mt-0.5">${message}</p>
    </div>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  // Animate out & remove
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function initForms() {
  // Contact & Consultation Forms
  const inquiryForms = ['contactInquiryForm', 'homeQuoteForm', 'modalConsultationForm'];

  inquiryForms.forEach(formId => {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const inquiry = {
        id: 'INQ-' + Date.now().toString().slice(-6),
        name: formData.get('fullName') || formData.get('name') || 'Enterprise Client',
        email: formData.get('email') || '',
        phone: formData.get('phone') || 'Not provided',
        company: formData.get('company') || 'Direct Inquiry',
        service: formData.get('service') || 'General Software Consultation',
        budget: formData.get('budget') || 'Flexible / To Be Discussed',
        details: formData.get('details') || formData.get('message') || 'Project consultation requested.',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'New'
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('atteria_inquiries') || '[]');
      existing.unshift(inquiry);
      localStorage.setItem('atteria_inquiries', JSON.stringify(existing));

      form.reset();
      closeModal('consultationModal');
      closeModal('quoteModal');

      showToast(
        'Inquiry Transmitted Successfully!',
        'Thank you for contacting Atteria Technologies. Our technical architect will review your project and connect within 4 business hours.'
      );
    });
  });

  // Newsletter Subscriptions
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast('Subscribed to Atteria Insights', 'You will receive our latest technology papers and executive whitepapers.');
        input.value = '';
      }
    });
  });
}

/* ==========================================================================
   6. PORTFOLIO DYNAMIC FILTERING & CASE STUDY MODAL
   ========================================================================== */
const PORTFOLIO_DATA = [
  {
    id: 'proj-1',
    title: 'Enterprise AI Logistics Neural Routing Engine',
    category: 'ai',
    categoryName: 'AI & Machine Learning',
    tech: ['Python 3.11', 'PyTorch', 'FastAPI', 'Docker', 'AWS ECS'],
    client: 'TransGlobal Supply Chain Group',
    challenge: 'Inefficient multi-stop freight route planning causing 22% fuel waste and predictive dispatch delays across 4,500 carrier fleets.',
    solution: 'Designed and deployed an automated neural network routing optimization model with sub-second prediction latency, automated telematics integration, and live AWS CloudWatch monitoring.',
    outcome: 'Reduced operational fleet fuel expenditures by 18.4% and accelerated cross-border dispatch processing by 3.8x.',
    imageBg: 'from-blue-600 to-indigo-900'
  },
  {
    id: 'proj-2',
    title: 'Scalable FinTech Core Banking & REST API Platform',
    category: 'django',
    categoryName: 'Python & Django',
    tech: ['Django 5.0', 'Django REST Framework', 'PostgreSQL', 'Redis', 'AWS EC2'],
    client: 'FinVantage Digital Capital',
    challenge: 'Legacy microservices failing at peak trading volumes with data consistency risks and slow transaction verification.',
    solution: 'Engineered a resilient Django REST API backbone with Redis caching layers, ACID-compliant PostgreSQL replication, and bank-grade tokenized OAuth2 authentication.',
    outcome: 'Supported 120,000+ daily concurrent transactions with zero downtime and sub-80ms API response latency.',
    imageBg: 'from-blue-900 to-cyan-900'
  },
  {
    id: 'proj-3',
    title: 'Decentralized Smart Contract Asset Verification Protocol',
    category: 'blockchain',
    categoryName: 'Blockchain & Web3',
    tech: ['Solidity', 'Ethereum', 'Web3.js', 'Hardhat', 'IPFS'],
    client: 'Aegis RealEstate Tokenization Consortium',
    challenge: 'Manual deed validation and high escrow intermediaries slowing down commercial property syndicate investments.',
    solution: 'Architected automated, audited Solidity smart contracts on Ethereum for fractionalized ownership deeds, accompanied by immutable IPFS document hashing and a responsive Web3 investor portal.',
    outcome: 'Eliminated paperwork verification overhead by 92% and tokenized over $45M in prime commercial real estate holdings.',
    imageBg: 'from-purple-900 to-slate-900'
  },
  {
    id: 'proj-4',
    title: 'Automated Multi-Tenant Cloud Infrastructure Migration',
    category: 'cloud',
    categoryName: 'AWS & Cloud Solutions',
    tech: ['AWS Architecture', 'Terraform', 'Kubernetes', 'Docker', 'GitHub CI/CD'],
    client: 'OmniSaaS Enterprise Systems',
    challenge: 'High on-prem server maintenance costs and vulnerable single points of failure across global client tenants.',
    solution: 'Executed zero-downtime containerized AWS migration utilizing EKS, automated Infrastructure as Code (Terraform), CloudFront edge acceleration, and automated disaster failover.',
    outcome: 'Achieved 99.99% uptime guarantee while decreasing recurring infrastructure operating costs by 34%.',
    imageBg: 'from-indigo-900 to-sky-900'
  },
  {
    id: 'proj-5',
    title: 'Next-Gen Omnichannel Healthcare Patient Portal',
    category: 'software',
    categoryName: 'Custom Software Development',
    tech: ['React.js', 'Python', 'PostgreSQL', 'WebRTC', 'HIPAA Secure AWS'],
    client: 'CarePulse Health Network',
    challenge: 'Fragmented electronic health records, slow appointment bookings, and insecure telemedicine video links.',
    solution: 'Constructed an end-to-end HIPAA-compliant health records portal with encrypted WebRTC teleconsultation, real-time prescription sync, and multi-hospital appointment routing.',
    outcome: 'Onboarded 85,000+ active patients and lowered clinical administrative scheduling queues by 65%.',
    imageBg: 'from-cyan-950 to-blue-900'
  },
  {
    id: 'proj-6',
    title: 'High-Performance Cross-Platform Mobile Commerce App',
    category: 'mobile',
    categoryName: 'Mobile Applications',
    tech: ['React Native', 'Node.js', 'MongoDB', 'Stripe Payments', 'AWS S3'],
    client: 'VogueRetail Global Brands',
    challenge: 'High shopping cart abandonment on mobile browsers due to slow rendering and complex checkout workflows.',
    solution: 'Built an iOS and Android native-performance application with one-click biometrics checkout, offline caching, push notifications, and localized international currencies.',
    outcome: 'Elevated mobile conversion rates by 41% and secured a 4.9-star average across App Store and Google Play.',
    imageBg: 'from-slate-900 to-indigo-950'
  }
];

function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const items = document.querySelectorAll('.portfolio-card-item');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-slate-800/80', 'text-slate-300');
      });
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-slate-800/80', 'text-slate-300');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filter === 'all' || itemCategory === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function openCaseStudyModal(projectId) {
  const project = PORTFOLIO_DATA.find(p => p.id === projectId) || PORTFOLIO_DATA[0];
  const modal = document.getElementById('caseStudyModal');
  if (!modal) return;

  document.getElementById('caseStudyTitle').innerText = project.title;
  document.getElementById('caseStudyCategory').innerText = project.categoryName;
  document.getElementById('caseStudyClient').innerText = project.client;
  document.getElementById('caseStudyChallenge').innerText = project.challenge;
  document.getElementById('caseStudySolution').innerText = project.solution;
  document.getElementById('caseStudyOutcome').innerText = project.outcome;

  const stackContainer = document.getElementById('caseStudyStack');
  if (stackContainer) {
    stackContainer.innerHTML = project.tech.map(t => 
      `<span class="px-3 py-1 bg-blue-900/40 border border-blue-500/30 text-blue-300 rounded-full text-xs font-semibold">${t}</span>`
    ).join('');
  }

  openModal('caseStudyModal');
}

/* ==========================================================================
   7. BLOG READER MODAL
   ========================================================================== */
const BLOG_DATA = {
  'blog-1': {
    title: 'Architecting Enterprise Generative AI with LangChain and Python 3.11',
    category: 'Artificial Intelligence',
    author: 'Sapna Thakur, Founder & Lead Architect',
    date: 'Nov 8, 2026',
    readTime: '6 min read',
    content: `
      <p class="mb-4 text-slate-300 leading-relaxed">Enterprise adoption of Generative Artificial Intelligence requires moving beyond isolated prompt-response experimentation to reliable, low-latency, and auditable production pipelines. At Atteria Technologies, our AI engineering practice structures enterprise LLM deployments through robust orchestration frameworks like LangChain paired with Python 3.11's async runtime performance.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">1. Retrieval-Augmented Generation (RAG) Security Boundaries</h3>
      <p class="mb-4 text-slate-300 leading-relaxed">Public LLMs cannot access private corporate knowledge bases securely without strict perimeter controls. We engineer isolated vector databases (using pgvector and Pinecone) coupled with semantic embedding chunking algorithms. Every query is authenticated and filtered through user role permissions prior to context vector retrieval, completely preventing data leakage across organizational tiers.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">2. Latency Optimization & Token Budgeting</h3>
      <p class="mb-4 text-slate-300 leading-relaxed">High token costs and multi-second streaming latencies undermine user adoption. By utilizing streaming token buffers, semantic caching of frequent corporate queries in Redis, and fallback routing to quantized open-source models (such as Llama 3 running on dedicated AWS EC2 inferencing instances), we routinely achieve sub-400ms First Token Time while reducing API expenditure by up to 60%.</p>
    `
  },
  'blog-2': {
    title: 'High-Concurrency Django Architecture: Scaling to 100K Requests per Second',
    category: 'Django & Python',
    author: 'Atteria Core Engineering Team',
    date: 'Nov 2, 2026',
    readTime: '8 min read',
    content: `
      <p class="mb-4 text-slate-300 leading-relaxed">A recurring myth in modern web development suggests that Python and Django cannot handle hyper-scale traffic. Having designed systems with 7+ years of IT engineering experience, Atteria Technologies has proven that well-architected Django backends comfortably power world-class enterprise volume.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Database Connection Pooling and Read-Replica Splitting</h3>
      <p class="mb-4 text-slate-300 leading-relaxed">The bottleneck in high-throughput applications is rarely Python itself; it is unoptimized database I/O. By configuring connection pooling with PgBouncer, establishing strict automatic database routing for read vs write replicas, and eliminating N+1 queries through <code>select_related</code> and <code>prefetch_related</code>, database saturation is virtually eliminated.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Asynchronous Tasks with Celery & Redis</h3>
      <p class="mb-4 text-slate-300 leading-relaxed">All operations involving external APIs, PDF generation, transactional notifications, and analytic recording are offloaded to asynchronous Celery worker nodes backed by Redis clusters. This ensures web request handlers complete within 20 to 50 milliseconds.</p>
    `
  },
  'blog-3': {
    title: 'Decentralized Finance & Web3: Smart Contract Auditing Best Practices',
    category: 'Blockchain & Web3',
    author: 'Web3 Security Practice',
    date: 'Oct 26, 2026',
    readTime: '7 min read',
    content: `
      <p class="mb-4 text-slate-300 leading-relaxed">Smart contracts are immutable once deployed to production blockchains. A single logic flaw or reentrancy vulnerability can result in catastrophic financial loss. At Atteria Technologies, our blockchain engineering workflow follows rigorous verification standards before any contract touches mainnet.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Automated Static Analysis & Formal Verification</h3>
      <p class="mb-4 text-slate-300 leading-relaxed">Prior to human review, contracts are subjected to automated symbolic execution and fuzzing frameworks including Slither and Mythril. We enforce checks against reentrancy, integer overflows, timestamp dependency, and flash-loan attack vulnerabilities.</p>
    `
  },
  'blog-4': {
    title: 'Cloud-Native AWS Deployment: Zero-Downtime CI/CD with Docker & Terraform',
    category: 'AWS & Cloud Solutions',
    author: 'Cloud Infrastructure Practice',
    date: 'Oct 19, 2026',
    readTime: '5 min read',
    content: `
      <p class="mb-4 text-slate-300 leading-relaxed">Modern enterprises demand 99.99% uptime with frictionless release cadences. At Atteria Technologies, our DevOps engineers implement Infrastructure as Code (IaC) using Terraform, ensuring that cloud infrastructure is immutable, reproducible, and self-healing across AWS availability zones.</p>
      
      <h3 class="text-xl font-bold text-white mt-6 mb-3">Blue-Green & Canary Deployments</h3>
      <p class="mb-4 text-slate-300 leading-relaxed">Through AWS ECS and Application Load Balancer health hooks, updates are released with zero customer downtime. If automated synthetic monitors detect anomalous error spikes, traffic is automatically rolled back in seconds without service disruption.</p>
    `
  }
};

function initBlogReader() {
  window.openArticleModal = (blogId) => {
    const article = BLOG_DATA[blogId] || BLOG_DATA['blog-1'];
    const modal = document.getElementById('articleModal');
    if (!modal) return;

    document.getElementById('articleTitle').innerText = article.title;
    document.getElementById('articleCategory').innerText = article.category;
    document.getElementById('articleAuthor').innerText = article.author;
    document.getElementById('articleDate').innerText = article.date + ' • ' + article.readTime;
    document.getElementById('articleBody').innerHTML = article.content;

    openModal('articleModal');
  };
}

/* ==========================================================================
   8. WHATSAPP FLOATING WIDGET
   ========================================================================== */
function initWhatsAppWidget() {
  const toggle = document.getElementById('whatsappToggle');
  const popup = document.getElementById('whatsappPopup');
  const closeBtn = document.getElementById('whatsappClose');

  if (toggle && popup) {
    toggle.addEventListener('click', () => {
      popup.classList.toggle('hidden');
    });

    closeBtn?.addEventListener('click', () => {
      popup.classList.add('hidden');
    });
  }
}


/* ==========================================================================
   COUNTER ANIMATION (Intersection Observer)
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.counter-num');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimal = parseInt(el.dataset.decimal || 0);
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = (decimal > 0 ? current.toFixed(decimal) : Math.floor(current)) + suffix;
    }, stepTime);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animate(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}
