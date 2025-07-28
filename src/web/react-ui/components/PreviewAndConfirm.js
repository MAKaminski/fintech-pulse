import React, { useState } from 'react';
import { usePostContext } from '../context/PostContext';
import {
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    Eye,
    BarChart3,
    Image as ImageIcon,
    Copy,
    ExternalLink,
    TrendingUp,
    MessageCircle,
    Heart,
    Share2
} from 'lucide-react';

const PreviewAndConfirm = ({ postData, onConfirm, onBack, onRegenerate }) => {
    const { loading, error, postToLinkedIn, saveToDatabase } = usePostContext();
    const [copied, setCopied] = useState(false);

    const handleCopyContent = () => {
        navigator.clipboard.writeText(postData.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePostToLinkedIn = async () => {
        try {
            // Save to database first
            await saveToDatabase(postData);

            // Post to LinkedIn
            const result = await postToLinkedIn(postData);

            if (result.success) {
                onConfirm();
            }
        } catch (err) {
            console.error('Failed to post:', err);
        }
    };

    const formatMetrics = (metrics) => {
        if (!metrics) return null;

        return {
            wordCount: metrics.wordCount || 0,
            charCount: metrics.charCount || 0,
            emojiCount: metrics.emojiCount || 0,
            engagementScore: metrics.engagementScore || 0,
            estimatedViews: metrics.estimatedViews || 0,
            hasQuestion: metrics.hasQuestion || false,
            hasCallToAction: metrics.hasCallToAction || false
        };
    };

    const metrics = formatMetrics(postData.metrics);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Preview & Confirm</h1>
                <div className="w-20"></div> {/* Spacer for centering */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Preview */}
                <div className="lg:col-span-2 space-y-6">
                    {/* LinkedIn Post Preview */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">LinkedIn Preview</h3>
                            <div className="flex items-center space-x-2">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500">How it will appear</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold">FP</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">FintechPulse</div>
                                        <div className="text-sm text-gray-500">Just now • 🌐</div>
                                    </div>
                                </div>

                                <div className="text-gray-900 leading-relaxed mb-3">
                                    {postData.content}
                                </div>

                                {postData.image && postData.image.success && (
                                    <div className="mb-3">
                                        <img
                                            src={`/api/images/${postData.image.filename}`}
                                            alt="Generated content"
                                            className="w-full rounded-lg"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-gray-500 text-sm">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <Heart className="w-4 h-4" />
                                            <span>Like</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>Comment</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Share2 className="w-4 h-4" />
                                            <span>Share</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Send</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Actions */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleCopyContent}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <Copy className="w-4 h-4" />
                                <span>{copied ? 'Copied!' : 'Copy Content'}</span>
                            </button>

                            <button
                                onClick={onRegenerate}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Regenerate</span>
                            </button>

                            <button
                                onClick={handlePostToLinkedIn}
                                disabled={loading}
                                className="btn-success flex items-center space-x-2 disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>{loading ? 'Posting...' : 'Post to LinkedIn'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Metrics and Image */}
                <div className="space-y-6">
                    {/* Engagement Metrics */}
                    {metrics && (
                        <div className="card">
                            <div className="flex items-center space-x-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Engagement Metrics</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Word Count</span>
                                    <span className="font-semibold">{metrics.wordCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Character Count</span>
                                    <span className="font-semibold">{metrics.charCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Emojis Used</span>
                                    <span className="font-semibold">{metrics.emojiCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Engagement Score</span>
                                    <span className="font-semibold text-green-600">
                                        {Math.round(metrics.engagementScore * 100)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Estimated Views</span>
                                    <span className="font-semibold">{metrics.estimatedViews.toLocaleString()}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-200">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${metrics.hasQuestion ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className="text-sm text-gray-600">Includes Question</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${metrics.hasCallToAction ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <span className="text-sm text-gray-600">Call to Action</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Generated Image */}
                    {postData.image && postData.image.success && (
                        <div className="card">
                            <div className="flex items-center space-x-2 mb-4">
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-semibold text-gray-900">Generated Image</h3>
                            </div>

                            <div className="space-y-3">
                                <img
                                    src={`/api/images/${postData.image.filename}`}
                                    alt="Generated content"
                                    className="w-full rounded-lg border border-gray-200"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />

                                {postData.image.prompt && (
                                    <div className="text-sm text-gray-600">
                                        <strong>Prompt:</strong> {postData.image.prompt}
                                    </div>
                                )}

                                <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Download Image</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="card bg-red-50 border-red-200">
                            <h3 className="text-red-900 font-semibold mb-2">Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreviewAndConfirm; 