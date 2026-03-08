// ===== Main Application Logic =====
const cursorRing = document.querySelector('.cursor-ring');
const cursorDot = document.querySelector('.cursor-dot');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
});

function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

// Cursor interactions
const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card, .achievement-badge');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.style.width = '48px';
        cursorRing.style.height = '48px';
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '32px';
        cursorRing.style.height = '32px';
    });
});

// Typing Animation
const texts = ['Web Developer', 'DSA with C++', 'Tech Digger', 'Problem Solver', 'Open Source Contributor'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedTextElement = document.getElementById('typed-text');

function typeText() {
    const currentText = texts[textIndex];

    if (isDeleting) {
        typedTextElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedTextElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => isDeleting = true, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
    }

    const speed = isDeleting ? 50 : 100;
    setTimeout(typeText, speed);
}

setTimeout(typeText, 1000);

// XP Bar Animation
window.addEventListener('load', () => {
    setTimeout(() => {
        const xpBar = document.getElementById('xp-bar');
        let currentXP = 0;
        const targetXP = 3420;
        const maxXP = 5000;
        const duration = 2000;
        const steps = 60;
        const increment = targetXP / steps;
        const stepDuration = duration / steps;

        const interval = setInterval(() => {
            currentXP += increment;
            if (currentXP >= targetXP) {
                currentXP = targetXP;
                clearInterval(interval);
            }
            document.getElementById('current-xp').textContent = Math.floor(currentXP);
        }, stepDuration);
    }, 500);
});

// Scroll Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target); // animate once, then stop observing
        }
    });
}, observerOptions);

// Animate quest cards on scroll (replaces old .experience-item)
document.querySelectorAll('.quest-card-wrapper').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
    observer.observe(item);
});

// Also animate achievement badges
document.querySelectorAll('.achievement-badge').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`;
    observer.observe(item);
});

// Skill Bar Animation
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bars = entry.target.querySelectorAll('.bar-fill');
            bars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                if (targetWidth) {
                    bar.style.width = targetWidth;
                }
            });
            // Only animate once
            skillObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-card').forEach((card) => {
    skillObserver.observe(card);
});

// Mobile Menu
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Project Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach(b => {
            b.classList.remove('bg-yellow-400', 'text-black');
            b.classList.add('bg-neutral-800', 'text-neutral-400');
        });
        btn.classList.remove('bg-neutral-800', 'text-neutral-400');
        btn.classList.add('bg-yellow-400', 'text-black');

        projectCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Terminal
const terminalToggle = document.getElementById('terminal-toggle');
const terminal = document.getElementById('terminal');
const terminalContent = document.getElementById('terminal-content');
const terminalInput = document.getElementById('terminal-input');
const red = document.getElementById('terminal1');
const yellow = document.getElementById('terminal2');
const green = document.getElementById('terminal3');
let isTerminalMinimized = false;


red.addEventListener('click', () => {
    terminal.style.display = 'none';
});
yellow.addEventListener('click', () => {
    isTerminalMinimized = !isTerminalMinimized;
    terminal.classList.toggle('minimized');
});



terminalToggle.addEventListener('click', () => {
    isTerminalMinimized = !isTerminalMinimized;
    terminal.classList.toggle('minimized');
});

const commands = {
    help: `Available commands:
  help      - Show this help message
  about     - Display information about me
  skills    - List all my skills
  contact   - Show contact information
  projects  - List my projects
  clear     - Clear the terminal
  coffee    - Refill XP bar ☕`,
    about: `Vaibhav Ghoshi - Web Developer & DSA Enthusiast
Tech Stack: C++, JavaScript, HTML, CSS, Node.js, React, Tailwind
Passion: Building innovative web applications and solving DSA problems
Tagline: engineered for engineering 👨‍🔧
Fun Fact: Daily DSA practice keeps the bugs away 🐛`,
    skills: `🟢 Expert: C++, JavaScript, HTML5, CSS3
🟡 Advanced: Node.js, React, Tailwind CSS, Bootstrap
🟠 Intermediate: MongoDB, Supabase, EJS, Git`,
    contact: `📧 Email: vaibhav7290119@gmail.com
🐙 GitHub: github.com/Classyvaibhav06
💼 LinkedIn: linkedin.com/in/vaibhav-ghoshi
📷 Instagram: @vaibhav.ghoshi
📝 Medium: @vaibhavghoshi
🎥 YouTube: @code_jaibabba`,
    projects: `Featured Projects:
1. Flying Modi Game - Trending game recreation (⭐ 2)
2. DSA with C++ - Daily DSA practice repo (⭐ 2)
3. Notification Popup - Modern UI component (⭐ 1)
4. Git Project Tools - Developer utilities (⭐ 1)
5. Web Development Projects - ST2, ST3 (⭐ 1 each)
Total: 18 repositories on GitHub`,
    clear: 'CLEAR',
    coffee: 'COFFEE'
};

function addTerminalLine(text, className = '') {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    terminalContent.appendChild(line);
    terminalContent.scrollTop = terminalContent.scrollHeight;
}

terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = terminalInput.value.trim().toLowerCase();

        addTerminalLine(`$ ${terminalInput.value}`, 'text-yellow-400 mb-2');

        if (command === 'clear') {
            terminalContent.innerHTML = '';
        } else if (command === 'coffee') {
            addTerminalLine('☕ Refilling XP bar...', 'text-green-400');
            const xpBar = document.getElementById('xp-bar');
            xpBar.style.width = '100%';
            document.getElementById('current-xp').textContent = '5000';
            setTimeout(() => {
                xpBar.style.width = '68%';
                document.getElementById('current-xp').textContent = '3420';
            }, 2000);
        } else if (commands[command]) {
            addTerminalLine(commands[command], 'text-neutral-300 mb-4 whitespace-pre-line');
        } else if (command) {
            addTerminalLine(`Command not found: ${command}. Type 'help' for available commands.`, 'text-red-400 mb-4');
        }

        terminalInput.value = '';
    }
});

// Smooth scroll with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const recaptchaResponse = grecaptcha.getResponse();

    if (!recaptchaResponse) {
        formStatus.classList.remove('hidden');
        formStatus.textContent = 'Please complete the reCAPTCHA.';
        formStatus.classList.add('text-red-400');
        return;
    }

    const formData = { name, email, subject, message, 'g-recaptcha-response': recaptchaResponse };

    formStatus.classList.remove('hidden');
    formStatus.textContent = 'Sending...';
    formStatus.classList.remove('text-green-400', 'text-red-400');

    fetch('https://portfolio-xs63.onrender.com/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                formStatus.textContent = 'Message sent successfully!';
                formStatus.classList.add('text-green-400');
                contactForm.reset();
                grecaptcha.reset();
            } else {
                formStatus.textContent = data.msg || 'Something went wrong. Please try again.';
                formStatus.classList.add('text-red-400');
            }
        })
        .catch(err => {
            formStatus.textContent = 'An error occurred. Please try again later.';
            formStatus.classList.add('text-red-400');
            console.error('Error:', err);
        });
});

// ===== Download CV =====
// Download CV
document.getElementById('download-cv-btn').addEventListener('click', function () {
    // Create a temporary anchor element
    var link = document.createElement('a');
    link.href = 'resume (1).pdf';
    link.download = 'Vaibhav-Ghoshi-Resume.pdf';

    // Append the anchor to the body
    document.body.appendChild(link);

    // Programmatically click the anchor
    link.click();

    // Remove the anchor from the body
    document.body.removeChild(link);
});

// ===== RAG Chatbot =====
const chatWindow = document.getElementById('chat-window');
const chatToggle = document.getElementById('chat-toggle');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');

// Define backend URL for dev and production
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : 'https://portfolio-xs63.onrender.com';

let isOpen = false;

function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
        chatWindow.style.display = 'flex';
        chatWindow.classList.remove('hidden');
        setTimeout(() => chatInput.focus(), 100);
        chatToggle.querySelector('.bg-red-500')?.remove();
    } else {
        chatWindow.style.display = 'none';
        chatWindow.classList.add('hidden');
    }
}

chatToggle.addEventListener('click', toggleChat);
closeChat.addEventListener('click', toggleChat);

function appendMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3 rounded-lg max-w-[85%] ${isUser ? 'self-end rounded-tr-none' : 'self-start rounded-tl-none'} whitespace-pre-wrap text-sm`;
    msgDiv.style.background = isUser ? 'rgba(250, 204, 21, 0.85)' : 'rgba(38, 38, 38, 0.7)';
    msgDiv.style.color = isUser ? '#000' : '#facc15';
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Optimistic UI update
    appendMessage(text, true);
    chatInput.value = '';

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bg-neutral-800 text-yellow-400 p-3 rounded-lg rounded-tl-none self-start max-w-[85%] animate-pulse';
    typingDiv.textContent = "Thinking...";
    typingDiv.id = "typing-indicator";
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        // Actually if your current backend is locally running on port 5000 we use that. 
        // We'll try the backend chat route.
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        // Remove typing indicator
        document.getElementById('typing-indicator')?.remove();

        if (data.reply) {
            appendMessage(data.reply);
        } else {
            appendMessage("Sorry, I received an empty response. Try again.");
        }
    } catch (err) {
        document.getElementById('typing-indicator')?.remove();
        appendMessage("Failed to connect to the backend. Make sure the RAG server is running!");
        console.error(err);
    }
}

sendChat.addEventListener('click', handleSend);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});

// ===== Shooting Stars Animation Engine =====
(function () {
    const NS = 'http://www.w3.org/2000/svg';
    const heroSection = document.getElementById('hero');

    // Cache hero dimensions, update on resize
    let heroW = heroSection ? heroSection.offsetWidth : window.innerWidth;
    let heroH = heroSection ? heroSection.offsetHeight : window.innerHeight;
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            heroW = heroSection ? heroSection.offsetWidth : window.innerWidth;
            heroH = heroSection ? heroSection.offsetHeight : window.innerHeight;
        }, 200);
    });

    function getRandomStartPoint() {
        const side = Math.floor(Math.random() * 4);
        const offset = Math.random() * Math.max(heroW, heroH);
        switch (side) {
            case 0: return { x: offset, y: 0, angle: 45 };
            case 1: return { x: heroW, y: offset, angle: 135 };
            case 2: return { x: offset, y: heroH, angle: 225 };
            case 3: return { x: 0, y: offset, angle: 315 };
            default: return { x: 0, y: 0, angle: 45 };
        }
    }

    // All layers managed by a single animation loop
    const layers = [];

    class ShootingStarLayer {
        constructor(svgId, gradientId, options = {}) {
            this.svg = document.getElementById(svgId);
            this.gradientId = gradientId;
            this.minSpeed = options.minSpeed || 10;
            this.maxSpeed = options.maxSpeed || 30;
            this.minDelay = options.minDelay || 1200;
            this.maxDelay = options.maxDelay || 4200;
            this.starWidth = options.starWidth || 10;
            this.starHeight = options.starHeight || 1;
            this.star = null;
            this.rect = null;
            this.waiting = false;
            this.spawnStar();
        }

        spawnStar() {
            this.waiting = false;
            const { x, y, angle } = getRandomStartPoint();
            this.star = {
                x, y, angle,
                scale: 1,
                speed: Math.random() * (this.maxSpeed - this.minSpeed) + this.minSpeed,
                distance: 0
            };
            if (this.rect && this.rect.parentNode) this.rect.parentNode.removeChild(this.rect);
            this.rect = document.createElementNS(NS, 'rect');
            this.rect.setAttribute('fill', `url(#${this.gradientId})`);
            this.svg.appendChild(this.rect);
            this.updateRect();
        }

        updateRect() {
            if (!this.rect || !this.star) return;
            const s = this.star;
            const w = this.starWidth * s.scale;
            this.rect.setAttribute('x', s.x);
            this.rect.setAttribute('y', s.y);
            this.rect.setAttribute('width', w);
            this.rect.setAttribute('height', this.starHeight);
            this.rect.setAttribute('transform',
                `rotate(${s.angle}, ${s.x + w / 2}, ${s.y + this.starHeight / 2})`);
        }

        tick() {
            if (!this.star || this.waiting) return;
            const s = this.star;
            s.x += s.speed * Math.cos((s.angle * Math.PI) / 180);
            s.y += s.speed * Math.sin((s.angle * Math.PI) / 180);
            s.distance += s.speed;
            s.scale = 1 + s.distance / 100;

            if (s.x < -20 || s.x > heroW + 20 || s.y < -20 || s.y > heroH + 20) {
                if (this.rect && this.rect.parentNode) this.rect.parentNode.removeChild(this.rect);
                this.star = null;
                this.rect = null;
                this.waiting = true;
                const delay = Math.random() * (this.maxDelay - this.minDelay) + this.minDelay;
                setTimeout(() => this.spawnStar(), delay);
                return;
            }
            this.updateRect();
        }
    }

    // Create layers
    layers.push(new ShootingStarLayer('shooting-svg-1', 'star-grad-1', {
        minSpeed: 15, maxSpeed: 35, minDelay: 1000, maxDelay: 3000
    }));
    layers.push(new ShootingStarLayer('shooting-svg-2', 'star-grad-2', {
        minSpeed: 10, maxSpeed: 25, minDelay: 2000, maxDelay: 4000
    }));
    layers.push(new ShootingStarLayer('shooting-svg-3', 'star-grad-3', {
        minSpeed: 20, maxSpeed: 40, minDelay: 1500, maxDelay: 3500
    }));

    // Single rAF loop for all layers — only runs when hero is visible
    let heroVisible = true;
    const heroObserver = new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
    }, { threshold: 0 });
    if (heroSection) heroObserver.observe(heroSection);

    function animateAllStars() {
        if (heroVisible) {
            for (let i = 0; i < layers.length; i++) layers[i].tick();
        }
        requestAnimationFrame(animateAllStars);
    }
    requestAnimationFrame(animateAllStars);
})();