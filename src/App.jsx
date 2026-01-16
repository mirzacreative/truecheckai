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
    setShowUpload(true);
  };

  const analyzeMedia = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = async () => {
        const blob = new Blob([reader.result], { type: file.type });
        
        // Call Hugging Face API directly
        const response = await fetch(
          'https://api-inference.huggingface.co/models/dima806/deepfake_vs_real_image_detection',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: blob
          }
        );

        const apiResult = await response.json();
        console.log('API Response:', apiResult);

        // Process the result
        if (apiResult && Array.isArray(apiResult) && apiResult.length > 0) {
          // Find the label with highest score
          const sortedResults = apiResult.sort((a, b) => b.score - a.score);
          const topResult = sortedResults[0];
          
          const isAI = topResult.label.toLowerCase().includes('fake') || 
                      topResult.label.toLowerCase().includes('ai');
          
          const confidence = Math.round(topResult.score * 100);
          
          setResult({
            isAI: isAI,
            confidence: confidence,
            details: {
              model: 'Hugging Face Deepfake Detector',
              classification: topResult.label,
              allScores: sortedResults
            }
          });
        } else {
          throw new Error('Invalid API response');
        }
        
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">🛡️ TrueCheck AI</h1>
            <p className="text-xl text-white/90">AI-Powered Media Verification Platform</p>
            <p className="text-lg text-white/80 mt-2">Detect Deepfakes & AI-Generated Content</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div
              className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
                dragOver ? 'border-white bg-white/20' : 'border-white/50 bg-white/10'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-bold text-white mb-2">Upload Media to Analyze</h2>
              <p className="text-white/80 mb-6">Drag & drop or click to select</p>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-xl cursor-pointer hover:bg-purple-50 transition-all"
              >
                Select File
              </label>
            </div>

            <div className="mt-8 p-6 bg-white/10 backdrop-blur-lg rounded-xl text-white">
              <h3 className="text-xl font-bold mb-4">✨ Features</h3>
              <ul className="space-y-2">
                <li>✅ Real-time AI Detection using Hugging Face models</li>
                <li>✅ Deepfake & Synthetic Image Detection</li>
                <li>✅ Confidence Score Analysis</li>
                <li>✅ Free & Open Source</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🛡️ TrueCheck AI</h1>
          <button
            onClick={() => { setShowUpload(false); setFile(null); setPreview(null); setResult(null); }}
            className="text-white/80 hover:text-white"
          >
            ← Upload New File
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {preview && (
              <div className="p-6 bg-gray-50">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="p-8">
              {!result && !analyzing && (
                <button
                  onClick={analyzeMedia}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  🔍 Start Analysis
                </button>
              )}

              {analyzing && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
                  <p className="text-xl font-bold text-gray-700">Analyzing with AI...</p>
                  <p className="text-gray-500 mt-2">Using Hugging Face detection models</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div
                    className={`p-6 rounded-xl text-center ${
                      result.isAI ? 'bg-red-50 border-2 border-red-300' : 'bg-green-50 border-2 border-green-300'
                    }`}
                  >
                    <div className="text-5xl mb-3">{result.isAI ? '⚠️' : '✅'}</div>
                    <h2 className="text-3xl font-bold mb-2">
                      {result.isAI ? 'AI-Generated' : 'Likely Real'}
                    </h2>
                    <p className="text-lg text-gray-600">
                      Confidence: <span className="font-bold">{result.confidence}%</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">📊 Analysis Details</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Model:</strong> {result.details.model}</p>
                      <p><strong>Classification:</strong> {result.details.classification}</p>
                      <div className="mt-4">
                        <p className="font-bold mb-2">All Predictions:</p>
                        <div className="space-y-1">
                          {result.details.allScores.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.label}:</span>
                              <span className="font-bold">{Math.round(item.score * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setFile(null); setPreview(null); setResult(null); setShowUpload(false); }}
                    className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all"
                  >
                    Upload Another File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
