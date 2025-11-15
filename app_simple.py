from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import uuid
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=['*'])

# Emotion to Music Database
emotion_music_db = {
    "happy": [
        {"id": "h1", "title": "Sunshine Day", "artist": "Happy Vibes", "genre": "Pop", "mood": "uplifting", "energy": 8},
        {"id": "h2", "title": "Dancing Lights", "artist": "Joy Band", "genre": "Dance", "mood": "energetic", "energy": 9},
        {"id": "h3", "title": "Celebration Time", "artist": "Euphoria", "genre": "Rock", "mood": "triumphant", "energy": 7}
    ],
    "sad": [
        {"id": "s1", "title": "Melancholy Rain", "artist": "Blue Mood", "genre": "Ambient", "mood": "reflective", "energy": 2},
        {"id": "s2", "title": "Quiet Thoughts", "artist": "Solitude", "genre": "Indie", "mood": "contemplative", "energy": 3},
        {"id": "s3", "title": "Gentle Tears", "artist": "Peace", "genre": "Classical", "mood": "healing", "energy": 1}
    ],
    "neutral": [
        {"id": "n1", "title": "Calm Waters", "artist": "Tranquil", "genre": "Ambient", "mood": "peaceful", "energy": 3},
        {"id": "n2", "title": "Morning Coffee", "artist": "Chill", "genre": "Jazz", "mood": "relaxed", "energy": 4},
        {"id": "n3", "title": "Steady Flow", "artist": "Balance", "genre": "Electronic", "mood": "focused", "energy": 5}
    ],
    "angry": [
        {"id": "a1", "title": "Storm Break", "artist": "Thunder", "genre": "Metal", "mood": "releasing", "energy": 9},
        {"id": "a2", "title": "Fire Storm", "artist": "Rage", "genre": "Rock", "mood": "cathartic", "energy": 8},
        {"id": "a3", "title": "Intense Focus", "artist": "Power", "genre": "Industrial", "mood": "channeling", "energy": 7}
    ],
    "surprised": [
        {"id": "su1", "title": "Wonder Struck", "artist": "Amazing", "genre": "Pop", "mood": "curious", "energy": 6},
        {"id": "su2", "title": "Unexpected Joy", "artist": "Surprise", "genre": "Electronic", "mood": "excited", "energy": 7},
        {"id": "su3", "title": "Magic Moments", "artist": "Wonder", "genre": "Orchestral", "mood": "awe", "energy": 5}
    ],
    "fearful": [
        {"id": "f1", "title": "Safe Harbor", "artist": "Comfort", "genre": "Ambient", "mood": "soothing", "energy": 2},
        {"id": "f2", "title": "Gentle Waves", "artist": "Calm Shore", "genre": "Nature", "mood": "grounding", "energy": 3},
        {"id": "f3", "title": "Peaceful Mind", "artist": "Zen", "genre": "Meditation", "mood": "protective", "energy": 1}
    ],
    "disgusted": [
        {"id": "d1", "title": "Clean Slate", "artist": "Fresh", "genre": "Indie", "mood": "cleansing", "energy": 4},
        {"id": "d2", "title": "New Beginning", "artist": "Reset", "genre": "Electronic", "mood": "refreshing", "energy": 5},
        {"id": "d3", "title": "Pure Light", "artist": "Clarity", "genre": "Ambient", "mood": "purifying", "energy": 3}
    ]
}

sessions = {}
emotion_history = []

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'emotionTypes': list(emotion_music_db.keys()),
        'totalTracks': sum(len(tracks) for tracks in emotion_music_db.values()),
        'activeSessions': len(sessions)
    })

@app.route('/api/emotions', methods=['POST'])
def store_emotion():
    try:
        data = request.get_json()
        emotion = data.get('emotion')
        confidence = data.get('confidence')
        session_id = data.get('sessionId', 'anonymous')
        
        if not emotion or confidence is None:
            return jsonify({'error': 'Missing emotion or confidence'}), 400
        
        emotion_entry = {
            'id': str(uuid.uuid4()),
            'emotion': emotion.lower(),
            'confidence': float(confidence),
            'sessionId': session_id,
            'timestamp': datetime.now().isoformat()
        }
        
        emotion_history.append(emotion_entry)
        
        return jsonify({
            'success': True,
            'data': emotion_entry
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to store emotion'}), 500

@app.route('/api/recommendations/<emotion>', methods=['GET'])
def get_recommendations(emotion):
    try:
        emotion_key = emotion.lower()
        limit = int(request.args.get('limit', 3))
        intensity = request.args.get('intensity')
        shuffle = request.args.get('shuffle', 'false')
        
        recommendations = emotion_music_db.get(emotion_key, emotion_music_db['neutral'])
        
        # Apply intensity filtering
        if intensity:
            intensity_value = float(intensity)
            if intensity_value >= 0.7:
                recommendations = [track for track in recommendations if track['energy'] >= 6]
            elif intensity_value <= 0.3:
                recommendations = [track for track in recommendations if track['energy'] <= 4]
        
        # Shuffle if requested
        if shuffle.lower() == 'true':
            import random
            recommendations = random.sample(recommendations, len(recommendations))
        
        # Limit results
        recommendations = recommendations[:min(limit, len(recommendations))]
        
        # Add URLs and timestamps
        for track in recommendations:
            track['url'] = f'/api/music/{track["id"]}'
            track['recommendedAt'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'emotion': emotion_key,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recommendations'}), 500

@app.route('/api/music/<track_id>', methods=['GET'])
def get_track(track_id):
    try:
        # Find track across all emotions
        track = None
        for emotion_tracks in emotion_music_db.values():
            for t in emotion_tracks:
                if t['id'] == track_id:
                    track = t
                    break
            if track:
                break
        
        if not track:
            return jsonify({'error': 'Track not found'}), 404
        
        # Return track info (demo mode)
        return jsonify({
            'success': True,
            'track': {
                **track,
                'demo': True,
                'message': 'Demo mode - no actual audio file'
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get track'}), 500

@app.route('/api/session', methods=['GET'])
def get_session():
    try:
        session_id = request.args.get('sessionId', str(uuid.uuid4()))
        
        if session_id not in sessions:
            sessions[session_id] = {
                'id': session_id,
                'createdAt': datetime.now().isoformat(),
                'lastActivity': datetime.now().isoformat(),
                'emotionHistory': []
            }
        else:
            sessions[session_id]['lastActivity'] = datetime.now().isoformat()
        
        return jsonify({
            'success': True,
            'session': sessions[session_id]
        })
        
    except Exception as e:
        return jsonify({'error': 'Session error'}), 500

@app.route('/api/emotions', methods=['GET'])
def get_emotions():
    try:
        session_id = request.args.get('sessionId')
        limit = int(request.args.get('limit', 20))
        
        filtered_history = emotion_history.copy()
        if session_id:
            filtered_history = [e for e in filtered_history if e['sessionId'] == session_id]
        
        # Sort by timestamp (newest first) and limit
        filtered_history.sort(key=lambda x: x['timestamp'], reverse=True)
        filtered_history = filtered_history[:limit]
        
        return jsonify({
            'success': True,
            'data': filtered_history
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get emotions'}), 500

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    print('MoodCanvas Singer Backend starting...')
    print('Backend will run on: http://localhost:5000')
    print('Available emotions:', ', '.join(emotion_music_db.keys()))
    print('Ready for frontend connection!')
    app.run(host='0.0.0.0', port=5000, debug=True)
