#!/bin/bash
# Railway deployment fix script

echo "🚀 Running Railway database migration..."

# Run the quick fix script
python3 quick_fix.py

echo "✅ Migration completed!"

# Start the application
python3 -m lok_backend.app