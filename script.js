
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = scrollPercent + '%';
    

    const header = document.querySelector('.header');
    if (header) {
        if (scrollTop > 100) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const progressFills = document.querySelectorAll('.progress-fill');
    
    const animateProgress = () => {
        progressFills.forEach(fill => {
            const rect = fill.getBoundingClientRect();
            const target = parseInt(fill.getAttribute('data-target'));
            
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const percentage = fill.parentElement.nextElementSibling;
                let currentWidth = parseInt(fill.style.width) || 0;
                
                
                if (currentWidth < target) {
                    let step = 0;
                    const interval = setInterval(() => {
                        step++;
                        currentWidth = Math.min(currentWidth + step, target);
                        fill.style.width = currentWidth + '%';
                        percentage.textContent = Math.round(currentWidth) + '%';
                        
                        if (currentWidth >= target) {
                            clearInterval(interval);
                        }
                    }, 10);
                }
            }
        });
    };
    
    window.addEventListener('scroll', animateProgress);
    animateProgress(); 
});

// Disable dragging and right-click on images to avoid opening/saving via click/drag
document.addEventListener('DOMContentLoaded', () => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
        try {
            img.setAttribute('draggable', 'false');
        } catch (e) {}
        img.addEventListener('dragstart', e => e.preventDefault());
        img.addEventListener('contextmenu', e => e.preventDefault());
        // additional touch/callout prevention for mobile
        img.style.webkitTouchCallout = 'none';
        img.style.userSelect = 'none';
    });
});


(function(){
    const buttons = document.querySelectorAll('.demo-open');
    const modal = document.getElementById('demo-modal');
    const frame = document.getElementById('demo-frame');
    const close = document.getElementById('demo-close');

    function open(url){
        if(!modal || !frame) return;
        frame.src = url;
        modal.setAttribute('aria-hidden','false');
    }
    function closeModal(){
        if(!modal || !frame) return;
        
        try { frame.src = 'about:blank'; } catch(e) { frame.src = ''; }
        modal.setAttribute('aria-hidden','true');
    }

    buttons.forEach(b=> b.addEventListener('click', (e)=>{
        const url = b.dataset.demoUrl || b.getAttribute('data-demo-url');
        if(url) open(url);
    }));

    if(close) close.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
    
    if(modal) modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
    
    
    window.addEventListener('message', (ev) => {
        if (!ev.data) return;
        if (ev.data.type === 'close-demo') closeModal();
    });
})();

// Theme toggle: remember preference in localStorage and update UI
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    const root = document.body;
    const saved = localStorage.getItem('theme');

    const moonSVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const sunSVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.03-2.03l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79zM17 13h6v-2h-6v2zM12 6a6 6 0 1 0 .001 12.001A6 6 0 0 0 12 6zm0-4h-2v3h2V2zM4.24 19.16l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79z"/></svg>';

    const apply = (mode) => {
        if (mode === 'dark') {
            root.classList.add('dark-theme');
            if (btn) btn.innerHTML = sunSVG;
        } else {
            root.classList.remove('dark-theme');
            if (btn) btn.innerHTML = moonSVG;
        }
    };

    if (saved === 'dark') apply('dark');
    else if (saved === 'light') apply('light');
    else {
        // default: follow prefers-color-scheme
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        apply(prefersDark ? 'dark' : 'light');
    }

    if (btn) {
        btn.addEventListener('click', () => {
            const isDark = root.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            btn.innerHTML = isDark ? sunSVG : moonSVG;
        });
    }
});

