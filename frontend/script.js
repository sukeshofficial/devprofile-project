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
  const checkboxes = document.querySelectorAll("#repo-list input[type='checkbox']:checked");
  const selectedRepos = Array.from(checkboxes).map(cb => cb.value);

  const token = document.getElementById("token").value;

  if (selectedRepos.length === 0) {
    alert("Please select at least one repository.");
    return;
  }

  try {
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

    const data = await response.json();

    console.log("🧠 Skill Extraction Results:", data);

    // Show results (you can enhance this UI)
    let output = "";
    data.results.forEach(result => {
      output += `<h4 class="font-bold mt-4">${result.repo}</h4>`;
      if (result.status === "success") {
        output += `<ul class="list-disc pl-5 text-sm text-gray-700">` +
          result.skills.map(skill => `<li>${skill}</li>`).join('') +
          `</ul>`;
      } else {
        output += `<p class="text-sm text-red-600">${result.status}</p>`;
      }
    });

    // Show in UI
    const outputDiv = document.createElement("div");
    outputDiv.className = "max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-6";
    outputDiv.innerHTML = `<h3 class="text-lg font-semibold text-primary mb-2">Extracted Skills</h3>${output}`;

    document.body.appendChild(outputDiv);

  } catch (error) {
    console.error("❌ Error analyzing repos:", error);
    alert("Failed to analyze repositories.");
  }
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
