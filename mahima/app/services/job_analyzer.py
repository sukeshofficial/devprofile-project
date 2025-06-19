import re
import PyPDF2
from docx import Document
from typing import List, Dict, Optional
import spacy
import os

class JobAnalyzer:
    def __init__(self):
        """
        Initialize the JobAnalyzer
        """
        self.nlp = spacy.load("en_core_web_sm")
        self.skills_keywords = [
            'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go',
            'machine learning', 'data science', 'artificial intelligence', 'ai', 'ml', 'deep learning',
            'web development', 'mobile development', 'devops', 'cloud', 'aws', 'azure', 'gcp',
            'docker', 'kubernetes', 'ci/cd', 'git', 'sql', 'nosql', 'mongodb', 'postgresql',
            'react', 'angular', 'vue', 'node.js', 'django', 'flask', 'fastapi', 'spring',
            'agile', 'scrum', 'kanban', 'project management'
        ]

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = '\n'.join(page.extract_text() for page in reader.pages)
        return text

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = Document(file_path)
        return '\n'.join(paragraph.text for paragraph in doc.paragraphs)

    def extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using NLP and keyword matching"""
        doc = self.nlp(text.lower())
        
        # Extract noun chunks and named entities
        skills = set()
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.lower()
            if any(skill in chunk_text for skill in self.skills_keywords):
                skills.add(chunk_text)
        
        # Add any direct matches from keywords
        for word in text.lower().split():
            if word in self.skills_keywords and word not in skills:
                skills.add(word)
        
        return list(skills)

    def get_learning_resources(self, skill: str) -> List[Dict]:
        """
        Get learning resources for a skill (stub implementation)
        
        Args:
            skill: The skill to find resources for
            
        Returns:
            List of resource dictionaries with title and URL
        """
        # This is a stub implementation that doesn't require any API key
        # In a real application, you might want to implement alternative resource providers
        # or use a different API that doesn't require authentication
        
        # Return a simple message about the skill
        return [
            {
                'title': f'Learn {skill} - Documentation',
                'url': f'https://www.google.com/search?q={skill.replace(" ", "+")}+documentation',
                'type': 'documentation',
                'source': 'Google Search',
                'description': f'Search for {skill} documentation on Google'
            },
            {
                'title': f'{skill} Tutorials - FreeCodeCamp',
                'url': f'https://www.freecodecamp.org/news/search/?query={skill.replace(" ", "+")}',
                'type': 'tutorial',
                'source': 'FreeCodeCamp',
                'description': f'Free {skill} tutorials on FreeCodeCamp'
            },
            {
                'title': f'{skill} Courses - edX',
                'url': f'https://www.edx.org/search?q={skill.replace(" ", "+")}',
                'type': 'course',
                'source': 'edX',
                'description': f'Online courses for learning {skill} on edX'
            }
        ]

    def analyze_job_offer(self, file_path: str) -> Dict:
        """
        Analyze job offer and return skills with learning resources
        
        Args:
            file_path: Path to the job offer file
            
        Returns:
            Dict containing extracted text, skills, and learning resources
        """
        try:
            # Determine file type and extract text
            if file_path.lower().endswith('.pdf'):
                text = self.extract_text_from_pdf(file_path)
            elif file_path.lower().endswith(('.docx', '.doc')):
                text = self.extract_text_from_docx(file_path)
            else:
                text = self.extract_text_from_txt(file_path)
                
            if not text.strip():
                raise ValueError("The uploaded file appears to be empty or could not be read properly.")
                
            # Extract skills
            skills = self.extract_skills(text)
            
            # Get learning resources for each skill
            learning_resources = []
            for skill in skills[:10]:  # Limit to first 10 skills to avoid too many resources
                try:
                    resources = self.get_learning_resources(skill)
                    if resources:
                        learning_resources.append({
                            'skill': skill,
                            'resources': resources[:5]  # Limit to 5 resources per skill
                        })
                except Exception as e:
                    print(f"Error getting resources for skill '{skill}': {str(e)}")
                    continue
            
            return {
                'success': True,
                'extracted_text': text[:1000] + '...' if len(text) > 1000 else text,
                'skills': skills,
                'learning_resources': learning_resources,
                'metadata': {
                    'total_skills': len(skills),
                    'resource_count': len(learning_resources)
                }
            }
            
        except Exception as e:
            print(f"Error in analyze_job_offer: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'extracted_text': '',
                'skills': [],
                'learning_resources': []
            }
