import * as cheerio from 'cheerio';
const { default: fetch } = require('node-fetch');

export function scrape() {
	return fetch('https://xkcd.com/')
		.then((res: any) => res.text())
		.then((page: string) => cheerio.load(page))
		.then(($: any) => `http:${$('#comic img').attr('src')}`)
	;
}
