window.resumeData = {};

document.getElementById('github-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const token = document.getElementById('token').value;

  const response = await fetch('http://localhost:8000/fetch-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      username: username, 
      github_token: token  // ✅ use the correct key name
    })
  });

  console.log("Sending to backend:", { username, github_token: token });


  if (response.ok) {
    const data = await response.json();
    console.log("👉 Response received:", data);
  
    if (!data || !data.profile) {
      console.error("⚠️ Backend response missing 'profile'", data);
      alert("Invalid response from server.");
      return;
    }
  
    // ✅ Safe to access now
    const profile = data.profile;
    document.getElementById("avatar").src = profile.avatar_url;
    document.getElementById("github-name").innerText = profile.login;
    document.getElementById("bio").innerText = profile.bio || "No bio available";
    document.getElementById("profile").classList.remove("hidden");
  
    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = "";
    data.repositories.forEach(repo => {
      const li = document.createElement("li");
      li.innerHTML = `
        <label class="flex items-center space-x-2">
          <input type="checkbox" value="${repo.name}" class="form-checkbox text-blue-600">
          <span>${repo.name}</span>
        </label>
      `;
      repoList.appendChild(li);
    });
  
    document.getElementById("repos-section").classList.remove("hidden");
  
  } else {
    const error = await response.text();
    console.error("❌ Fetch failed", error);
    alert('Failed to fetch profile.');
  }
  
});

document.getElementById("analyze-btn").addEventListener("click", async () => {
  const selectedRepos = Array.from(
    document.querySelectorAll("#repo-list input[type=checkbox]:checked")
  ).map(checkbox => checkbox.value);

  const token = document.getElementById("token").value;

  if (selectedRepos.length === 0) {
    alert("Please select at least one repository.");
    return;
  }

  window.selectedRepos = selectedRepos;

  const response = await fetch("http://localhost:8000/analyze-repos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      github_token: token,
      selected_repos: selectedRepos
    })
  });

  const result = await response.json();

  if (!result || !result.results) {
    console.error("⚠️ Unexpected response from /analyze-repos:", result);
    alert("Failed to fetch skills.");
    return;
  }

  const skillSet = new Set();
  result.results.forEach(entry => {
    if (entry.status === "success") {
      entry.skills.forEach(skill => skillSet.add(skill));
    }
  });

  // Render skills
  const skillContainer = document.getElementById("skill-suggestions");
  skillContainer.innerHTML = "";

  if (skillSet.size === 0) {
    skillContainer.innerHTML = `<p class="text-sm text-gray-500">No skills found in selected repos.</p>`;
    return;
  }

  skillSet.forEach(skill => {
    const span = document.createElement("span");
    span.className = "skill-badge cursor-pointer inline-block m-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200";
    span.innerText = skill;
    span.addEventListener("click", () => {
      span.classList.toggle("selected");
    
      if (span.classList.contains("selected")) {
        span.classList.remove("bg-blue-100", "text-blue-700");
        span.classList.add("bg-blue-600", "text-white");
      } else {
        span.classList.add("bg-blue-100", "text-blue-700");
        span.classList.remove("bg-blue-600", "text-white");
      }
    });
    
    skillContainer.appendChild(span);
  });

  document.getElementById("skills-section").classList.remove("hidden");
});

// Called after /analyze-repos API call is completed
function displaySkillSuggestions(skillsArray) {
  const skillsSection = document.getElementById("skills-section");
  const suggestionBox = document.getElementById("skill-suggestions");

  suggestionBox.innerHTML = "";

  skillsArray.forEach(skill => {
    const tag = document.createElement("span");
    tag.textContent = skill;
    tag.className = "cursor-pointer px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-blue-100";
    tag.dataset.selected = "false";

    tag.addEventListener("click", () => {
      const selected = tag.dataset.selected === "true";
      tag.dataset.selected = !selected;
      tag.classList.toggle("bg-blue-500", !selected);
      tag.classList.toggle("text-white", !selected);
      tag.classList.toggle("bg-gray-200", selected);
    });

    suggestionBox.appendChild(tag);
  });

  skillsSection.classList.remove("hidden");
}

// When "Next" is clicked, collect selected skills
document.getElementById("next-btn").addEventListener("click", () => {
  const selected = document.querySelectorAll(".skill-badge.selected");
  const selectedSkills = Array.from(selected).map(el => el.innerText.trim());

  if (selectedSkills.length === 0) {
    alert("Please select at least one skill.");
    return;
  }

  console.log("✅ Selected skills:", selectedSkills);

  // Store it or pass it to the resume form step
  document.getElementById("skills-section").classList.add("hidden");
  document.getElementById("resume-form-section").classList.remove("hidden");
  // If you use a function to go to next step
});

document.getElementById("next-btn").addEventListener("click", () => {
  const selected = [];
  document.querySelectorAll("#skill-suggestions span").forEach(tag => {
    if (tag.classList.contains("selected")) {
      selected.push(tag.textContent.trim());
    }
  });

  if (selected.length === 0) {
    alert("Please select at least one skill.");
    return;
  }

  // ✅ Store globally
  window.selectedSkills = selected;

  // ✅ Display them in resume section
  const displayDiv = document.getElementById("selected-skills-display");
  displayDiv.innerHTML = ""; // clear first
  selected.forEach(skill => {
    const span = document.createElement("span");
    span.className = "px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium";
    span.textContent = skill;
    displayDiv.appendChild(span);
  });

  // ✅ Move to next section
  document.getElementById("skills-section").classList.add("hidden");
  document.getElementById("resume-form-section").classList.remove("hidden");
});


// Once skills are rendered:
document.querySelectorAll(".skill-badge").forEach(badge => {
  badge.addEventListener("click", () => {
    badge.classList.toggle("selected");
    badge.classList.toggle("bg-blue-600");
    badge.classList.toggle("text-white");
    badge.classList.toggle("bg-blue-100");
    badge.classList.toggle("text-blue-700");
  });
});


document.getElementById("next-projects-btn").addEventListener("click", () => {
  // Collect resume basic info
  const name = document.getElementById("full-name").value.trim();
  const role = document.getElementById("role").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const linkedin = document.getElementById("linkedin").value.trim();
  const github = document.getElementById("github").value.trim();

  // Save basic info globally
  window.resumeData = {
    name, role, email, phone, linkedin, github,
    tech: {
      languages: window.selectedSkills?.join(", ") || "",
      ai: "", frameworks: "", tools: ""
    },
    achievements: [],
    projects: [],
    experience: [],
    education: []
  };

  // Move to project suggestion
  // document.getElementById("resume-form-section").classList.add("hidden");
  document.getElementById("projects-section").classList.remove("hidden");

  // Show dynamic project suggestions
  showProjectSuggestions();
});


document.querySelectorAll("#project-suggestions span").forEach(tag => {
  tag.addEventListener("click", () => {
    const selected = tag.dataset.selected === "true";
    tag.dataset.selected = !selected;
    tag.classList.toggle("bg-blue-600", !selected);
    tag.classList.toggle("text-white", !selected);
    tag.classList.toggle("border-blue-600", !selected);
  });
});

const selectedProjects = [];
document.querySelectorAll("#project-suggestions span").forEach(tag => {
  if (tag.dataset.selected === "true") {
    selectedProjects.push(tag.textContent);
  }
});

function showProjectSuggestions() {
  const container = document.getElementById("project-suggestions");
  container.innerHTML = "";

  if (!window.selectedRepos || window.selectedRepos.length === 0) {
    container.innerHTML = "<p class='text-red-500'>No repositories selected.</p>";
    return;
  }

  window.selectedProjects = []; // clear old

  window.selectedRepos.forEach(repo => {
    const tag = document.createElement("span");
    tag.textContent = repo;
    tag.dataset.selected = "false";
    tag.className = "cursor-pointer inline-block px-3 py-1 m-1 rounded-full bg-blue-100 text-blue-800 text-sm border border-blue-300";

    tag.addEventListener("click", () => {
      const isSelected = tag.dataset.selected === "true";
      tag.dataset.selected = isSelected ? "false" : "true";
      tag.classList.toggle("bg-green-200", !isSelected);
      tag.classList.toggle("bg-blue-100", isSelected);

      if (!isSelected) {
        window.selectedProjects.push(repo);
      } else {
        window.selectedProjects = window.selectedProjects.filter(r => r !== repo);
      }

      updateSelectedProjectsUI();
    });

    container.appendChild(tag);
  });
}

function updateSelectedProjectsUI() {
  const selectedContainer = document.getElementById("selected-projects");
  selectedContainer.innerHTML = "";

  window.selectedProjects.forEach(project => {
    const span = document.createElement("span");
    span.className = "inline-block px-3 py-1 m-1 rounded-full bg-green-100 text-green-800 text-sm";
    span.innerText = project;
    selectedContainer.appendChild(span);
  });
}

document.getElementById("next-experience-btn").addEventListener("click", () => {
  // Check if any project is selected
  if (!window.selectedProjects || window.selectedProjects.length === 0) {
    alert("⚠️ Please select at least one project.");
    return;
  }

  // Convert selectedProjects to project objects with placeholders
  const formattedProjects = window.selectedProjects.map(project => ({
    title: project,
    link: `https://github.com/${window.resumeData.github.split("github.com/")[1]}/${project}`,
    points: [
      "Worked on key features", 
      "Collaborated with team", 
      "Improved performance and efficiency"
    ]
  }));

  // Store in resumeData
  window.resumeData.projects = formattedProjects;

  console.log("✅ Stored Projects:", window.resumeData.projects);

  // Move to experience section
  document.getElementById("projects-section").classList.add("hidden");
  document.getElementById("experience-section").classList.remove("hidden");
});


document.getElementById("next-experience-btn").addEventListener("click", () => {
  console.log("✅ Final Projects Selected:", window.selectedProjects);
  // Move to experience section...
});


// Store globally for later use
window.selectedProjects = selectedProjects;

// ✅ Log it properly
console.log("✅ Selected projects:", window.selectedProjects);

const selectedContainer = document.getElementById("selected-projects");
selectedContainer.innerHTML = "";
window.selectedProjects.forEach(project => {
  const span = document.createElement("span");
  span.className = "inline-block px-3 py-1 m-1 rounded-full bg-green-100 text-green-800 text-sm";
  span.innerText = project;
  selectedContainer.appendChild(span);
});


document.addEventListener("DOMContentLoaded", () => {
  const experienceContainer = document.getElementById("experience-fields");

  function createExperienceField() {
    const wrapper = document.createElement("div");
    wrapper.className = "bg-gray-100 p-4 rounded shadow";

    wrapper.innerHTML = `
      <input type="text" placeholder="Company Name" class="company w-full mb-2 p-2 rounded border" />
      <textarea placeholder="What did you do?" class="description w-full p-2 rounded border"></textarea>
    `;

    experienceContainer.appendChild(wrapper);
  }

  // Show first experience field by default
  createExperienceField();

  document.getElementById("add-experience-btn").addEventListener("click", createExperienceField);

  document.getElementById("finish-resume-btn").addEventListener("click", async (e) => {
    e.preventDefault(); // ✅ Prevent page reload

    const experiences = [];
    document.querySelectorAll("#experience-fields > div").forEach(field => {
      const company = field.querySelector(".company").value.trim();
      const description = field.querySelector(".description").value.trim();
      if (company && description) {
        experiences.push({ company, description });
      }
    });

    if (experiences.length === 0) {
      alert("⚠️ Please enter at least one experience.");
      return;
    }

    window.resumeData.experience = experiences;

    // 🔄 Show spinner
    document.getElementById("loading-spinner").classList.remove("hidden");

    try {
      const response = await fetch("http://localhost:8000/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(window.resumeData)
      });

      const result = await response.json();

      // ✅ Hide spinner
      document.getElementById("loading-spinner").classList.add("hidden");

      if (result.pdf_url) {
        window.generatedResumeUrl = result.pdf_url; // ✅ Store resume URL
        const downloadBtn = document.getElementById("download-resume-btn");
        downloadBtn.href = result.pdf_url;
        document.getElementById("resume-download-link").classList.remove("hidden");
        document.getElementById("resume-preview").src = result.pdf_url; // show preview
      } else {
        alert("❌ No PDF URL received.");
      }

    } catch (err) {
      console.error("❌ Resume generation error:", err);
      alert("Something went wrong while generating resume.");
      document.getElementById("loading-spinner").classList.add("hidden");
    }
  });

  // ✅ Control the actual download behavior
  document.getElementById("download-resume-btn").addEventListener("click", (e) => {
    if (window.generatedResumeUrl) {
      const link = document.createElement("a");
      link.href = window.generatedResumeUrl;
      link.download = "resume.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("PDF not ready yet!");
      e.preventDefault();
    }
  });
});


// Tailwind config (optional customization)
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
      },
    },
  },
};
