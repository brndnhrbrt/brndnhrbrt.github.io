// Configuration data for the portfolio
const portfolioData = {
  name: "Brandon Herbert",
  title: "Full Stack Web Developer",
  description:
    "Building secure, scalable web applications with modern technologies and a passion for cybersecurity tools.",
  projects: [
    {
      id: 1,
      name: "Pen Pal",
      description:
        "AI-powered penetration testing assistant that analyzes web requests in real-time during security assessments.",
      tags: ["AI", "Penetration Testing", "Web Security"],
      githubUrl: "https://github.com/brndnhrbrt/pen-pal",
      icon: "fas fa-robot",
    },
    {
      id: 2,
      name: "Image Steganography",
      description:
        "Hide messages in plain sight with steganography. Manipulates pixel color values to embed ASCII messages within images.",
      tags: ["Python", "Steganography", "Image Processing"],
      githubUrl: "https://github.com/brndnhrbrt/image_steganography",
      icon: "fas fa-image",
    },
    {
      id: 3,
      name: "Evil Portal",
      description:
        "Create an evil captive portal Wi-Fi access point using Flipper Zero and Wi-Fi development board for security testing.",
      tags: ["Flipper Zero", "Wi-Fi", "Captive Portal", "Security Testing"],
      githubUrl: "https://github.com/bigbrodude6119/flipper-zero-evil-portal",
      icon: "fas fa-wifi",
    },
    {
      id: 4,
      name: "Pwndurgotchi",
      description:
        "Communication and disruption tool for pwnagotchi devices written in Python. Can send messages to nearby pwnagotchis and crash software components.",
      tags: ["Python", "Pwnagotchi", "Network"],
      githubUrl: "https://github.com/bigbrodude6119/pwndurgotchi",
      icon: "fas fa-wifi",
    },
  ],
  githubProfiles: [
    {
      name: "Main GitHub Profile",
      url: "https://github.com/brndnhrbrt",
    },
    {
      name: "Alternate GitHub Profile",
      url: "https://github.com/bigbrodude6119",
    },
  ],
};

// Function to populate projects
function populateProjects() {
  const projectsContainer = document.querySelector(".projects-grid");

  portfolioData.projects.forEach((project) => {
    const projectCard = document.createElement("div");
    projectCard.className = "project-card";

    projectCard.innerHTML = `
      <div class="project-header">
        <h3><i class="${project.icon}"></i> ${project.name}</h3>
      </div>
      <div class="project-content">
        <p class="project-description">${project.description}</p>
        <div class="project-tags">
          ${project.tags
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("")}
        </div>
        <div class="project-links">
          <a href="${project.githubUrl}" class="project-link">
            <i class="fab fa-github"></i> GitHub
          </a>
        </div>
      </div>
    `;

    projectsContainer.appendChild(projectCard);
  });
}

// Function to populate GitHub links
function populateGithubLinks() {
  const githubLinksContainer = document.querySelector(".github-links");

  portfolioData.githubProfiles.forEach((profile) => {
    const githubLink = document.createElement("a");
    githubLink.href = profile.url;
    githubLink.className = "github-link";
    githubLink.innerHTML = `
      <i class="fab fa-github"></i> ${profile.name}
    `;

    githubLinksContainer.appendChild(githubLink);
  });
}

// Simple scroll animation for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Add hover effect to project cards
const projectCards = document.querySelectorAll(".project-card");
projectCards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    card.style.transform = "translateY(-10px)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "translateY(0)";
  });
});

// Initialize the portfolio
document.addEventListener("DOMContentLoaded", function () {
  populateProjects();
  populateGithubLinks();
});
