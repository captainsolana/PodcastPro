#!/bin/bash
# test-dev-api.sh - Test the development API

echo "🧪 Testing Development API..."
echo "Waiting for server to be ready..."
sleep 3

echo "📊 Testing projects endpoint..."
curl -s "http://localhost:3001/api/projects?userId=single-user" | python3 -m json.tool | head -30

echo ""
echo "🎵 Testing if we can see audio files from production..."
curl -s "http://localhost:3001/api/projects?userId=single-user" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    projects = data if isinstance(data, list) else []
    audio_projects = [p for p in projects if p.get('audioUrl')]
    print(f'Found {len(projects)} total projects')
    print(f'Found {len(audio_projects)} projects with audio')
    if audio_projects:
        print('✅ Production data access working!')
        print('Sample project:', audio_projects[0]['title'][:50] + '...')
    else:
        print('ℹ️ No audio projects found (this is normal if no projects exist)')
except Exception as e:
    print('❌ Error parsing response:', e)
"

echo ""
echo "✅ Development API test complete!"
