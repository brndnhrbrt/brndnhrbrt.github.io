const portfolioData = {
  focusAreas: [
    {
      title: "Production delivery",
      description:
        "Leading delivery across multiple production modules with an emphasis on maintainability and reliable releases.",
    },
    {
      title: "AI workflows",
      description:
        "Hands-on implementation of Bedrock, RAG, MCP, and agent workflows for internal tooling and SDLC automation.",
    },
    {
      title: "Healthcare systems",
      description:
        "Building HIPAA-conscious applications and internal platforms for secure, healthcare-oriented environments.",
    },
    {
      title: "Full stack execution",
      description:
        "Working across frontend, backend, and internal tooling without losing sight of product quality or usability.",
    },
  ],
  skills: [
    {
      title: "Core stack",
      items: ["TypeScript", "JavaScript", "Node.js", "React", "Angular"],
    },
    {
      title: "AI & platform",
      items: ["AWS", "AWS Bedrock", "RAG", "MCP", "Agent Workflows"],
    },
    {
      title: "Delivery tooling",
      items: ["Jenkins", "Git", "Automation Tooling", "Internal Platforms"],
    },
  ],
  featuredProjects: [
    {
      name: "Image Steganography Web",
      status: "Interactive browser demo",
      description:
        "A live client-side app that hides text or files inside PNG images with no backend required.",
      tags: ["Browser App", "Client-side"],
      icon: "fas fa-image",
      ctaLabel: "Open live demo",
      ctaUrl: "./image-steganography-web-main/",
    },
    {
      name: "FZ Friend Finder",
      status: "Device communication app",
      description:
        "A Flipper Zero application for device discovery and peer communication over a shared protocol on embedded hardware.",
      tags: ["Embedded", "Protocol"],
      icon: "fas fa-satellite-dish",
      ctaLabel: "View on GitHub",
      ctaUrl: "https://github.com/bigbrodude6119/flipper-zero-friend-finder",
    },
    {
      name: "Evil Portal",
      status: "Captive portal app",
      description:
        "A device-connected networking project for building and customizing captive portal flows on constrained hardware.",
      tags: ["Networking", "Embedded"],
      icon: "fas fa-wifi",
      ctaLabel: "View on GitHub",
      ctaUrl: "https://github.com/bigbrodude6119/flipper-zero-evil-portal",
    },
  ],
  githubProfiles: [
    {
      name: "Main GitHub",
      url: "https://github.com/brndnhrbrt",
      icon: "fab fa-github",
    },
    {
      name: "Alt GitHub",
      url: "https://github.com/bigbrodude6119",
      icon: "fab fa-github",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/brndnhrbrt/",
      icon: "fab fa-linkedin-in",
    },
  ],
};

function renderFocusAreas() {
  const focusList = document.querySelector("#focus-list");

  portfolioData.focusAreas.forEach((area) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${area.title}</strong>${area.description}`;
    focusList.appendChild(item);
  });
}

function renderSkills() {
  const skillsContainer = document.querySelector("#skills-grid");

  portfolioData.skills.forEach((group) => {
    const card = document.createElement("article");
    card.className = "skill-card";

    card.innerHTML = `
      <h3>${group.title}</h3>
      <div class="skill-list">
        ${group.items.map((item) => `<span class="tag">${item}</span>`).join("")}
      </div>
    `;

    skillsContainer.appendChild(card);
  });
}

function renderFeaturedProjects() {
  const featuredContainer = document.querySelector("#featured-grid");

  portfolioData.featuredProjects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card featured-card";

    const externalAttrs = project.ctaUrl.startsWith("#")
      ? ""
      : 'target="_blank" rel="noreferrer"';

    card.innerHTML = `
      <div class="project-head">
        <div>
          <span class="project-icon"><i class="${project.icon}"></i></span>
        </div>
        <span class="project-status">${project.status}</span>
      </div>
      <div>
        <h3>${project.name}</h3>
        <p class="project-description">${project.description}</p>
      </div>
      <div class="project-tags">
        ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
      <div class="project-links">
        <a href="${project.ctaUrl}" class="project-link" ${externalAttrs}>
          <i class="fas fa-arrow-up-right-from-square"></i>
          ${project.ctaLabel}
        </a>
      </div>
    `;

    featuredContainer.appendChild(card);
  });
}

function renderGithubLinks() {
  const githubLinksContainer = document.querySelector(".github-links");

  portfolioData.githubProfiles.forEach((profile) => {
    const githubLink = document.createElement("a");
    githubLink.href = profile.url;
    githubLink.className = "github-link";
    githubLink.target = "_blank";
    githubLink.rel = "noreferrer";
    githubLink.innerHTML = `<i class="${profile.icon}"></i>${profile.name}`;

    githubLinksContainer.appendChild(githubLink);
  });
}

function setFooterYear() {
  document.querySelector("#footer-year").textContent = new Date().getFullYear();
}

function setupThemeToggle() {
  const toggle = document.querySelector("#theme-toggle");
  const label = toggle.querySelector(".theme-toggle-label");
  const icon = toggle.querySelector(".theme-toggle-icon i");
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
    label.textContent = isDark ? "Light mode" : "Dark mode";
    icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
  }

  const savedTheme = localStorage.getItem("portfolio-theme");
  const initialTheme =
    savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : mediaQuery.matches
        ? "dark"
        : "light";

  applyTheme(initialTheme);

  toggle.addEventListener("click", () => {
    const nextTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";

    applyTheme(nextTheme);
  });
}

function revealProjectCards() {
  const projectCards = document.querySelectorAll(".project-card, .featured-card");

  if (!("IntersectionObserver" in window)) {
    projectCards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  projectCards.forEach((card) => observer.observe(card));
}

document.addEventListener("DOMContentLoaded", () => {
  renderFocusAreas();
  renderSkills();
  renderFeaturedProjects();
  renderGithubLinks();
  setFooterYear();
  setupThemeToggle();
  revealProjectCards();
});
