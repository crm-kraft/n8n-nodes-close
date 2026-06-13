import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

export async function closeApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('closeApi');

	const options: IHttpRequestOptions = {
		method,
		url: `https://api.close.com/api/v1${endpoint}`,
		auth: {
			username: credentials.apiKey as string,
			password: '',
		},
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(qs).length > 0) {
		options.qs = qs;
	}

	return this.helpers.httpRequest(options);
}

export async function closeApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: any[] = [];
	let skip = 0;
	const limit = 100;

	while (true) {
		const response = await closeApiRequest.call(this, method, endpoint, body, {
			...qs,
			_skip: skip,
			_limit: limit,
		});

		const items = response.data || [];
		returnData.push(...items);

		if (!response.has_more) break;
		skip += limit;
	}

	return returnData;
}
