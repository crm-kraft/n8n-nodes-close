import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
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

			// ─── LEAD ───────────────────────────────────────────────────────────────
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
					{ name: 'Get All', value: 'getAll', action: 'Get all leads' },
					{ name: 'Update', value: 'update', action: 'Update a lead' },
					{ name: 'Search', value: 'search', action: 'Search leads' },
				],
				default: 'get',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['lead'], operation: ['get', 'update', 'delete'] } },
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

			// ─── CONTACT ────────────────────────────────────────────────────────────
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
					{ name: 'Get All', value: 'getAll', action: 'Get all contacts' },
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

			// ─── OPPORTUNITY ─────────────────────────────────────────────────────────
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
					{ name: 'Get All', value: 'getAll', action: 'Get all opportunities' },
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
					{ displayName: 'Value Period', name: 'value_period', type: 'options', options: [{ name: 'One Time', value: 'one_time' }, { name: 'Monthly', value: 'monthly' }, { name: 'Annual', value: 'annual' }], default: 'one_time' },
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

			// ─── TASK ────────────────────────────────────────────────────────────────
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
					{ name: 'Get All', value: 'getAll', action: 'Get all tasks' },
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

			// ─── ACTIVITY ────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['activity'] } },
				options: [
					{ name: 'Create Note', value: 'createNote', action: 'Create a note activity' },
					{ name: 'Get', value: 'get', action: 'Get an activity' },
					{ name: 'Get All', value: 'getAll', action: 'Get all activities for a lead' },
					{ name: 'Delete', value: 'delete', action: 'Delete an activity' },
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
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['activity'], operation: ['createNote'] } },
			},

			// ─── CUSTOM ACTIVITY ─────────────────────────────────────────────────────
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
					{ displayName: 'Status', name: 'status', type: 'options', options: [{ name: 'Draft', value: 'draft' }, { name: 'Published', value: 'published' }], default: 'draft' },
					{ displayName: 'Custom Fields (JSON)', name: 'custom_fields_json', type: 'string', default: '', description: 'JSON object of custom field ID to value pairs' },
				],
			},

			// ─── COMMENT ─────────────────────────────────────────────────────────────
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
					{ name: 'Get', value: 'get', action: 'Get an email template' },
					{ name: 'Get All', value: 'getAll', action: 'Get all email templates' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Template ID',
				name: 'templateId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['emailTemplate'], operation: ['get'] } },
			},

			// ─── LEAD STATUS ──────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['leadStatus'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all lead statuses' },
				],
				default: 'getAll',
			},

			// ─── OPPORTUNITY STATUS ───────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['opportunityStatus'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all opportunity statuses' },
				],
				default: 'getAll',
			},

			// ─── PIPELINE ─────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['pipeline'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all pipelines' },
				],
				default: 'getAll',
			},

			// ─── SMART VIEW ───────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['smartView'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all smart views' },
					{ name: 'Get Leads', value: 'getLeads', action: 'Get leads from a smart view' },
				],
				default: 'getAll',
			},
			{
				displayName: 'Smart View ID',
				name: 'smartViewId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { resource: ['smartView'], operation: ['getLeads'] } },
			},

			// ─── USER ─────────────────────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['user'] } },
				options: [
					{ name: 'Get All', value: 'getAll', action: 'Get all users' },
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
					{ name: 'Get All', value: 'getAll', action: 'Get all custom fields' },
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
				displayOptions: { show: { resource: ['customField'], operation: ['getAll'] } },
			},
		],
	};

	methods = {
		loadOptions: {
			async getLeadStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/status/lead/');
				return (response.data || []).map((s: IDataObject) => ({ name: s.label as string, value: s.id as string }));
			},
			async getOpportunityStatuses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/status/opportunity/');
				return (response.data || []).map((s: IDataObject) => ({ name: s.label as string, value: s.id as string }));
			},
			async getCustomActivityTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/custom_activity/');
				return (response.data || []).map((t: IDataObject) => ({ name: t.name as string, value: t.id as string }));
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
						const note = this.getNodeParameter('note', i) as string;
						responseData = await closeApiRequest.call(this, 'POST', '/activity/note/', { lead_id: leadId, note });
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
						const body: IDataObject = { activity_at: new Date().toISOString(), lead_id: leadId, _type: activityTypeId };
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.custom_fields_json) {
							try { Object.assign(body, JSON.parse(additionalFields.custom_fields_json as string)); } catch (_) {}
						}
						responseData = await closeApiRequest.call(this, 'POST', '/activity/custom/', body);
					} else if (operation === 'update') {
						const id = this.getNodeParameter('customActivityId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						const body: IDataObject = {};
						if (additionalFields.status) body.status = additionalFields.status;
						if (additionalFields.custom_fields_json) {
							try { Object.assign(body, JSON.parse(additionalFields.custom_fields_json as string)); } catch (_) {}
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
					}
				}

				// ── LEAD STATUS ───────────────────────────────────────────────────────
				else if (resource === 'leadStatus') {
					const res = await closeApiRequest.call(this, 'GET', '/status/lead/');
					responseData = res.data || [];
				}

				// ── OPPORTUNITY STATUS ────────────────────────────────────────────────
				else if (resource === 'opportunityStatus') {
					const res = await closeApiRequest.call(this, 'GET', '/status/opportunity/');
					responseData = res.data || [];
				}

				// ── PIPELINE ──────────────────────────────────────────────────────────
				else if (resource === 'pipeline') {
					const res = await closeApiRequest.call(this, 'GET', '/pipeline/');
					responseData = res.data || [];
				}

				// ── SMART VIEW ────────────────────────────────────────────────────────
				else if (resource === 'smartView') {
					if (operation === 'getAll') {
						const res = await closeApiRequest.call(this, 'GET', '/saved_search/');
						responseData = res.data || [];
					} else if (operation === 'getLeads') {
						const smartViewId = this.getNodeParameter('smartViewId', i) as string;
						responseData = await closeApiRequestAllItems.call(this, 'GET', '/lead/', {}, { saved_search_id: smartViewId });
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
					const res = await closeApiRequest.call(this, 'GET', `/custom_field/${objectType}/`);
					responseData = res.data || [];
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
