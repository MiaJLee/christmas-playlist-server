const express = require('express')
const server = express()
const { DateTime } = require('luxon')
var cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb')
import { postCardReq } from '../types/app'
require('dotenv').config()

const corsOptions = {
	origin: true,
	credentials: true,
}

/** @TODO 수정 필요 */
server.use(cors()) // 어떤 주소를 허용할지 설정이 가능하다.

server.use(express.json())
server.use(express.urlencoded({ extended: true })) // body를 받겠다는 의미(middleware)

const port = process.env.PORT || 3000

const MONGODB_URL = process.env.MONGODB_URI
const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true })
const db = client.db(process.env.MONGODB_DATABASE)
const collectionCard = db.collection(process.env.MONGODB_COLLECTION_CARDS)

async function postCard(cardData: postCardReq) {
	try {
		const created_at = DateTime.now().toFormat('yyyyMMddHHmmss')
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
	const postCardToDB = postCard(req.body)

	postCardToDB.then((result) => {
		res.json({ message: 'success', cardId: result.insertedId?.toString() })
	})
})

/**
 * 카드를 요청한다.
 */
server.get('/card/:id', (req: any, res: any) => {
	const { id } = req.params
	const getCardFromDB = getCardById(id)

	/** [workaround] 시간이 되지 않은 경우 데이터 리턴하지 않는다. */
	// if (notyet) {
	//   res.json({message: 'yet to open'})
	// }

	getCardFromDB
		.then((result) => {
			if (result) {
				res.json({ message: 'success', result })
			}
		})
		.catch((err) => {
			// @TODO: 에러핸들링
			console.error(err)
			res.status(404).json({ errorMessage: 'There is no card.' })
		})
})
