# GROWLYTICS - Child Nutrition Tracking System

A comprehensive web-based system for monitoring child nutrition, growth, blood health, and vaccination status.

## Features

- **Growth Monitoring**: WHO Z-score based malnutrition assessment
- **Blood Report Analysis**: AI-powered deficiency detection
- **Vaccination Tracker**: Indian UIP schedule compliance
- **Meal Planning**: Kerala-specific affordable nutrition plans
- **Multi-role Access**: Parent, Health Center, WHO dashboards

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)
- **Database**: SQL
- **Charts**: Chart.js

## Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python server/server.py
```
Or on Windows:
```bash
run.bat
```

3. Open browser at: `http://localhost:5000`

### Default Users (for testing)

|      Role     | Username  |  Password |
|---------------|-----------|-----------|
|     Parent    |  parent1  | parent123 |
| Health Center |  hc_tvm   |   hc123   |
|      WHO      | who_admin |   who123  |

## Project Structure

```
child-nutrition-tracker/
├── index.html              # Entry point
├── style.css               # Global styles
├── js/                     # Frontend JavaScript
├── pages/                  # HTML pages
├── data/                   # JSON data files
├── server/                 # Python backend
└── requirements.txt        # Python dependencies
```

## License

Academic Project - MIT License
