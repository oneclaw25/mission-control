/**
 * OpenClaw API Proxy
 * Proxies commands to the OpenClaw CLI
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  // Security: Only allow openclaw commands
  if (!command.startsWith('openclaw ')) {
    return res.status(400).json({ error: 'Invalid command' });
  }

  try {
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000,
      env: {
        ...process.env,
        PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/sbin:/usr/local/sbin',
      },
    });

    if (stderr && !stdout) {
      return res.status(500).json({ error: stderr });
    }

    res.status(200).json({ output: stdout });
  } catch (error: any) {
    console.error('OpenClaw command error:', error);
    res.status(500).json({ 
      error: error.message,
      stderr: error.stderr,
    });
  }
}
