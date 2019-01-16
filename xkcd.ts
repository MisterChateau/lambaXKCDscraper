import { APIGatewayProxyHandler } from 'aws-lambda';

import { scrape } from './lib/scrape';

export const comic: APIGatewayProxyHandler = async () => {
	return {
		statusCode: 200,
		body: await scrape(),
	};
}
