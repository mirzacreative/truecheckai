import { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result;
        const type = file.type.startsWith('video') ? 'video' : 'image';
        
        const response = await fetch('/.netlify/functions/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media: base64, type })
        });
        
        const data = await response.json();
        setResult(data);
        setAnalyzing(false);
      };
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  if (!showUpload) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-5xl font-bold text-white">TrueCheck</h1>
            </div>
            <p className="text-2xl text-indigo-200 font-semibold">AI-Powered Media Verification</p>
            <p className="text-gray-400 mt-2">Detect deepfakes and AI-generated content with advanced machine learning</p>
          </header>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 transition">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-white mb-2">Deep Learning</h3>
              <p className="text-gray-400">Utilizes Convolutional Neural Networks (CNNs) trained on millions of fake and real images.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 transition">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">Metadata Extraction</h3>
              <p className="text-gray-400">Parses EXIF, XMP, and IPTC data to verify device fingerprints and timestamps.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur p-6 rounded-xl border border-indigo-500/20 hover:border-indigo-500/50 transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Privacy First</h3>
              <p className="text-gray-400">Files are processed securely. We calculate hashes and do not store your personal media.</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowUpload(true)}
              className="px-12 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/50"
            >
              Start Analysis →
            </button>
          </div>

          <div className="mt-16 bg-slate-800/30 backdrop-blur rounded-xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Latest Insights</h2>
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📊</span>
                  <div>
                    <h4 className="text-white font-semibold">8 AI Models Working Together</h4>
                    <p className="text-gray-400 text-sm">Combined analysis from multiple deepfake detection systems</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <h4 className="text-white font-semibold">Fast Processing</h4>
                    <p className="text-gray-400 text-sm">Get results in seconds with our optimized pipeline</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-16 text-center text-gray-500">
            <p>© 2026 TrueCheck. Powered by 8 Hugging Face AI Models.</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => { setShowUpload(false); setFile(null); setPreview(null); setResult(null); }}
            className="text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Back to Home
          </button>
        </div>
        
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">TrueCheck</h1>
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
                    {result.verdict === 'real' ? 'Authentic Media' : 'AI-Generated Content'}
                  </h4>
                  <p className="text-gray-300 mt-2">
                    {result.verdict === 'real' ? 'This appears to be genuine content' : 'This appears to be synthetically generated'}
                  </p>
                </div>

                {result.score && (
                  <div className="text-center mb-4">
                    <p className="text-gray-300">Confidence: {result.score}%</p>
                  </div>
                )}

                {result.platform && (
                  <div className="mt-4 text-center">
                    <p className="text-yellow-400">Possible Generation Platform: {result.platform}</p>
                  </div>
                )}

                {result.details && (
                  <div className="mt-6 bg-slate-900/50 p-4 rounded-lg">
                    <h5 className="text-lg font-semibold text-white mb-2">Verification Details:</h5>
                    <div className="space-y-1 text-gray-300">
                      <p>• Device: {result.details.device}</p>
                      <p>• Authenticity: {result.details.authenticity}</p>
                      <p>• Analysis Date: {result.details.date}</p>
                    </div>
                  </div>
                )}

                {result.model_used && (
                  <div className="mt-4 text-center text-sm text-gray-400">
                    Analyzed by: {result.model_used}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-gray-500">
          <p>© 2026 TrueCheck. Powered by 8 Hugging Face AI Models.</p>
        </footer>
      </div>
    </div>
  );
}
