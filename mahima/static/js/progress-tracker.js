class ProgressTracker {
    constructor() {
        this.skills = new Map(); // skillName -> {level, progress, hoursSpent, totalHours, lastPracticed}
        this.initialize();
    }

    initialize() {
        try {
            // Load saved progress from localStorage
            this.loadProgress();
            
            // Initialize UI elements
            this.createProgressUI();
            
            // Render initial progress
            this.renderProgress();
        } catch (error) {
            console.error('Error initializing progress tracker:', error);
        }
    }

    createProgressUI() {
        // Create progress section in the results
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        const progressSection = document.createElement('div');
        progressSection.id = 'progressSection';
        progressSection.className = 'mt-12';
        progressSection.innerHTML = `
            <div class="bg-white shadow rounded-lg p-6 mb-8">
                <h3 class="text-xl font-bold text-gray-900 mb-4">
                    <i class="fas fa-chart-line text-blue-600 mr-2"></i>Your Learning Progress
                </h3>
                <div id="progressContainer" class="space-y-6">
                    <!-- Progress bars will be added here -->
                    <p class="text-gray-500 text-center py-4">Complete a skill analysis to see your progress</p>
                </div>
            </div>
        `;

        // Add progress section after the results
        resultsSection.appendChild(progressSection);
    }


    updateProgress(requiredSkills, userSkills) {
        // Update progress for each required skill
        requiredSkills.forEach(skill => {
            const hasSkill = userSkills.includes(skill);
            const level = hasSkill ? 'intermediate' : 'beginner';
            const progress = hasSkill ? 100 : 0;
            
            if (!this.skills.has(skill)) {
                this.skills.set(skill, {
                    level,
                    progress,
                    hoursSpent: 0,
                    totalHours: level === 'beginner' ? 20 : 40, // 20h for beginner, 40h for intermediate
                    lastPracticed: new Date().toISOString()
                });
            }
        });

        // Save to localStorage
        this.saveProgress();
        
        // Update the UI
        this.renderProgress();
    }

    
    addPracticeTime(skill, hours) {
        if (!this.skills.has(skill)) {
            this.skills.set(skill, {
                level: 'beginner',
                progress: 0,
                hoursSpent: 0,
                totalHours: 20,
                lastPracticed: new Date().toISOString()
            });
        }
        
        const skillData = this.skills.get(skill);
        skillData.hoursSpent = Math.min(skillData.hoursSpent + hours, skillData.totalHours);
        skillData.progress = Math.round((skillData.hoursSpent / skillData.totalHours) * 100);
        
        // Update level if enough hours spent
        if (skillData.level === 'beginner' && skillData.hoursSpent >= 20) {
            skillData.level = 'intermediate';
            skillData.totalHours = 40; // Now need 40 total hours for advanced
        } else if (skillData.level === 'intermediate' && skillData.hoursSpent >= 40) {
            skillData.level = 'advanced';
            skillData.totalHours = 100; // Now need 100 total hours for expert
        }
        
        skillData.lastPracticed = new Date().toISOString();
        
        // Save and update UI
        this.saveProgress();
        this.renderProgress();
    }
    
    getEstimatedCompletion(skill) {
        if (!this.skills.has(skill)) return 'Not started';
        
        const skillData = this.skills.get(skill);
        const remainingHours = skillData.totalHours - skillData.hoursSpent;
        
        if (remainingHours <= 0) return 'Completed';
        
        // Assuming 2 hours per week of practice
        const weeks = Math.ceil(remainingHours / 2);
        return `${weeks} week${weeks !== 1 ? 's' : ''} remaining`;
    }
    
    getLevelBadge(level) {
        const colors = {
            'beginner': 'bg-blue-100 text-blue-800',
            'intermediate': 'bg-yellow-100 text-yellow-800',
            'advanced': 'bg-green-100 text-green-800',
            'expert': 'bg-purple-100 text-purple-800'
        };
        
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-800'}">
            ${level.charAt(0).toUpperCase() + level.slice(1)}
        </span>`;
    }
    
    renderProgress() {
        const container = document.getElementById('progressContainer');
        if (!container) {
            console.warn('Progress container not found');
            return;
        }
        
        if (!this.skills || this.skills.size === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Complete a skill analysis to see your progress</p>';
            return;
        }
        
        try {
            let html = '';
            
            // Sort skills by progress (descending)
            const sortedSkills = Array.from(this.skills.entries())
                .sort((a, b) => (b[1]?.progress || 0) - (a[1]?.progress || 0));
            
            sortedSkills.forEach(([skill, data]) => {
                if (!data) return;
                
                const estimatedCompletion = this.getEstimatedCompletion(skill);
                const progressPercent = Math.min(Math.max(data.progress || 0, 0), 100);
                
                html += `
                    <div class="mb-4">
                        <div class="flex justify-between items-center mb-1">
                            <div class="flex items-center">
                                <span class="font-medium text-gray-700">${skill}</span>
                                <span class="ml-2">${this.getLevelBadge(data.level || 'beginner')}</span>
                            </div>
                            <span class="text-sm text-gray-500">${progressPercent}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="flex justify-between mt-1">
                            <span class="text-xs text-gray-500">${data.hoursSpent || 0} / ${data.totalHours || 20} hours</span>
                            <span class="text-xs text-gray-500">${estimatedCompletion}</span>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html || '<p class="text-gray-500 text-center py-4">No progress data available</p>';
        } catch (error) {
            console.error('Error rendering progress:', error);
            container.innerHTML = '<p class="text-red-500 text-center py-4">Error loading progress. Please refresh the page.</p>';
        }
    }
    
    saveProgress() {
        localStorage.setItem('learningProgress', JSON.stringify(Array.from(this.skills.entries())));
    }
    
    loadProgress() {
        const savedProgress = localStorage.getItem('learningProgress');
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                this.skills = new Map(parsed);
            } catch (e) {
                console.error('Error loading progress:', e);
            }
        }
    }
}

// Progress tracker is now initialized in the main HTML file
