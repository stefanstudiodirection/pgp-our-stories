/** @type {import('@webflow/webflow-cli').WebflowConfig} */
export default {
  // Mount path where your app will be accessible on Webflow
  mountPath: '/rs-en/our-stories',

  // Framework configuration
  framework: 'nextjs',

  // Build configuration
  build: {
    command: 'npm run build',
    outputDirectory: '.next',
  },

  // Development server configuration
  dev: {
    command: 'npm run dev',
    port: 3000,
  },
};
