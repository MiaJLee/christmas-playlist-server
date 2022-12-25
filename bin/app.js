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
const { DateTime } = require('luxon');
var cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();
/** @TODO 수정 필요 */
const whitelist = ['http://localhost:4200'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not Allowed Origin!'));
        }
    },
};
server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: true })); // body를 받겠다는 의미(middleware)
const port = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URL, { useUnifiedTopology: true });
const db = client.db(process.env.MONGODB_DATABASE);
const collectionCard = db.collection(process.env.MONGODB_COLLECTION_CARDS);
const local = DateTime.local().setZone('Asia/Seoul');
const firstDayOf2023 = DateTime.fromISO('2023-01-01T00:00:00', { zone: 'Asia/Seoul' });
function postCard(cardData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const created_at = local.toFormat('yyyyMMddHHmmss');
            const card = Object.assign(Object.assign({}, cardData), { created_at });
            const result = yield collectionCard.insertOne(card);
            return result;
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
            const card = yield collectionCard.findOne({ _id: ObjectId(id) });
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
    console.log(port);
});
/**
 * 카드를 저장한다.
 */
server.post('/card', (req, res) => {
    postCard(req.body)
        .then((result) => {
        var _a;
        if (!result) {
            throw Error;
        }
        res.json({ message: 'success', cardId: (_a = result.insertedId) === null || _a === void 0 ? void 0 : _a.toString() });
    })
        .catch((err) => {
        // @TODO: 에러핸들링
        console.error(err);
        res.status(404).json({ errorMessage: 'Something goes wrong.' });
    })
        .finally(() => {
        console.log('done');
    });
});
/**
 * 카드를 요청한다.
 */
server.get('/card/:id', (req, res) => {
    const { id } = req.params;
    getCardById(id)
        .then((result) => {
        console.log(result);
        if (!result) {
            throw Error;
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
            });
        }
        if (result) {
            res.json({ message: 'success', result });
        }
    })
        .catch((err) => {
        // @TODO: 에러핸들링
        console.error(err);
        res.status(404).json({ errorMessage: 'There is no card.' });
    })
        .finally(() => {
        console.log('done');
    });
});
