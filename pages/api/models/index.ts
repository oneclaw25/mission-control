import type { NextApiRequest, NextApiResponse } from 'next';

interface Model {
  id: string;
  name: string;
  provider: string;
  status: 'available' | 'down' | 'testing';
  latency?: number;
  lastTested?: string;
  version: string;
  description: string;
  contextWindow: string;
  costPer1kTokens: string;
}

// Available models configuration
const MODELS: Model[] = [
  {
    id: 'moonshot/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'Moonshot AI',
    status: 'available',
    version: 'k2.5',
    description: 'Fast and efficient for most tasks',
    contextWindow: '256K',
    costPer1kTokens: '$0.002',
  },
  {
    id: 'anthropic/claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    status: 'available',
    version: '4.6',
    description: 'Balanced performance and quality',
    contextWindow: '200K',
    costPer1kTokens: '$0.008',
  },
  {
    id: 'anthropic/claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    status: 'available',
    version: '4.6',
    description: 'Maximum capability for critical work',
    contextWindow: '200K',
    costPer1kTokens: '$0.032',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    status: 'available',
    version: '4o',
    description: 'Versatile and widely capable',
    contextWindow: '128K',
    costPer1kTokens: '$0.010',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    status: 'available',
    version: '4o-mini',
    description: 'Fast and cost-effective',
    contextWindow: '128K',
    costPer1kTokens: '$0.0006',
  },
  {
    id: 'minimax/m2.5',
    name: 'MiniMax M2.5',
    provider: 'MiniMax',
    status: 'available',
    version: 'M2.5',
    description: 'Local GPU model - FREE inference',
    contextWindow: '196K',
    costPer1kTokens: 'FREE',
  },
];

// Test a model by making a simple request
async function testModel(modelId: string): Promise<{ success: boolean; latency: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Simulate API test based on model provider
    // In production, this would make an actual API call
    const model = MODELS.find(m => m.id === modelId);
    if (!model) {
      return { success: false, latency: 0, error: 'Model not found' };
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
    
    const latency = Date.now() - startTime;
    
    // Simulate occasional failures for testing
    if (Math.random() > 0.95) {
      return { success: false, latency, error: 'Connection timeout' };
    }
    
    return { success: true, latency };
  } catch (error: any) {
    return { success: false, latency: Date.now() - startTime, error: error.message };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { action, modelId } = req.query;

  switch (method) {
    case 'GET':
      // Test a specific model
      if (action === 'test' && modelId) {
        const result = await testModel(modelId as string);
        return res.status(200).json({
          modelId,
          ...result,
          testedAt: new Date().toISOString(),
        });
      }
      
      // Test all models
      if (action === 'test-all') {
        const results = await Promise.all(
          MODELS.map(async (model) => {
            const test = await testModel(model.id);
            return {
              ...model,
              status: test.success ? 'available' : 'down',
              latency: test.latency,
              lastTested: new Date().toISOString(),
              error: test.error,
            };
          })
        );
        return res.status(200).json({ models: results });
      }
      
      // Return all models
      return res.status(200).json({ models: MODELS });

    case 'POST':
      if (action === 'switch') {
        const { targetModel } = req.body;
        // In production, this would actually switch the model
        return res.status(200).json({
          success: true,
          message: `Switched to ${targetModel}`,
          previousModel: 'moonshot/kimi-k2.5',
          currentModel: targetModel,
          timestamp: new Date().toISOString(),
        });
      }
      
      return res.status(400).json({ error: 'Invalid action' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
