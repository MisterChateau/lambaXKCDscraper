import { APIGatewayProxyHandler } from 'aws-lambda';

import { scrape } from './lib/scrape';

export const menu: APIGatewayProxyHandler = async () => {
	const { PAGE_URL, PAGE_ARTICLES } = process.env;
	const articles = await scrape(PAGE_URL!, parseInt(PAGE_ARTICLES!));

	return {
		statusCode: 200,
		body: JSON.stringify(articles),
	};
}
