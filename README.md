# 🚀 VOID STRIKER - Deep Space Combat Game

An immersive, browser-based space combat game where pilots engage in intense battles across the galaxy. Navigate through challenging missions, upgrade your aircraft, and become the ultimate void striker. VOID STRIKER combines strategic gameplay, progression systems, and fast-paced combat for an engaging gaming experience.

## 🎮 Game Overview

**VOID STRIKER** is a mission-based space combat game featuring:
- Progressive difficulty through multiple levels and stages
- Wave-based combat encounters
- Aircraft customization and upgrades
- Persistent progression system
- Pilot authentication and profiles
- Immersive deep space warfare experience

### Game Features

#### 🎯 Mission System
- **Level-Based Progression** - 5 structured stages per level with increasing difficulty
- **Wave Combat** - 3 waves of enemies per stage for varied gameplay
- **Mission Briefing** - Pre-mission details with aircraft specs and reward information
- **Dynamic Challenges** - Unique challenges and enemy configurations per stage
- **Reward System** - Earn Universe Cash for completed missions and victories

#### 👾 Aircraft & Customization
- **Aircraft Hangar** - Unlock and manage multiple fighter craft
- **Craft Statistics** - Customize performance with:
  - **Damage** - Weapon power multiplier
  - **Fire Rate** - Attack speed increase
  - **Health** - Durability against enemy fire
  - **Speed** - Movement agility
- **Aircraft Upgrades** - Improve craft capabilities through progression
- **Strategic Selection** - Choose optimal aircraft for different mission types

#### 📊 Progression & Rewards
- **Leveling System** - Advance through levels as you complete stages
- **Universe Cash** - In-game currency earned from mission completion (100-150 per stage)
- **Achievement Tracking** - Monitor statistics:
  - Stages cleared
  - Total currency earned
  - Aircraft unlocked
  - Mission completion rate
- **Persistent Save** - Progress automatically saved after each mission

#### 🔐 Pilot System
- **Account Management** - Create and manage pilot accounts
- **Google Sign-In** - Quick authentication with Google
- **Pilot Profiles** - Personalized pilot accounts with:
  - Pilot Level
  - Cash Balance
  - Mission Progress
  - Aircraft Inventory
  - Session History

#### ⚙️ Gameplay Features
- **Mission Control** - Pause, resume, or quit during missions
- **Real-Time Combat** - Responsive action gameplay
- **Success/Failure States** - Stage clear rewards or mission failure scenarios
- **Audio & Haptics** - Immersive sound effects and vibration feedback
- **Settings Panel** - Customize:
  - Sound Effects toggle
  - Vibration feedback
  - Account preferences
  - Game data management

#### 🎨 User Interface
- **Mission Select** - Browse and choose available missions
- **Dashboard** - Central hub with quick access to game modes
- **Status Display** - Real-time mission waves and combat information
- **Pause Menu** - In-game controls and mission management
- **Game Over Screens** - Results display with progression options
- **Settings Menu** - Account and preference management

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup and game canvas structure
- **CSS3** - Modern styling, animations, and responsive design
- **JavaScript (Vanilla)** - Game engine and core mechanics

### Game Architecture
- **Canvas API** - Rendering game graphics and animations
- **Client-Side Logic** - All game calculations run locally
- **Local Storage** - Persistent save data management
- **Event-Driven** - Keyboard and mouse input handling

## 📋 Project Structure

```
Aircraft/
├── index.html          # Game structure and UI markup
├── game.js             # Core game engine and mechanics
├── styles.css          # Styling and visual design
├── LICENCE             # Project license
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SharvilMishra/Aircraft.git
   cd Aircraft
   ```

2. **Open in Browser**
   - Double-click `index.html` to open directly, OR
   - Use a local server for optimal performance:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (with http-server)
   http-server
   ```

3. **Access the Game**
   - Open your browser and navigate to `http://localhost:8000`
   - Or visit the live version: [VOID STRIKER](https://sharvilmishra.github.io/Aircraft/)

### Quick Start

1. **Create or Login**
   - Sign up for a new pilot account, or
   - Login with existing credentials, or
   - Sign in with Google for quick access

2. **Start Mission**
   - Select a level from the mission select screen
   - Review mission briefing and aircraft stats
   - Click "LAUNCH" to begin

3. **Combat Controls**
   - Navigate your aircraft through space
   - Engage enemies in wave-based combat
   - Survive all 3 waves to clear the stage
   - Complete all 5 stages to finish the level

4. **Progression**
   - Earn Universe Cash from victories
   - Unlock new aircraft in the hangar
   - Advance to higher difficulty levels
   - Track your statistics in the profile

## 🎮 Gameplay Mechanics

### Mission Structure
```
Level Select → Mission Briefing → Combat Waves → Results
                                       ↓
                        Wave 1 → Wave 2 → Wave 3
```

### Combat Flow
- **Initiation** - Mission launches with first wave
- **Wave Combat** - Defeat enemies in dynamic encounters
- **Progression** - Survive to advance to next wave
- **Stage Clear** - Victory unlocks next stage and rewards
- **Game Over** - Defeat triggers retry or level select

### Progression Path
```
Starter Craft (Level 0) → Stage 1 → Stage 2 → ... → Stage 5 → Level Up
                                   ↓
                          Unlock New Aircraft
                          Increase Stats
                          Earn Universe Cash
```

### Aircraft Performance
Each aircraft has 4 key statistics that affect gameplay:

| Stat | Impact | Scaling |
|------|--------|---------|
| **Damage** | Enemy defeat speed | 1.0x to 3.0x+ |
| **Fire Rate** | Weapon attack frequency | 1.0x to 3.0x+ |
| **Health** | Damage tolerance | 1.0x to 3.0x+ |
| **Speed** | Movement velocity | 1.0x to 3.0x+ |

## 🔄 Game States

### Mission States
- **Active** - Current wave in progress
- **Paused** - Mission temporarily halted
- **Wave Complete** - Ready for next wave
- **Stage Clear** - All waves defeated, rewards earned
- **Mission Failed** - Aircraft destroyed, retry available

### Account States
- **Logged Out** - Pre-authentication screen
- **Guest** - Temporary session without account
- **Authenticated** - Logged in with account access
- **In-Game** - Active mission in progress

## 📱 Browser Compatibility

- Chrome (Recommended)
- Firefox
- Safari
- Edge
- Modern mobile browsers (with responsive controls)

## 🎯 Game Modes

### Campaign Mode
- Progress through sequential levels
- Complete all 5 stages per level
- Unlock new aircraft and upgrades
- Accumulate currency for advancement

### Stage Replay
- Re-challenge completed stages
- Farm currency for upgrades
- Improve personal best scores
- Practice with different aircraft

### Hangar Management
- View all unlocked aircraft
- Review craft specifications
- Select primary aircraft
- Track aircraft collection

## 💾 Save System

- **Automatic Saving** - Progress saved after each mission completion
- **Local Storage** - Data persisted in browser storage
- **Account Sync** - Linked to pilot profile for multi-device access
- **Data Reset** - Option to reset all progress from settings

## ⚡ Performance Optimization

- Lightweight Canvas rendering
- Efficient event handling
- Optimized collision detection
- Minimal memory footprint
- Fast loading times

## 🔮 Future Enhancements

- **Multiplayer Mode** - Competitive and cooperative gameplay
- **Advanced Graphics** - WebGL rendering and particle effects
- **Sound Design** - Full audio soundtrack and effects
- **Leaderboards** - Global rankings and statistics
- **Achievements** - Badge system and challenges
- **Aircraft Cosmetics** - Skins and customization
- **Boss Battles** - Epic encounters with special enemies
- **Campaign Expansions** - Additional levels and content
- **Mobile App** - Native iOS/Android version
- **Story Mode** - Narrative-driven campaign

## 🎨 Design Highlights

- **Minimalist Aesthetic** - Clean, modern interface
- **Responsive Layout** - Adapts to all screen sizes
- **Smooth Animations** - Fluid transitions and effects
- **Intuitive Controls** - Easy-to-learn gameplay mechanics
- **Visual Feedback** - Clear indication of game states
- **Accessibility** - High contrast and readable text

## 🤝 Contributing

Contributions are welcome! Help improve VOID STRIKER:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Areas
- Bug fixes and optimization
- New aircraft designs and balancing
- Level design and mission creation
- UI/UX improvements
- Sound design and audio
- Documentation and guides

## 📝 License

This project is licensed under the terms specified in the LICENCE file. See the LICENCE file for details.

## 👨‍💻 Author

**Sharvil Mishra**
- 🔗 **GitHub:** [SharvilMishra](https://github.com/SharvilMishra)
- 💼 **LinkedIn:** [sharvil-mishra](https://www.linkedin.com/in/sharvil-mishra-07888238a/)
- 📸 **Instagram:** [@sharvil.tech](https://www.instagram.com/sharvil.tech/)
- 📧 **Email:** eng.sharvilmishra@gmail.com

## 🔗 Live Game

**Play Now:** [VOID STRIKER - Live Game](https://sharvilmishra.github.io/Aircraft/)

## 📊 Game Statistics

- **Total Levels:** Multiple progressive levels
- **Stages per Level:** 5 challenging stages
- **Waves per Stage:** 3 intense combat waves
- **Aircraft Available:** Multiple craft to unlock
- **Progression Path:** Level-based advancement system
- **Reward Structure:** Universe Cash earning system

## 🎓 Learning Outcomes

This project demonstrates:
- Game engine development with vanilla JavaScript
- Canvas API mastery for graphics rendering
- Object-oriented programming patterns
- State management in games
- User authentication integration
- Local storage implementation
- Responsive web design
- Interactive UI/UX development

## 🐛 Bug Reports & Feedback

Found a bug or have suggestions? Contact:
- Open an issue on GitHub
- Email: eng.sharvilmishra@gmail.com
- Connect on LinkedIn or Instagram

## 🎊 Acknowledgments

- Inspired by classic space combat games
- Built with passion for interactive entertainment
- Dedicated to all pilots seeking galactic adventure

---

**Prepare for deep space combat. The void awaits, pilot.**

*Become the ultimate VOID STRIKER.*

**Last Updated:** 2026 | **Version:** 1.0
