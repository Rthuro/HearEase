#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Convert static files
python manage.py collectstatic --no-input

python manage.py migrate

# --- SEEDING DATA ---
python manage.py seed_barangays
python manage.py seed_case_types
python manage.py seed_relationships
python manage.py seed_settlements

# --- CREATING DOCUMENTS ---
python manage.py create_default_templates
