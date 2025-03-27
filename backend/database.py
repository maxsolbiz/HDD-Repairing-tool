# database.py
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base
from config import DATABASE_URL  # Import from config

# Optional: Setup logging for SQLAlchemy
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Configure the engine with additional pool settings
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,       # Adjust based on your expected load
    max_overflow=20,    # Allow additional connections if needed
    pool_timeout=30     # Timeout for acquiring a connection
)

# Using scoped_session for better session management in web apps
SessionLocal = scoped_session(sessionmaker(bind=engine, autocommit=False, autoflush=False))

def init_db():
    """
    Initializes the database by creating all tables.
    In production, consider using a migration tool like Alembic.
    """
    Base.metadata.create_all(bind=engine)

def get_db():
    """
    Dependency function to get a database session.
    It yields a session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logging.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
