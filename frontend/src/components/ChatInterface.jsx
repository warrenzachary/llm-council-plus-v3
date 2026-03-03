import StageTimer from './StageTimer';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import SearchContext from './SearchContext';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import CouncilGrid from './CouncilGrid';
import ExecutionModeToggle from './ExecutionModeToggle';
import { api, API_BASE } from '../api';
import './ChatInterface.css';


export default function ChatInterface({
    conversation,
    onSendMessage,
    onAbort,
    isLoading,
    councilConfigured,
    onOpenSettings,
    councilModels = [],
    chairmanModel = null,
    executionMode,
    onExecutionModeChange,
    searchProvider = 'duckduckgo',
}) {
    const [input, setInput] = useState('');
    const [webSearch, setWebSearch] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Fetch the list of uploaded files for the current conversation
    const fetchUploadedFiles = async () => {
        if (!conversation || !conversation.id) {
            setUploadedFiles([]);
            return;
        }
        try {
            const data = await api.getDocuments(conversation.id);
            setUploadedFiles(data.files || []);
        } catch (err) {
            console.error("Failed to fetch document list:", err);
            setUploadedFiles([]);
        }
    };

    // Refresh file list when conversation changes
    useEffect(() => {
        fetchUploadedFiles();
    }, [conversation?.id]);

    const handleUploadDocuments = async (event) => {
        if (!conversation || !conversation.id) return;
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const res = await fetch(`${API_BASE}/api/conversations/${conversation.id}/documents`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const bodyText = await res.text();
                console.error("Upload failed:", {
                    status: res.status,
                    statusText: res.statusText,
                    body: bodyText,
                    conversationId: conversation.id,
                    apiBase: API_BASE,
                });
                return;
            }
            let response;
            try {
                response = await res.json();
            } catch (_) {
                response = null;
            }
            console.log("Upload success:", { conversationId: conversation.id, response });
            event.target.value = "";
            fetchUploadedFiles();
        } catch (error) {
            console.error("Failed to upload documents:", error, {
                conversationId: conversation.id,
                apiBase: API_BASE,
            });
        }
    };


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Only auto-scroll if user is already near the bottom
    useEffect(() => {
        if (!messagesContainerRef.current) return;

        const container = messagesContainerRef.current;
        const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 150;

        if (isNearBottom) {
            scrollToBottom();
        }
    }, [conversation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input, webSearch);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (!conversation) {
        return (
            <div className="chat-interface">
                <div className="empty-state">
                    <h1>Welcome to ConsiliumAI</h1>
                    <p className="hero-message">
                        The CH Consulting Advisors AI Engine
                    </p>
                    <p className="hero-message">
                        <button
                            className="config-link"
                            onClick={() => onOpenSettings('council')}
                        >
                            Configure it
                        </button>
                    </p>

                    <div className="welcome-grid-container">
                        <CouncilGrid
                            models={councilModels}
                            chairman={chairmanModel}
                            status="idle"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-interface">
            {/* Messages Area */}
            <div className="messages-area" ref={messagesContainerRef}>
                {(!conversation || conversation.messages.length === 0) ? (
                    <div className="hero-container">
                        <div className="hero-content">
                            <h1>Welcome to ConsiliumAI</h1>
                            <p className="hero-subtitle">
                                The CH Consulting Advisors AI Engine
                            </p>
                            <p className="hero-subtitle">
                                <button className="config-link" onClick={() => onOpenSettings('council')}>
                                    Configure it
                                </button>
                            </p>

                            <div className="welcome-grid-container">
                                <CouncilGrid models={councilModels} chairman={chairmanModel} status="idle" />
                            </div>
                        </div>
                    </div>
                ) : (
                    conversation.messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <div className="message-role">
                                {msg.role === 'user' ? 'Your Question to the Council' : 'ConsiliumAI Council'}
                            </div>

                            <div className="message-content">
                                {msg.role === 'user' ? (
                                    <div className="markdown-content">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Loading */}
                                        {msg.loading?.search && (
                                            <div className="stage-loading">
                                                <div className="spinner"></div>
                                                <span>
                                                    🔍 Searching the web with {
                                                        searchProvider === 'duckduckgo' ? 'DuckDuckGo' :
                                                            searchProvider === 'tavily' ? 'Tavily' :
                                                                searchProvider === 'brave' ? 'Brave' :
                                                                    'Provider'
                                                    }...
                                                </span>
                                            </div>
                                        )}

                                        {/* Search Context */}
                                        {msg.metadata?.search_context && (
                                            <SearchContext
                                                searchQuery={msg.metadata?.search_query}
                                                extractedQuery={msg.metadata?.extracted_query}
                                                searchContext={msg.metadata?.search_context}
                                            />
                                        )}

                                        {/* Stage 1: Council Grid Visualization */}
                                        {(msg.loading?.stage1 || (msg.stage1 && !msg.stage2)) && (
                                            <div className="stage-container">
                                                <div className="stage-header">
                                                    <h3>Stage 1: Council Deliberation</h3>
                                                    {msg.timers?.stage1Start && (
                                                        <StageTimer
                                                            startTime={msg.timers.stage1Start}
                                                            endTime={msg.timers.stage1End}
                                                        />
                                                    )}
                                                </div>
                                                <CouncilGrid
                                                    models={councilModels}
                                                    chairman={chairmanModel}
                                                    status={msg.loading?.stage1 ? 'thinking' : 'complete'}
                                                    progress={{
                                                        currentModel: msg.progress?.stage1?.currentModel,
                                                        completed: msg.stage1?.map(r => r.model) || []
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Stage 1 Results */}
                                        {msg.stage1 && (
                                            <Stage1
                                                responses={msg.stage1}
                                                startTime={msg.timers?.stage1Start}
                                                endTime={msg.timers?.stage1End}
                                            />
                                        )}

                                        {/* Stage 2 */}
                                        {msg.loading?.stage2 && (
                                            <div className="stage-loading">
                                                <div className="spinner"></div>
                                                <span>Running Stage 2...</span>
                                            </div>
                                        )}
                                        {msg.stage2 && (
                                            <Stage2
                                                rankings={msg.stage2}
                                                labelToModel={msg.metadata?.label_to_model}
                                                aggregateRankings={msg.metadata?.aggregate_rankings}
                                                startTime={msg.timers?.stage2Start}
                                                endTime={msg.timers?.stage2End}
                                            />
                                        )}

                                        {/* Stage 3 */}
                                        {msg.loading?.stage3 && (
                                            <div className="stage-loading">
                                                <div className="spinner"></div>
                                                <span>Final Synthesis...</span>
                                            </div>
                                        )}
                                        {msg.stage3 && (
                                            <Stage3
                                                finalResponse={msg.stage3}
                                                startTime={msg.timers?.stage3Start}
                                                endTime={msg.timers?.stage3End}
                                            />
                                        )}

                                        {/* Aborted Indicator */}
                                        {msg.aborted && (
                                            <div className="aborted-indicator">
                                                <span className="aborted-icon">⏹</span>
                                                <span className="aborted-text">
                                                    Generation stopped by user.
                                                    {msg.stage1 && !msg.stage3 && ' Partial results shown above.'}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Bottom Spacer for floating input */}
                <div ref={messagesEndRef} style={{ height: '20px' }} />
            </div>

            {/* Floating Command Capsule */}
            <div className="input-area">
                {!councilConfigured ? (
                    <div className="input-container config-required">
                        <span className="config-message">
                            ⚠️ Council not ready.
                            <button className="config-link" onClick={() => onOpenSettings('llm_keys')}>Configure API Keys</button>
                            <span className="config-separator">or</span>
                            <button className="config-link" onClick={() => onOpenSettings('council')}>Configure Council</button>
                        </span>
                    </div>
                ) : (
                    <form className="input-container" onSubmit={handleSubmit}>
                        <div className="input-row-top">
                            <label className={`search-toggle ${webSearch ? 'active' : ''}`} title="Toggle Web Search">
                                <input
                                    type="checkbox"
                                    className="search-checkbox"
                                    checked={webSearch}
                                    onChange={() => setWebSearch(!webSearch)}
                                    disabled={isLoading}
                                />
                                <span className="search-icon">🌐</span>
                                {webSearch && <span className="search-label">Search On</span>}
                            </label>

                            <textarea
                                className="message-input"
                                placeholder={isLoading ? "Consulting..." : "Ask the Council..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                rows={1}
                                style={{ height: 'auto', minHeight: '24px' }}
                            />
                            {/* Upload documents */}
                            {!isLoading && (
                                <label className="upload-button" title="Attach files">
                                    <span className="upload-button-icon" aria-hidden="true">📎</span>
                                    <span className="upload-button-text">Attach</span>
                                    <input
                                        type="file"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={handleUploadDocuments}
                                    />
                                </label>
                            )}

                            {isLoading ? (
                                <button
                                    type="button"
                                    className="send-button stop-button"
                                    onClick={onAbort}
                                    title="Stop Generation"
                                >
                                    ⏹
                                </button>
                            ) : (
                                <button type="submit" className="send-button" disabled={!input.trim()}>
                                    ➤
                                </button>
                            )}


                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="uploaded-files-bar">
                                <span className="uploaded-files-icon">📎</span>
                                <span className="uploaded-files-list">
                                    {uploadedFiles.map((f, i) => (
                                        <span key={f.filename} className="uploaded-file-tag">
                                            {f.filename}
                                            <span className="uploaded-file-size">
                                                ({f.size < 1024 ? `${f.size} B`
                                                    : f.size < 1048576 ? `${(f.size / 1024).toFixed(0)} KB`
                                                        : `${(f.size / 1048576).toFixed(1)} MB`})
                                            </span>
                                            {i < uploadedFiles.length - 1 && <span className="uploaded-file-sep"> · </span>}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        )}

                        <div className="input-row-bottom">
                            <ExecutionModeToggle
                                value={executionMode}
                                onChange={onExecutionModeChange}
                                disabled={isLoading}
                            />
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
