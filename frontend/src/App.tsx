function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">MzansiBuilds</h1>
      <p className="text-github-muted mb-8">If this is grey, and the background is dark, Tailwind is working!</p>
      
      {/* Testing your custom green button */}
      <button className="bg-github-green hover:bg-github-greenHover text-white px-6 py-2 rounded-md font-semibold transition-colors">
        Test Button
      </button>
    </div>
  )
}

export default App