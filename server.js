const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', '*'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Emotion to Music Database
const emotionMusicDB = {
  happy: [
    { id: 'h1', title: 'Sunshine Day', artist: 'Happy Vibes', genre: 'Pop', mood: 'uplifting', energy: 8 },
    { id: 'h2', title: 'Dancing Lights', artist: 'Joy Band', genre: 'Dance', mood: 'energetic', energy: 9 },
    { id: 'h3', title: 'Celebration Time', artist: 'Euphoria', genre: 'Rock', mood: 'triumphant', energy: 7 }
  ],
  sad: [
    { id: 's1', title: 'Melancholy Rain', artist: 'Blue Mood', genre: 'Ambient', mood: 'reflective', energy: 2 },
    { id: 's2', title: 'Quiet Thoughts', artist: 'Solitude', genre: 'Indie', mood: 'contemplative', energy: 3 },
    { id: 's3', title: 'Gentle Tears', artist: 'Peace', genre: 'Classical', mood: 'healing', energy: 1 }
  ],
  neutral: [
    { id: 'n1', title: 'Calm Waters', artist: 'Tranquil', genre: 'Ambient', mood: 'peaceful', energy: 3 },
    { id: 'n2', title: 'Morning Coffee', artist: 'Chill', genre: 'Jazz', mood: 'relaxed', energy: 4 },
    { id: 'n3', title: 'Steady Flow', artist: 'Balance', genre: 'Electronic', mood: 'focused', energy: 5 }
  ],
  angry: [
    { id: 'a1', title: 'Storm Break', artist: 'Thunder', genre: 'Metal', mood: 'releasing', energy: 9 },
    { id: 'a2', title: 'Fire Storm', artist: 'Rage', genre: 'Rock', mood: 'cathartic', energy: 8 },
    { id: 'a3', title: 'Intense Focus', artist: 'Power', genre: 'Industrial', mood: 'channeling', energy: 7 }
  ],
  surprised: [
    { id: 'su1', title: 'Wonder Struck', artist: 'Amazing', genre: 'Pop', mood: 'curious', energy: 6 },
    { id: 'su2', title: 'Unexpected Joy', artist: 'Surprise', genre: 'Electronic', mood: 'excited', energy: 7 },
    { id: 'su3', title: 'Magic Moments', artist: 'Wonder', genre: 'Orchestral', mood: 'awe', energy: 5 }
  ],
  fearful: [
    { id: 'f1', title: 'Safe Harbor', artist: 'Comfort', genre: 'Ambient', mood: 'soothing', energy: 2 },
    { id: 'f2', title: 'Gentle Waves', artist: 'Calm Shore', genre: 'Nature', mood: 'grounding', energy: 3 },
    { id: 'f3', title: 'Peaceful Mind', artist: 'Zen', genre: 'Meditation', mood: 'protective', energy: 1 }
  ],
  disgusted: [
    { id: 'd1', title: 'Clean Slate', artist: 'Fresh', genre: 'Indie', mood: 'cleansing', energy: 4 },
    { id: 'd2', title: 'New Beginning', artist: 'Reset', genre: 'Electronic', mood: 'refreshing', energy: 5 },
    { id: 'd3', title: 'Pure Light', artist: 'Clarity', genre: 'Ambient', mood: 'purifying', energy: 3 }
  ]
};

let sessions = {};
let emotionHistory = [];

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    emotionTypes: Object.keys(emotionMusicDB),
    totalTracks: Object.values(emotionMusicDB).flat().length,
    activeSessions: Object.keys(sessions).length
  });
});

app.post('/api/emotions', (req, res) => {
  try {
    const { emotion, confidence, sessionId, timestamp } = req.body;
    
    if (!emotion || !confidence) {
      return res.status(400).json({ error: 'Missing emotion or confidence' });
    }

    const emotionEntry = {
      id: uuidv4(),
      emotion: emotion.toLowerCase(),
      confidence: parseFloat(confidence),
      sessionId: sessionId || 'anonymous',
      timestamp: timestamp || new Date().toISOString()
    };

    emotionHistory.push(emotionEntry);
    
    res.json({
      success: true,
      data: emotionEntry
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to store emotion' });
  }
});

app.get('/api/recommendations/:emotion', (req, res) => {
  try {
    const { emotion } = req.params;
    const { limit = 3, intensity, shuffle } = req.query;
    
    const emotionKey = emotion.toLowerCase();
    let recommendations = emotionMusicDB[emotionKey] || emotionMusicDB.neutral;
    
    // Apply intensity filtering
    if (intensity) {
      const intensityValue = parseFloat(intensity);
      if (intensityValue >= 0.7) {
        recommendations = recommendations.filter(track => track.energy >= 6);
      } else if (intensityValue <= 0.3) {
        recommendations = recommendations.filter(track => track.energy <= 4);
      }
    }
    
    // Shuffle if requested
    if (shuffle === 'true') {
      recommendations = recommendations.sort(() => Math.random() - 0.5);
    }
    
    // Limit results
    const limitValue = Math.min(parseInt(limit) || 3, recommendations.length);
    recommendations = recommendations.slice(0, limitValue);
    
    res.json({
      success: true,
      emotion: emotionKey,
      recommendations: recommendations.map(track => ({
        ...track,
        url: `/api/music/${track.id}`,
        recommendedAt: new Date().toISOString()
      }))
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

app.get('/api/music/:trackId', (req, res) => {
  try {
    const { trackId } = req.params;
    
    // Find track across all emotions
    let track = null;
    for (const emotion in emotionMusicDB) {
      track = emotionMusicDB[emotion].find(t => t.id === trackId);
      if (track) break;
    }
    
    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }
    
    // Return track info (in demo mode, no actual audio file)
    res.json({
      success: true,
      track: {
        ...track,
        demo: true,
        message: 'Demo mode - no actual audio file'
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get track' });
  }
});

app.get('/api/session', (req, res) => {
  try {
    const sessionId = req.query.sessionId || uuidv4();
    
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        emotionHistory: []
      };
    } else {
      sessions[sessionId].lastActivity = new Date().toISOString();
    }
    
    res.json({
      success: true,
      session: sessions[sessionId]
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Session error' });
  }
});

app.get('/api/emotions', (req, res) => {
  try {
    const { sessionId, limit = 20 } = req.query;
    
    let filteredHistory = [...emotionHistory];
    if (sessionId) {
      filteredHistory = filteredHistory.filter(e => e.sessionId === sessionId);
    }
    
    filteredHistory = filteredHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: filteredHistory
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get emotions' });
  }
});

// Serve the React app (will create this)
app.get('*', (req, res) => {
  res.json({
    message: 'MoodCanvas Singer API',
    endpoints: [
      'GET /api/status',
      'POST /api/emotions', 
      'GET /api/recommendations/:emotion',
      'GET /api/music/:trackId',
      'GET /api/session',
      'GET /api/emotions'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🎵 MoodCanvas Singer Backend running on http://localhost:${PORT}`);
  console.log(`🔗 Status: http://localhost:${PORT}/api/status`);
  console.log(`🎯 Emotions: ${Object.keys(emotionMusicDB).join(', ')}`);
  console.log('✅ Ready for frontend connection!');
});
