/** @type {import('tailwindcss').Config} */
export default {
  // This tells Tailwind exactly which files to scan for class names.
  // If a file isn't listed here, Tailwind won't style it!
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // This is where we lock in your custom GitHub color palette
      colors: {
        github: {
          // The primary dark background (Deep black/grey)
          dark: '#0d1117', 
          
          // The slightly lighter color for cards, navbars, and panels
          surface: '#161b22', 
          
          // The clean, subtle border color separating panes
          border: '#30363d', 
          
          // The primary green for active buttons (like 'Publish' or 'Add')
          green: '#238636', 
          
          // A slightly lighter green for when a user hovers over a button
          greenHover: '#2ea043', 
          
          // The highly readable, off-white text color
          text: '#c9d1d9', 
          
          // A muted grey for secondary text (timestamps, short descriptions)
          muted: '#8b949e', 
          
          // A subtle red for destructive actions (Delete, Decline)
          danger: '#da3633' 
        }
      }
    },
  },
  plugins: [],
}