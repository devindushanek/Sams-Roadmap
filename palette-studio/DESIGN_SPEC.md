# Palette Studio - Design Document & Functional Specification

## Project Overview

**Palette Studio** is a web-based color palette creation and management application with AI-powered features. It allows designers to create, organize, analyze, and export color palettes for design projects.

### Core Value Proposition
- AI-generated color names and descriptions using Google's Gemini API
- Intelligent palette analysis with harmony, contrast, and usage insights
- Project-based organization for managing multiple palettes
- Real-time mockup previews to visualize palettes in context
- Neumorphic design aesthetic with smooth, premium UI/UX

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend Framework | React 19.2 (Vite 6.0) |
| Styling | Tailwind CSS 4.1 |
| Icons | Lucide React |
| AI Integration | Google Gemini API (via REST) |
| Build Tool | Vite |
| Package Manager | npm |

### Key Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "tailwindcss": "^4.1.18",
  "lucide-react": "^0.562.0"
}
```

---

## File Structure

```
palette-studio/
├── src/
│   ├── App.jsx                 # Main application component (state, API calls, routing)
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global styles, neumorphic design tokens
│   ├── assets/
│   │   └── logo.png            # Application logo
│   ├── components/
│   │   ├── modals/
│   │   │   ├── index.js        # Barrel export
│   │   │   ├── ColorEditorModal.jsx    # Individual color editing
│   │   │   ├── DeleteModal.jsx         # Delete confirmation
│   │   │   └── GenerationModal.jsx     # AI palette generation
│   │   ├── mockups/
│   │   │   ├── EditorialMockups.jsx    # Editorial style mockups
│   │   │   └── DesktopMockups.jsx      # Desktop app style mockups
│   │   ├── MockupCarousel.jsx          # Carousel for switching mockups
│   │   ├── views/
│   │   │   ├── index.js        # Barrel export
│   │   │   ├── LibraryView.jsx # Palette library with projects
│   │   │   └── EditorView.jsx  # Individual palette editor
│   │   └── ui/
│   │       └── Tooltip.jsx     # Reusable tooltip component
│   └── utils/
│       └── colorUtils.js       # Color conversion utilities
├── public/
├── .env                        # Environment variables (VITE_GEMINI_API_KEY)
├── vite.config.js
├── package.json
└── index.html
```

---

## State Management

All state is managed in **App.jsx** using React's `useState` and `useRef`. There is no external state management library.

### Core State

```javascript
// Data State
const [palettes, setPalettes] = useState(initialPalettes);     // Array of palette objects
const [projects, setProjects] = useState([]);                   // Array of project objects
const [activeIndex, setActiveIndex] = useState(0);              // Currently selected palette index

// Navigation State
const [currentPage, setCurrentPage] = useState('library');      // 'library' | 'editor'

// History State (Undo/Redo)
const [history, setHistory] = useState([initialPalettes]);
const [historyIndex, setHistoryIndex] = useState(0);

// UI State
const [viewMode, setViewMode] = useState('grid');               // 'grid' | 'mockup'
const [mockupType, setMockupType] = useState('editorial');      // Mockup style
const [showInsights, setShowInsights] = useState(false);        // Show/hide analysis
const [showSuggestions, setShowSuggestions] = useState(false);  // Show/hide color suggestions
```

### Data Models

#### Palette Object
```javascript
{
  id: "1704729600000",           // Unique ID (timestamp)
  name: "Arcane Bloom",          // AI-generated or user-edited name
  description: "A mystical...",  // AI-generated or user-edited description
  nameLocked: false,             // Prevent AI from overwriting name
  descriptionLocked: false,      // Prevent AI from overwriting description
  projectId: null,               // ID of parent project (null = ungrouped)
  colors: [
    {
      hex: "#5A27EF",
      name: "Royal Purple",
      description: "A mid-value violet with cool undertones...",
      text: "#ffffff",           // Contrast text color (auto-calculated)
      dominant: false            // Marked as dominant color (max 3)
    }
  ],
  insights: [                    // AI-generated analysis results
    {
      title: "Harmony",
      subtitle: "Nature-Inspired Greens",
      body: "The dominant green hues...",
      type: "harmony",           // harmony | contrast | usage
      relatedColors: ["hex1", "hex2"]
    }
  ]
}
```

#### Project Object
```javascript
{
  id: "1704729600001",
  name: "New Project",
  createdAt: "2026-01-08T12:00:00.000Z"
}
```

---

## Key Features

### 1. Library View (LibraryView.jsx)
- Displays all palettes in a responsive grid
- **Project grouping**: Palettes can be organized into projects
- **Drag and drop**: Palettes can be dragged between projects
- **Inline editing**: Click project name to edit
- **Collapsible groups**: Projects can be collapsed to hide palettes
- **Delete confirmation**: Projects with palettes show a modal asking to keep or delete palettes

### 2. Editor View (EditorView.jsx)
- Edit individual palette colors
- **Title/Description editing**: Inline editing with lock/unlock to prevent AI overwrites
- **Color swatches**: Click to open color editor modal
- **Toolbar actions**: Sort, Randomize, Generate (AI), Undo, Redo, Delete
- **View modes**: Swatches grid or Mockup preview
- **Quick Add**: Bulk add colors via hex input
- **Color suggestions**: AI suggests complementary colors
- **Analyze button**: Generates AI insights about the palette

### 3. Color Editor Modal (ColorEditorModal.jsx)
- Full-screen color picker
- Live preview with color name and description
- Randomize color button
- Regenerate name button
- Copy hex value
- Auto-updates name/description when color changes (debounced)

### 4. AI Generation Modal (GenerationModal.jsx)
- Generate palette from text prompt
- Generate palette from uploaded image
- Modify existing palette with natural language

### 5. Mockup Preview
- Visualize palette in realistic design contexts
- **Mockup Types:**
  - **Editorial:** Magazine/print style layouts (3 variations)
  - **Desktop:** App/dashboard style layouts (3 variations)
  - **Mobile:** Mobile app layouts
  - **Branding:** Brand identity layouts

#### Editorial Mockups (`EditorialMockups.jsx`)
- **Layout 1:** "The Edit" magazine cover with title, body text, and colored sidebar
- **Layout 2:** "Modern Minimal" grid layout with quote and methodology sections
- **Layout 3:** "Visual Identity" split layout with color swatch display (up to 10 colors)
- All layouts support `readabilityEnabled` prop for WCAG-compliant text contrast

#### Desktop Mockups (`DesktopMockups.jsx`)
- **Layout 1 (Chromatic Dashboard):**
  - Sidebar with Palette icon logo and menu items
  - Analytics cards showing real palette stats (Contrast grade, Harmony %, Saturation %)
  - Color palette display with hex values
- **Layout 2:** Brand.io landing page with hero section
- **Layout 3:** Dark mode design editor with floating toolbar

#### Mockup Features
- Dynamic color application using `safeGetColor()` helper
- Shuffle button randomizes color assignments
- Readability toggle ensures text contrast meets WCAG standards

---

## AI Integration (Gemini API)

### API Configuration
```javascript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.0-flash";
```

### Key AI Functions

#### `callGemini(prompt, schema)`
Generic function to call Gemini with structured JSON output.

#### `fetchRichPaletteData(hexes)`
Given an array of hex colors, returns:
- Palette name and description
- Individual color names and descriptions

#### `handleNameColor(idx, silent, hexOverride, updateState)`
Generates a professional color name and description for a single color.

**Prompt Pattern for Color Naming:**
```
Generate a STRICTLY CONVENTIONAL, professional color name and a descriptive identity.

Follow this 3-step "Color Identity" formula:
1. Structural Anchor: Identify the hue and value.
2. Nuance/Undertone: Identify the lean or subtle character.
3. Environmental/Material Proxy: Link to something tangible.

Do NOT use semicolons. Use clear, complete sentences.
```

#### `handleAnalyze()`
Analyzes the palette and generates insights categorized by:
- **Harmony**: Color relationships and mood
- **Contrast**: Visual tension and focal points
- **Usage**: Practical application suggestions

#### `getSuggestedColors()`
Suggests 5 complementary colors that would enhance the palette.

---

## Styling System

### Neumorphic Design Tokens (index.css)

```css
@theme {
    --color-neumorphic-bg: #f0f2f5;
    --shadow-neu-flat: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff;
    --shadow-neu-flat-sm: 4px 4px 8px #d1d9e6, -4px -4px 8px #ffffff;
    --shadow-neu-pressed: inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff;
    --shadow-neu-pressed-sm: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff;
}
```

### Utility Classes

| Class | Purpose |
|-------|---------|
| `.neu-flat` | Raised neumorphic surface |
| `.neu-flat-sm` | Smaller raised surface |
| `.neu-pressed` | Pressed/inset surface |
| `.neu-pressed-sm` | Smaller pressed surface |
| `.neu-button-hover` | Hover effect for buttons |
| `.neu-card-hover` | Hover effect for cards |
| `.neu-icon-ghost` | Ghost button for icons |
| `.neu-back-btn:hover` | Special hover for back button |

### Color Palette
- **Primary**: Indigo (`text-indigo-600`)
- **Background**: Neumorphic grey (`#f0f2f5`)
- **Text Primary**: Slate 800
- **Text Secondary**: Slate 400/500
- **Danger**: Rose 500

---

## Known Issues & Design Decisions

### Resolved Issues (for context)
1. **Shadow clipping in project groups**: Neumorphic shadows were clipped by `overflow-x-auto`. Fixed with negative margin + positive padding technique.
2. **Pixelated grab cursor**: System grab cursor appeared pixelated. Changed to pointer cursor.
3. **Description text pinching**: Fixed by adding `w-full` to description container.
4. **Blank Screen / File Corruption**: Fixed corrupted `LibraryView.jsx` and `EditorView.jsx` files that were causing a blank screen.
5. **Icon Import Issue**: Replaced `GripVertical` with `Grip` from `lucide-react` to resolve potential import errors and ensure consistency.

### Known Limitations
1. **Mobile Palette Reordering**: On mobile devices, palettes can be moved between projects but cannot be reordered within a list. This is a current limitation of the touch handler implementation.

### Design Decisions
1. **No external state management**: App is simple enough for React useState
2. **Inline editing**: Project names and palette titles use click-to-edit pattern
3. **Lock system**: Prevents AI from overwriting user-edited content
4. **Debounced API calls**: Color editor waits 800ms before regenerating name

---

## Planned Features (Not Yet Implemented)

### 1. UI Color Themes
- Light mode (current)
- Dark mode
- Colorful light mode

### 2. Material Palette Creator
- Separate creation flow from Color Palette
- Different color relationships and naming conventions
- Material-specific properties (metallic, matte, etc.)

### 3. Export Functionality
- Export as CSS variables
- Export as Tailwind config
- Export as image/PDF

---

## Development Guidelines

### Running the Project
```bash
cd palette-studio
npm install
npm run dev
```

### Environment Variables
Create `.env` file:
```
VITE_GEMINI_API_KEY=your_api_key_here
```

### Code Conventions
1. **Components**: Functional components with hooks
2. **Styling**: Tailwind classes, avoid inline styles except for dynamic colors
3. **Modals**: Use fixed positioning with backdrop blur
4. **Icons**: Use Lucide React icons consistently
5. **Spacing**: Use Tailwind spacing scale (4, 6, 8, etc.)

### Adding New Features
1. Add state to App.jsx if needed
2. Create component in appropriate folder
3. Pass state and handlers as props
4. Follow existing neumorphic styling patterns

---

## Quick Reference: Key Prop Flows

### LibraryView receives:
```javascript
palettes, projects, setActiveIndex, setCurrentPage, addPalette, 
setDeleteModal, createProject, updateProject, deleteProject, movePaletteToProject
```

### EditorView receives:
```javascript
currentPalette, setCurrentPage, suggestPaletteName, isSuggestingName,
updateField, suggestPaletteDesc, isSuggestingDesc, historyIndex, history,
undo, redo, randomizePalette, viewMode, setViewMode, setDeleteModal,
activeIndex, getShuffledColor, setEditorModal, handleNameColor, isNaming,
removeColor, copyHex, copiedColor, addColor, getSuggestedColors,
isSuggestingColors, showSuggestions, setShowSuggestions, suggestedColors,
palettes, pushState, getContrastColor, showLimitError, limitError,
bulkInput, setBulkInput, addBulkColors, handleAnalyze, isAnalyzing,
mockupType, setMockupType, shuffleMockupColors, isInsightsOutdated,
setGenerationModal, autoOrganizeColors, toggleDominant, insightsRef,
showInsights, handleAddSuggestedColor, autoResizeTextarea, textareaRef,
modifyPaletteWithPrompt, isGenerating
```

---

## Handoff Notes

When continuing development in a new chat:

1. **Start by reviewing App.jsx** - It contains all core logic and state
2. **Check index.css** - All custom neumorphic styles are defined here
3. **The API key is in .env** - Gemini API requires valid key
4. **Test locally first** - Run `npm run dev` to see current state
5. **Shadow issues** - Be careful with `overflow` properties on containers with neumorphic shadows
6. **AI prompts are in App.jsx** - Search for `callGemini` to find all AI integration points

This document should provide sufficient context to continue development without the original conversation history.
