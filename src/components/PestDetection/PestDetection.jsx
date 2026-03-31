// import React, { useState } from 'react';
// import { useTheme } from '../../context/ThemeContext';
// import UploadSection from './UploadSection';
// import AnalysisResult from './AnalysisResult';

// const PestDetection = ({ onShowToast }) => {
//   const { theme } = useTheme();
//   const [image, setImage] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [result, setResult] = useState(null);
//   const [history, setHistory] = useState([]);

//   const handleImageUpload = async (file) => {
//     setImage(file);
//     setResult(null);
//     await analyzeImage(file);
//   };

//   const analyzeImage = async (file) => {
//     setIsAnalyzing(true);
    
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await fetch('https://rahul90k-pest-detection.hf.space/predict?strict=false', {
//         method: 'POST',
//         body: formData,
//         // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
//         mode: 'cors', // Explicitly set CORS mode
//       });

//       // Log response for debugging
//       console.log('Response status:', response.status);
//       console.log('Response headers:', [...response.headers.entries()]);

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Error response:', errorText);
//         throw new Error(`API request failed with status ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('API Response:', data);
      
//       if (data.success) {
//         const analysisResult = {
//           // Main prediction data
//           diseaseName: data.prediction.class,
//           confidence: parseFloat(data.prediction.confidence),
//           severity: data.prediction.severity,
//           type: data.prediction.type,
//           cropType: data.prediction.crop_type,
//           status: data.prediction.status,
          
//           // Validation data
//           validation: data.validation,
          
//           // Alternative predictions
//           alternatives: data.alternative_predictions,
          
//           // Metadata
//           metadata: data.metadata,
          
//           // Treatment recommendations
//           recommendedAction: getRecommendedAction(data.prediction.class, data.prediction.severity),
//           preventativeMeasures: getPreventativeMeasures(data.prediction.type),
//           organicAlternatives: getOrganicAlternatives(data.prediction.type),
//           affectedArea: data.validation.metrics.vegetation_coverage,
//           estimatedYieldLoss: getEstimatedYieldLoss(data.prediction.severity),
//         };

//         setResult(analysisResult);
//         setHistory((prev) => [
//           { 
//             id: Date.now(), 
//             diseaseName: analysisResult.diseaseName,
//             confidence: analysisResult.confidence,
//             severity: analysisResult.severity,
//             timestamp: new Date().toLocaleString()
//           }, 
//           ...prev.slice(0, 4)
//         ]);
        
//         onShowToast && onShowToast(`${data.prediction.type} detected: ${data.prediction.class}`, 
//           data.prediction.severity === 'High' ? 'error' : 'warning');
//       } else {
//         throw new Error('Analysis failed - API returned success: false');
//       }
//     } catch (error) {
//       console.error('Error analyzing image:', error);
      
//       // More specific error messages
//       if (error.message.includes('Failed to fetch')) {
//         onShowToast && onShowToast('Network error: Unable to reach the API. Please check your internet connection.', 'error');
//       } else if (error.message.includes('CORS')) {
//         onShowToast && onShowToast('CORS error: Unable to access the API from this domain.', 'error');
//       } else {
//         onShowToast && onShowToast(`Failed to analyze image: ${error.message}`, 'error');
//       }
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // Helper functions for recommendations
//   const getRecommendedAction = (disease, severity) => {
//     const actions = {
//       'High': 'Immediate action required! Apply appropriate treatment and isolate affected plants.',
//       'Medium': 'Apply treatment within 24-48 hours and monitor closely.',
//       'Low': 'Monitor the situation and apply preventive measures.'
//     };
//     return actions[severity] || 'Consult with agricultural expert for proper treatment.';
//   };

//   const getPreventativeMeasures = (type) => {
//     const measures = {
//       'Pest': 'Regular monitoring, maintain plant hygiene, use row covers, and introduce beneficial insects.',
//       'Disease': 'Ensure proper spacing, improve air circulation, avoid overhead watering, and practice crop rotation.',
//       'Healthy': 'Continue current practices and maintain regular monitoring.'
//     };
//     return measures[type] || 'Follow general agricultural best practices.';
//   };

//   const getOrganicAlternatives = (type) => {
//     const alternatives = {
//       'Pest': 'Use neem oil, garlic spray, diatomaceous earth, or introduce natural predators like ladybugs.',
//       'Disease': 'Apply copper-based fungicides, baking soda solution, or beneficial bacteria treatments.',
//       'Healthy': 'No treatment needed. Continue preventive care.'
//     };
//     return alternatives[type] || 'Consult organic farming guidelines.';
//   };

//   const getEstimatedYieldLoss = (severity) => {
//     const losses = {
//       'High': '20-35%',
//       'Medium': '10-20%',
//       'Low': '5-10%'
//     };
//     return losses[severity] || 'Minimal';
//   };

//   const keyframeStyles = `
//     @keyframes slideUp {
//       from { opacity: 0; transform: translateY(20px); }
//       to { opacity: 1; transform: translateY(0); }
//     }
//     @keyframes slideDown {
//       from { opacity: 0; transform: translateY(-20px); }
//       to { opacity: 1; transform: translateY(0); }
//     }
//   `;

//   return (
//     <>
//       <style>{keyframeStyles}</style>
//       <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
//         theme === 'dark' ? 'bg-black' : 'bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50'
//       }`}>
//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* Header */}
//           <div style={{ animation: 'slideDown 0.6s ease-out' }}>
//             <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
//               AI Pest & Disease Detection
//             </h1>
//             <p className={`text-sm sm:text-base font-semibold ${
//               theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//             }`}>
//               Upload plant images for instant AI-powered analysis
//             </p>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
//             {/* Upload Section */}
//             <div className="lg:col-span-2">
//               <UploadSection
//                 image={image}
//                 isAnalyzing={isAnalyzing}
//                 onUpload={handleImageUpload}
//               />
//             </div>

//             {/* History */}
//             <div 
//               className={`rounded-xl shadow-xl p-4 sm:p-6 ${
//                 theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
//               }`}
//               style={{ animation: 'slideUp 0.6s ease-out' }}
//             >
//               <h2 className={`text-lg font-bold mb-4 ${
//                 theme === 'dark' ? 'text-white' : 'text-gray-900'
//               }`}>
//                 Recent Scans
//               </h2>
//               <div className="space-y-2">
//                 {history.length === 0 ? (
//                   <p className={`text-center py-4 text-sm ${
//                     theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
//                   }`}>
//                     No scans yet
//                   </p>
//                 ) : (
//                   history.map((item) => (
//                     <div
//                       key={item.id}
//                       className={`p-3 rounded-lg transition-all hover:scale-105 cursor-pointer ${
//                         theme === 'dark'
//                           ? 'bg-gray-800 hover:bg-gray-700'
//                           : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md'
//                       }`}
//                     >
//                       <p className={`font-semibold text-sm ${
//                         theme === 'dark' ? 'text-white' : 'text-gray-900'
//                       }`}>
//                         {item.diseaseName}
//                       </p>
//                       <div className="flex items-center justify-between mt-1">
//                         <p className={`text-xs ${
//                           theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//                         }`}>
//                           {item.confidence}% confidence
//                         </p>
//                         <span className={`text-xs px-2 py-0.5 rounded-full ${
//                           item.severity === 'High' 
//                             ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
//                             : item.severity === 'Medium'
//                             ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
//                             : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
//                         }`}>
//                           {item.severity}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Result */}
//           {result && <AnalysisResult result={result} />}
//         </div>
//       </div>
//     </>
//   );
// };

// export default PestDetection;
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import UploadSection from './UploadSection';
import AnalysisResult from './AnalysisResult';
import LowConfidenceResult from './LowConfidenceResult';

const PestDetection = ({ onShowToast }) => {
  const { theme } = useTheme();
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [lowConfidenceResult, setLowConfidenceResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleImageUpload = async (file) => {
    setImage(file);
    setResult(null);
    setLowConfidenceResult(null);
    await analyzeImage(file);
  };

  const analyzeImage = async (file) => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://rahul90k-pest-detection.hf.space/predict?strict=false', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      console.log('Response status:', response.status);

     // const data = await response.json();
     const contentType = response.headers.get("content-type");

let data;

if (contentType && contentType.includes("application/json")) {
  data = await response.json();
} else {
  const text = await response.text();
  console.error("Server returned non-JSON:", text);
  throw new Error("Server returned HTML instead of JSON (API crashed)");
}
      console.log('API Response:', data);
      
      // Handle successful high-confidence prediction
      if (response.ok && data.success) {
        const analysisResult = {
          // Main prediction data
          diseaseName: data.prediction.class,
          confidence: parseFloat(data.prediction.confidence),
          severity: data.prediction.severity,
          type: data.prediction.type,
          cropType: data.prediction.crop_type,
          status: data.prediction.status,
          
          // Validation data
          validation: data.validation,
          
          // Alternative predictions
          alternatives: data.alternative_predictions,
          
          // Metadata
          metadata: data.metadata,
          
          // Treatment recommendations
          recommendedAction: getRecommendedAction(data.prediction.class, data.prediction.severity),
          preventativeMeasures: getPreventativeMeasures(data.prediction.type),
          organicAlternatives: getOrganicAlternatives(data.prediction.type),
          affectedArea: data.validation.metrics.vegetation_coverage,
          estimatedYieldLoss: getEstimatedYieldLoss(data.prediction.severity),
        };

        setResult(analysisResult);
        setLowConfidenceResult(null);
        
        setHistory((prev) => [
          { 
            id: Date.now(), 
            diseaseName: analysisResult.diseaseName,
            confidence: analysisResult.confidence,
            severity: analysisResult.severity,
            timestamp: new Date().toLocaleString()
          }, 
          ...prev.slice(0, 4)
        ]);
        
        onShowToast && onShowToast(`${data.prediction.type} detected: ${data.prediction.class}`, 
          data.prediction.severity === 'High' ? 'error' : 'warning');
      } 
      // Handle low confidence prediction (400 response)
      else if (response.status === 400 && !data.success && data.error === "Low prediction confidence") {
        setLowConfidenceResult(data);
        setResult(null);
        
        onShowToast && onShowToast(
          `Low confidence: ${data.confidence} (requires ${data.threshold_required})`, 
          'warning'
        );
      } 
      // Handle other errors
      else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      if (error.message.includes('Failed to fetch')) {
        onShowToast && onShowToast('Network error: Unable to reach the API.', 'error');
      } else {
        onShowToast && onShowToast(`Failed to analyze image: ${error.message}`, 'error');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions for recommendations
  const getRecommendedAction = (disease, severity) => {
    const actions = {
      'High': 'Immediate action required! Apply appropriate treatment and isolate affected plants.',
      'Medium': 'Apply treatment within 24-48 hours and monitor closely.',
      'Low': 'Monitor the situation and apply preventive measures.'
    };
    return actions[severity] || 'Consult with agricultural expert for proper treatment.';
  };

  const getPreventativeMeasures = (type) => {
    const measures = {
      'Pest': 'Regular monitoring, maintain plant hygiene, use row covers, and introduce beneficial insects.',
      'Disease': 'Ensure proper spacing, improve air circulation, avoid overhead watering, and practice crop rotation.',
      'Healthy': 'Continue current practices and maintain regular monitoring.'
    };
    return measures[type] || 'Follow general agricultural best practices.';
  };

  const getOrganicAlternatives = (type) => {
    const alternatives = {
      'Pest': 'Use neem oil, garlic spray, diatomaceous earth, or introduce natural predators like ladybugs.',
      'Disease': 'Apply copper-based fungicides, baking soda solution, or beneficial bacteria treatments.',
      'Healthy': 'No treatment needed. Continue preventive care.'
    };
    return alternatives[type] || 'Consult organic farming guidelines.';
  };

  const getEstimatedYieldLoss = (severity) => {
    const losses = {
      'High': '20-35%',
      'Medium': '10-20%',
      'Low': '5-10%'
    };
    return losses[severity] || 'Minimal';
  };

  const keyframeStyles = `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  return (
    <>
      <style>{keyframeStyles}</style>
      <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-black' : 'bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50'
      }`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div style={{ animation: 'slideDown 0.6s ease-out' }}>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
              AI Pest & Disease Detection
            </h1>
            <p className={`text-sm sm:text-base font-semibold ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Upload plant images for instant AI-powered analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <UploadSection
                image={image}
                isAnalyzing={isAnalyzing}
                onUpload={handleImageUpload}
              />
            </div>

            {/* History */}
            <div 
              className={`rounded-xl shadow-xl p-4 sm:p-6 ${
                theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
              }`}
              style={{ animation: 'slideUp 0.6s ease-out' }}
            >
              <h2 className={`text-lg font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Scans
              </h2>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className={`text-center py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    No scans yet
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-gray-800 hover:bg-gray-700'
                          : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.diseaseName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {item.confidence}% confidence
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.severity === 'High' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : item.severity === 'Medium'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* High Confidence Result */}
          {result && <AnalysisResult result={result} />}
          
          {/* Low Confidence Result */}
          {lowConfidenceResult && <LowConfidenceResult data={lowConfidenceResult} />}
        </div>
      </div>
    </>
  );
};

export default PestDetection;
