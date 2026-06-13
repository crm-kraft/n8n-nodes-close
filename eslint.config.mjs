import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';
export default [
  {
    plugins: { 'n8n-nodes-base': n8nNodesBase },
    rules: {
      'n8n-nodes-base/node-param-options-type-unsorted-items': 'off',
      'n8n-nodes-base/node-param-collection-type-unsorted-items': 'off'
    }
  }
];
