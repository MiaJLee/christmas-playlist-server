"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const { DateTime } = require('luxon');
var cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const corsOptions = {
    origin: true,
    credentials: true,
};
/** @TODO 수정 필요 */
server.use(cors()); // 어떤 주소를 허용할지 설정이 가능하다.
server.use(express.json());
server.use(express.urlencoded({ extended: true })); // body를 받겠다는 의미(middleware)
const port = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true });
const db = client.db(process.env.MONGODB_DATABASE);
const collectionCard = db.collection(process.env.MONGODB_COLLECTION_CARDS);
const collectionMusic = db.collection(process.env.MONGODB_COLLECTION_MUSIC);
/** 음악 한꺼번에 업로드 하기 */
// async function run() {
// 	try {
// 		const musicExample = {
// 			id: 1,
// 			title: 'New Day',
// 			artist: '폴킴',
// 			lyrics: `이뤄질 거라 믿으면
// 			언젠간 꼭 오겠지`,
// 			fullLyrics: `우연히 올려다본 거리
// 			내가 알고 있는 그대로
// 			지나가는 사람마저
// 			익숙한걸
// 			유난히 푸른 저 하늘이
// 			오늘따라 낯설게 보여
// 			흥얼대던 노래마저
// 			새로운걸
// 			그땐 아픈 맘 견디지 못해
// 			아무 말도 못 했죠
// 			그런 사랑이 있고 나서야
// 			비로소 알았어
// 			익숙하지만 새로운
// 			누군가를 만나는 일
// 			원한다고 쉽게 오지 않을
// 			마법 같은 일
// 			너무 쉽게 알아버리기엔
// 			많이 아쉬운걸
// 			이뤄질 거라 믿으면
// 			언젠간 꼭 오겠지
// 			유난히 빛나는 저 별이
// 			내게 말을 건 것 같아서
// 			한참 동안 길에 서서
// 			잠 못 드는 밤
// 			이런 나의 맘을 아는지
// 			설레이는 나를 아는지
// 			이름 모를 사람들도
// 			빛이 나는 걸
// 			전엔 만남을 쉽게 여겼지
// 			아무것도 모르고
// 			그런 사랑이 있고 나서야
// 			이제는 알겠어
// 			익숙하지만 새로운
// 			누군가를 만나는 일
// 			원한다고 쉽게 오지않을
// 			마법 같은 일
// 			너무 쉽게 알아버리기엔
// 			많이 아쉬운걸
// 			이뤄질 거라 믿으면
// 			언젠간 꼭 오겠지
// 			익숙함이란 이유로
// 			너무 쉽게 생각했던
// 			지나친 많은 인연들
// 			다신 오지 않겠지
// 			힘들어도 알고 싶단
// 			진실한 그 마음으로
// 			누군가를 만나는 일
// 			언젠간 꼭 오겠지
// 			이뤄질 거라 믿으면
// 			언젠간 꼭 오겠지`,
// 			image: '',
// 			spotifyLink: '',
// 			youtubeLink: '',
// 		}
// 		await collectionMusic.insertOne(musicExample)
// 	} catch {
// 		console.dir
// 	} finally {
// 		await client.close()
// 	}
// }
// run()
function postCard(cardData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const created_at = DateTime.now().toFormat('yyyyMMddHHmmss');
            // const query = { id: 1 }
            // const card = await cards.find)
            const card = Object.assign(Object.assign({}, cardData), { created_at });
            yield collectionCard.insertOne(card);
            console.log({ card });
            return card;
        }
        catch (_a) {
            console.dir;
        }
        finally {
            yield client.close();
        }
    });
}
function getCardById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const card = yield collectionCard.findOnd({ id });
            console.log({ card });
            return card;
        }
        catch (_a) {
            console.dir;
        }
        finally {
            yield client.close();
        }
    });
}
server.listen(port, () => {
    console.log('the server is running');
});
function getMusicList() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const musics = yield collectionMusic.find();
            console.log({ musics });
            return musics;
        }
        catch (_a) {
            console.dir;
        }
        finally {
            yield client.close();
        }
    });
}
/**
 * 카드를 저장한다.
 */
server.post('/card', (req, res) => {
    const result = postCard(req.body);
    // id 값을 반환한다. -> 해당 주소로 리디렉션
    // res.redirect()
    res.json({ message: 'success', result });
});
/**
 * 카드를 요청한다.
 */
server.get('/card/:id', (req, res) => {
    const { id } = req.params;
    const card = getCardById(id);
    /** [workaround] 시간이 되지 않은 경우 데이터 리턴하지 않는다. */
    // if (notyet) {
    //   res.json({message: 'yet to open'})
    // }
    if (card) {
        res.json(card);
    }
    else {
        res.status(404).json({ errorMessage: 'There is no card.' });
    }
});
/**
 * 음악 리스트를 요청한다.
 */
server.get('/musics', (_, res) => {
    /** [workaround] 데이터 어떻게 보낼지 고민해보기 */
    const musics = getMusicList();
    res.json(musics);
});
/**
 * 특정 음악을 호출한다.
 */
// server.get('/api/musics/:id', (req: any, res: any) => {
// 	const musicId = Number(req.params.id)
// 	const music = musics.find((m) => {
// 		return m.id === musicId
// 	})
// 	if (music) {
// 		res.json(music)
// 	} else {
// 		res.status(404).json({ errorMessage: 'There is no music.' })
// 	}
// })
