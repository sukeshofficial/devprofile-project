from setuptools import setup, find_packages

setup(
    name="dev_profile_optimizer",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        'fastapi>=0.68.0',
        'uvicorn>=0.15.0',
        'python-dotenv>=0.19.0',
        'httpx>=0.23.0',
        'jinja2>=3.0.0',
        'python-multipart>=0.0.5',
    ],
    python_requires='>=3.7',
)
