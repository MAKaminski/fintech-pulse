import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Eye,
    Heart,
    MessageCircle,
    Share2,
    Calendar,
    Clock,
    FileText,
    Target,
    ArrowUp,
    ArrowDown,
    Activity
} from 'lucide-react';

const AnalyticsDashboard = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('engagement');

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }
            const data = await response.json();
            setAnalyticsData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const getMetricIcon = (metric) => {
        switch (metric) {
            case 'views': return <Eye className="w-5 h-5" />;
            case 'likes': return <Heart className="w-5 h-5" />;
            case 'comments': return <MessageCircle className="w-5 h-5" />;
            case 'shares': return <Share2 className="w-5 h-5" />;
            case 'engagement': return <Activity className="w-5 h-5" />;
            default: return <TrendingUp className="w-5 h-5" />;
        }
    };

    const getMetricColor = (metric) => {
        switch (metric) {
            case 'views': return 'text-blue-600';
            case 'likes': return 'text-red-600';
            case 'comments': return 'text-green-600';
            case 'shares': return 'text-purple-600';
            case 'engagement': return 'text-orange-600';
            default: return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 mb-4">❌ {error}</div>
                <button
                    onClick={fetchAnalyticsData}
                    className="btn-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!analyticsData) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-600 mb-4">No analytics data available</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-2">Performance insights and optimization recommendations</p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {analyticsData.summary && Object.entries(analyticsData.summary).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {typeof value === 'number' ? formatNumber(value) : value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg bg-gray-50 ${getMetricColor(key)}`}>
                                {getMetricIcon(key)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Engagement Over Time */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Over Time</h3>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Chart visualization would go here</p>
                        </div>
                    </div>
                </div>

                {/* Performance by Post Type */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Post Type</h3>
                    <div className="space-y-4">
                        {analyticsData.performanceByType && Object.entries(analyticsData.performanceByType).map(([type, data]) => (
                            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <span className="font-medium capitalize">{type}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{data.avgEngagement.toFixed(2)}%</div>
                                    <div className="text-sm text-gray-500">{data.postCount} posts</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Day of Week Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Day of Week</h3>
                <div className="grid grid-cols-7 gap-4">
                    {analyticsData.dayOfWeekPerformance && Object.entries(analyticsData.dayOfWeekPerformance).map(([day, data]) => (
                        <div key={day} className="text-center">
                            <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-blue-600">{data.avgEngagement.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">{data.postCount} posts</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Time of Day Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Time of Day</h3>
                <div className="grid grid-cols-6 gap-4">
                    {analyticsData.timeOfDayPerformance && Object.entries(analyticsData.timeOfDayPerformance).map(([time, data]) => (
                        <div key={time} className="text-center">
                            <div className="text-sm font-medium text-gray-600 mb-2">{time}</div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <div className="text-lg font-bold text-green-600">{data.avgEngagement.toFixed(1)}%</div>
                                <div className="text-xs text-gray-500">{data.postCount} posts</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Performing Posts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
                <div className="space-y-4">
                    {analyticsData.topPosts && analyticsData.topPosts.map((post, index) => (
                        <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {post.content.substring(0, 100)}...
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {post.type} • {new Date(post.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center space-x-4">
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900">{formatNumber(post.views)}</div>
                                        <div className="text-xs text-gray-500">Views</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900">{post.engagementRate.toFixed(2)}%</div>
                                        <div className="text-xs text-gray-500">Engagement</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            {analyticsData.recommendations && analyticsData.recommendations.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
                    <div className="space-y-4">
                        {analyticsData.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-900">{rec.title}</p>
                                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard; 