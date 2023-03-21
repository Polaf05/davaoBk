// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true })
const PDFDocument = require("pdf-lib").PDFDocument
const StandardFonts = require("pdf-lib").StandardFonts
const FontKit = require("@pdf-lib/fontkit")
const rgb = require("pdf-lib").rgb
const degrees = require("pdf-lib").degrees
const fs = require("fs")
const QRCode = require("qrcode")
const bwipjs = require("bwip-js")

fastify.register(require("@fastify/multipart"), { attachFieldsToBody: true })
fastify.register(require("@fastify/cors"), {
	origin: "*",
	methods: ["GET", "POST", "PUT", "DELETE"],
})

// Declare a route
fastify.post("/", async (request, reply) => {
	// const data =await  request.body.file.toBuffer()
	const imageBuffer = await request.body.file.toBuffer()
	const signBuffer = await request.body.file1.toBuffer()
	const name = request.body.name.value
	const address = request.body.address.value
	const dob = request.body.dob.value
	const date_issue = request.body.date_issue.value
	const marital_status = request.body.marital_status.value
	const gender = request.body.gender.value
	const phone = request.body.phone.value
	const pcn = request.body.pcn.value
	const philsys_data = request.body.philsys_data.value

	// Load the existing PDF
	const existingPdfBytes = fs.readFileSync("template.pdf")
	const pdfDoc = await PDFDocument.load(existingPdfBytes)

	// Load custom font via fontkit
	pdfDoc.registerFontkit(FontKit)

	// Get the first page of the PDF
	const page = pdfDoc.getPages()[0]

	// Embed a font
	const helveticaFont = await pdfDoc.embedFont(StandardFonts.CourierBold)

	// Embed a custom font
	const interFontNorm = fs.readFileSync("inter.ttf")
	const interFontBold = fs.readFileSync("inter-bold.otf")
	const interFont = await pdfDoc.embedFont(interFontNorm)
	const interFontB = await pdfDoc.embedFont(interFontBold)

	// Draw a string of text on the first page
	page.drawText(name, {
		x: 970,
		y: 1295,
		size: 70,
		//color: rgb(0, 0.53, 0.71),
		font: interFontB,
	})
	page.drawText(address, {
		x: 970,
		y: 1045,
		size: 70,
		//color: rgb(0, 0.53, 0.71),
		font: interFontB,
		maxWidth: 1200,
		lineHeight: 70,
	})
	page.drawText(dob, {
		x: 970,
		y: 670,
		size: 54,
		//color: rgb(0, 0.53, 0.71),
		font: interFontB,
	})
	page.drawText(pcn, {
		x: 135,
		y: 520,
		size: 54,
		//color: rgb(0, 0.53, 0.71),
		font: interFont,
	})
	page.drawText(date_issue, {
		x: 1640,
		y: 670,
		size: 54,
		//color: rgb(0, 0.53, 0.71),
		font: interFontB,
	})
	page.drawText(marital_status, {
		x: 1205,
		y: 380,
		size: 54,
		//color: rgb(0, 0.53, 0.71),
		font: interFontB,
	})
	page.drawText(gender, {
		x: 1665,
		y: 380,
		size: 54,
		//color: rgb(0, 0.53, 0.71),
		font: interFontB,
	})

	// for (let index = 0; index < 1500; index += 50) {
	// 	const element = index
	// 	page.drawText(String(element), {
	// 		x: 50,
	// 		y: element,
	// 		size: 70,
	// 		//color: rgb(0, 0.53, 0.71),
	// 		font: interFont,
	// 	})
	// }

	// for (let index = 0; index < 3000; index += 50) {
	// 	const element = index
	// 	page.drawText(String(element), {
	// 		x: element,
	// 		y: 1500,
	// 		size: 70,
	// 		//color: rgb(0, 0.53, 0.71),
	// 		font: interFont,
	// 		rotate: degrees(90),
	// 	})
	// }

	// Embed an image on the first page
	const pngImageBytes = fs.readFileSync("id.jpg")
	const pngImage = await pdfDoc.embedJpg(imageBuffer)
	page.drawImage(pngImage, {
		x: 96,
		y: 598,
		width: 752,
		height: 752,
	})

	const pngSignatureBytes = fs.readFileSync("signature.png")
	const pngSignatureImage = await pdfDoc.embedPng(signBuffer)
	page.drawImage(pngSignatureImage, {
		x: 50,
		y: -160,
		width: 810,
		height: 810,
	})

	page.drawImage(pngImage, {
		x: 968,
		y: 280,
		width: 205,
		height: 230,
		opacity: 0.3,
	})

	// Generate a QR code
	const qrCode = await QRCode.toDataURL(philsys_data)
	const qrImage = await pdfDoc.embedPng(
		Buffer.from(qrCode.split(",")[1], "base64")
	)
	page.drawImage(qrImage, {
		x: 2273,
		y: 200,
		width: 910,
		height: 910,
	})

	// Mcash QR Code
	const mcashData = {
		name: name,
		phone: phone,
		type: "customer",
		image: "2023-01-08-63bb4508a17ea.png",
	}
	const page2 = pdfDoc.getPages()[1]
	const mcashQr = await QRCode.toDataURL(JSON.stringify(mcashData))
	const mcashQrImage = await pdfDoc.embedPng(
		Buffer.from(mcashQr.split(",")[1], "base64")
	)
	page2.drawImage(mcashQrImage, {
		x: 950,
		y: 735,
		width: 1170,
		height: 1170,
	})

	// barcode
	const barcode = await generateBarcode(phone)
	const barcodeImage = await pdfDoc.embedPng(barcode)
	page2.drawImage(barcodeImage, {
		x: 1350,
		y: 546,
		width: 400,
		height: 155,
	})

	// Save the PDF
	const pdfBytes = await pdfDoc.save()
	fs.writeFileSync("modified.pdf", pdfBytes)

	fs.readFile("./modified.pdf", (err, data) => {
		if (err) {
			reply.code(500).send({ error: err.message })
		} else {
			reply.type("application/pdf").send(data)
		}
	})

	await waitAndLoadNextLine(5000)
})

// Run the server!
const start = async () => {
	try {
		await fastify.listen({ port: 3000 })
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}
start()

function waitAndLoadNextLine(time) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}

function generateBarcode(data) {
	return new Promise((resolve, reject) => {
		bwipjs.toBuffer(
			{
				bcid: "code128",
				text: data,
				scale: 3,
				height: 10,
				includetext: true,
				textxalign: "center",
			},
			(err, png) => {
				if (err) {
					reject(err)
				} else {
					resolve(png)
				}
			}
		)
	})
}
