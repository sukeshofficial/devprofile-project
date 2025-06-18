// Job Analysis Module
class JobAnalysis {
    constructor() {
        this.textTab = document.getElementById('textTab');
        this.fileTab = document.getElementById('fileTab');
        this.textInputSection = document.getElementById('textInputSection');
        this.fileInputSection = document.getElementById('fileInputSection');
        this.dropZone = document.getElementById('dropZone');
        this.jobFileInput = document.getElementById('jobFile');
        this.fileName = document.getElementById('fileName');
        this.fileError = document.getElementById('fileError');
        this.analyzeJobBtn = document.getElementById('analyzeJobBtn');
        this.jobAnalysisStatus = document.getElementById('jobAnalysisStatus');
        this.jobAnalysisResults = document.getElementById('jobAnalysisResults');
        this.extractedSkills = document.getElementById('extractedSkills');
        this.youtubeVideos = document.getElementById('youtubeVideos');
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Tab switching
        this.textTab.addEventListener('click', () => this.switchTab('text'));
        this.fileTab.addEventListener('click', () => this.switchTab('file'));
        
        // File input handling
        this.jobFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            if (e.dataTransfer.files.length) {
                this.jobFileInput.files = e.dataTransfer.files;
                this.updateFileName();
            }
        });
        
        // Analyze button
        this.analyzeJobBtn.addEventListener('click', () => this.analyzeJob());
    }
    
    switchTab(tab) {
        if (tab === 'text') {
            this.textTab.classList.add('border-blue-500', 'text-blue-600');
            this.textTab.classList.remove('border-transparent', 'text-gray-500');
            this.fileTab.classList.remove('border-blue-500', 'text-blue-600');
            this.fileTab.classList.add('border-transparent', 'text-gray-500');
            this.textInputSection.classList.remove('hidden');
            this.fileInputSection.classList.add('hidden');
        } else {
            this.fileTab.classList.add('border-blue-500', 'text-blue-600');
            this.fileTab.classList.remove('border-transparent', 'text-gray-500');
            this.textTab.classList.remove('border-blue-500', 'text-blue-600');
            this.textTab.classList.add('border-transparent', 'text-gray-500');
            this.fileInputSection.classList.remove('hidden');
            this.textInputSection.classList.add('hidden');
        }
    }
    
    handleFileSelect(event) {
        if (this.jobFileInput.files && this.jobFileInput.files[0]) {
            const file = this.jobFileInput.files[0];
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|txt)$/i)) {
                this.showFileError('Please upload a PDF, DOCX, or TXT file.');
                return;
            }
            
            if (file.size > maxSize) {
                this.showFileError('File size must be less than 10MB.');
                return;
            }
            
            this.updateFileName();
        }
    }
    
    updateFileName() {
        if (this.jobFileInput.files && this.jobFileInput.files[0]) {
            const file = this.jobFileInput.files[0];
            this.fileName.innerHTML = `
                <span class="text-green-600 font-medium">${file.name}</span> 
                <span class="text-gray-500">(${(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            `;
            this.fileError.textContent = '';
        } else {
            this.fileName.innerHTML = '<span class="text-gray-500">No file selected</span>';
        }
    }
    
    showFileError(message) {
        this.fileError.textContent = message;
        this.jobFileInput.value = '';
        this.fileName.innerHTML = '<span class="text-gray-500">No file selected</span>';
    }
    
    async analyzeJob() {
        const jobDescription = document.getElementById('jobDescription').value.trim();
        const fileInput = this.jobFileInput.files[0];
        
        // Validate input
        if (!jobDescription && !fileInput) {
            this.showError('Please enter a job description or upload a file.');
            return;
        }
        
        this.showLoading(true);
        this.jobAnalysisResults.classList.add('hidden');
        
        try {
            const formData = new FormData();
            
            if (fileInput) {
                formData.append('file', fileInput);
            } else {
                formData.append('text', jobDescription);
            }
            
            // Send to backend for analysis
            const response = await fetch('/analyze-job', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            this.displayResults(data);
            
        } catch (error) {
            console.error('Error analyzing job description:', error);
            this.showError('Failed to analyze job description. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }
    
    showLoading(show) {
        if (show) {
            this.analyzeJobBtn.disabled = true;
            this.analyzeJobBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin mr-2"></i> Analyzing...
            `;
            this.jobAnalysisStatus.textContent = 'Processing your job description...';
        } else {
            this.analyzeJobBtn.disabled = false;
            this.analyzeJobBtn.innerHTML = `
                <i class="fas fa-search mr-2"></i> Analyze Job Description
            `;
            this.jobAnalysisStatus.textContent = '';
        }
    }
    
    showError(message) {
        this.jobAnalysisStatus.textContent = '';
        alert(message); // Replace with a better error display
    }
    
    displayResults(data) {
        // Display extracted skills
        this.extractedSkills.innerHTML = '';
        if (data.skills && data.skills.length > 0) {
            data.skills.forEach(skill => {
                const skillElement = document.createElement('span');
                skillElement.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';
                skillElement.textContent = skill;
                this.extractedSkills.appendChild(skillElement);
            });
        } else {
            this.extractedSkills.innerHTML = '<p class="text-gray-500">No specific skills detected. Try a more detailed job description.</p>';
        }
        
        // Display YouTube videos
        this.youtubeVideos.innerHTML = '';
        if (data.videos && data.videos.length > 0) {
            data.videos.forEach(video => {
                const videoElement = document.createElement('div');
                videoElement.className = 'bg-gray-50 rounded-lg overflow-hidden border border-gray-200';
                videoElement.innerHTML = `
                    <div class="md:flex">
                        <div class="md:flex-shrink-0">
                            <img class="h-48 w-full md:w-80 object-cover" 
                                 src="${video.thumbnail}" 
                                 alt="${video.title}">
                        </div>
                        <div class="p-6">
                            <div class="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
                                ${video.channelTitle || 'YouTube'}
                            </div>
                            <a href="${video.url}" target="_blank" class="block mt-1 text-lg font-medium text-gray-900 hover:text-blue-600">
                                ${this.escapeHtml(video.title)}
                            </a>
                            <p class="mt-2 text-gray-600 text-sm">
                                ${video.description ? this.escapeHtml(video.description.substring(0, 150)) + '...' : ''}
                            </p>
                            <div class="mt-4 flex items-center">
                                <span class="text-sm text-gray-500">
                                    <i class="far fa-clock mr-1"></i> ${video.duration || ''}
                                </span>
                                <span class="ml-4 text-sm text-gray-500">
                                    <i class="far fa-eye mr-1"></i> ${video.viewCount ? this.formatNumber(video.viewCount) + ' views' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                this.youtubeVideos.appendChild(videoElement);
            });
        } else {
            this.youtubeVideos.innerHTML = `
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-video-slash text-3xl text-gray-300 mb-2"></i>
                    <p>No video recommendations found. Try a different job description.</p>
                </div>
            `;
        }
        
        // Show results section
        this.jobAnalysisResults.classList.remove('hidden');
        this.jobAnalysisResults.scrollIntoView({ behavior: 'smooth' });
    }
    
    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobAnalysis = new JobAnalysis();
});
