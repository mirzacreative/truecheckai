import { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.size > 4 * 1024 * 1024) {
      alert('File size must be less than 4MB');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
  };

  const analyzeMedia = async () => {
    if (!file) return;
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">TrueCheckAI</h1>
          <p className="text-xl text-indigo-200">AI-Powered Media Verification</p>
          <p className="text-gray-400 mt-2">Detect deepfakes and AI-generated content</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div 
            className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
              dragOver ? 'border-indigo-400 bg-indigo-900/20' : 'border-indigo-600 bg-slate-800/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            {!preview ? (
              <>
                <div className="text-6xl mb-4">📤</div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Upload Image or Video
                </h3>
                <p className="text-gray-400 mb-6">Drag and drop or click to browse</p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition"
                >
                  Select File
                </label>
                <p className="text-sm text-gray-500 mt-4">Max file size: 4MB</p>
              </>
            ) : (
              <div className="space-y-6">
                {file?.type.startsWith('image') ? (
                  <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded-lg" />
                ) : (
                  <video src={preview} controls className="max-h-96 mx-auto rounded-lg" />
                )}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={analyzeMedia}
                    disabled={analyzing}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Media'}
                  </button>
                  <button
                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                    className="px-8 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {analyzing && (
            <div className="mt-8 bg-slate-800/50 rounded-xl p-8 text-center">
              <div className="animate-pulse text-white text-lg mb-4">Analyzing with AI models...</div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="mt-8 bg-slate-800/50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Analysis Results</h3>
              <div className={`p-6 rounded-lg ${result.verdict === 'real' ? 'bg-green-900/30 border-2 border-green-500' : 'bg-red-900/30 border-2 border-red-500'}`}>
                <div className="text-center mb-4">
                  <span className="text-5xl">{result.verdict === 'real' ? '✓' : '⚠'}</span>
                  <h4 className="text-3xl font-bold text-white mt-4">
                    {result.verdict === 'real' ? 'Authentic' : 'AI-Generated'}
                  </h4>
                </div>
                {result.confidence && (
                  <div className="text-center mb-4">
                    <p className="text-gray-300">Confidence: {result.confidence}%</p>
                  </div>
                )}
                {result.models && (
                  <div className="mt-6">
                    <h5 className="text-xl font-semibold text-white mb-3">Model Analysis:</h5>
                    <div className="space-y-2">
                      {result.models.map((model, idx) => (
                        <div key={idx} className="bg-slate-900/50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{model.name}</span>
                            <span className={`font-semibold ${model.verdict === 'real' ? 'text-green-400' : 'text-red-400'}`}>
                              {model.verdict} ({model.confidence}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-gray-500">
          <p>© 2026 TrueCheckAI. Powered by 8 Hugging Face AI Models.</p>
        </footer>
      </div>
    </div>
  );
}
