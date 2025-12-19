import sys
import os
import importlib.util

# Add the backend directory to the path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Manually load app.py to avoid conflict with app folder
spec = importlib.util.spec_from_file_location("main_app", os.path.join(backend_dir, "app.py"))
main_app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(main_app)

from models import db

app = main_app.create_app()

with app.app_context():
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()
    main_app.seed_database()
    print("\nDatabase reset complete!")
