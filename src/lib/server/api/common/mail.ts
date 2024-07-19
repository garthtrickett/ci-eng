import nodemailer from 'nodemailer';
import { injectable } from 'tsyringe';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

type SendMail = {
	to: string | string[];
	subject: string;
	html: string;
};
// Library WIFI breaks mail

export function getTemplate(template: string) {
	const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
	const __dirname = path.dirname(__filename); // get the name of the directory
	return fs.readFileSync(
		path.join(__dirname, `../infrastructure/email-templates/${template}.hbs`),
		'utf-8'
	);
}

export async function send({ to, subject, html }: SendMail) {
	const transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // Use `true` for port 465, `false` for all other ports
		auth: {
			user: 'eveline62@ethereal.email',
			pass: 'HN6t6E8Uap8WT52mm9'
		}
	});

	transporter
		.sendMail({
			from: '"Example" <example@ethereal.email>',
			bcc: to,
			subject,
			text: html,
			html
		})
		.then((info) => {
			console.log(nodemailer.getTestMessageUrl(info));
		})
		.catch((error) => {
			console.log('Error occurred:', error);
		});
}
