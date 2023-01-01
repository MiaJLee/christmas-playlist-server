process.env.NODE_ENV =
	process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production'
		? 'production'
		: 'development'

const express = require('express')
const server = express()
const { DateTime } = require('luxon')
var cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
import { postCardReq } from '../types/app'

if (process.env.NODE_ENV === 'development') {
	require('dotenv').config()
}

const APP_URL = 'https://dj-blackbunny.netlify.app'

/** @TODO 수정 필요 */
const whitelist = [
	'http://172.30.1.84:4200',
	'https://dj-blackbunny.netlify.app',
	'http://localhost:4200',
]

const corsOptions = {
	origin: function (origin: any, callback: any) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error('Not Allowed Origin!'))
		}
	},
}

server.use(cors(corsOptions))

server.use(express.json())
server.use(express.urlencoded({ extended: true })) // body를 받겠다는 의미(middleware)

const port = process.env.PORT || 3000
const firstDayOf2023 = DateTime.fromISO('2023-01-01T00:00:00', { zone: 'Asia/Seoul' })

async function postCard(cardData: postCardReq) {
	const MONGODB_URL = process.env.MONGODB_URI
	const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true })
	const db = client.db(process.env.MONGODB_DATABASE)
	const collectionCard = db.collection(process.env.MONGODB_COLLECTION_CARDS)
	const local = DateTime.local().setZone('Asia/Seoul')

	const created_at = local.toFormat('yyyyMMddHHmmss')
	const card = { ...cardData, created_at }

	try {
		await client.connect()

		const result = await collectionCard.insertOne(card)

		if (result) {
			console.log(
				`============================\n카드가 생성되었습니다\nid: ${result.insertedId}, \ncard: `,
				card,
				`\n============================`
			)
		}

		return result
	} catch (e) {
		console.error(e)
	} finally {
		await client.close()
	}
}

async function getCardById(id: string) {
	const MONGODB_URL = process.env.MONGODB_URI
	const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true })
	const db = client.db(process.env.MONGODB_DATABASE)
	const collectionCard = db.collection(process.env.MONGODB_COLLECTION_CARDS)

	try {
		await client.connect()

		const card = await collectionCard.findOne({ _id: ObjectId(id) })

		if (card) {
			console.log(
				`============================\n카드가 조회되었습니다\nid: ${id} \ncard: `,
				card,
				`\n============================`
			)
		}

		return card
	} catch (e) {
		console.error(e)
	} finally {
		await client.close()
	}
}

server.listen(port, () => {
	console.log(`the server is running at port ${port}`)
})

/**
 * 카드를 저장한다.
 */
server.post('/card', (req: any, res: any) => {
	postCard(req.body)
		.then((result) => {
			if (!result) {
				throw Error
			}

			res.json({ message: 'success', cardId: result.insertedId?.toString() })
		})
		.catch((err) => {
			// @TODO: 에러핸들링
			console.error(err)
			res.status(404).json({ errorMessage: 'Something goes wrong.' })
		})
		.finally(() => {
			console.log('done')
		})
})

/**
 * 카드를 요청한다.
 */
server.get('/card/:id', (req: any, res: any) => {
	const { id } = req.params
	const local = DateTime.local().setZone('Asia/Seoul')

	getCardById(id)
		.then((result) => {
			if (!result) {
				throw Error
			}

			console.log(
				`현재시간: ${local.toFormat('yyyy-MM-dd HH:mm:ss')}\nis새해: ${local > firstDayOf2023}`
			)
			/** [workaround] 시간이 되지 않은 경우 데이터 리턴하지 않는다. */
			if (process.env.NODE_ENV === 'production' && local < firstDayOf2023) {
				res.json({
					message: 'notyet',
					result: {
						sender: result.sender,
						receiver: result.receiver,
					},
				})

				return
			} else {
				res.json({ message: 'success', result })
			}
		})
		.catch((err) => {
			// @TODO: 에러핸들링
			console.error(err)
			res.status(404).json({ errorMessage: 'There is no card.' })
		})
		.finally(() => {
			console.log('done')
		})
})
