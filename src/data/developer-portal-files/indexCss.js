export const indexCssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --background: 220 20% 8%;
  --foreground: 210 40% 98%;
  --card: 220 20% 10%;
  --card-foreground: 210 40% 98%;
  --popover: 220 20% 10%;
  --popover-foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --primary-foreground: 222 84% 5%;
  --secondary: 217 32% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 215 32% 27%;
  --muted-foreground: 217 10% 64%;
  --accent: 217 32% 17%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62% 30%;
  --destructive-foreground: 210 40% 98%;
  --border: 217 32% 17%;
  --input: 217 32% 17%;
  --ring: 217 91% 60%;
  --radius: 0.5rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #1d4ed8 50%, #1e40af 75%, #000000 100%);
  background-attachment: fixed;
  color: hsl(var(--foreground));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-feature-settings: "cv11", "ss01";
  font-variation-settings: "opsz" 32;
  min-height: 100vh;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ios-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.score-critical {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
}

.score-warning {
  background: linear-gradient(135deg, #ea580c, #c2410c);
  color: white;
}

.score-good {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
}

.score-excellent {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: white;
}

.sidebar-nav {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  transition: all 0.2s ease;
  border-radius: 12px;
  margin: 4px 0;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.search-input {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.facility-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.facility-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.progress-fill {
  transition: width 0.8s ease;
  border-radius: 8px;
}

.warning-banner {
  background: linear-gradient(135deg, #dc2626, #991b1b);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 12px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.upload-zone {
  border: 2px dashed rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.05);
  transition: all 0.3s ease;
}

.upload-zone:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.upload-zone.dragover {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.15);
  transform: scale(1.02);
}

.scorecard-container {
  position: relative;
  overflow: hidden;
}

.scorecard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
}

.representative-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.representative-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

.data-visualization {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.metric-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.trend-up {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.trend-down {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.trend-stable {
  background: rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.loading-shimmer {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.mobile-nav {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .sidebar-nav {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar-nav.open {
    transform: translateX(0);
  }
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
`;