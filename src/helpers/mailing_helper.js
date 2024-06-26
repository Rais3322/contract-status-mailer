const nodemailer = require('nodemailer');
const moment = require('moment');
const logger = require('../log/logger');
const { createNotionComment, formComment } = require('./notion_helper');
const { fetchOrgName } = require('./kontur_helper');

const sendMailMessage = async (src, dst, sub, msg, callback) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.yandex.ru',
		port: 465,
		secure: true,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS
		}
	});

	const mailOptions = {
		from: src,
		to: dst,
		subject: sub,
		html: msg
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		logger.info('Email sent', info.response)
		if (typeof callback === 'function') {
			callback();
		};
	} catch (error) {
		logger.error('Error sending email', error);
	};
};

const formSubject = async (contract) => {
	const contractNumber = contract.contractNumber;
	const contractDate = moment(contract.contractDate).format('DD.MM.YYYY');
	const msgSub = `Информирование по заключенному договору на оказание услуг № ${contractNumber} от ${contractDate}`;

	return msgSub;
}

const formMessage = async (contract) => {
	const orgName = contract.orgName;
	const contractNumber = contract.contractNumber;
	const contractDate = moment(contract.contractDate).format('DD.MM.YYYY');
	const taskNumber = contract.taskNumber;
	const msgText = `
		<p>
			&nbsp;&nbsp;&nbsp;&nbsp;Здравствуйте, уважаемый Заказчик ${orgName}.
		</p>
		<strong>
			&nbsp;&nbsp;&nbsp;&nbsp;Вы получили это письмо в результате подписания Контракта № ${contractNumber} от ${contractDate}, этапы исполнения которого Вы можете отслеживать по Вашему уникальному номеру заявки ${taskNumber}.
		</strong>
		<p>
			&nbsp;&nbsp;&nbsp;&nbsp;Коллектив ООО “Технический центр Баланс-Информ” благодарит Вас за доверие в выполнении поставленной задачи. Мы уже начали подготовку к исполнению своих обязательств по Контракту и приложим все усилия, чтобы у Вас остались только позитивные эмоции от нашего взаимодействия.
		</p>
		<p>
			&nbsp;&nbsp;&nbsp;&nbsp;Для возможности максимально оперативного исполнения Контракта просим Вас в ответ на данное письмо сообщить <strong>контактные данные ответственного лица</strong> с Вашей стороны:<br>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;– ФИО;<br>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;– должность;<br>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;– номер телефона (предпочтительнее мобильного).
		</p>
		<p>
			&nbsp;&nbsp;&nbsp;&nbsp;С Уважением к Вам,<br>
			&nbsp;&nbsp;&nbsp;&nbsp;Коллектив ООО “Технический центр Баланс-Информ”
		</p>
		<p>
			&nbsp;&nbsp;&nbsp;&nbsp;+7(495)212-16-72 | help@bal-inf.ru – Технический отдел<br>
			&nbsp;&nbsp;&nbsp;&nbsp;+7(499)653-87-07 | b2g@bal-inf.ru – Департамент по работе с заказчиками
		</p>
	`;

	return msgText;
};

const showMessage = async (contract) => {
	const message = await formMessage(contract);
	console.log(message);
};

const sendContractInfo = async (contract, notionUUID, notionClient) => {
	const sourceEmail = process.env.MAIL_USER;
	const desinationEmail = contract.email;
	const subject = await formSubject(contract);
	const message = await formMessage(contract);

	sendMailMessage(sourceEmail, desinationEmail, subject, message, async () => {
		const commentary = await formComment(contract.email);
		await createNotionComment(notionUUID, notionClient, commentary);
	});
};

module.exports = { sendContractInfo, showMessage };