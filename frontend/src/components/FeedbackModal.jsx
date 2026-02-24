import { useState } from 'react';
import { api } from '../api';
import './FeedbackModal.css';

export default function FeedbackModal({ initialType = 'bug', context, onClose }) {
    const [type, setType] = useState(initialType);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [issueUrl, setIssueUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (!description.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await api.submitFeedback(type, description.trim(), context);
            setIssueUrl(result.issue_url);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const modeLabels = {
        full: 'Full Deliberation',
        chat_ranking: 'Chat + Ranking',
        chat_only: 'Chat Only',
    };

    return (
        <div className="feedback-overlay" onClick={onClose}>
            <div className="feedback-modal" onClick={e => e.stopPropagation()}>
                <div className="feedback-header">
                    <h2>{type === 'bug' ? '🐛 Report a Bug' : '✨ Request a Feature'}</h2>
                    <button className="feedback-close" onClick={onClose}>&times;</button>
                </div>

                {issueUrl ? (
                    <div className="feedback-success">
                        <div className="feedback-success-icon">✓</div>
                        <p>Your {type === 'bug' ? 'bug report' : 'feature request'} was submitted.</p>
                        <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="feedback-issue-link">
                            View it on GitHub →
                        </a>
                        <button className="feedback-done-btn" onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <>
                        <div className="feedback-type-toggle">
                            <button
                                className={`feedback-type-btn ${type === 'bug' ? 'active' : ''}`}
                                onClick={() => setType('bug')}
                            >
                                🐛 Bug Report
                            </button>
                            <button
                                className={`feedback-type-btn ${type === 'feature' ? 'active' : ''}`}
                                onClick={() => setType('feature')}
                            >
                                ✨ Feature Request
                            </button>
                        </div>

                        <div className="feedback-body">
                            <label className="feedback-label">
                                {type === 'bug'
                                    ? 'What happened? What did you expect?'
                                    : 'What would you like to see?'}
                            </label>
                            <textarea
                                className="feedback-textarea"
                                placeholder={type === 'bug'
                                    ? 'Describe the issue...'
                                    : 'Describe the feature...'}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                                autoFocus
                            />

                            <details className="feedback-context-details">
                                <summary>What we'll include automatically</summary>
                                <div className="feedback-context-grid">
                                    <span className="ctx-label">Mode</span>
                                    <span className="ctx-value">{modeLabels[context.execution_mode] || context.execution_mode}</span>
                                    <span className="ctx-label">Chairman</span>
                                    <span className="ctx-value">{context.chairman_model || 'Not set'}</span>
                                    <span className="ctx-label">Council</span>
                                    <span className="ctx-value">{(context.council_models || []).join(', ') || 'None'}</span>
                                    <span className="ctx-label">Search</span>
                                    <span className="ctx-value">{context.search_provider || 'Unknown'}</span>
                                </div>
                            </details>

                            {error && <div className="feedback-error">{error}</div>}

                            <div className="feedback-actions">
                                <button className="feedback-cancel" onClick={onClose}>Cancel</button>
                                <button
                                    className="feedback-submit"
                                    onClick={handleSubmit}
                                    disabled={!description.trim() || isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
