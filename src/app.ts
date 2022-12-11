import { MUSIC_LIST, CARDS } from './app.value'

const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const { DateTime } = require('luxon')

var cors = require('cors')
const SnowflakeId = require('snowflake-id').default

var snowflake = new SnowflakeId({
	mid: 42,
	offset: (2019 - 1970) * 31536000 * 1000,
})

/** @TODO 수정 필요 */
server.use(cors()) // 어떤 주소를 허용할지 설정이 가능하다.

server.use(bodyParser.json())

const port = 3000

server.listen(port, () => {
	console.log('the server is running')
})

/**
 * 카드를 저장한다.
 */
server.post('/api/card', (req: any, res: any) => {
	const id = snowflake.generate()
	const created_at = DateTime.now().toFormat('yyyyMMddHHmmss')

	CARDS.push(req.body)
	res.json({ message: 'success', id, created_at })
})

/**
 * 카드를 요청한다.
 */
server.get('/api/card/:id', (req: any, res: any) => {
	const cardId = Number(req.params.id)

	const card = CARDS.find((c) => {
		return c.id === cardId
	})

	/** [workaround] 시간이 되지 않은 경우 데이터 리턴하지 않는다. */
	// if (notyet) {
	//   res.json({message: 'yet to open'})
	// }

	if (card) {
		res.json(card)
	} else {
		res.status(404).json({ errorMessage: 'There is no card.' })
	}
})

/**
 * 음악 리스트를 요청한다.
 */
server.get('/api/musics', (req: any, res: any) => {
	/** [workaround] 데이터 어떻게 보낼지 고민해보기 */
	// const musics = MUSIC_LIST.map(({ id, title, artist, lyrics, image, youtubeLink }) => ({
	// 	id,
	// 	title,
	// 	artist,
	// 	lyrics,
	// 	image,
	// 	youtubeLink,
	// }))
	res.json(MUSIC_LIST)
})

/**
 * 특정 음악을 호출한다.
 */
server.get('/api/musics/:id', (req: any, res: any) => {
	const musicId = Number(req.params.id)

	const music = MUSIC_LIST.find((m) => {
		return m.id === musicId
	})

	if (music) {
		res.json(music)
	} else {
		res.status(404).json({ errorMessage: 'There is no music.' })
	}
})
