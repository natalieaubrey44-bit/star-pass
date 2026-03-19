<div align="center">
  <div style="background-color: #4f46e5; border-radius: 20px; padding: 20px; display: inline-block; margin-bottom: 20px;">
    <h1 style="color: white; margin: 0; font-family: sans-serif; display: flex; align-items: center; gap: 10px;">
      StarCard
    </h1>
  </div>
  <h3>Your Personal Celebrity Fan Card Generator</h3>
  <p>Generate high-quality, personalized fan cards with your photo and name in seconds.</p>
</div>

---

## 🌟 About

**StarCard** is a premium, interactive web application that allows users to create personalized "fan cards" featuring their favorite celebrities. With a sleek, modern UI built using React and TailwindCSS, users can choose from different membership tiers (Silver, Diamond, Platinum), upload their own photo, and generate a downloadable, high-definition fan card in seconds.

## ✨ Features

- **Premium Templates**: Choose from a variety of celebrity-inspired templates such as Keanu Reeves, Taylor Swift, Elon Musk, and more.
- **Beautiful UI/UX**: A stunning, responsive interface with smooth micro-animations powered by framer-motion.
- **Client-Side Generation**: Instantly generate and preview HD fan cards using HTML5 Canvas—all directly within the browser.
- **Image Upload & Cropping**: Easily upload personal photos for seamless integration into the selected fan card template.
- **Zero Backend**: Fully functional static application running exclusively on the client side.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Animations**: [motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Getting Started

To run StarCard locally on your machine, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or newer recommended)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd star-card
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to the local server URL provided in the terminal (usually `http://localhost:5173`).

## 📁 Project Structure

- `src/App.tsx`: The main React application containing all UI components and logic, including the landing page and the card generator.
- `public/templates/`: Contains the image assets for different celebrity templates.
- `templates.json`: Defines the configuration for each template (coordinates for text and image placement).

## 📝 License

This project is open-source and available under the terms of the MIT License.
