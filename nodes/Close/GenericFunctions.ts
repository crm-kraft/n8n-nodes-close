import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

export async function closeApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
		const options: IHttpRequestOptions = {
		method,
		url: `https://api.close.com/api/v1${endpoint}`,

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

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'closeApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function closeApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
	const returnData: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
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
