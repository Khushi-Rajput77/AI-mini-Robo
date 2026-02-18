# 🤖 Nexus AI - 3D Animated Chatbot

An intelligent AI chatbot featuring a fully animated 3D robot built with React, Three.js, and real-time Socket.IO communication. The robot responds with voice synthesis and dynamic lip-sync animations.

![Nexus AI Demo](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)

---

## ✨ Features

- 🎨 **3D Animated Robot** - Fully modeled robot with glowing outline effects
- 💬 **Real-time Chat** - Instant messaging with AI-powered responses
- 🎙️ **Voice Synthesis** - Text-to-speech using Web Speech API
- 👄 **Lip-Sync Animation** - Robot mouth animates while speaking
- 🌊 **Smooth Animations** - Floating, breathing, waving, and thinking gestures
- ⚡ **Socket.IO Integration** - Real-time bidirectional communication
- 🎨 **Modern UI** - Glassmorphism design with ambient glow effects
- 🔊 **Voice Controls** - Mute/unmute and introduction playback
- 📱 **Responsive Design** - Works on desktop and mobile

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Three.js** - 3D graphics and robot rendering
- **Socket.IO Client** - Real-time communication
- **Web Speech API** - Text-to-speech synthesis
- **CSS3** - Modern styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web server framework
- **Socket.IO** - WebSocket server
- **AI Service** - Custom AI integration (configurable)

---

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Clone Repository
```bash
git clone https://github.com/yourusername/nexus-ai-chatbot.git
cd nexus-ai-chatbot
```

### Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## 🚀 Usage

### 1. Start Backend Server
```bash
cd backend
npm start
```
Server runs on `http://localhost:3000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. Open Browser
Navigate to `http://localhost:5173` and start chatting!

---

## 📁 Project Structure

```
nexus-ai-chatbot/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── Robot.jsx            # Three.js 3D robot
│   │   ├── VoiceService.js      # Web Speech API wrapper
│   │   └── style.css            # Styling
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── app.js               # Express app
│   │   └── services/
│   │       └── ai-service.js    # AI integration
│   ├── server.js                # Socket.IO server
│   └── package.json
│
└── README.md
```

---

## 🎮 Features Breakdown

### 3D Robot Animations

| Animation | Trigger | Description |
|-----------|---------|-------------|
| **Wave** | Page load | Robot waves hand on startup |
| **Idle** | Default state | Gentle floating and breathing |
| **Thinking** | AI processing | Head oscillates, antenna blinks |
| **Sent** | User sends message | Body pulse effect |
| **Speaking** | Voice active | Lip-sync mouth animation |

### Voice Features

- **User Message Reading** - Robot reads your questions aloud
- **Introduction Speech** - Pre-programmed LinkedIn introduction
- **Voice Controls** - Toggle mute/unmute
- **Customizable** - Adjustable speed, pitch, and volume

---

## ⚙️ Configuration

### Customize Robot Voice

Edit `src/VoiceService.js`:

```javascript
voiceService.speak(text, {
  rate: 1.0,    // Speed (0.1 - 10)
  pitch: 1.0,   // Pitch (0 - 2)
  volume: 1.0   // Volume (0 - 1)
});
```

### Change Robot Colors

Edit `src/Robot.jsx` line 51:

```javascript
// Outline color
const outlineM = new THREE.MeshStandardMaterial({
  color: 0x00ffff,           // Cyan
  emissive: 0x00ffff,        // Glow color
  emissiveIntensity: 3.5,    // Glow strength
});
```

### AI Service Integration

Replace `src/services/ai-service.js` with your preferred AI:
- OpenAI GPT
- Anthropic Claude
- Google Gemini
- Custom LLM

---

## 🎨 Customization

### Robot Position
```javascript
// Robot.jsx - Line 86
root.position.set(3.5, -0.5, 0);  // (x, y, z)
```

### Camera Zoom
```javascript
// Robot.jsx - Line 28
camera.position.set(0, 0, 17);  // Higher = zoomed out
```

### Outline Thickness
```javascript
// Robot.jsx - Line 59
const addOutline = (mesh, scale=1.07) => { ... }
```

---

## 🐛 Troubleshooting

### Voice Not Working
- Check browser compatibility (Chrome/Edge recommended)
- Ensure system volume is on
- Click the speaker icon to unmute

### Robot Not Visible
- Check browser console for Three.js errors
- Ensure WebGL is enabled
- Try refreshing the page

### Connection Issues
- Verify backend server is running on port 3000
- Check CORS settings in backend
- Ensure Socket.IO versions match

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Portfolio: [yourwebsite.com](https://yourwebsite.com)

---

## 🙏 Acknowledgments

- **Three.js** - 3D graphics library
- **React** - UI framework
- **Socket.IO** - Real-time communication
- **Web Speech API** - Text-to-speech synthesis
- Inspiration from modern AI assistants and 3D web experiences

---

## 📸 Screenshots

### Chat Interface
![Chat Interface](screenshots/chat.png)

### 3D Robot Animation
![Robot Animation](screenshots/robot.png)

### Voice Controls
![Voice Controls](screenshots/voice.png)

---

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Voice recognition (speech-to-text)
- [ ] More robot animations and gestures
- [ ] Custom avatar/robot skins
- [ ] Mobile app version
- [ ] Group chat functionality
- [ ] Conversation history export
- [ ] Dark/Light theme toggle

---

## 📊 Performance

- **Initial Load**: ~2-3 seconds
- **Message Response**: <500ms
- **3D Rendering**: 60 FPS
- **Memory Usage**: ~150MB
- **Bundle Size**: ~800KB (gzipped)

---

## 🌐 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Firefox | 88+ | ⚠️ Limited voice |
| Safari | 14+ | ⚠️ Limited voice |
| Opera | 76+ | ✅ Full |

---

## 💬 Contact

For questions or support, please open an issue or contact:
- Email: your.email@example.com
- Discord: YourDiscord#1234
- Twitter: [@yourtwitter](https://twitter.com/yourtwitter)

---

## ⭐ Show Your Support

If you found this project helpful, please consider:
- Giving it a ⭐ on GitHub
- Sharing it with others
- Contributing to the codebase
- Reporting bugs or suggesting features

---

**Made with ❤️ and Three.js**

*Hare Krishna, Hare Rama* 🙏