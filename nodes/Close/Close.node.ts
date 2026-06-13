import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { closeApiRequest, closeApiRequestAllItems } from './GenericFunctions';

export class Close implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Close',
		name: 'close',
		icon: 'file:close.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Close CRM',
		codex: {
			categories: ['Sales', 'CRM'],
			alias: ['close', 'close crm', 'closecrm', 'close.com', 'crm', 'leads', 'contacts', 'opportunities', 'sales'],
			resources: {
				primaryDocumentation: [{ url: 'https://developer.close.com/' }],
			},
		},
		defaults: {
			name: 'Close',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'closeApi',
				required: true,
			},
		],
		properties: [
			// ─── RESOURCE SELECTOR ───────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Activity', value: 'activity' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Custom Activity', value: 'customActivity' },
					{ name: 'Custom Field', value: 'customField' },
					{ name: 'Email Template', value: 'emailTemplate' },
					{ name: 'Integration Link', value: 'integrationLink' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Lead Status', value: 'leadStatus' },
					{ name: 'Opportunity', value: 'opportunity' },
					{ name: 'Opportunity Status', value: 'opportunityStatus' },
					{ name: 'Pipeline', value: 'pipeline' },
					{ name: 'Smart View', value: 'smartView' },
					{ name: 'Task', value: 'task' },
					{ name: 'User', value: 'user' },
				],
				default: 'lead',
			},

			// ─── LEAD ────────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['lead'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a lead' },
					{ name: 'Delete', value: 'delete', action: 'Delete a lead' },
					{ name: 'Get', value: 'get', action: 'Get a lead' },
					{ name: 'Get All', value: 'getAll', action: 'Get many leads' },
					{ name: 'Merge', value: 'merge', action: 'Merge leads' },
					{ name: 'Search', value: 'search', action: 'Search leads' },
					{ name: 'Update', value: 'update', action: 'Update a lead' },
				],
				default: 'get',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['lead'], operation: ['get', 'update', 'delete', 'merge'] } },
			},
			{
				displayName: 'Source Lead ID',
				name: 'sourceLeadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['lead'], operation: ['merge'] } },
				description: 'ID of the lead to merge into the destination lead — it will be deleted after merging',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['lead'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['lead'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Status', name: 'status_id', type: 'options', typeOptions: { loadOptionsMethod: 'getLeadStatuses' }, default: '' },
					{ displayName: 'URL', name: 'url', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['lead'], operation: ['search'] } },
				description: 'Search query string',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['lead'], operation: ['getAll', 'search'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: { minValue: 1, maxValue: 200 },
				displayOptions: { show: { resource: ['lead'], operation: ['getAll', 'search'], returnAll: [false] } },
			},

			// ─── LEAD STATUS ─────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['leadStatus'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a lead status' },
					{ name: 'Delete', value: 'delete', action: 'Delete a lead status' },
					{ name: 'Get', value: 'get', action: 'Get a lead status' },
					{ name: 'Get All', value: 'getAll', action: 'Get many lead statuses' },
					{ name: 'Update', value: 'update', action: 'Update a lead status' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Lead Status ID',
				name: 'leadStatusId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['leadStatus'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['leadStatus'], operation: ['create', 'update'] } },
			},

			// ─── CONTACT ─────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a contact' },
					{ name: 'Delete', value: 'delete', action: 'Delete a contact' },
					{ name: 'Get', value: 'get', action: 'Get a contact' },
					{ name: 'Get All', value: 'getAll', action: 'Get many contacts' },
					{ name: 'Update', value: 'update', action: 'Update a contact' },
				],
				default: 'get',
			},
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['contact'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
				description: 'ID of the lead to create the contact under',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Title', name: 'title', type: 'string', default: '' },
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['contact'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: { minValue: 1, maxValue: 200 },
				displayOptions: { show: { resource: ['contact'], operation: ['getAll'], returnAll: [false] } },
			},

			// ─── OPPORTUNITY ──────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['opportunity'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create an opportunity' },
					{ name: 'Delete', value: 'delete', action: 'Delete an opportunity' },
					{ name: 'Get', value: 'get', action: 'Get an opportunity' },
					{ name: 'Get All', value: 'getAll', action: 'Get many opportunities' },
					{ name: 'Update', value: 'update', action: 'Update an opportunity' },
				],
				default: 'get',
			},
			{
				displayName: 'Opportunity ID',
				name: 'opportunityId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['opportunity'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['opportunity'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['opportunity'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Note', name: 'note', type: 'string', default: '' },
					{ displayName: 'Status', name: 'status_id', type: 'options', typeOptions: { loadOptionsMethod: 'getOpportunityStatuses' }, default: '' },
					{ displayName: 'Value (in cents)', name: 'value', type: 'number', default: 0 },
					{ displayName: 'Value Currency', name: 'value_currency', type: 'string', default: 'USD' },
					{
						displayName: 'Value Period',
						name: 'value_period',
						type: 'options',
						options: [
							{ name: 'One Time', value: 'one_time' },
							{ name: 'Monthly', value: 'monthly' },
							{ name: 'Annual', value: 'annual' },
						],
						default: 'one_time',
					},
					{ displayName: 'Close Date', name: 'date_won', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['opportunity'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: { minValue: 1, maxValue: 200 },
				displayOptions: { show: { resource: ['opportunity'], operation: ['getAll'], returnAll: [false] } },
			},

			// ─── OPPORTUNITY STATUS ───────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['opportunityStatus'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create an opportunity status' },
					{ name: 'Delete', value: 'delete', action: 'Delete an opportunity status' },
					{ name: 'Get', value: 'get', action: 'Get an opportunity status' },
					{ name: 'Get All', value: 'getAll', action: 'Get many opportunity statuses' },
					{ name: 'Update', value: 'update', action: 'Update an opportunity status' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Opportunity Status ID',
				name: 'opportunityStatusId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['opportunityStatus'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['opportunityStatus'], operation: ['create'] } },
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Won', value: 'won' },
					{ name: 'Lost', value: 'lost' },
				],
				default: 'active',
				required: true,
				displayOptions: { show: { resource: ['opportunityStatus'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['opportunityStatus'], operation: ['update'] } },
				options: [
					{ displayName: 'Label', name: 'label', type: 'string', default: '' },
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Active', value: 'active' },
							{ name: 'Won', value: 'won' },
							{ name: 'Lost', value: 'lost' },
						],
						default: 'active',
					},
				],
			},

			// ─── PIPELINE ─────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['pipeline'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a pipeline' },
					{ name: 'Delete', value: 'delete', action: 'Delete a pipeline' },
					{ name: 'Get', value: 'get', action: 'Get a pipeline' },
					{ name: 'Get All', value: 'getAll', action: 'Get many pipelines' },
					{ name: 'Update', value: 'update', action: 'Update a pipeline' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['pipeline'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['pipeline'], operation: ['create', 'update'] } },
			},

			// ─── TASK ─────────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['task'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a task' },
					{ name: 'Delete', value: 'delete', action: 'Delete a task' },
					{ name: 'Get', value: 'get', action: 'Get a task' },
					{ name: 'Get All', value: 'getAll', action: 'Get many tasks' },
					{ name: 'Update', value: 'update', action: 'Update a task' },
				],
				default: 'get',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['task'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['task'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['task'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Lead ID', name: 'lead_id', type: 'string', default: '' },
					{ displayName: 'Assigned To (User ID)', name: 'assigned_to', type: 'string', default: '' },
					{ displayName: 'Due Date', name: 'due_date', type: 'string', default: '', description: 'ISO 8601 date string' },
					{ displayName: 'Is Complete', name: 'is_complete', type: 'boolean', default: false },
				],
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['task'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: { minValue: 1, maxValue: 200 },
				displayOptions: { show: { resource: ['task'], operation: ['getAll'], returnAll: [false] } },
			},

			// ─── ACTIVITY ─────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['activity'] } },
				options: [
					{ name: 'Create Note', value: 'createNote', action: 'Create a note activity' },
					{ name: 'Delete', value: 'delete', action: 'Delete an activity' },
					{ name: 'Get', value: 'get', action: 'Get an activity' },
					{ name: 'Get All', value: 'getAll', action: 'Get all activities for a lead' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Activity ID',
				name: 'activityId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['activity'], operation: ['get', 'delete'] } },
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['activity'], operation: ['createNote', 'getAll'] } },
			},
			{
				displayName: 'Note Type',
				name: 'noteType',
				type: 'options',
				options: [
					{ name: 'Plain Text', value: 'plain' },
					{ name: 'Rich Text (HTML)', value: 'html' },
				],
				default: 'plain',
				displayOptions: { show: { resource: ['activity'], operation: ['createNote'] } },
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'Plain text content of the note',
				displayOptions: { show: { resource: ['activity'], operation: ['createNote'], noteType: ['plain'] } },
			},
			{
				displayName: 'Note HTML',
				name: 'noteHtml',
				type: 'string',
				typeOptions: { rows: 6 },
				default: '<body><p></p></body>',
				required: true,
				description: 'Rich text HTML content. Must be wrapped in &lt;body&gt;&lt;/body&gt; tags. Supports &lt;p&gt;, &lt;h1&gt;-&lt;h3&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;img&gt;, etc.',
				displayOptions: { show: { resource: ['activity'], operation: ['createNote'], noteType: ['html'] } },
			},
			{
				displayName: 'Attach File',
				name: 'attachFile',
				type: 'boolean',
				default: false,
				description: 'Whether to attach a binary file to this note',
				displayOptions: { show: { resource: ['activity'], operation: ['createNote'] } },
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				description: 'Name of the binary property containing the file to attach',
				displayOptions: { show: { resource: ['activity'], operation: ['createNote'], attachFile: [true] } },
			},
			// ─── CUSTOM ACTIVITY ──────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['customActivity'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a custom activity' },
					{ name: 'Delete', value: 'delete', action: 'Delete a custom activity' },
					{ name: 'Get', value: 'get', action: 'Get a custom activity' },
					{ name: 'Update', value: 'update', action: 'Update a custom activity' },
				],
				default: 'create',
			},
			{
				displayName: 'Custom Activity ID',
				name: 'customActivityId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['customActivity'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Activity Type',
				name: 'activityTypeId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getCustomActivityTypes' },
				default: '',
				required: true,
				displayOptions: { show: { resource: ['customActivity'], operation: ['create'] } },
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['customActivity'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['customActivity'], operation: ['create', 'update'] } },
				options: [
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Draft', value: 'draft' },
							{ name: 'Published', value: 'published' },
						],
						default: 'draft',
					},
					{
						displayName: 'Custom Fields (JSON)',
						name: 'custom_fields_json',
						type: 'string',
						default: '',
						description: 'JSON object of custom field ID to value pairs',
					},
				],
			},

			// ─── COMMENT ──────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['comment'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a comment' },
					{ name: 'Delete', value: 'delete', action: 'Delete a comment' },
					{ name: 'Get All', value: 'getAll', action: 'Get all comments for a lead' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['comment'], operation: ['create', 'getAll'] } },
			},
			{
				displayName: 'Comment ID',
				name: 'commentId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['comment'], operation: ['delete'] } },
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
			},

			// ─── EMAIL TEMPLATE ───────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['emailTemplate'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create an email template' },
					{ name: 'Delete', value: 'delete', action: 'Delete an email template' },
					{ name: 'Get', value: 'get', action: 'Get an email template' },
					{ name: 'Get All', value: 'getAll', action: 'Get many email templates' },
					{ name: 'Update', value: 'update', action: 'Update an email template' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['emailTemplate'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['emailTemplate'], operation: ['create'] } },
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['emailTemplate'], operation: ['create'] } },
			},
			{
				displayName: 'Body HTML',
				name: 'body_html',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['emailTemplate'], operation: ['create'] } },
				description: 'HTML body of the email template',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['emailTemplate'], operation: ['update'] } },
				options: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Subject', name: 'subject', type: 'string', default: '' },
					{ displayName: 'Body HTML', name: 'body_html', type: 'string', default: '' },
				],
			},

			// ─── SMART VIEW ───────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['smartView'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a smart view' },
					{ name: 'Delete', value: 'delete', action: 'Delete a smart view' },
					{ name: 'Get', value: 'get', action: 'Get a smart view' },
					{ name: 'Get All', value: 'getAll', action: 'Get many smart views' },
					{ name: 'Get Leads', value: 'getLeads', action: 'Get leads from a smart view' },
					{ name: 'Update', value: 'update', action: 'Update a smart view' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Smart View ID',
				name: 'smartViewId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['smartView'], operation: ['get', 'update', 'delete', 'getLeads'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['smartView'], operation: ['create'] } },
			},
			{
				displayName: 'Query (JSON)',
				name: 's_query',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['smartView'], operation: ['create'] } },
				description: 'Structured query JSON for the smart view (see Close API advanced filtering docs)',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['smartView'], operation: ['update'] } },
				options: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Query (JSON)', name: 's_query', type: 'string', default: '' },
				],
			},

			// ─── USER ─────────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['user'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get many users' },
					{ name: 'Get Me', value: 'getMe', action: 'Get current user' },
				],
				default: 'getAll',
			},

			// ─── CUSTOM FIELD ─────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['customField'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create a custom field' },
					{ name: 'Delete', value: 'delete', action: 'Delete a custom field' },
					{ name: 'Get', value: 'get', action: 'Get a custom field' },
					{ name: 'Get All', value: 'getAll', action: 'Get many custom fields' },
					{ name: 'Update', value: 'update', action: 'Update a custom field' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Object Type',
				name: 'objectType',
				type: 'options',
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Lead', value: 'lead' },
					{ name: 'Opportunity', value: 'opportunity' },
					{ name: 'Shared', value: 'shared' },
				],
				default: 'lead',
				required: true,
				displayOptions: { show: { resource: ['customField'] } },
			},
			{
				displayName: 'Custom Field ID',
				name: 'customFieldId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['customField'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['customField'], operation: ['create'] } },
			},
			{
				displayName: 'Field Type',
				name: 'fieldType',
				type: 'options',
				options: [
					{ name: 'Text', value: 'text' },
					{ name: 'Number', value: 'number' },
					{ name: 'Date', value: 'date' },
					{ name: 'Datetime', value: 'datetime' },
					{ name: 'Choices', value: 'choices' },
					{ name: 'User', value: 'user' },
					{ name: 'Contact', value: 'contact' },
				],
				default: 'text',
				required: true,
				displayOptions: { show: { resource: ['customField'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['customField'], operation: ['update'] } },
				options: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
				],
			},

			// ─── INTEGRATION LINK ─────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['integrationLink'] } },
				options: [
					{ name: 'Create', value: 'create', action: 'Create an integration link' },
					{ name: 'Delete', value: 'delete', action: 'Delete an integration link' },
					{ name: 'Get', value: 'get', action: 'Get an integration link' },
					{ name: 'Get All', value: 'getAll', action: 'Get many integration links' },
					{ name: 'Update', value: 'update', action: 'Update an integration link' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Integration Link ID',
				name: 'integrationLinkId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['integrationLink'], operation: ['get', 'update', 'delete'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['integrationLink'], operation: ['create'] } },
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['integrationLink'], operation: ['create'] } },
				description: 'URL template for the integration link. Use {{lead.id}} etc. as placeholders.',
			},
			{
				displayName: 'Link Type',
				name: 'linkType',
				type: 'options',
				options: [
					{ name: 'Lead', value: 'lead' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Opportunity', value: 'opportunity' },
				],
				default: 'lead',
				required: true,
				displayOptions: { show: { resource: ['integrationLink'], operation: ['create'] } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['integrationLink'], operation: ['update'] } },
				options: [
					{ displayName: 'Name', name: 'name', type: 'string', default: '' },
					{ displayName: 'URL', name: 'url', type: 'string', default: '' },
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getLeadStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/status/lead/');
				return (response.data || []).map((s: IDataObject) => ({
					name: s.label as string,
					value: s.id as string,
				}));
			},
			async getOpportunityStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/status/opportunity/');
				return (response.data || []).map((s: IDataObject) => ({
					name: s.label as string,
					value: s.id as string,
				}));
			},
			async getCustomActivityTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/custom_activity/');
				return (response.data || []).map((t: IDataObject) => ({
					name: t.name as string,
					value: t.id as string,
				}));
			},
			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/user/');
				return (response.data || []).map((u: IDataObject) => ({
					name: `${u.first_name} ${u.last_name}`.trim() || (u.email as string),
					value: u.id as string,
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				// ── LEAD ──────────────────────────────────────────────────────────────
				if (resource === 'lead') {
					if (operation === 'get') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/lead/${leadId}/`);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(this, 'GET', '/lead/');
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await closeApiRequest.call(this, 'GET', '/lead/', {}, { _limit: limit });
							responseData = res.data || [];
						}
					} else if (operation === 'search') {
						const query = this.getNodeParameter('query', i) as string;
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(this, 'GET', '/lead/', {}, { query });
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await closeApiRequest.call(this, 'GET', '/lead/', {}, { query, _limit: limit });
							responseData = res.data || [];
						}
					} else if (operation === 'create') {
						const companyName = this.getNodeParameter('companyName', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = { name: companyName, ...additionalFields };
						responseData = await closeApiRequest.call(this, 'POST', '/lead/', body);
					} else if (operation === 'update') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/lead/${leadId}/`, additionalFields);
					} else if (operation === 'delete') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/lead/${leadId}/`);
						responseData = { success: true };
					} else if (operation === 'merge') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const sourceLeadId = this.getNodeParameter('sourceLeadId', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/lead/merge/', {
							destination: leadId,
							source: sourceLeadId,
						});
					}
				}

				// ── LEAD STATUS ───────────────────────────────────────────────────────
				else if (resource === 'leadStatus') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/status/lead/');
						responseData = res.data || [];
					} else if (operation === 'get') {
						const id = this.getNodeParameter('leadStatusId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/status/lead/${id}/`);
					} else if (operation === 'create') {
						const label = this.getNodeParameter('label', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/status/lead/', { label });
					} else if (operation === 'update') {
						const id = this.getNodeParameter('leadStatusId', i) as string;
						const label = this.getNodeParameter('label', i) as string;
						responseData = await closeApiRequest.call(this, 'PUT', `/status/lead/${id}/`, { label });
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('leadStatusId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/status/lead/${id}/`);
						responseData = { success: true };
					}
				}

				// ── CONTACT ───────────────────────────────────────────────────────────
				else if (resource === 'contact') {
					if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/contact/${contactId}/`);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(this, 'GET', '/contact/');
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await closeApiRequest.call(this, 'GET', '/contact/', {}, { _limit: limit });
							responseData = res.data || [];
						}
					} else if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = { lead_id: leadId, name, ...additionalFields };
						responseData = await closeApiRequest.call(this, 'POST', '/contact/', body);
					} else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/contact/${contactId}/`, additionalFields);
					} else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/contact/${contactId}/`);
						responseData = { success: true };
					}
				}

				// ── OPPORTUNITY ───────────────────────────────────────────────────────
				else if (resource === 'opportunity') {
					if (operation === 'get') {
						const opportunityId = this.getNodeParameter('opportunityId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/opportunity/${opportunityId}/`);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(this, 'GET', '/opportunity/');
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await closeApiRequest.call(this, 'GET', '/opportunity/', {}, { _limit: limit });
							responseData = res.data || [];
						}
					} else if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = { lead_id: leadId, ...additionalFields };
						responseData = await closeApiRequest.call(this, 'POST', '/opportunity/', body);
					} else if (operation === 'update') {
						const opportunityId = this.getNodeParameter('opportunityId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/opportunity/${opportunityId}/`, additionalFields);
					} else if (operation === 'delete') {
						const opportunityId = this.getNodeParameter('opportunityId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/opportunity/${opportunityId}/`);
						responseData = { success: true };
					}
				}

				// ── OPPORTUNITY STATUS ────────────────────────────────────────────────
				else if (resource === 'opportunityStatus') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/status/opportunity/');
						responseData = res.data || [];
					} else if (operation === 'get') {
						const id = this.getNodeParameter('opportunityStatusId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/status/opportunity/${id}/`);
					} else if (operation === 'create') {
						const label = this.getNodeParameter('label', i) as string;
						const type = this.getNodeParameter('type', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/status/opportunity/', { label, type });
					} else if (operation === 'update') {
						const id = this.getNodeParameter('opportunityStatusId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/status/opportunity/${id}/`, additionalFields);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('opportunityStatusId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/status/opportunity/${id}/`);
						responseData = { success: true };
					}
				}

				// ── PIPELINE ──────────────────────────────────────────────────────────
				else if (resource === 'pipeline') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/pipeline/');
						responseData = res.data || [];
					} else if (operation === 'get') {
						const id = this.getNodeParameter('pipelineId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/pipeline/${id}/`);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/pipeline/', { name });
					} else if (operation === 'update') {
						const id = this.getNodeParameter('pipelineId', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						responseData = await closeApiRequest.call(this, 'PUT', `/pipeline/${id}/`, { name });
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('pipelineId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/pipeline/${id}/`);
						responseData = { success: true };
					}
				}

				// ── TASK ──────────────────────────────────────────────────────────────
				else if (resource === 'task') {
					if (operation === 'get') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/task/${taskId}/`);
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						if (returnAll) {
							responseData = await closeApiRequestAllItems.call(this, 'GET', '/task/');
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const res = await closeApiRequest.call(this, 'GET', '/task/', {}, { _limit: limit });
							responseData = res.data || [];
						}
					} else if (operation === 'create') {
						const text = this.getNodeParameter('text', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = { text, ...additionalFields };
						responseData = await closeApiRequest.call(this, 'POST', '/task/', body);
					} else if (operation === 'update') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/task/${taskId}/`, additionalFields);
					} else if (operation === 'delete') {
						const taskId = this.getNodeParameter('taskId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/task/${taskId}/`);
						responseData = { success: true };
					}
				}

				// ── ACTIVITY ──────────────────────────────────────────────────────────
				else if (resource === 'activity') {
					if (operation === 'createNote') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const noteType = this.getNodeParameter('noteType', i) as string;
						const attachFile = this.getNodeParameter('attachFile', i) as boolean;

						// Build note body
						const noteBody: IDataObject = { lead_id: leadId };
						if (noteType === 'html') {
							noteBody.note_html = this.getNodeParameter('noteHtml', i) as string;
						} else {
							noteBody.note = this.getNodeParameter('note', i) as string;
						}

						// Handle file attachment via Close Files API
						if (attachFile) {
							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
							const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
							const filename = binaryData.fileName || 'attachment';
							const contentType = binaryData.mimeType || 'application/octet-stream';

							// Step 1: Get S3 upload URL from Close
							const uploadMeta = await closeApiRequest.call(this, 'POST', '/files/upload/', {
								filename,
								content_type: contentType,
							});

							// Step 2: Upload file to S3 using FormData
							const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
							const s3Form = new FormData();
							// Add all S3 policy fields first
							for (const [key, value] of Object.entries(uploadMeta.upload.fields as Record<string, string>)) {
								s3Form.append(key, value);
							}
							// File must be last
							s3Form.append('file', new Blob([fileBuffer], { type: contentType }), filename);
							const s3Options: IHttpRequestOptions = {
								method: 'POST',
								url: uploadMeta.upload.url,
								body: s3Form,
								ignoreHttpStatusErrors: true,
							};
							await this.helpers.httpRequest(s3Options);

							// Step 3: Attach the uploaded file URL to the note
							noteBody.attachments = [{
								url: uploadMeta.download.url,
								filename,
								content_type: contentType,
							}];
						}

						responseData = await closeApiRequest.call(this, 'POST', '/activity/note/', noteBody);
					} else if (operation === 'get') {
						const activityId = this.getNodeParameter('activityId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/activity/${activityId}/`);
					} else if (operation === 'getAll') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const res = await closeApiRequest.call(this, 'GET', '/activity/', {}, { lead_id: leadId });
						responseData = res.data || [];
					} else if (operation === 'delete') {
						const activityId = this.getNodeParameter('activityId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/activity/${activityId}/`);
						responseData = { success: true };
					}
				}

				// ── CUSTOM ACTIVITY ───────────────────────────────────────────────────
				else if (resource === 'customActivity') {
					if (operation === 'get') {
						const id = this.getNodeParameter('customActivityId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/activity/custom/${id}/`);
					} else if (operation === 'create') {
						const activityTypeId = this.getNodeParameter('activityTypeId', i) as string;
						const leadId = this.getNodeParameter('leadId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {
							activity_at: new Date().toISOString(),
							lead_id: leadId,
							_type: activityTypeId,
						};
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.custom_fields_json) {
							try {
								Object.assign(body, JSON.parse(additionalFields.custom_fields_json as string));
							} catch (_) {}
						}
						responseData = await closeApiRequest.call(this, 'POST', '/activity/custom/', body);
					} else if (operation === 'update') {
						const id = this.getNodeParameter('customActivityId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {};
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.custom_fields_json) {
							try {
								Object.assign(body, JSON.parse(additionalFields.custom_fields_json as string));
							} catch (_) {}
						}
						responseData = await closeApiRequest.call(this, 'PUT', `/activity/custom/${id}/`, body);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('customActivityId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/activity/custom/${id}/`);
						responseData = { success: true };
					}
				}

				// ── COMMENT ───────────────────────────────────────────────────────────
				else if (resource === 'comment') {
					if (operation === 'getAll') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const res = await closeApiRequest.call(this, 'GET', '/activity/note/', {}, { lead_id: leadId });
						responseData = res.data || [];
					} else if (operation === 'create') {
						const leadId = this.getNodeParameter('leadId', i) as string;
						const note = this.getNodeParameter('note', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/activity/note/', { lead_id: leadId, note });
					} else if (operation === 'delete') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/activity/note/${commentId}/`);
						responseData = { success: true };
					}
				}

				// ── EMAIL TEMPLATE ────────────────────────────────────────────────────
				else if (resource === 'emailTemplate') {
					if (operation === 'get') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/email_template/${templateId}/`);
					} else if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/email_template/');
						responseData = res.data || [];
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const subject = this.getNodeParameter('subject', i) as string;
						const body_html = this.getNodeParameter('body_html', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/email_template/', { name, subject, body_html });
					} else if (operation === 'update') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/email_template/${templateId}/`, additionalFields);
					} else if (operation === 'delete') {
						const templateId = this.getNodeParameter('templateId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/email_template/${templateId}/`);
						responseData = { success: true };
					}
				}

				// ── SMART VIEW ────────────────────────────────────────────────────────
				else if (resource === 'smartView') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/saved_search/');
						responseData = res.data || [];
					} else if (operation === 'get') {
						const id = this.getNodeParameter('smartViewId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/saved_search/${id}/`);
					} else if (operation === 'getLeads') {
						const smartViewId = this.getNodeParameter('smartViewId', i) as string;
						responseData = await closeApiRequestAllItems.call(this, 'GET', '/lead/', {}, { saved_search_id: smartViewId });
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const s_query = this.getNodeParameter('s_query', i) as string;
						let queryObj: IDataObject = {};
						try {
							queryObj = JSON.parse(s_query);
						} catch (e) {
							throw new NodeOperationError(this.getNode(), 'Query (JSON) must be valid JSON', { itemIndex: i });
						}
						responseData = await closeApiRequest.call(this, 'POST', '/saved_search/', { name, s_query: queryObj });
					} else if (operation === 'update') {
						const id = this.getNodeParameter('smartViewId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {};
						if (additionalFields.name) body.name = additionalFields.name;
						if (additionalFields.s_query) {
							try {
								body.s_query = JSON.parse(additionalFields.s_query as string);
							} catch (e) {
								throw new NodeOperationError(this.getNode(), 'Query (JSON) must be valid JSON', { itemIndex: i });
							}
						}
						responseData = await closeApiRequest.call(this, 'PUT', `/saved_search/${id}/`, body);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('smartViewId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/saved_search/${id}/`);
						responseData = { success: true };
					}
				}

				// ── USER ──────────────────────────────────────────────────────────────
				else if (resource === 'user') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/user/');
						responseData = res.data || [];
					} else if (operation === 'getMe') {
						responseData = await closeApiRequest.call(this, 'GET', '/me/');
					}
				}

				// ── CUSTOM FIELD ──────────────────────────────────────────────────────
				else if (resource === 'customField') {
					const objectType = this.getNodeParameter('objectType', i) as string;
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', `/custom_field/${objectType}/`);
						responseData = res.data || [];
					} else if (operation === 'get') {
						const id = this.getNodeParameter('customFieldId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/custom_field/${objectType}/${id}/`);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const fieldType = this.getNodeParameter('fieldType', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', `/custom_field/${objectType}/`, { name, type: fieldType });
					} else if (operation === 'update') {
						const id = this.getNodeParameter('customFieldId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/custom_field/${objectType}/${id}/`, additionalFields);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('customFieldId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/custom_field/${objectType}/${id}/`);
						responseData = { success: true };
					}
				}

				// ── INTEGRATION LINK ──────────────────────────────────────────────────
				else if (resource === 'integrationLink') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/integration_link/');
						responseData = res.data || [];
					} else if (operation === 'get') {
						const id = this.getNodeParameter('integrationLinkId', i) as string;
						responseData = await closeApiRequest.call(this, 'GET', `/integration_link/${id}/`);
					} else if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const url = this.getNodeParameter('url', i) as string;
						const linkType = this.getNodeParameter('linkType', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/integration_link/', { name, url, type: linkType });
					} else if (operation === 'update') {
						const id = this.getNodeParameter('integrationLinkId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						responseData = await closeApiRequest.call(this, 'PUT', `/integration_link/${id}/`, additionalFields);
					} else if (operation === 'delete') {
						const id = this.getNodeParameter('integrationLinkId', i) as string;
						await closeApiRequest.call(this, 'DELETE', `/integration_link/${id}/`);
						responseData = { success: true };
					}
				}

				else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}

				// Normalize to array
				const items2 = Array.isArray(responseData) ? responseData : [responseData];
				returnData.push(...items2.map((item: any) => ({ json: item as IDataObject })));

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
