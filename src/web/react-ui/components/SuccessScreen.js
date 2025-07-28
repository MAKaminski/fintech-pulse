import React from 'react';
import { CheckCircle, Plus, BarChart3, ExternalLink, Share2, TrendingUp } from 'lucide-react';

const SuccessScreen = ({ postData, onNewPost }) => {
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check out my LinkedIn post!',
                text: 'I just posted this using FintechPulse AI',
                url: 'https://linkedin.com'
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText('Check out my LinkedIn post!');
        }
    };

    return (
        <div className="text-center space-y-8">
            {/* Success Animation */}
            <div className="flex justify-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Post Successfully Published! 🎉
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Your {postData.type} post has been published to LinkedIn and is now live for your network to see.
                </p>
            </div>

            {/* Post Preview */}
            <div className="max-w-2xl mx-auto">
                <div className="card bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Published Content</h3>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-gray-900 leading-relaxed mb-3">
                            {postData.content}
                        </div>
                        {postData.image && postData.image.success && (
                            <div className="mb-3">
                                <img
                                    src={`/api/images/${postData.image.filename}`}
                                    alt="Published content"
                                    className="w-full rounded-lg"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {postData.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {postData.metrics.estimatedViews?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Views</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round((postData.metrics.engagementScore || 0) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Engagement Score</div>
                    </div>
                    <div className="card text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {postData.metrics.wordCount || '0'}
                        </div>
                        <div className="text-sm text-gray-600">Words</div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                    onClick={onNewPost}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Another Post</span>
                </button>

                <button
                    onClick={handleShare}
                    className="btn-secondary flex items-center space-x-2"
                >
                    <Share2 className="w-5 h-5" />
                    <span>Share Success</span>
                </button>

                <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center space-x-2"
                >
                    <ExternalLink className="w-5 h-5" />
                    <span>View on LinkedIn</span>
                </a>
            </div>

            {/* Next Steps */}
            <div className="max-w-2xl mx-auto">
                <div className="card bg-blue-50 border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div className="flex items-start space-x-2">
                            <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Monitor engagement and analytics in your dashboard</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <BarChart3 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Track performance metrics and optimize future posts</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Plus className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Create more content to build your professional presence</span>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Share2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Engage with your network and respond to comments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="max-w-2xl mx-auto">
                <div className="card bg-green-50 border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">💡 Pro Tips</h3>
                    <ul className="text-sm text-green-800 space-y-1 text-left">
                        <li>• Engage with comments within the first hour for maximum visibility</li>
                        <li>• Share your post in relevant LinkedIn groups to expand reach</li>
                        <li>• Use the analytics dashboard to track which content performs best</li>
                        <li>• Post consistently to build momentum and grow your audience</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SuccessScreen; 