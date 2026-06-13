import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class CloseApi implements ICredentialType {
	name = 'closeApi';
	displayName = 'Close.com API';
	icon: Icon = 'file:close.svg' as Icon;
	documentationUrl = 'https://developer.close.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Close.com API Key',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.apiKey}}',
				password: '',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.close.com',
			url: '/api/v1/me/',
		},
	};
}
