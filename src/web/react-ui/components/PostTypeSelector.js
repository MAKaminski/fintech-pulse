import React from 'react';
import {
    TrendingUp,
    User,
    BookOpen,
    DollarSign,
    Sparkles,
    MessageSquare,
    Zap,
    Target,
    GraduationCap,
    Building2
} from 'lucide-react';

const PostTypeSelector = ({ onSelect }) => {
    const postTypes = [
        {
            id: 'fintech',
            title: 'FintechPulse Post',
            description: 'Business/Industry focused content with fintech insights',
            icon: TrendingUp,
            color: 'from-blue-500 to-blue-600',
            features: ['Industry insights', 'Market analysis', 'Professional tone']
        },
        {
            id: 'personal',
            title: 'Personal Post',
            description: 'Personal branding and opportunity-focused content',
            icon: User,
            color: 'from-purple-500 to-purple-600',
            features: ['Personal branding', 'Career opportunities', 'Authentic voice']
        },
        {
            id: 'michael-davis',
            title: 'Michael Davis Post',
            description: 'Economist style content with data-driven insights',
            icon: BookOpen,
            color: 'from-green-500 to-green-600',
            features: ['Data-driven', 'Economic analysis', 'Expert perspective']
        },
        {
            id: 'education',
            title: 'Continuing Education Post',
            description: 'Course recommendations and learning content',
            icon: GraduationCap,
            color: 'from-orange-500 to-orange-600',
            features: ['Course recommendations', 'Learning insights', 'Professional development']
        },
        {
            id: 'qed',
            title: 'QED Investors Post',
            description: 'Investment and fintech VC focused content',
            icon: DollarSign,
            color: 'from-red-500 to-red-600',
            features: ['Investment insights', 'VC perspective', 'Startup ecosystem']
        },
        {
            id: 'freestyle',
            title: 'Freestyle Post',
            description: 'Custom content from your own prompts',
            icon: Sparkles,
            color: 'from-pink-500 to-pink-600',
            features: ['Custom prompts', 'Creative freedom', 'Unique content']
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    What type of post would you like to generate?
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Choose from our specialized content generators or create something unique with your own prompt
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postTypes.map((type) => (
                    <div
                        key={type.id}
                        className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => onSelect(type.id)}
                    >
                        <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                <type.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {type.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {type.description}
                                </p>
                                <div className="mt-3 space-y-1">
                                    {type.features.map((feature, index) => (
                                        <div key={index} className="flex items-center text-xs text-gray-500">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Click to select</span>
                                <div className="w-6 h-6 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors flex items-center justify-center">
                                    <Zap className="w-3 h-3 text-gray-400 group-hover:text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-8">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                    <Target className="w-4 h-4" />
                    <span>Each generator is optimized for maximum LinkedIn engagement</span>
                </div>
            </div>
        </div>
    );
};

export default PostTypeSelector; 