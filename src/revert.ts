import { execSync } from 'child_process';

try {
  const status = execSync('git status', { encoding: 'utf8' });
  console.log('Git Status:\n', status);
} catch (err: any) {
  console.error('Error running git command:', err.message || err);
}
