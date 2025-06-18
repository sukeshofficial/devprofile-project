@echo off
echo Setting up Dev Profile Optimizer...
echo.

:: Create and activate virtual environment
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

:: Install Python dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt

:: Download spaCy model
echo Downloading spaCy language model...
python -m spacy download en_core_web_sm

echo.
echo Setup complete! To start the application, run:
echo venv\Scripts\activate
echo uvicorn app.main:app --reload
echo.
echo Then open http://localhost:8000 in your browser.
pause
