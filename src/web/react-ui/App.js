import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import PostTypeSelector from './components/PostTypeSelector';
import ContentGenerator from './components/ContentGenerator';
import PreviewAndConfirm from './components/PreviewAndConfirm';
import SuccessScreen from './components/SuccessScreen';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { PostProvider } from './context/PostContext';
import './App.css';

function App() {
    const [currentStep, setCurrentStep] = useState('post-type-selector');
    const [postData, setPostData] = useState({
        type: null,
        content: null,
        image: null,
        metrics: null,
        customPrompt: ''
    });

    const handleStepChange = (step, data = {}) => {
        setCurrentStep(step);
        setPostData(prev => ({ ...prev, ...data }));
    };

    const resetApp = () => {
        setCurrentStep('post-type-selector');
        setPostData({
            type: null,
            content: null,
            image: null,
            metrics: null,
            customPrompt: ''
        });
    };

    return (
        <PostProvider>
            <Router>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                    <Header />

                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/analytics" element={<AnalyticsDashboard />} />
                            <Route path="/" element={
                                <div className="max-w-4xl mx-auto">
                                    {currentStep === 'post-type-selector' && (
                                        <PostTypeSelector
                                            onSelect={(type) => handleStepChange('content-generator', { type })}
                                        />
                                    )}

                                    {currentStep === 'content-generator' && (
                                        <ContentGenerator
                                            postType={postData.type}
                                            customPrompt={postData.customPrompt}
                                            onGenerate={(content, image, metrics) =>
                                                handleStepChange('preview-confirm', { content, image, metrics })
                                            }
                                            onBack={() => handleStepChange('post-type-selector')}
                                        />
                                    )}

                                    {currentStep === 'preview-confirm' && (
                                        <PreviewAndConfirm
                                            postData={postData}
                                            onConfirm={() => handleStepChange('success')}
                                            onBack={() => handleStepChange('content-generator')}
                                            onRegenerate={() => handleStepChange('content-generator')}
                                        />
                                    )}

                                    {currentStep === 'success' && (
                                        <SuccessScreen
                                            postData={postData}
                                            onNewPost={resetApp}
                                        />
                                    )}
                                </div>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </PostProvider>
    );
}

export default App; 