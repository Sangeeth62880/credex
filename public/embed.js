(function() {
  const container = document.querySelector('[data-credex-audit]');
  if (!container) return;

  const width = container.getAttribute('data-width') || '100%';
  const height = container.getAttribute('data-height') || '400px';
  const theme = container.getAttribute('data-theme') || 'dark';

  const iframe = document.createElement('iframe');
  iframe.src = 'https://audit.credex.rocks/embed/audit';
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  iframe.style.overflow = 'hidden';
  iframe.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
  
  container.appendChild(iframe);
})();
