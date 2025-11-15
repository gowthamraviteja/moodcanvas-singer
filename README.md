# 🎵 MoodCanvas Singer

AI-powered emotion-based music recommendation app built in 40 minutes for a coding challenge.

## 🚀 Features

- **Real-time emotion detection simulation**
- **7 emotion categories** with 21 curated tracks
- **Professional UI** with gradients and animations
- **Music player** with full controls (play/pause/next/previous)
- **Demo mode** with keyboard shortcuts
- **Session management** with emotion history tracking

## ⚡ Quick Start

```bash
# Clone or download the repository
cd moodcanvas-singer

# Install dependencies
pip install flask flask-cors

# Run the application
python app_simple.py

# Open your browser
http://localhost:5000
```

## 🎮 Demo Controls

- **Press 1** → Happy emotion
- **Press 2** → Sad emotion  
- **Press 3** → Angry emotion
- **Press 4** → Surprised emotion
- **Press 5** → Neutral emotion
- **Press H** → Show help

Watch music recommendations change instantly based on your selected emotion!

## 🛠 Tech Stack

- **Backend**: Python Flask + Flask-CORS
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Database**: In-memory JSON with 21 curated tracks
- **UI**: Responsive design with gradient backgrounds
- **API**: RESTful endpoints for emotions and music

## 🎯 API Endpoints

- `GET /api/status` - Server health check
- `POST /api/emotions` - Store emotion data
- `GET /api/recommendations/{emotion}` - Get music recommendations
- `GET /api/music/{track_id}` - Get track details
- `GET /api/session` - Session management

## 🎨 Emotion Categories

1. **Happy** - Upbeat, energetic tracks
2. **Sad** - Melancholic, reflective music  
3. **Angry** - High-energy, cathartic songs
4. **Surprised** - Wonder-filled, curious tracks
5. **Neutral** - Balanced, ambient music
6. **Fearful** - Soothing, protective sounds
7. **Disgusted** - Cleansing, refreshing music

## 💡 Future Enhancements

- Integration with actual emotion detection APIs (face-api.js, emotion recognition)
- Spotify/Apple Music streaming service integration
- Machine learning for personalized recommendations
- Voice command integration
- Biometric sensor support (heart rate, stress levels)
- Social features for mood sharing

## 📱 Demo Screenshots

*Experience emotion-driven music discovery!*

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

MIT License - Built for educational and demonstration purposes.

---


**Experience the future of emotion-driven music discovery!** 🎶

<img width="1912" height="1210" alt="Screenshot 2025-11-15 001203" src="https://github.com/user-attachments/assets/93ee034f-f320-4e29-b259-4d8392d1fb79" />
