#!/usr/bin/env python3
"""
Database initialization script for production deployment
"""

from config import app, db
from models import User, Reading, Medication, Meal, Doctor, reading_meals, Reminder, EducationalTip, DoctorMessage, BMISnapshot

def init_database():
    """Initialize database tables and seed with basic data"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Check if we need to seed basic data
        if Doctor.query.count() == 0:
            # Add some basic doctors
            doctors = [
                Doctor(name="Dr. Sarah Johnson", specialization="Endocrinology", phone="+254700123456"),
                Doctor(name="Dr. Michael Chen", specialization="Internal Medicine", phone="+254700123457"),
                Doctor(name="Dr. Amina Hassan", specialization="Family Medicine", phone="+254700123458"),
            ]
            
            for doctor in doctors:
                db.session.add(doctor)
            
            db.session.commit()
            print("✅ Basic doctors seeded!")
        
        print("🎉 Database initialization complete!")

if __name__ == '__main__':
    init_database()
