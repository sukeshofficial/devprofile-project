async function loadGithubProfile(event) {
  event.preventDefault(); // Prevent form reload

  const username = document.getElementById("githubInput").value.trim();
  const token = document.getElementById("tokenInput").value.trim();

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/profile/github?username=${username}&token=${token}`
    );
    if (!res.ok) {
      throw new Error("GitHub fetch failed");
    }
  
    const data = await res.json();
    document.getElementById("avatar").src = data.avatar_url;
    document.getElementById("githubLink").href = `https://github.com/${username}`;
    document.getElementById("name").textContent = data.name || "Unknown User";
    document.getElementById("bio").innerHTML =
      data.bio?.replace(/\r\n/g, "<br>") || "No bio found.";
    document.getElementById("repos-count").innerHTML = `📂 Public Repos: <strong>${data.public_repos}</strong>`;
    document.getElementById("followers").innerHTML = `👥 Followers: <strong>${data.followers}</strong>`;
    document.getElementById("following").innerHTML = `👣 Following: <strong>${data.following}</strong>`;
  
    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = "";
    data.repos.forEach((repo) => {
      const li = document.createElement("li");
  
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = repo;
      li.appendChild(checkbox);
  
      const a = document.createElement("a");
      a.href = `https://github.com/${username}/${repo}`;
      a.textContent = " " + repo;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
  
      li.appendChild(a);
      repoList.appendChild(li);
    });
  
    // ✅ Reveal profile section
    document.getElementById("profile").classList.remove("hidden");
  
  } catch (err) {
    console.error("Failed to load GitHub profile:", err);
    document.getElementById("profile").innerHTML =
      "<p>🚫 Failed to load GitHub profile data.</p>";
  }  
}

// Bind the submit event
document
  .getElementById("githubForm")
  .addEventListener("submit", loadGithubProfile);

document
  .getElementById("generateResumeBtn")
  .addEventListener("click", async () => {
    const selectedRepos = Array.from(
      document.querySelectorAll("#repo-list input:checked")
    ).map((checkbox) => checkbox.value);

    if (selectedRepos.length === 0) {
      alert("Please select at least one repository.");
      return;
    }

    const username = document.getElementById("githubInput").value.trim();
    const token = document.getElementById("tokenInput").value.trim();

    const res = await fetch("http://localhost:8000/profile/extract-skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, token, repos: selectedRepos }),
    });

    const result = await res.json();
    alert("✅ Resume Generated!");
  });

async function analyzeSkills() {
  const selectedRepos = Array.from(
    document.querySelectorAll("#repo-list input:checked")
  ).map((cb) => cb.value);

  if (selectedRepos.length === 0) {
    alert("Please select at least one repository.");
    return;
  }

  const username = document.getElementById("githubInput").value.trim();
  const token = document.getElementById("tokenInput").value.trim();

  const res = await fetch("http://127.0.0.1:8000/analyze/skills", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      token,
      repos: selectedRepos,
    }),
  });

  if (res.ok) {
    const data = await res.json();
  
    const rawHTML = data.skills;
    const cleaned = rawHTML.replace(/^<pre>|<\/pre>$/g, "").trim();
  
    // Optional: Convert markdown to readable plain text
    const plainText = cleaned
      .replace(/\*\*/g, "")        // remove bold
      .replace(/## /g, "")         // remove headings
      .replace(/^- /gm, "• ")      // convert bullet style
      .replace(/\r?\n/g, "\n");    // normalize newlines
  
    const output = document.getElementById("skills-output");
    output.value = plainText;
    output.removeAttribute("readonly");
  } else {
    document.getElementById("skills-output").value =
      "❌ Failed to extract skills";
  }
  
  const skillsOutputDiv = document.getElementById("skills-output");
  const markdownText = data.skills;
  skillsOutputDiv.innerHTML = marked.parse(markdownText);
}

function displaySkills(markdownText) {
  const plainText = markdownText
    .replace(/\*\*/g, "") // bold
    .replace(/## /g, "") // headers
    .replace(/^- /gm, "• "); // bullets

  const output = document.getElementById("skills-output");
  output.value = plainText.trim();
}

// Make textarea editable
function enableEditing() {
  const output = document.getElementById("skills-output");
  output.removeAttribute("readonly");
  output.focus();
}

// Copy to clipboard
function copySkills() {
  const output = document.getElementById("skills-output");
  output.select();
  document.execCommand("copy");
  alert("Copied to clipboard!");
}

function showAlert(title, message) {
  const alertBox = document.getElementById('dynamicAlert');
  document.getElementById('alertTitle').textContent = title;
  document.getElementById('alertText').textContent = message;
  alertBox.classList.remove('hidden');

  // Auto-hide after 4 seconds (optional)
  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 4000);
}

function hideAlert() {
  document.getElementById('dynamicAlert').classList.add('hidden');
}