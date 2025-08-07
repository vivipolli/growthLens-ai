import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { apiCall } from '../utils/api';
import Card from './Card';
import Button from './Button';
import ChatParser from '../utils/chatParser';

const ChatPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { userProfile, loading: profileLoading } = useUserProfile();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatStatus, setChatStatus] = useState({ isReady: false, topicId: null });
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        adjustTextareaHeight();
    }, [newMessage]);

    useEffect(() => {
        // Check chat service status
        checkChatStatus();

        // Add welcome message
        if (userProfile && !profileLoading) {
            addSystemMessage("Hello! I'm your AI business coach. I have access to your business profile and can help you with strategy, growth, and daily missions. How can I assist you today?");
        }
    }, [userProfile, profileLoading]);

    const checkChatStatus = async () => {
        try {
            const status = await apiCall('/api/chat/status');
            setChatStatus(status);
        } catch (error) {
            console.error('Failed to check chat status:', error);
        }
    };

    const addSystemMessage = (message) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'system',
            message: message,
            timestamp: new Date().toISOString()
        }]);
    };

    const addUserMessage = (message) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            message: message,
            timestamp: new Date().toISOString()
        }]);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !userProfile || !user?.id) return;

        const message = newMessage.trim();
        setNewMessage('');
        setIsLoading(true);

        // Add user message to chat
        addUserMessage(message);

        try {
            const data = await apiCall('/api/chat/send', {
                method: 'POST',
                body: JSON.stringify({
                    message: message,
                    userProfile: userProfile,
                    userId: user.id
                })
            });

            console.log('Chat response data:', data);
            console.log('aiResponse exists:', !!data.aiResponse);
            console.log('aiResponse content:', data.aiResponse);

            if (data.aiResponse) {
                addSystemMessage(data.aiResponse);
            } else {
                console.log('No aiResponse found in data');
                addSystemMessage("I understand your question. Let me provide some insights based on your business profile...");
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            addSystemMessage("Sorry, I'm having trouble processing your message right now. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">AI Business Coach</h1>
                            <p className="text-sm text-gray-500">Powered by Hedera Blockchain</p>
                        </div>
                    </div>

                    {/* Chat Status */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${chatStatus.isReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-500">
                            {chatStatus.isReady ? 'Connected' : 'Connecting...'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <div className="text-6xl mb-4">💬</div>
                            <h2 className="text-xl font-semibold mb-2">Welcome to your AI Business Coach</h2>
                            <p className="text-gray-400">Ask me anything about your business strategy, growth, or daily missions.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-3xl rounded-2xl px-4 py-3 ${msg.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                            }`}
                                    >
                                        {msg.type === 'system' && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">AI</span>
                                                </div>
                                                <span className="text-xs text-gray-500">AI Coach</span>
                                            </div>
                                        )}
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: ChatParser.formatMessage(msg.message)
                                            }}
                                        />
                                        <div className="text-xs text-gray-400 mt-2">
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span className="text-sm">AI is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <textarea
                                ref={textareaRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask your AI business coach anything..."
                                className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                rows="1"
                                disabled={isLoading}
                                style={{ minHeight: '60px', maxHeight: '200px' }}
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <Button
                                onClick={sendMessage}
                                disabled={isLoading || !newMessage.trim()}
                                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>Send</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage; 