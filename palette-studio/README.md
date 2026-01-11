# Palette Studio

**Palette Studio** is a premium, AI-powered color palette creation and management tool designed for modern designers. It combines intelligent color analysis with a sleek, neumorphic interface to help you build, organize, and visualize stunning color systems.

## ✨ Key Features

- **AI-Powered Naming & Descriptions**: Automatically generates professional, evocative names and descriptions for your colors using Google's Gemini API.
- **Smart Analytics**: Real-time analysis of your palette's contrast, harmony, and saturation.
- **Project Organization**: Group palettes into projects with drag-and-drop functionality.
- **Realistic Mockups**: Visualize your palettes instantly on magazine covers, dashboards, and landing pages.
- **Neumorphic Design**: A beautiful, tactile user interface that makes color creation a joy.
- **WCAG Accessibility**: Built-in tools to ensure your color combinations are readable and accessible.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/palette-studio.git
   cd palette-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create a `.env` file in the root directory and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **AI**: Google Gemini 2.0 Flash

## 📂 Project Structure

- `src/components/views`: Main application views (Library, Editor)
- `src/components/mockups`: Visualization components (Editorial, Desktop)
- `src/utils/colorUtils.js`: Core color manipulation logic
- `DESIGN_SPEC.md`: Detailed technical specifications
- `HANDOFF_NOTES.md`: Notes for development continuity

## 📄 License

MIT
