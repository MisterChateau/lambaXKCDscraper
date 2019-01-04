import { scrape } from './scrape';

const PAGE = 'https://mobile.facebook.com/pages/category/Coffee-Shop/Caf%C3%A9-Soucoupe-991973480815330/';

exports.handler = (_event: string, _context: string, callback: (error: any, data: any) => any) => {
    scrape(PAGE).then((articles) => {
        return callback(null, articles);
    });
}

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
	exports.handler('', '', console.log);
}
