// YouTube Video Integration
console.log('YouTube script loaded');

// Function to show error messages in the UI
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

// Function to get selected skill level
function getSelectedSkillLevel() {
    return document.querySelector('input[name="skill-level"]:checked')?.value || 'beginner';
}

// Function to get selected language
function getSelectedLanguage() {
    return document.getElementById('language').value || 'en';
}

// Function to enhance search query with skill level
function enhanceQueryWithSkillLevel(query, level) {
    const levelTerms = {
        'beginner': 'beginner tutorial',
        'intermediate': 'intermediate tutorial',
        'advanced': 'advanced tutorial'
    };
    return `${query} ${levelTerms[level] || 'tutorial'}`;
}

// Function to search for videos based on a skill
async function searchVideos() {
    const skillInput = document.getElementById('skill-search');
    let skill = skillInput.value.trim();
    
    if (!skill) {
        showError('Please enter a skill to search for');
        return;
    }

    const resultsContainer = document.getElementById('youtube-results');
    const loading = document.getElementById('loading');
    
    // Get filter values
    const skillLevel = getSelectedSkillLevel();
    const language = getSelectedLanguage();
    
    // Enhance search query with skill level
    skill = enhanceQueryWithSkillLevel(skill, skillLevel);
    
    // Show loading state
    loading.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    
    try {
        // Call our backend API to search for videos with filters
        const response = await fetch(
            `/api/skills/learning-resources?` + 
            `skills=${encodeURIComponent(skill)}&` +
            `language=${encodeURIComponent(language)}&` +
            `skill_level=${encodeURIComponent(skillLevel)}`
        );
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Failed to fetch learning resources');
        }
        
        // Display the videos
        if (result.resources) {
            // Add skill level badge to each video
            const resourcesWithLevel = {};
            for (const [skill, videos] of Object.entries(result.resources)) {
                resourcesWithLevel[skill] = videos.map(video => ({
                    ...video,
                    level: skillLevel
                }));
            }
            displayVideos(resourcesWithLevel);
        } else {
            throw new Error('No resources found in the response');
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        showError(error.message || 'Failed to load learning resources');
    } finally {
        loading.classList.add('hidden');
    }
}

// Function to get level badge HTML
function getLevelBadge(level) {
    const levels = {
        'beginner': { text: 'Beginner', color: 'bg-green-100 text-green-800' },
        'intermediate': { text: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
        'advanced': { text: 'Advanced', color: 'bg-red-100 text-red-800' }
    };
    const levelInfo = levels[level] || levels['beginner'];
    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelInfo.color} ml-2">
        ${levelInfo.text}
    </span>`;
}

// Function to create a video card
function createVideoCard(video) {
    if (!video || !video.videoId) return '';
    
    const title = video.title || 'No title available';
    const description = video.description || 'No description available';
    const thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
    const levelBadge = video.level ? getLevelBadge(video.level) : '';
    
    return `
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener noreferrer" class="block">
            <div class="relative pb-[56.25%] bg-gray-200 dark:bg-gray-700">
                <img src="${thumbnailUrl}" 
                     alt="${escapeHtml(title)}" 
                     class="absolute inset-0 w-full h-full object-cover">
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-10 transition-all duration-300">
                    <div class="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                        <i class="fas fa-play text-white text-xl"></i>
                    </div>
                </div>
            </div>
        </a>
        <div class="p-4">
            <div class="flex items-start justify-between">
                <h3 class="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white flex-grow">
                    <a href="https://www.youtube.com/watch?v=${video.videoId}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        ${escapeHtml(title)}
                    </a>
                </h3>
                ${levelBadge}
            </div>
            <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-3">
                ${escapeHtml(description)}
            </p>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <i class="far fa-clock mr-1"></i>
                <span>${video.duration || 'N/A'}</span>
                <span class="mx-2">•</span>
                <i class="far fa-eye mr-1"></i>
                <span>${video.viewCount ? formatNumber(video.viewCount) + ' views' : 'N/A'}</span>
            </div>
        </div>
    </div>`;
}

// Helper function to format numbers (e.g., 1000 -> 1K)
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Function to display videos in the UI
function displayVideos(data) {
    const resultsContainer = document.getElementById('youtube-results');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Check if we have any videos
    const skills = Object.keys(data);
    if (skills.length === 0) {
        resultsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-video-slash text-4xl text-gray-400 mb-2"></i>
                <p class="text-gray-600 dark:text-gray-300">No videos found. Try a different search term.</p>
            </div>`;
        return;
    }
    
    // Process and display videos for each skill
    skills.forEach(skill => {
        const videos = data[skill];
        if (!videos || videos.length === 0) return;
        
        // Create a section for this skill
        const skillSection = document.createElement('div');
        skillSection.className = 'col-span-full mb-8';
        skillSection.innerHTML = `
            <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                <i class="fas fa-graduation-cap mr-2"></i>
                ${escapeHtml(skill)} Tutorials
                <span class="text-sm text-gray-500 ml-2">(${videos.length} videos)</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${videos.map(video => createVideoCard(video)).join('')}
            </div>`;
            
        resultsContainer.appendChild(skillSection);
    });
    
    // Initialize any tooltips or other interactive elements
    initializeVideoCards();
}

// Function to initialize interactive elements for video cards
function initializeVideoCards() {
    // Add any interactive elements initialization here
    // For example, tooltips, hover effects, etc.
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('YouTube learning resources module initialized');
    
    // Get DOM elements
    const searchButton = document.querySelector('button[onclick="searchVideos()"]');
    const searchInput = document.getElementById('skill-search');
    const skillLevelRadios = document.querySelectorAll('input[name="skill-level"]');
    const languageSelect = document.getElementById('language');
    
    // Add click event to the search button
    if (searchButton) {
        // Remove the inline onclick handler
        searchButton.removeAttribute('onclick');
        searchButton.addEventListener('click', searchVideos);
        console.log('Search button event listener added');
    } else {
        console.warn('Search button not found');
    }
    
    // Add keyboard event to search input
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchVideos();
            }
        });
    } else {
        console.warn('Search input not found');
    }
    
    // Add change event to skill level radio buttons
    if (skillLevelRadios.length > 0) {
        skillLevelRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (searchInput && searchInput.value.trim()) {
                    searchVideos();
                }
            });
        });
    } else {
        console.warn('Skill level radios not found');
    }
    
    // Add change event to language dropdown
    if (languageSelect) {
        languageSelect.addEventListener('change', () => {
            if (searchInput && searchInput.value.trim()) {
                searchVideos();
            }
        });
    } else {
        console.warn('Language select not found');
    }
});
