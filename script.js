/* ========================================
   INTENSE FITNESS STUDIO - JavaScript
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
  // === Theme Toggle (Dark/Light Mode) ===
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // === Preloader ===
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("hidden"), 800);
  });
  // Fallback: hide preloader after 3s
  setTimeout(() => preloader.classList.add("hidden"), 3000);

  // === Navbar Scroll Effect ===
  const navbar = document.getElementById("navbar");
  const backToTop = document.getElementById("backToTop");
  const sections = document.querySelectorAll("section[id]");

  function handleScroll() {
    const scrollY = window.scrollY;

    // Navbar background
    navbar.classList.toggle("scrolled", scrollY > 50);

    // Back to top button
    backToTop.classList.toggle("visible", scrollY > 500);

    // Active nav link
    sections.forEach((section) => {
      const top = section.offsetTop - 150;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle(
          "active",
          scrollY >= top && scrollY < top + height,
        );
      }
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  // Back to top click
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // === Mobile Menu ===
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    document.body.style.overflow = navLinks.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu on link click
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // === Smooth Scroll for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight;
        const position = target.offsetTop - offset;
        window.scrollTo({ top: position, behavior: "smooth" });
      }
    });
  });

  // === Counter Animation ===
  function animateCounters() {
    const counters = document.querySelectorAll(".stat-number[data-target]");
    counters.forEach((counter) => {
      if (counter.dataset.animated) return;

      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        counter.textContent = Math.floor(eased * target);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target;
        }
      }

      counter.dataset.animated = "true";
      requestAnimationFrame(update);
    });
  }

  // === AOS (Animate On Scroll) Custom Implementation ===
  function initAOS() {
    const elements = document.querySelectorAll("[data-aos]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.aosDelay) || 0;
            setTimeout(() => {
              entry.target.classList.add("aos-animate");
            }, delay);

            // Trigger counters when hero stats come into view
            if (
              entry.target.closest(".hero-stats") ||
              entry.target.classList.contains("hero-stats")
            ) {
              animateCounters();
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    elements.forEach((el) => observer.observe(el));
  }

  initAOS();

  // Also observe hero-stats directly for counter animation
  const heroStats = document.querySelector(".hero-stats");
  if (heroStats) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    statsObserver.observe(heroStats);
  }

  // === Schedule Tabs ===
  const scheduleTabs = document.querySelectorAll(".schedule-tab");
  const scheduleDays = document.querySelectorAll(".schedule-day");

  scheduleTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const day = tab.dataset.day;

      scheduleTabs.forEach((t) => t.classList.remove("active"));
      scheduleDays.forEach((d) => d.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(day).classList.add("active");
    });
  });

  // === Testimonials Slider ===
  const track = document.getElementById("testimonialTrack");
  const cards = track ? track.querySelectorAll(".testimonial-card") : [];
  const dotsContainer = document.getElementById("testimonialDots");
  const prevBtn = document.getElementById("prevTestimonial");
  const nextBtn = document.getElementById("nextTestimonial");
  let currentSlide = 0;
  let autoSlideInterval;

  function initTestimonials() {
    if (!track || cards.length === 0) return;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.classList.add("testimonial-dot");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    // Button events
    prevBtn.addEventListener("click", () => {
      goToSlide(currentSlide === 0 ? cards.length - 1 : currentSlide - 1);
    });

    nextBtn.addEventListener("click", () => {
      goToSlide(currentSlide === cards.length - 1 ? 0 : currentSlide + 1);
    });

    // Auto slide
    startAutoSlide();

    // Pause on hover
    track
      .closest(".testimonials-slider")
      .addEventListener("mouseenter", stopAutoSlide);
    track
      .closest(".testimonials-slider")
      .addEventListener("mouseleave", startAutoSlide);
  }

  function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;

    const dots = dotsContainer.querySelectorAll(".testimonial-dot");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
      goToSlide(currentSlide === cards.length - 1 ? 0 : currentSlide + 1);
    }, 5000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  initTestimonials();

  // === BMI Calculator ===
  const bmiForm = document.getElementById("bmiForm");
  if (bmiForm) {
    bmiForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const height =
        parseFloat(document.getElementById("bmiHeight").value) / 100;
      const weight = parseFloat(document.getElementById("bmiWeight").value);

      if (height <= 0 || weight <= 0 || isNaN(height) || isNaN(weight)) return;

      const bmi = (weight / (height * height)).toFixed(1);
      const resultDiv = document.getElementById("bmiResult");
      const valueDiv = document.getElementById("bmiValue");
      const categoryDiv = document.getElementById("bmiCategory");
      const barFill = document.getElementById("bmiBarFill");

      let category, color, percentage;

      if (bmi < 18.5) {
        category = "Underweight";
        color = "#2196f3";
        percentage = (bmi / 40) * 100;
      } else if (bmi < 25) {
        category = "Normal Weight";
        color = "#00c853";
        percentage = (bmi / 40) * 100;
      } else if (bmi < 30) {
        category = "Overweight";
        color = "#ffc107";
        percentage = (bmi / 40) * 100;
      } else {
        category = "Obese";
        color = "#ff4d00";
        percentage = Math.min((bmi / 40) * 100, 100);
      }

      valueDiv.textContent = bmi;
      categoryDiv.textContent = category;
      categoryDiv.style.color = color;
      barFill.style.width = percentage + "%";
      barFill.style.background = color;
      resultDiv.style.display = "block";
    });
  }

  // === Contact Form ===
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic client-side validation is handled by HTML required attributes
      const formData = new FormData(contactForm);

      // Show success message (in production, this would send to a server)
      const successDiv = document.getElementById("formSuccess");
      successDiv.style.display = "block";
      contactForm.reset();

      setTimeout(() => {
        successDiv.style.display = "none";
      }, 5000);
    });
  }

  // === Newsletter Form ===
  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector("input");
      if (input.value) {
        input.value = "";
        // In production, send to server
        alert("Thank you for subscribing!");
      }
    });
  }

  // === Hero Particle Effect ===
  function createParticles() {
    const container = document.getElementById("heroParticles");
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(255, 245, 104, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
      container.appendChild(particle);
    }

    // Add floating animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes float {
                0% { transform: translateY(0) translateX(0); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px); opacity: 0; }
            }
        `;
    document.head.appendChild(style);
  }

  createParticles();

  // === Parallax effect on hero (subtle) ===
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const heroBg = document.querySelector(".hero-bg");
          if (heroBg && scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );

  // === Tilt effect on program cards ===
  if (window.innerWidth > 768) {
    document.querySelectorAll(".program-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // === Keyboard accessibility for schedule tabs ===
  scheduleTabs.forEach((tab, index) => {
    tab.addEventListener("keydown", (e) => {
      let newIndex;
      if (e.key === "ArrowRight") {
        newIndex = (index + 1) % scheduleTabs.length;
      } else if (e.key === "ArrowLeft") {
        newIndex = (index - 1 + scheduleTabs.length) % scheduleTabs.length;
      }
      if (newIndex !== undefined) {
        scheduleTabs[newIndex].click();
        scheduleTabs[newIndex].focus();
      }
    });
  });

  // === Certificate Modal ===
  const certModal = document.getElementById("certModal");
  const certModalImg = document.getElementById("certModalImg");
  const certModalTitle = document.getElementById("certModalTitle");
  const certModalClose = document.getElementById("certModalClose");

  document.querySelectorAll(".btn-certification").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const certSrc = btn.getAttribute("data-cert");
      const trainerName = btn.getAttribute("data-name");
      certModalImg.src = certSrc;
      certModalTitle.textContent = trainerName + "'s Certification";
      certModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeCertModal() {
    certModal.classList.remove("active");
    document.body.style.overflow = "";
    certModalImg.src = "";
  }

  certModalClose.addEventListener("click", closeCertModal);

  certModal
    .querySelector(".cert-modal-overlay")
    .addEventListener("click", closeCertModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && certModal.classList.contains("active")) {
      closeCertModal();
    }
  });
});
