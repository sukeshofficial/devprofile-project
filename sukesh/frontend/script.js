async function loadGithubProfile(event) {
  event.preventDefault(); // Prevent form reload

  const username = document.getElementById("githubInput").value.trim();
  const token = document.getElementById("tokenInput").value.trim();

  if (!username || !token) {
    alert("Please enter both GitHub username and token.");
    return;
  }

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
    document.getElementById(
      "repos-count"
    ).innerHTML = `📂 Public Repos: <strong>${data.public_repos}</strong>`;
    document.getElementById(
      "followers"
    ).innerHTML = `👥 Followers: <strong>${data.followers}</strong>`;
    document.getElementById(
      "following"
    ).innerHTML = `👣 Following: <strong>${data.following}</strong>`;

    const repoList = document.getElementById("repo-list");
    repoList.innerHTML = "";
    data.repos.forEach((repo) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
    
      a.href = `https://github.com/${username}/${repo}`;
      a.textContent = repo;
      a.target = "_blank"; // open in new tab
      a.rel = "noopener noreferrer"; // security best practice
    
      li.appendChild(a);
      repoList.appendChild(li);
    });
    
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
