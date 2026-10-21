// Staging is selected by the build mode, never by production credentials.
export const isMockStaging = import.meta.env.MODE === 'staging';
export const isLivePreview = import.meta.env.MODE === 'live';

export function workflowUrl(workflow) {
  if (!['summarize', 'prd', 'transcribe'].includes(workflow)) throw new Error('Unknown workflow');
  if (isMockStaging) return `/__mock/workflows/${workflow}`;
  const base = import.meta.env.VITE_WORKFLOW_BASE_URL;
  if (!base) throw new Error('AI workflows are disabled: configure VITE_WORKFLOW_BASE_URL explicitly.');
  const paths = { summarize: 'transcript-summarize', prd: 'prd', transcribe: 'a37165d8-dcbd-4c54-8712-4400bec5f17b' };
  return `${base.replace(/\/$/, '')}/${paths[workflow]}`;
}
