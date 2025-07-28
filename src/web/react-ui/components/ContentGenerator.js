import React, { useState } from 'react';
import { usePostContext } from '../context/PostContext';
import { ArrowLeft, Sparkles, Image, BarChart3, Send, RefreshCw } from 'lucide-react';

const ContentGenerator = ({ postType, customPrompt, onGenerate, onBack }) => {
    const { loading, error, generatePost } = usePostContext();
    const [prompt, setPrompt] = useState(customPrompt || '');
    const [generationStep, setGenerationStep] = useState('idle'); // idle, generating, complete

    const getPostTypeInfo = (type) => {
        const types = {
            fintech: {
                title: 'FintechPulse Post',
                description: 'Generate business-focused fintech content with industry insights',
                icon: '🚀',
                color: 'blue'
            },
            personal: {
                title: 'Personal Post',
                description: 'Create personal branding content and opportunity-focused posts',
                icon: '👤',
                color: 'purple'
            },
            'michael-davis': {
                title: 'Michael Davis Post',
                description: 'Generate economist-style content with data-driven insights',
                icon: '📊',
                color: 'green'
            },
            education: {
                title: 'Continuing Education Post',
                description: 'Create content about courses and professional development',
                icon: '📚',
                color: 'orange'
            },
            qed: {
                title: 'QED Investors Post',
                description: 'Generate investment and VC-focused content',
                icon: '💰',
                color: 'red'
            },
            freestyle: {
                title: 'Freestyle Post',
                description: 'Create custom content from your own prompts',
                icon: '✨',
                color: 'pink'
            }
        };
        return types[type] || types.freestyle;
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && postType === 'freestyle') {
            alert('Please enter a custom prompt for freestyle posts');
            return;
        }

        setGenerationStep('generating');

        try {
            const result = await generatePost(postType, prompt);
            setGenerationStep('complete');
            onGenerate(result.content, result.image, result.metrics);
        } catch (err) {
            setGenerationStep('idle');
            console.error('Generation failed:', err);
        }
    };

    const postTypeInfo = getPostTypeInfo(postType);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {postTypeInfo.title}
                    </h1>
                    <p className="text-gray-600">{postTypeInfo.description}</p>
                </div>
            </div>

            {/* Custom Prompt Input */}
            {postType === 'freestyle' && (
                <div className="card">
                    <div className="flex items-center space-x-3 mb-4">
                        <Sparkles className="w-6 h-6 text-pink-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Custom Prompt</h3>
                    </div>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your custom prompt here... (e.g., 'Write about the future of AI in fintech')"
                        className="input-field h-32 resize-none"
                        disabled={loading}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        Describe what you want to write about. Be specific for better results!
                    </p>
                </div>
            )}

            {/* Generation Controls */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Generate Content</h3>
                    <div className="flex items-center space-x-2">
                        <Image className="w-5 h-5 text-blue-500" />
                        <BarChart3 className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">Content + Image + Metrics</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || (postType === 'freestyle' && !prompt.trim())}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Generate Post</span>
                            </>
                        )}
                    </button>

                    {postType === 'freestyle' && !prompt.trim() && (
                        <span className="text-sm text-gray-500">
                            Enter a prompt to continue
                        </span>
                    )}
                </div>

                {/* Generation Progress */}
                {generationStep === 'generating' && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="loading-spinner"></div>
                            <span className="text-gray-700">Generating optimized content...</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="loading-spinner"></div>
                            <span className="text-gray-700">Creating custom image...</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="loading-spinner"></div>
                            <span className="text-gray-700">Calculating engagement metrics...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="card bg-blue-50 border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Results</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Be specific about your topic and target audience</li>
                    <li>• Include industry keywords for better reach</li>
                    <li>• Mention current trends or news for relevance</li>
                    <li>• Consider your professional goals and brand voice</li>
                </ul>
            </div>
        </div>
    );
};

export default ContentGenerator; 