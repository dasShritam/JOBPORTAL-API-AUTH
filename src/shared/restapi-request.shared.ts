import axios, { AxiosResponse } from 'axios';

export default async function ext_api_call(config: any): Promise<AxiosResponse> {
	try {
		return await axios(config);
	} catch (error) {
		return error.response;
	}
}
