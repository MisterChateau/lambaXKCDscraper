import { createReadStream, existsSync } from 'fs';
import * as puppeteer from 'puppeteer';
import * as tar from 'tar';

const setupLocalChrome: () => Promise<string | undefined> = async () => {
	return new Promise((resolve, reject) => {
		if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
			const tmp = '/tmp';
			const filepath = `${tmp}/headless_shell`;

			if (existsSync(filepath)) {
				resolve(filepath);
				return;
			}

			createReadStream('/opt/headless_shell.tar.gz')
				.on('error', reject)
				.pipe(tar.x({ C: tmp }))
				.on('error', reject)
				.on('end', () => resolve(filepath))
			;
		} else {
			resolve(process.env.LOCAL_CHROME);
		}
	});
};

export const scrape = async (url: string, numArticles: number = 5) => {
	const executablePath = await setupLocalChrome();
	const browser = await puppeteer.launch(Object.assign({
		headless: true,
		args: ['--no-sandbox', '--disable-gpu', '--single-process'],
	}, executablePath && { executablePath } || {}));
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'networkidle2' });

	const loadArticles = (numArticles: number) => {
		const loader: () => Promise<Array<{ created_time: string, message: string }>> = async () => {
			const articles: Array<{ created_time: string, message: string }> = await page.evaluate(() => {
				window.scrollBy(0, window.innerHeight);
				return Array.from(document.querySelectorAll('article')).map((article) => {
					const time = article.dataset.ft!.match(/publish_time.+?(\d+)/)![1];
					return {
						created_time: new Date(parseInt(time) * 1000).toISOString(),
						message: (article.querySelector('[data-ad-preview]') as HTMLElement).innerText,
					};
				});
			});
			return articles.length > numArticles && articles.slice(0, numArticles) || loader();
		}

		return loader();
	}

	const articles = await loadArticles(numArticles);
	await browser.close();
	return articles;
};
