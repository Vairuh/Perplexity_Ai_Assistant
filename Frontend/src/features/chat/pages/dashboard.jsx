import React, {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {useSelector} from 'react-redux';
import {useChat} from './hooks/useChat';

const Dashboard = () => {
    const chat = useChat();
    const [messageText, setMessageText] = useState('');
    const [isNewChat, setIsNewChat] = useState(false);

    const chats = useSelector((state) => state.chat.chats);
    const currentChat = useSelector((state) => state.chat.currentChat);
    const user = useSelector((state) => state.auth.user);

    const chatList = Object.entries(chats)
        .map(([id, chat]) => ({
            id,
            title: chat.title || 'Untitled Chat',
            messages: chat.messages || [],
            lastUpdated: chat.lastUpdated || 0,
        }))
        .sort((a, b) => b.lastUpdated - a.lastUpdated);

    const activeChat = isNewChat
        ? { id: 'new', title: 'New Chat', messages: [] }
        : currentChat
            ? chats[currentChat] || chatList.find((item) => item.id === currentChat)
            : chatList[0];
    const messages = activeChat?.messages || [];

    useEffect(() => {
        chat.initializeSocketConnection();
        chat.handleGetChats();
    }, []);

    useEffect(() => {
        if (!currentChat && !isNewChat && chatList.length > 0) {
            const firstId = chatList[0].id;
            chat.handleSetCurrentChat(firstId);
            chat.handleGetMessages(firstId);
        }
    }, [chatList, currentChat, isNewChat]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!messageText.trim()) return;
        chat.handleSendMessage({ chatId: isNewChat ? null : currentChat, message: messageText });
        setMessageText('');
        setIsNewChat(false);
    };

    const handleNewChat = () => {
        setIsNewChat(true);
        chat.handleSetCurrentChat(null);
    };

    const openChat = (chatId) => {
        setIsNewChat(false);
        chat.handleSetCurrentChat(chatId);
        chat.handleGetMessages(chatId);
    };

    return (
        <main className="h-screen w-full bg-slate-950 text-slate-100">
            <div className="mx-auto flex h-full max-w-[1600px] flex-col px-4 py-4 md:px-6">
                <header className="flex flex-col gap-4 rounded-3xl border border-cyan-800/50 bg-cyan-950/70 p-5 shadow-lg shadow-cyan-950/20 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-cyan-100">AI Chat Dashboard</h1>
                        <p className="text-sm text-cyan-300">Manage conversations and review chat history.</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-cyan-700/80 bg-cyan-900/90 px-4 py-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-slate-950">
                            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-cyan-100">{user?.username || user?.email || 'Guest'}</p>
                            <p className="text-xs text-cyan-300">Logged in</p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-cyan-800/50 bg-slate-950/90 shadow-xl shadow-cyan-950/20 md:flex-row md:divide-x md:divide-cyan-800/50 md:p-6">
                    <aside className="order-2 flex w-full flex-col gap-4 rounded-b-3xl border border-cyan-800/50 bg-slate-900/90 p-4 md:order-1 md:w-80 md:rounded-l-3xl md:rounded-r-none">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-cyan-100">Chat History</h2>
                                <p className="text-xs text-cyan-300">Refresh to sync with the server after a delete.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleNewChat}
                                    className="rounded-2xl border border-cyan-700/80 bg-cyan-900/90 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-400 hover:bg-cyan-800"
                                >
                                    New Chat
                                </button>
                                <button
                                    type="button"
                                    onClick={chat.handleGetChats}
                                    className="rounded-2xl border border-cyan-700/80 bg-cyan-900/90 px-3 py-1 text-xs text-cyan-100 transition hover:border-cyan-400 hover:bg-cyan-800"
                                >
                                    Refresh
                                 </button>
                                <span className="rounded-full bg-cyan-950/70 px-3 py-1 text-xs text-cyan-300">{chatList.length} items</span>
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 overflow-auto pr-1">
                            {chatList.length === 0 ? (
                                <div className="rounded-3xl border border-cyan-800/60 bg-slate-950 px-4 py-4 text-sm text-cyan-300">
                                    No chats available yet. Start a conversation to see chat history here.
                                </div>
                            ) : (
                                chatList.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openChat(item.id)}
                                        role="button"
                                        tabIndex={0}
                                        className={`group w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                                            item.id === currentChat
                                                ? 'border-cyan-400 bg-cyan-950/70'
                                                : 'border-cyan-800/60 bg-slate-950 hover:border-cyan-400 hover:bg-cyan-950/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <span className="font-medium text-cyan-100">{item.title}</span>
                                                <p className="mt-1 text-sm text-cyan-300">
                                                    {item.title || 'Untitled Chat'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        chat.handleDeleteChat(item.id);
                                                    }}
                                                    className="rounded-full border border-red-600/80 bg-red-600/10 px-2 py-1 text-[10px] font-semibold text-red-300 transition hover:bg-red-600/20"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </aside>

                    <section className="order-1 flex flex-1 flex-col overflow-hidden rounded-t-3xl bg-slate-950/95 p-4 md:order-2 md:rounded-r-3xl md:rounded-l-none md:p-6">
                        <div className="mb-4 flex items-center justify-between rounded-3xl bg-cyan-950/80 px-4 py-3 text-sm text-cyan-100">
                            <span>Active conversation</span>
                            <span className="rounded-full bg-cyan-900/90 px-3 py-1 text-xs text-cyan-300">AI Assistant</span>
                        </div>

                        <div className="messages flex h-full flex-col gap-4 overflow-y-auto pr-2 pb-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm shadow-cyan-950/20 ${
                                        message.role === 'user'
                                            ? 'self-end rounded-br-2xl bg-cyan-500 text-slate-950'
                                            : 'self-start rounded-bl-2xl text-cyan-100'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        message.content
                                    ) : (
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    )}
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="border-t border-cyan-800/60 bg-slate-950/90 px-4 py-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <label htmlFor="message" className="sr-only">Type a message</label>
                                <input
                                    id="message"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 rounded-3xl border border-cyan-800/60 bg-slate-900 px-4 py-3 text-sm text-cyan-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center rounded-3xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default Dashboard;
