import {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
		NodeOperationError,
		NodeConnectionTypes,
	} from 'n8n-workflow';
import { closeApiRequest } from '../Close/GenericFunctions';

export class CloseTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Close Trigger',
		name: 'closeTrigger',
		icon: 'file:close.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Interact with Close CRM — manage leads, contacts, opportunities, tasks, notes, calls, emails, custom activities, pipelines, and more. Includes a full webhook trigger for real-time events.',
		codex: {
			categories: ['Sales', 'CRM'],
			alias: ['close', 'close crm', 'closecrm', 'close.com', 'crm', 'leads', 'contacts', 'opportunities', 'sales', 'webhook', 'trigger'],
			resources: {
				primaryDocumentation: [{ url: 'https://developer.close.com/' }],
			},
		},
		defaults: {
			name: 'Close Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'closeApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				options: [
					// ── Lead ──────────────────────────────────────────────────
					{ name: 'Lead Created', value: 'lead.created' },
					{ name: 'Lead Updated', value: 'lead.updated' },
					{ name: 'Lead Deleted', value: 'lead.deleted' },
					{ name: 'Lead Merged', value: 'lead.merged' },
					// ── Contact ───────────────────────────────────────────────
					{ name: 'Contact Created', value: 'contact.created' },
					{ name: 'Contact Updated', value: 'contact.updated' },
					{ name: 'Contact Deleted', value: 'contact.deleted' },
					// ── Opportunity ───────────────────────────────────────────
					{ name: 'Opportunity Created', value: 'opportunity.created' },
					{ name: 'Opportunity Updated', value: 'opportunity.updated' },
					{ name: 'Opportunity Deleted', value: 'opportunity.deleted' },
					// ── Task ──────────────────────────────────────────────────
					{ name: 'Task Created', value: 'task.created' },
					{ name: 'Task Updated', value: 'task.updated' },
					{ name: 'Task Deleted', value: 'task.deleted' },
					{ name: 'Task Completed', value: 'task.completed' },
					// ── Note ──────────────────────────────────────────────────
					{ name: 'Note Created', value: 'note.created' },
					{ name: 'Note Updated', value: 'note.updated' },
					{ name: 'Note Deleted', value: 'note.deleted' },
					// ── Call ──────────────────────────────────────────────────
					{ name: 'Call Created', value: 'call.created' },
					{ name: 'Call Updated', value: 'call.updated' },
					{ name: 'Call Deleted', value: 'call.deleted' },
					{ name: 'Call Completed', value: 'call.completed' },
					// ── Email ─────────────────────────────────────────────────
					{ name: 'Email Created', value: 'email.created' },
					{ name: 'Email Updated', value: 'email.updated' },
					{ name: 'Email Deleted', value: 'email.deleted' },
					{ name: 'Email Sent', value: 'email.sent' },
					// ── SMS ───────────────────────────────────────────────────
					{ name: 'SMS Created', value: 'sms.created' },
					{ name: 'SMS Updated', value: 'sms.updated' },
					{ name: 'SMS Deleted', value: 'sms.deleted' },
					{ name: 'SMS Sent', value: 'sms.sent' },
					// ── Meeting ───────────────────────────────────────────────
					{ name: 'Meeting Created', value: 'meeting.created' },
					{ name: 'Meeting Updated', value: 'meeting.updated' },
					{ name: 'Meeting Deleted', value: 'meeting.deleted' },
					{ name: 'Meeting Scheduled', value: 'meeting.scheduled' },
					{ name: 'Meeting Started', value: 'meeting.started' },
					{ name: 'Meeting Completed', value: 'meeting.completed' },
					{ name: 'Meeting Canceled', value: 'meeting.canceled' },
					// ── Custom Activity Instance ───────────────────────────────
					{ name: 'Custom Activity Instance Updated', value: 'custom_activity.updated' },
					{ name: 'Custom Activity Instance Deleted', value: 'custom_activity.deleted' },
					// ── Custom Activity Instance Published ─────────────────────
					{ name: 'On Custom Activity Instance Published', value: 'custom_activity_published' },
					// ── Status Changes ────────────────────────────────────────
					{ name: 'Lead Status Changed', value: 'lead_status_change.created' },
					{ name: 'Opportunity Status Changed', value: 'opportunity_status_change.created' },
					// ── Form Submission ───────────────────────────────────────
					{ name: 'Form Submission Created', value: 'form_submission.created' },
					// ── Unsubscribed Email ────────────────────────────────────
					{ name: 'Email Unsubscribed', value: 'unsubscribed_email.created' },
					{ name: 'Email Resubscribed', value: 'unsubscribed_email.deleted' },
				],
				default: 'lead.created',
				description: 'The Close CRM event to listen for',
			},
			{
				displayName: 'Custom Activity Type Name or ID',
				name: 'customActivityTypeId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getCustomActivityTypes' },
				required: true,
				default: '',
				description: 'The custom activity type to listen for. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: {
					show: {
						event: [
							'custom_activity.updated',
							'custom_activity.deleted',
							'custom_activity_published',
						],
					},
				},
			},
			{
				displayName: 'Trigger On',
				name: 'publishTriggerOn',
				type: 'options',
				options: [
					{ name: 'Every Publish', value: 'every', description: 'Trigger every time the activity is published or re-published' },
					{ name: 'First Publish Only', value: 'first', description: 'Trigger only when the activity is published for the first time (previous_data.last_published_at is null)' },
				],
				default: 'first',
				displayOptions: { show: { event: ['custom_activity_published'] } },
				description: 'Whether to trigger on every publish or only the first time the activity is published',
			},
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			async getCustomActivityTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = await closeApiRequest.call(this, 'GET', '/custom_activity/');
				const types = (response.data || []) as IDataObject[];
				const options: INodePropertyOptions[] = [];
				options.push(
					...types
						.filter((t) => !t.is_archived)
						.map((t) => ({ name: t.name as string, value: t.id as string })),
				);
				return options;
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await closeApiRequest.call(this, 'GET', `/webhook/${webhookData.webhookId}/`);
						return true;
					} catch {
						delete webhookData.webhookId;
					}
				}

				const response = await closeApiRequest.call(this, 'GET', '/webhook/');
				const webhooks = (response.data || []) as IDataObject[];
				for (const wh of webhooks) {
					if (wh.url === webhookUrl) {
						webhookData.webhookId = wh.id;
						return true;
					}
				}
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');
				const event = this.getNodeParameter('event') as string;
				const actTypeId = this.getNodeParameter('customActivityTypeId', '') as string;

				// Map simple event value → Close API event objects
				const eventMap: Record<string, IDataObject[]> = {
					'lead.created': [{ object_type: 'lead', action: 'created' }],
					'lead.updated': [{ object_type: 'lead', action: 'updated' }],
					'lead.deleted': [{ object_type: 'lead', action: 'deleted' }],
					'lead.merged': [{ object_type: 'lead', action: 'merged' }],
					'contact.created': [{ object_type: 'contact', action: 'created' }],
					'contact.updated': [{ object_type: 'contact', action: 'updated' }],
					'contact.deleted': [{ object_type: 'contact', action: 'deleted' }],
					'opportunity.created': [{ object_type: 'opportunity', action: 'created' }],
					'opportunity.updated': [{ object_type: 'opportunity', action: 'updated' }],
					'opportunity.deleted': [{ object_type: 'opportunity', action: 'deleted' }],
					'task.created': [{ object_type: 'task.lead', action: 'created' }],
					'task.updated': [{ object_type: 'task.lead', action: 'updated' }],
					'task.deleted': [{ object_type: 'task.lead', action: 'deleted' }],
					'task.completed': [{ object_type: 'task.lead', action: 'completed' }],
					'note.created': [{ object_type: 'activity.note', action: 'created' }],
					'note.updated': [{ object_type: 'activity.note', action: 'updated' }],
					'note.deleted': [{ object_type: 'activity.note', action: 'deleted' }],
					'call.created': [{ object_type: 'activity.call', action: 'created' }],
					'call.updated': [{ object_type: 'activity.call', action: 'updated' }],
					'call.deleted': [{ object_type: 'activity.call', action: 'deleted' }],
					'call.completed': [{ object_type: 'activity.call', action: 'completed' }],
					'email.created': [{ object_type: 'activity.email', action: 'created' }],
					'email.updated': [{ object_type: 'activity.email', action: 'updated' }],
					'email.deleted': [{ object_type: 'activity.email', action: 'deleted' }],
					'email.sent': [{ object_type: 'activity.email', action: 'sent' }],
					'sms.created': [{ object_type: 'activity.sms', action: 'created' }],
					'sms.updated': [{ object_type: 'activity.sms', action: 'updated' }],
					'sms.deleted': [{ object_type: 'activity.sms', action: 'deleted' }],
					'sms.sent': [{ object_type: 'activity.sms', action: 'sent' }],
					'meeting.created': [{ object_type: 'activity.meeting', action: 'created' }],
					'meeting.updated': [{ object_type: 'activity.meeting', action: 'updated' }],
					'meeting.deleted': [{ object_type: 'activity.meeting', action: 'deleted' }],
					'meeting.scheduled': [{ object_type: 'activity.meeting', action: 'scheduled' }],
					'meeting.started': [{ object_type: 'activity.meeting', action: 'started' }],
					'meeting.completed': [{ object_type: 'activity.meeting', action: 'completed' }],
					'meeting.canceled': [{ object_type: 'activity.meeting', action: 'canceled' }],
					'lead_status_change.created': [{ object_type: 'activity.lead_status_change', action: 'created' }],
					'opportunity_status_change.created': [{ object_type: 'activity.opportunity_status_change', action: 'created' }],
					'form_submission.created': [{ object_type: 'activity.form_submission', action: 'created' }],
					'unsubscribed_email.created': [{ object_type: 'unsubscribed_email', action: 'created' }],
					'unsubscribed_email.deleted': [{ object_type: 'unsubscribed_email', action: 'deleted' }],
				};

				let eventObjects: IDataObject[];

				if (event === 'custom_activity.updated') {
					eventObjects = [{
						object_type: 'activity.custom_activity',
						action: 'updated',
						...(actTypeId ? {
							extra_filter: {
								type: 'and',
								filters: [{
									type: 'field_accessor', field: 'data',
									filter: { type: 'field_accessor', field: 'custom_activity_type_id', filter: { type: 'equals', value: actTypeId } },
								}],
							},
						} : {}),
					}];
				} else if (event === 'custom_activity.deleted') {
					// On delete, Close sends data: null — must filter on previous_data instead
					eventObjects = [{
						object_type: 'activity.custom_activity',
						action: 'deleted',
						...(actTypeId ? {
							extra_filter: {
								type: 'and',
								filters: [{
									type: 'field_accessor', field: 'previous_data',
									filter: { type: 'field_accessor', field: 'custom_activity_type_id', filter: { type: 'equals', value: actTypeId } },
								}],
							},
						} : {}),
					}];
				} else if (event === 'custom_activity_published') {
					// Exact subscription format as specified:
					// - updated: status=published AND changed_fields contains "status" (true draft→published transition)
					// - created: status=published (new activity created as published)
					eventObjects = [
						{
							action: 'updated',
							object_type: 'activity.custom_activity',
							extra_filter: {
								type: 'and',
								filters: [
									{
										field: 'data',
										filter: {
											field: 'custom_activity_type_id',
											filter: { type: 'equals', value: actTypeId },
											type: 'field_accessor',
										},
										type: 'field_accessor',
									},
									{
										field: 'data',
										filter: {
											field: 'status',
											filter: { type: 'equals', value: 'published' },
											type: 'field_accessor',
										},
										type: 'field_accessor',
									},
									{
										field: 'changed_fields',
										filter: { type: 'contains', value: 'status' },
										type: 'field_accessor',
									},
								],
							},
						},
						{
							action: 'created',
							object_type: 'activity.custom_activity',
							extra_filter: {
								type: 'and',
								filters: [
									{
										field: 'data',
										filter: {
											field: 'custom_activity_type_id',
											filter: { type: 'equals', value: actTypeId },
											type: 'field_accessor',
										},
										type: 'field_accessor',
									},
									{
										field: 'data',
										filter: {
											field: 'status',
											filter: { type: 'equals', value: 'published' },
											type: 'field_accessor',
										},
										type: 'field_accessor',
									},
								],
							},
						},
					];
					} else {
						const mapped = eventMap[event];
						if (!mapped) {
							throw new NodeOperationError(this.getNode(), `Unknown event type: ${event}`);
						}
					eventObjects = mapped;
				}

				const body: IDataObject = {
					url: webhookUrl,
					events: eventObjects,
				};

				const response = await closeApiRequest.call(this, 'POST', '/webhook/', body);
				webhookData.webhookId = response.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				if (webhookData.webhookId) {
					try {
						await closeApiRequest.call(this, 'DELETE', `/webhook/${webhookData.webhookId}/`);
					} catch {
						return false;
					}
					delete webhookData.webhookId;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData() as IDataObject;
		const event = this.getNodeParameter('event') as string;

		// For custom_activity_published with 'First Publish Only', filter out re-publishes
		if (event === 'custom_activity_published') {
			const publishTriggerOn = this.getNodeParameter('publishTriggerOn', 'every') as string;
			if (publishTriggerOn === 'first') {
				const previousData = bodyData.previous_data as IDataObject | undefined;
				const lastPublishedAt = previousData?.last_published_at;
				// Only proceed if last_published_at was null (first time published)
				if (lastPublishedAt !== null && lastPublishedAt !== undefined && lastPublishedAt !== '') {
					return {};
				}
			}
		}

		return {
			workflowData: [[{ json: bodyData }]],
		};
	}
}
