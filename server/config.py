
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy import MetaData


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-string'  
app.json.compact = False


metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)
api = Api(app)

jwt = JWTManager(app)


CORS(
    app,
    resources={r"/*": {"origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "https://diabetes-management-app-gamma.vercel.app",
        "*"  # Allow all origins for now - you can restrict this later
    ]}},
    supports_credentials=True,
)
