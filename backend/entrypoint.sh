#!/bin/bash

echo "🚀 Starting Tag Game Setup..."

# Wait for database
echo "⏳ Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "✅ Database is ready!"

# Wait for redis
echo "⏳ Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "✅ Redis is ready!"

# Run migrations
echo "📦 Running database migrations..."
python manage.py migrate

# Create admin user
echo "👤 Creating admin user..."
python manage.py create_admin

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Initialize game settings
echo "⚙️ Initializing game settings..."
python manage.py shell -c "
from game.models import GameSettings
GameSettings.get_settings()
print('Game settings initialized')
"

echo "✅ Setup complete!"

# Start server
echo "🚀 Starting Django server..."
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
