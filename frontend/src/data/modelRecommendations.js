/**
 * Model recommendation tiers for council deliberation work.
 *
 * Tiers differ by role:
 *   - council: Needs diverse perspectives. Mix of quality and value is good.
 *   - chairman: Needs deep synthesis, strong instruction-following, long-context coherence.
 *               Use premium models only.
 *
 * Matching uses substring search on the model ID (case-insensitive), so it works
 * regardless of provider prefix (openrouter:, openai:, anthropic:, etc.)
 */

export const TIERS = {
  best: { label: '⭐ Best Quality', color: '#4ade80' },
  value: { label: '💰 Good Value', color: '#60a5fa' },
  not_recommended: { label: '⚠️ Limited', color: '#94a3b8' },
};

export const COUNCIL_TIERS = {
  best: [
    // Anthropic
    'claude-opus', 'claude-sonnet',
    // OpenAI
    'gpt-4.1', 'gpt-4o',
    // Google
    'gemini-2.5-pro',
    // xAI
    'grok-3',
    // OpenAI reasoning
    'o4-mini', 'o3',
    // Meta (large)
    'llama-3.1-405b',
    // DeepSeek
    'deepseek-r1',
    // Perplexity (real-time web search built in — unique perspective)
    'sonar-pro', 'sonar-reasoning-pro',
  ],
  value: [
    // Anthropic
    'claude-haiku',
    // OpenAI
    'gpt-4o-mini',
    // Google
    'gemini-2.0-flash',
    // xAI
    'grok-3-mini',
    // Meta (mid-size)
    'llama-3.3-70b',
    // DeepSeek
    'deepseek-chat',
    // Mistral
    'mistral-large',
    // Perplexity
    'sonar',
  ],
  not_recommended: [
    // Very small or outdated models
    'gemini-2.0-flash-lite',
    'mistral-small', 'mistral-7b',
    'llama-3.2-1b', 'llama-3.2-3b',
  ],
};

export const CHAIRMAN_TIERS = {
  best: [
    // Chairman needs premium synthesis ability
    'claude-opus',
    'gpt-4.1',
    'gemini-2.5-pro',
    'o3',
  ],
  value: [
    'claude-sonnet',
    'gpt-4o',
    'gemini-2.0-flash',
    'o4-mini',
    'grok-3',
    'deepseek-r1',
  ],
  not_recommended: [
    // Good as council members but too lightweight for chairman synthesis
    'claude-haiku',
    'gpt-4o-mini',
    'gemini-2.0-flash-lite',
    'grok-3-mini',
    'sonar-pro', 'sonar-reasoning-pro', 'sonar',
    'llama-3.3-70b', 'llama-3.1-405b',
    'mistral-large', 'mistral-small', 'mistral-7b',
    'deepseek-chat',
  ],
};

/**
 * Returns the tier for a model ID given its role.
 * @param {string} modelId - Full model ID (with or without prefix)
 * @param {'council'|'chairman'} role
 * @returns {'best'|'value'|'not_recommended'|null}
 */
export function getModelTier(modelId, role = 'council') {
  if (!modelId) return null;
  const id = modelId.toLowerCase();
  const tiers = role === 'chairman' ? CHAIRMAN_TIERS : COUNCIL_TIERS;
  for (const tier of ['best', 'value', 'not_recommended']) {
    if (tiers[tier].some(pattern => id.includes(pattern))) return tier;
  }
  return null; // unrated — no badge shown
}
