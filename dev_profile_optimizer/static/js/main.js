// Global variables to store user data
let userSkills = new Set();
let jobSkills = new Set();
let missingSkills = new Set();
let isLoading = false;

// DOM Elements
const profileSection = document.getElementById('profileSection');
const jobSection = document.getElementById('jobSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const textTab = document.getElementById('textTab');
const fileTab = document.getElementById('fileTab');
const textInputSection = document.getElementById('textInputSection');
const fileInputSection = document.getElementById('fileInputSection');
const jobFileInput = document.getElementById('jobFile');
const fileNameElement = document.getElementById('fileName');

// Initialize the application
function init() {
    try {
        // Set up event listeners
        if (textTab) textTab.addEventListener('click', () => switchTab('text'));
        if (fileTab) fileTab.addEventListener('click', () => switchTab('file'));
        if (jobFileInput) jobFileInput.addEventListener('change', handleFileSelect);
        
        // Set up analyze profile button
        const analyzeBtn = document.getElementById('analyzeProfileBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', analyzeProfile);
        }
        
        // Set up analyze job button
        const analyzeJobBtn = document.getElementById('analyzeJobBtn');
        if (analyzeJobBtn) {
            analyzeJobBtn.addEventListener('click', analyzeJob);
        }
        
        // Set up start over button
        const startOverBtn = document.getElementById('startOverBtn');
        if (startOverBtn) {
            startOverBtn.addEventListener('click', startOver);
        }
        
        // Initialize any other components
        initializeComponents();
    } catch (error) {
        console.error('Error initializing application:', error);
    }
    
    // Set up drag and drop if drop zone exists
    const dropZone = document.querySelector('.border-dashed');
    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        dropZone.addEventListener('drop', handleDrop, false);
    }
    
    // Initialize with text tab active
    switchTab('text');
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop zone when item is dragged over it
function highlight() {
    document.querySelector('.border-dashed').classList.add('border-blue-500', 'bg-blue-50');
}

// Remove highlight when item leaves drop zone
function unhighlight() {
    document.querySelector('.border-dashed').classList.remove('border-blue-500', 'bg-blue-50');
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        jobFileInput.files = files;
        updateFileName(files[0].name);
    }
}

// Switch between text and file input tabs
function switchTab(tab) {
    if (tab === 'text') {
        textTab.classList.add('border-blue-500', 'text-blue-600');
        textTab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        fileTab.classList.remove('border-blue-500', 'text-blue-600');
        fileTab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        textInputSection.classList.remove('hidden');
        fileInputSection.classList.add('hidden');
    } else {
        fileTab.classList.add('border-blue-500', 'text-blue-600');
        fileTab.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        textTab.classList.remove('border-blue-500', 'text-blue-600');
        textTab.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        fileInputSection.classList.remove('hidden');
        textInputSection.classList.add('hidden');
    }
}

// Update file name display
function updateFileName(fileName) {
    fileNameElement.textContent = `Selected file: ${fileName}`;
}

// Handle file selection
function handleFileSelect(e) {
    if (this.files && this.files[0]) {
        updateFileName(this.files[0].name);
    }
}

// Analyze user profile
async function analyzeProfile() {
    const githubUsername = document.getElementById('githubUsername')?.value.trim();

    if (!githubUsername) {
        showError('Please enter a GitHub username');
        return;
    }
    
    showLoading(true);
    userSkills.clear();
    
    try {
        // Extract skills from GitHub if username is provided
        const githubSkills = await extractGithubSkills(githubUsername);
        githubSkills.forEach(skill => userSkills.add(skill.toLowerCase()));
        
        // Show job section if we have skills
        if (userSkills.size > 0) {
            showJobSection();
        } else {
            showError('No skills found in the provided profiles');
        }
    } catch (error) {
        console.error('Error analyzing profiles:', error);
        showError('Failed to analyze profiles. Please try again.');
    } finally {
        showLoading(false);
    }
    
    // Show the job section after profile is loaded
    showJobSection();
}

// Extract skills from GitHub
async function extractGithubSkills(username) {
    if (!username || username.trim() === '') {
        showError('GitHub username cannot be empty');
        return [];
    }
    
    try {
        showLoading(true);
        const apiUrl = `/extract-github-skills?username=${encodeURIComponent(username)}`;
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'same-origin'
        });

        if (!response.ok) {
            let errorDetail = 'Failed to fetch data from GitHub';
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || JSON.stringify(errorData);
                console.error('GitHub API error details:', errorData);
            } catch (e) {
                console.error('Failed to parse error response:', e);
            }
            throw new Error(`${errorDetail} (Status: ${response.status})`);
        }

        const data = await response.json();
        
        // If we get a message, show it to the user
        if (data.message) {
            showInfo(data.message);
        }
        
        // Display GitHub profile information
        displayGithubProfile(username, data);
        
        // Update user skills
        const skills = Array.isArray(data.skills) ? data.skills : [];
        if (skills.length > 0) {
            userSkills = new Set(skills);
        } else {
            showInfo('No skills found in the GitHub profile. Consider adding more projects or skills to your repositories.');
        }
        
        return skills;
    } catch (error) {
        console.error('Error fetching GitHub skills:', error);
        showError(error.message || 'Failed to fetch GitHub profile. Please try again.');
        return [];
    } finally {
        showLoading(false);
    }
}

// Display GitHub profile information
function displayGithubProfile(username, profileData) {
    const profileContainer = document.getElementById('github-profile');
    if (!profileContainer) return;
    
    // Clear previous content
    profileContainer.innerHTML = '';
    
    // Create profile header
    const header = document.createElement('div');
    header.className = 'bg-white p-6 rounded-lg shadow-md mb-6';
    
    const title = document.createElement('h2');
    title.className = 'text-2xl font-semibold mb-4 flex items-center';
    
    const githubIcon = document.createElement('i');
    githubIcon.className = 'fab fa-github text-2xl mr-2';
    title.appendChild(githubIcon);
    title.appendChild(document.createTextNode(` ${username}'s GitHub Profile`));
    
    const profileLink = document.createElement('a');
    profileLink.href = `https://github.com/${username}`;
    profileLink.target = '_blank';
    profileLink.className = 'ml-2 text-blue-600 hover:underline text-sm';
    profileLink.textContent = '(View on GitHub)';
    title.appendChild(profileLink);
    
    header.appendChild(title);
    
    // Add skills section if available
    const skills = Array.isArray(profileData.skills) ? profileData.skills : [];
    if (skills.length > 0) {
        const skillsSection = document.createElement('div');
        skillsSection.className = 'mt-4';
        
        const skillsTitle = document.createElement('h3');
        skillsTitle.className = 'text-lg font-medium mb-2';
        skillsTitle.textContent = 'Skills Identified:';
        
        const skillsList = document.createElement('div');
        skillsList.className = 'flex flex-wrap gap-2';
        
        skills.forEach(skill => {
            const skillBadge = document.createElement('span');
            skillBadge.className = 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
            skillBadge.textContent = skill;
            skillsList.appendChild(skillBadge);
        });
        
        skillsSection.appendChild(skillsTitle);
        skillsSection.appendChild(skillsList);
        header.appendChild(skillsSection);
    } else {
        const noSkills = document.createElement('p');
        noSkills.className = 'text-gray-600';
        noSkills.textContent = 'No specific skills identified. Consider adding more detailed descriptions to your repositories.';
        header.appendChild(noSkills);
    }
    
    profileContainer.appendChild(header);
}

// Show info message to user
function showInfo(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden', 'text-red-500');
        errorDiv.classList.add('text-blue-500');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }
}

// Analyze job description
async function analyzeJob() {
    const jobDescription = document.getElementById('jobDescription')?.value.trim();
    const jobFile = document.getElementById('jobFile')?.files[0];
    
    if (!jobDescription && !jobFile) {
        showError('Please enter a job description or upload a file');
        return;
    }
    
    showLoading(true, 'Analyzing job description and finding relevant learning resources...');
    jobSkills.clear();
    missingSkills.clear();
    
    try {
        let extractedSkills = [];
        let formData = new FormData();
        
        // Prepare form data based on input type
        if (jobFile) {
            formData.append('file', jobFile);
        } else {
            formData.append('text', jobDescription);
        }
        
        // Send to backend for analysis
        const response = await fetch('/analyze-job', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to analyze job description');
        }
        
        const data = await response.json();
        
        // Update job skills from response
        if (data.skills && Array.isArray(data.skills)) {
            data.skills.forEach(skill => jobSkills.add(skill.toLowerCase()));
        }
        
        // Find missing skills
        userSkills.forEach(skill => {
            if (!jobSkills.has(skill)) {
                missingSkills.add(skill);
            }
        });
        
        // Display results with YouTube videos if available
        displayResults(data);
        
        // Load YouTube videos for missing skills
        if (missingSkills.size > 0) {
            loadMissingSkillsVideos(Array.from(missingSkills));
        }
        
    } catch (error) {
        console.error('Job analysis error:', error);
        showError(`Failed to analyze job description: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Load YouTube videos for missing skills
async function loadMissingSkillsVideos(skills) {
    // Get preferred language
    const languageSelect = document.getElementById('videoLanguage');
    const preferredLanguage = languageSelect ? languageSelect.value : 'en';
    try {
        const response = await fetch(`/get-learning-resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                skills: skills,
                maxResults: 3, // Get 3 videos per skill
                language: preferredLanguage
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch learning resources');
        }
        
        const data = await response.json();
        
        // Display videos in the UI
        displayLearningResources(data.resources || []);
        
    } catch (error) {
        console.error('Error loading learning resources:', error);
        // Don't show error to user as this is a non-critical feature
    }
}

// Display learning resources (YouTube videos)
function displayLearningResources(resources) {
    const videosContainer = document.getElementById('youtubeVideos');
    if (!videosContainer) return;
    
    if (!resources || resources.length === 0) {
        videosContainer.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-video-slash text-3xl text-gray-300 mb-2"></i>
                <p>No video recommendations found. Try a different job description.</p>
            </div>
        `;
        return;
    }
    
    // Clear existing content
    videosContainer.innerHTML = '';
    
    // Group videos by skill
    const videosBySkill = {};
    resources.forEach(resource => {
        if (!videosBySkill[resource.skill]) {
            videosBySkill[resource.skill] = [];
        }
        videosBySkill[resource.skill].push(resource);
    });
    
    // Create HTML for each skill's videos
    Object.entries(videosBySkill).forEach(([skill, videos]) => {
        const skillSection = document.createElement('div');
        skillSection.className = 'mb-8';
        
        const skillTitle = document.createElement('h4');
        skillTitle.className = 'text-lg font-medium text-gray-900 mb-3 flex items-center';
        skillTitle.innerHTML = `
            <i class="fas fa-tag mr-2 text-blue-500"></i>
            ${skill}
        `;
        
        const videosGrid = document.createElement('div');
        videosGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
        
        // Add each video
        videos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
            videoCard.innerHTML = `
                <a href="${video.url}" target="_blank" class="block">
                    <div class="relative">
                        <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-40 object-cover">
                        <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            ${video.duration || ''}
                        </div>
                    </div>
                    <div class="p-4">
                        <h5 class="font-medium text-gray-900 mb-1 line-clamp-2" title="${video.title}">
                            ${video.title}
                        </h5>
                        <p class="text-sm text-gray-600">${video.channelTitle || 'YouTube'}</p>
                        <div class="mt-2 flex items-center text-xs text-gray-500">
                            <span>${video.viewCount ? formatViewCount(video.viewCount) + ' views' : ''}</span>
                            <span class="mx-2">•</span>
                            <span>${video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ''}</span>
                        </div>
                    </div>
                </a>
            `;
            videosGrid.appendChild(videoCard);
        });
        
        skillSection.appendChild(skillTitle);
        skillSection.appendChild(videosGrid);
        videosContainer.appendChild(skillSection);
    });
}

// Format view count (e.g., 1234 -> 1.2K)
function formatViewCount(count) {
    if (!count) return '';
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Chart.js instance for skills chart
let skillsChartInstance = null;

// Initialize components
function initializeComponents() {
    // Progress tracker is initialized in the HTML file
    console.log('Application components initialized');
}

// Clean and format skill name
function cleanSkillName(skill) {
    if (!skill) return '';
    // Remove any non-alphanumeric characters except spaces and hyphens
    return String(skill).trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();
}

// Display analysis results
function displayResults(data) {
    // Update progress tracker with the analyzed skills
    if (window.progressTracker && data.missing_skills) {
        // Convert missing skills to an array of skill names
        const missingSkillNames = data.missing_skills.map(skill => 
            typeof skill === 'string' ? skill : skill.name || skill.skill || skill
        );
        
        // Update progress tracker with analyzed skills
        if (window.progressTracker) {
            try {
                // Clean and filter skills
                const cleanSkills = (skills) => {
                    if (!Array.isArray(skills)) return [];
                    return skills
                        .map(skill => cleanSkillName(skill))
                        .filter(skill => skill.length > 0);
                };
                
                const matchingSkills = cleanSkills(data.matching_skills || []);
                const missingSkills = cleanSkills(data.missing_skills || []);
                
                // Combine and deduplicate skills
                const allSkills = [...new Set([...matchingSkills, ...missingSkills])];
                
                if (allSkills.length > 0) {
                    window.progressTracker.updateSkills(allSkills);
                }
            } catch (error) {
                console.error('Error updating progress tracker:', error);
            }
        }
    }
    try {
        const resultsSection = document.getElementById('resultsSection');
        const jobAnalysisResults = document.getElementById('jobAnalysisResults');
        
        if (!resultsSection || !jobAnalysisResults) return;
        
        // Show the job analysis results section
        jobAnalysisResults.classList.remove('hidden');
        
        // Update match score if available
        if (data.match_score !== undefined) {
            const matchScore = Math.round(data.match_score * 100);
            const matchScoreElement = document.getElementById('matchScore');
            const matchScoreBar = document.getElementById('matchScoreBar');
            
            if (matchScoreElement) matchScoreElement.textContent = matchScore;
            if (matchScoreBar) matchScoreBar.style.width = `${matchScore}%`;
            
            // Update match status text and color
            const matchStatus = document.getElementById('matchStatus');
            if (matchStatus) {
                let statusText = '';
                let statusClass = '';
                
                if (matchScore >= 80) {
                    statusText = 'Excellent Match!';
                    statusClass = 'text-green-600';
                } else if (matchScore >= 50) {
                    statusText = 'Good Match';
                    statusClass = 'text-blue-600';
                } else {
                    statusText = 'Needs Improvement';
                    statusClass = 'text-yellow-600';
                }
                
                matchStatus.textContent = statusText;
                matchStatus.className = `text-lg font-semibold ${statusClass}`;
            }
        }
        
        // Update extracted skills
        const extractedSkillsElement = document.getElementById('extractedSkills');
        if (extractedSkillsElement && data.skills) {
            extractedSkillsElement.innerHTML = data.skills.map(skill => `
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 m-1">
                    ${skill}
                </span>`
            ).join('') || '<p class="text-gray-500">No skills detected in the job description</p>';
        }
        
        // Show the results section if we're coming from the profile analysis
        const profileSection = document.getElementById('profileSection');
        const jobSection = document.getElementById('jobSection');
        
        if (profileSection && profileSection.classList.contains('hidden') && 
            jobSection && !jobSection.classList.contains('hidden')) {
            resultsSection.classList.remove('hidden');
        }
        
        // If we have missing skills from profile analysis, show them
        const missingSkillsList = document.getElementById('missingSkillsList');
        if (missingSkillsList && missingSkills.size > 0) {
            missingSkillsList.innerHTML = Array.from(missingSkills).map(skill => `
                <li class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 mr-2 mb-2">
                    ${skill}
                    <button onclick="loadLearningResources('${skill.replace(/'/g, "\\'")}')" 
                            class="ml-2 p-1 text-red-400 hover:text-red-600 rounded-full hover:bg-red-200">
                        <i class="fas fa-search-plus text-xs"></i>
                    </button>
                </li>`
            ).join('');
        }
        
        // Visualization: Render skills chart
        const skillsChartCanvas = document.getElementById('skillsChart');
        if (skillsChartCanvas) {
            // Prepare data for chart
            let skillLabels = [];
            let skillData = [];
            let skillExperience = [];
            // If experience info is present in data, use it; else just count skills
            if (data.user_skills_with_experience) {
                // Example: [{skill: 'Python', experience: 3}, ...]
                skillLabels = data.user_skills_with_experience.map(s => s.skill);
                skillData = data.user_skills_with_experience.map(s => s.experience || 1);
            } else if (data.user_skills) {
                skillLabels = data.user_skills;
                skillData = new Array(skillLabels.length).fill(1);
            } else if (window.userSkills && userSkills.size > 0) {
                skillLabels = Array.from(userSkills);
                skillData = new Array(skillLabels.length).fill(1);
            }
            // Destroy previous chart if exists
            if (window.skillsChartInstance) {
                window.skillsChartInstance.destroy();
            }
            if (skillLabels.length > 0) {
                window.skillsChartInstance = new Chart(skillsChartCanvas, {
                    type: 'bar',
                    data: {
                        labels: skillLabels,
                        datasets: [{
                            label: 'Skills' + (data.user_skills_with_experience ? ' (Years Experience)' : ''),
                            data: skillData,
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            title: { display: true, text: 'Your Skills' }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: !!data.user_skills_with_experience, text: data.user_skills_with_experience ? 'Years' : 'Count' }
                            }
                        }
                    }
                });
            } else {
                skillsChartCanvas.getContext('2d').clearRect(0, 0, skillsChartCanvas.width, skillsChartCanvas.height);
            }
        }
        // Scroll to results
        jobAnalysisResults.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error in displayResults:', error);
        showError('Failed to display results. Please try again.');
    }
}

// Toggle learning resources visibility
function toggleLearningResources(skill) {
    const resourcesElement = document.getElementById(`resources-${skill}`);
    const iconElement = document.getElementById(`icon-${skill}`);
    
    if (resourcesElement && iconElement) {
        if (resourcesElement.classList.contains('hidden')) {
            resourcesElement.classList.remove('hidden');
            iconElement.classList.add('transform', 'rotate-180');
            
            // Load resources if not already loaded
            const loadingElement = resourcesElement.querySelector('.loading-resources');
            if (loadingElement) {
                loadLearningResources(skill);
            }
        } else {
            resourcesElement.classList.add('hidden');
            iconElement.classList.remove('transform', 'rotate-180');
        }
    }
}

// Get appropriate icon for resource type
function getResourceIcon(type) {
    const icons = {
        'course': 'fas fa-graduation-cap',
        'tutorial': 'fas fa-book',
        'documentation': 'fas fa-file-alt',
        'video': 'fas fa-video',
        'article': 'fas fa-newspaper',
        'book': 'fas fa-book-open',
        'cheatsheet': 'fas fa-scroll',
        'github': 'fab fa-github',
        'youtube': 'fab fa-youtube',
        'udemy': 'fas fa-university',
        'coursera': 'fas fa-laptop-code',
        'pluralsight': 'fas fa-chalkboard-teacher',
        'default': 'fas fa-link'
    };
    
    const typeLower = type ? type.toLowerCase() : '';
    return icons[typeLower] || icons['default'];
}

// Load learning resources for a skill
async function loadLearningResources(skill) {
    // Get preferred language
    const languageSelect = document.getElementById('videoLanguage');
    const preferredLanguage = languageSelect ? languageSelect.value : 'en';
    const youtubeVideos = document.getElementById('youtubeVideos');
    if (!youtubeVideos) return;
    
    try {
        // Show loading state
        youtubeVideos.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-blue-500 text-2xl mb-2"></i>
                <p class="text-gray-600">Finding the best YouTube tutorials for ${skill}...</p>
            </div>`;
        
        // Fetch YouTube videos from backend
        const response = await fetch(`/get-youtube-videos?skill=${encodeURIComponent(skill)}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display videos
        if (data.videos && data.videos.length > 0) {
            youtubeVideos.innerHTML = `
                <h3 class="text-xl font-semibold text-gray-800 mb-4">
                    <i class="fab fa-youtube text-red-500 mr-2"></i>
                    Recommended Tutorials for ${skill}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${data.videos.map(video => `
                        <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                            <a href="${video.url}" target="_blank" class="block">
                                <div class="relative">
                                    <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-40 object-cover">
                                    <div class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                        ${video.duration || ''}
                                    </div>
                                </div>
                                <div class="p-4">
                                    <h4 class="font-medium text-gray-900 mb-1 line-clamp-2" title="${video.title}">
                                        ${video.title}
                                    </h4>
                                    <p class="text-sm text-gray-600">${video.channelTitle || 'YouTube'}</p>
                                    <div class="mt-2 flex items-center text-xs text-gray-500">
                                        <span>${video.viewCount ? formatViewCount(video.viewCount) + ' views' : ''}</span>
                                        <span class="mx-2">•</span>
                                        <span>${video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : ''}</span>
                                    </div>
                                </div>
                            </a>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            youtubeVideos.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-video-slash text-3xl text-gray-300 mb-2"></i>
                    <p>No video tutorials found for ${skill}. Try a different skill or check back later.</p>
                </div>`;
        }
        
    } catch (error) {
        console.error('Error loading YouTube videos:', error);
        const youtubeVideos = document.getElementById('youtubeVideos');
        if (youtubeVideos) {
            youtubeVideos.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                    <p>Failed to load video tutorials. Please try again later.</p>
                    <p class="text-sm text-gray-500 mt-1">${error.message}</p>
                </div>`;
        }
    }
}

// Get icon for resource type
function getResourceIcon(type) {
    const icons = {
        'course': 'fas fa-graduation-cap',
        'tutorial': 'fas fa-laptop-code',
        'documentation': 'fas fa-book',
        'video': 'fas fa-play-circle',
        'article': 'fas fa-newspaper',
        'book': 'fas fa-book-open',
        'cheatsheet': 'fas fa-scroll',
        'project': 'fas fa-project-diagram',
        'exercise': 'fas fa-dumbbell',
        'forum': 'fas fa-comments',
        'default': 'fas fa-link'
    };
    
    const typeLower = type ? type.toLowerCase() : '';
    return icons[typeLower] || icons['default'];
}

// Show job section after profile analysis
function showJobSection() {
    const jobSection = document.getElementById('jobSection');
    if (jobSection) {
        jobSection.classList.remove('hidden');
        jobSection.classList.add('fade-in');
        setTimeout(() => {
            jobSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Show loading state
function showLoading(show) {
    const loadingSection = document.getElementById('loadingSection');
    const resultsSection = document.getElementById('resultsSection');
    const analyzeProfileBtn = document.getElementById('analyzeProfileBtn');
    const analyzeJobBtn = document.getElementById('analyzeJobBtn');
    
    isLoading = show;
    
    if (loadingSection) {
        if (show) {
            loadingSection.classList.remove('hidden');
            loadingSection.classList.add('fade-in');
            
            // Animate progress bar
            const progressBar = document.getElementById('analysisProgress');
            if (progressBar) {
                let progress = 0;
                const interval = setInterval(() => {
                    progress += Math.random() * 15;
                    if (progress > 90) clearInterval(interval);
                    progressBar.style.width = `${Math.min(progress, 90)}%`;
                }, 300);
                // Store interval ID for cleanup
                loadingSection.dataset.interval = interval;
            }
        } else {
            // Clear any existing interval
            if (loadingSection.dataset.interval) {
                clearInterval(parseInt(loadingSection.dataset.interval));
            }
            loadingSection.classList.add('hidden');
            
            // Reset progress bar
            const progressBar = document.getElementById('analysisProgress');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
        }
    }
    
    // Disable buttons while loading
    [analyzeProfileBtn, analyzeJobBtn].forEach(btn => {
        if (btn) {
            btn.disabled = show;
            btn.innerHTML = show ? 
                '<i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...' : 
                '<i class="fas fa-search mr-2"></i> ' + (btn.id === 'analyzeProfileBtn' ? 'Analyze My Profile' : 'Analyze Job Description');
        }
    });
}

// Show error message
function showError(message) {
    // You can implement a toast or alert system here
    alert(message);
}

// Start over
function startOver() {
    // Clear skills chart if present
    const skillsChartCanvas = document.getElementById('skillsChart');
    if (window.skillsChartInstance && skillsChartCanvas) {
        window.skillsChartInstance.destroy();
        window.skillsChartInstance = null;
        skillsChartCanvas.getContext('2d').clearRect(0, 0, skillsChartCanvas.width, skillsChartCanvas.height);
    }
    // Reset form
    document.getElementById('githubUsername').value = '';

    document.getElementById('jobDescription').value = '';
    jobFileInput.value = '';
    fileNameElement.textContent = '';
    
    // Reset state
    userSkills = new Set();
    jobSkills = new Set();
    missingSkills = new Set();
    
    // Reset UI
    document.getElementById('yourSkills').innerHTML = '<div class="text-gray-400 text-sm italic">Your skills will appear here</div>';
    document.getElementById('jobSkills').innerHTML = '<div class="text-gray-400 text-sm italic">Required skills will appear here</div>';
    document.getElementById('missingSkills').innerHTML = `
        <div class="text-center py-8 text-gray-400">
            <i class="fas fa-lightbulb text-3xl text-yellow-300 mb-2"></i>
            <p>Analyze a job description to see skill recommendations</p>
        </div>
    `;
    
    // Hide sections
    jobSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    document.getElementById('recommendationsSection').classList.add('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
