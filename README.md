# 🇰🇪 Kenyan Diabetes Management App

A culturally-adapted diabetes management platform designed specifically for Kenyan patients, offering bilingual support (English/Swahili), local food insights, and AI-powered glucose predictions.

## 🎯 Project Overview

This full-stack application addresses the unique needs of Kenya's 458,000+ diabetes patients through localized content, gamification, and smart healthcare integration. Built with Flask (backend) and React (frontend), it provides a comprehensive diabetes management solution that understands Kenyan culture, food, and healthcare system.

## 🚀 Key Features

### ✅ **Core Diabetes Management**
- Blood sugar tracking with color-coded results
- Medication reminders with overdue detection
- BMI calculator with health insights
- Doctor-patient relationship management

### ✅ **Kenyan Localization**
- **Bilingual Support**: Full English/Swahili interface
- **Local Food Database**: 8 traditional foods (ugali, sukuma wiki, chapati, etc.)
- **Cultural Context**: NHIF integration, traditional herbs awareness
- **Local Statistics**: Kenya-specific diabetes education

### ✅ **Smart Features**
- **AI-Powered Alerts**: Glucose pattern analysis and predictions
- **Food Impact Predictor**: Personalized recommendations for Kenyan foods
- **Gamification**: Daily challenges, badges, progress tracking
- **Interactive Education**: Diabetes lessons with quizzes

## 🏗️ Technical Architecture

### Backend (Flask API)
```
server/
├── app.py                 # Main Flask application with 15+ API endpoints
├── config.py             # Database and app configuration
├── models.py             # 5 SQLAlchemy models with relationships
├── seed.py               # Sample data including Kenyan doctors and foods
├── kenyan_foods.py       # Local food database with glucose impact data
├── glucose_predictor.py  # AI pattern analysis and predictive alerts
├── gamification.py       # Badge system and daily challenges
└── migrations/           # Database migration files
```

### Frontend (React SPA)
```
client/src/
├── components/
│   ├── App.js            # Main app with routing (9 routes)
│   ├── AuthContext.js    # Authentication state management
│   ├── Dashboard.js      # Welcome page with BMI and doctor info
│   ├── Readings.js       # Blood sugar tracking with color coding
│   ├── Medications.js    # Smart medication reminders
│   ├── FoodInsights.js   # Kenyan food database with recommendations
│   ├── SmartAlerts.js    # AI-powered glucose pattern alerts
│   ├── Gamification.js   # Progress tracking, badges, challenges
│   ├── Education.js      # Interactive diabetes education modules
│   └── Profile.js        # User profile with doctor assignment
├── contexts/
│   └── LanguageContext.js # Bilingual support (English/Swahili)
└── utils/
    └── translations.js    # Translation strings for localization
```

### Database Schema
```
Models & Relationships:
├── User (1:many → Reading, Medication) + (many:1 → Doctor)
├── Doctor (1:many → User)
├── Reading (many:many → Meal via reading_meals association)
├── Medication (many:1 → User)
└── Meal (many:many → Reading via reading_meals)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### 1. Clone and Setup Repository
```bash
git clone <your-repo-url>
cd Diabetes-Management-App
```

### 2. Backend Setup

```bash
cd server
pipenv install
pipenv shell
```

### 3. Database Setup
```bash
# Initialize database and migrations
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed with sample data (including Kenyan doctors and foods)
python seed.py
```

### 4. Start Backend Server
```bash
python app.py
```
The API will be available at `http://localhost:5555`

### 5. Frontend Setup

```bash
cd ../client
npm install
```

### 6. Start Frontend Development Server
```bash
npm start
```
The React app will be available at `http://localhost:3000`

## 🧪 Testing the Application

### Sample Login Credentials
After running the seed script, you can login with:
- **Email**: `user1@example.com`
- **Password**: `password123`

### Key User Flows to Test
1. **Language Toggle**: Click 🇰🇪 SW / 🇺🇸 EN button in navbar
2. **Blood Sugar Tracking**: Add readings and see color-coded results
3. **Food Insights**: Explore Kenyan foods and their glucose impact
4. **Smart Alerts**: Add multiple readings to trigger pattern analysis
5. **Gamification**: Complete daily challenges and earn badges
6. **Doctor Assignment**: Assign a doctor in Profile page

## Generating Your Database

NOTE: The initial project directory structure does not contain the `instance` or
`migrations` folders. Change into the `server` directory:

```console
cd server
```

Then enter the commands to create the `instance` and `migrations` folders and
the database `app.db` file:

```
flask db init
flask db upgrade head
```

Type `tree -L 2` within the `server` folder to confirm the new directory
structure:

```console
.
├── app.py
├── config.py
├── instance
│   └── app.db
├── migrations
│   ├── README
│   ├── __pycache__
│   ├── alembic.ini
│   ├── env.py
│   ├── script.py.mako
│   └── versions
├── models.py
└── seed.py
```

Edit `models.py` and start creating your models. Import your models as needed in
other modules, i.e. `from models import ...`.

Remember to regularly run
`flask db revision --autogenerate -m'<descriptive message>'`, replacing
`<descriptive message>` with an appropriate message, and `flask db upgrade head`
to track your modifications to the database and create checkpoints in case you
ever need to roll those modifications back.

> **Tip: It's always a good idea to start with an empty revision! This allows
> you to roll all the way back while still holding onto your database. You can
> create this empty revision with `flask db revision -m'Create DB'`.**

If you want to seed your database, now would be a great time to write out your
`seed.py` script and run it to generate some test data. Faker has been included
in the Pipfile if you'd like to use that library.

---

#### `config.py`

When developing a large Python application, you might run into a common issue:
_circular imports_. A circular import occurs when two modules import from one
another, such as `app.py` and `models.py`. When you create a circular import and
attempt to run your app, you'll see the following error:

```console
ImportError: cannot import name
```

If you're going to need an object in multiple modules like `app` or `db`,
creating a _third_ module to instantiate these objects can save you a great deal
of circular grief. Here's a good start to a Flask config file (you may need more
if you intend to include features like authentication and passwords):

```py
# Standard library imports

# Remote library imports
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

# Local imports

# Instantiate app, set attributes
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# Define metadata, instantiate db
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app)

```

Now let's review that last line...

#### CORS

CORS (Cross-Origin Resource Sharing) is a system that uses HTTP headers to
determine whether resources from different servers-of-origin can be accessed. If
you're using the fetch API to connect your frontend to your Flask backend, you
need to configure CORS on your Flask application instance. Lucky for us, that
only takes one line:

```py
CORS(app)

```

By default, Flask-CORS enables CORS on all routes in your application with all
fetching servers. You can also specify the resources that allow CORS. The
following specifies that routes beginning with `api/` allow CORS from any
originating server:

```py
CORS(app, resources={r"/api/*": {"origins": "*"}})

```

You can also set this up resource-by-resource by importing and using the
`@cross_origin` decorator:

```py
@app.route("/")
@cross_origin()
def howdy():
  return "Howdy partner!"

```

---

## Updating Your README.md

`README.md` is a Markdown file that describes your project. These files can be
used in many different ways- you may have noticed that we use them to generate
entire Canvas lessons- but they're most commonly used as homepages for online
Git repositories. **When you develop something that you want other people to
use, you need to have a README.**

Markdown is not a language that we cover in Flatiron's Software Engineering
curriculum, but it's not a particularly difficult language to learn (if you've
ever left a comment on Reddit, you might already know the basics). Refer to the
cheat sheet in this lesson's resources for a basic guide to Markdown.

### What Goes into a README?

This README should serve as a template for your own- go through the important
files in your project and describe what they do. Each file that you edit (you
can ignore your migration files) should get at least a paragraph. Each function
should get a small blurb.

You should descibe your application first, and with a good level of detail. The
rest should be ordered by importance to the user. (Probably routes next, then
models.)

Screenshots and links to resources that you used throughout are also useful to
users and collaborators, but a little more syntactically complicated. Only add
these in if you're feeling comfortable with Markdown.

---

## Conclusion

A lot of work goes into a full-stack application, but it all relies on concepts
that you've practiced thoroughly throughout this phase. Hopefully this template
and guide will get you off to a good start with your Phase 4 Project.

Happy coding!

---

## Resources

- [Setting up a respository - Atlassian](https://www.atlassian.com/git/tutorials/setting-up-a-repository)
- [Create a repo- GitHub Docs](https://docs.github.com/en/get-started/quickstart/create-a-repo)
- [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)
- [Python Circular Imports - StackAbuse](https://stackabuse.com/python-circular-imports/)
- [Flask-CORS](https://flask-cors.readthedocs.io/en/latest/)
