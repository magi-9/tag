#!/bin/bash

# Script to generate VAPID keys and update .env files
# Run this after setting up the project

set -e

echo "🔐 Generating VAPID keys for Web Push notifications..."
echo ""

# Check if backend is running
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo "⚠️  Backend container is not running. Starting it..."
    docker-compose up -d backend
    sleep 5
fi

# Generate VAPID keys using Django management command
echo "Generating keys..."
VAPID_OUTPUT=$(docker-compose exec -T backend python manage.py shell << 'EOF'
from py_vapid import Vapid
vapid = Vapid()
vapid.generate_keys()
print(f"PUBLIC:{vapid.public_key.savePublicKey().decode()}")
print(f"PRIVATE:{vapid.private_key.encode().decode()}")
EOF
)

# Extract keys
PUBLIC_KEY=$(echo "$VAPID_OUTPUT" | grep "PUBLIC:" | cut -d: -f2)
PRIVATE_KEY=$(echo "$VAPID_OUTPUT" | grep "PRIVATE:" | cut -d: -f2)

if [ -z "$PUBLIC_KEY" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Failed to generate VAPID keys!"
    echo "Try running manually:"
    echo "docker-compose exec backend python manage.py shell"
    echo ">>> from py_vapid import Vapid"
    echo ">>> vapid = Vapid()"
    echo ">>> vapid.generate_keys()"
    echo ">>> print(vapid.public_key.savePublicKey().decode())"
    echo ">>> print(vapid.private_key.encode().decode())"
    exit 1
fi

echo ""
echo "✅ VAPID keys generated successfully!"
echo ""
echo "📝 Updating .env files..."

# Update backend .env files
for ENV_FILE in backend/.env backend/.env.prod; do
    if [ -f "$ENV_FILE" ]; then
        # Update or add VAPID keys
        if grep -q "^VAPID_PUBLIC_KEY=" "$ENV_FILE"; then
            sed -i "s|^VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$PUBLIC_KEY|" "$ENV_FILE"
            sed -i "s|^VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$PRIVATE_KEY|" "$ENV_FILE"
        else
            echo "VAPID_PUBLIC_KEY=$PUBLIC_KEY" >> "$ENV_FILE"
            echo "VAPID_PRIVATE_KEY=$PRIVATE_KEY" >> "$ENV_FILE"
        fi
        echo "✅ Updated $ENV_FILE"
    fi
done

# Update frontend .env files
for ENV_FILE in frontend/.env frontend/.env.prod; do
    if [ -f "$ENV_FILE" ]; then
        if grep -q "^VITE_VAPID_PUBLIC_KEY=" "$ENV_FILE"; then
            sed -i "s|^VITE_VAPID_PUBLIC_KEY=.*|VITE_VAPID_PUBLIC_KEY=$PUBLIC_KEY|" "$ENV_FILE"
        else
            echo "VITE_VAPID_PUBLIC_KEY=$PUBLIC_KEY" >> "$ENV_FILE"
        fi
        echo "✅ Updated $ENV_FILE"
    fi
done

echo ""
echo "🎉 All done!"
echo ""
echo "Public Key: $PUBLIC_KEY"
echo ""
echo "⚠️  Keep the private key secret!"
echo ""
echo "🔄 Restart services for changes to take effect:"
echo "docker-compose restart backend frontend"
