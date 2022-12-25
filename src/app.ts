const express = require('express')
const server = express()
const { DateTime } = require('luxon')
var cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
import { postCardReq } from '../types/app'

/** @TODO 수정 필요 */
const whitelist = ['http://localhost:4200']

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

const MONGODB_URL = process.env.MONGODB_URI
const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true })
const db = client.db(process.env.MONGODB_DATABASE)
const collectionCard = db.collection(process.env.MONGODB_COLLECTION_CARDS)

const local = DateTime.local().setZone('Asia/Seoul')
const firstDayOf2023 = DateTime.fromISO('2023-01-01T00:00:00', { zone: 'Asia/Seoul' })

async function postCard(cardData: postCardReq) {
	try {
		const created_at = local.toFormat('yyyyMMddHHmmss')
		const card = {
			...cardData,
			created_at,
		}

		const result = await collectionCard.insertOne(card)

		return result
	} catch {
		console.dir
	} finally {
		await client.close()
	}
}

async function getCardById(id: string) {
	try {
		const card = await collectionCard.findOne({ _id: ObjectId(id) })

		return card
	} catch {
		console.dir
	} finally {
		await client.close()
	}
}

server.listen(port, () => {
	console.log('the server is running')
	console.log(port)
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

	getCardById(id)
		.then((result) => {
			console.log(result)

			if (!result) {
				throw Error
			}
			/** [workaround] 시간이 되지 않은 경우 데이터 리턴하지 않는다. */
			// @TODO: 최종 배포 전에 부등호 바꾸기
			if (local > firstDayOf2023) {
				res.json({
					message: 'notyet',
					result: {
						sender: result.sender,
						receiver: result.receiver,
					},
				})
			}

			if (result) {
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
