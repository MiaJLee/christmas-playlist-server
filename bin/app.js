"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
var cors = require('cors');
const SnowflakeId = require('snowflake-id').default;
var snowflake = new SnowflakeId({
    mid: 42,
    offset: (2019 - 1970) * 31536000 * 1000,
});
server.use(cors()); // 어떤 주소를 허용할지 설정이 가능하다.
server.use(bodyParser.json());
const cards = [
    {
        id: 526338008954347520,
        sender: '지형',
        reciever: '현진',
        card: {
            shape: 'circle',
            color: 'pink',
            illustration: 'rabbit',
        },
        text: '이건 편지야',
        created_at: 2022121003124599000000,
        musicId: 1,
    },
    {
        id: 526338040256438272,
        sender: '지형',
        reciever: '현진',
        card: {
            shape: 'circle',
            color: 'pink',
            illustration: 'rabbit',
        },
        text: '이건 편지야',
        created_at: 2022121003124599000000,
        musicId: 1,
    },
];
const port = 3000;
server.listen(port, () => {
    console.log('the server is running');
});
server.get('/', function (req, res) {
    res.send('Hello World');
});
server.post('/api/card', (req, res) => {
    const id = snowflake.generate(); // returns something along the lines of "285124269753503744"
    cards.push(req.body);
    res.json({ message: 'success', id });
});
server.get('/api/card/:id', (req, res) => {
    const cardId = req.params.id;
    console.log(cardId);
    const card = cards.find((c) => {
        return c.id === cardId.toNumber();
    });
    if (card) {
        res.json(card);
    }
    else {
        res.status(404).json({ errorMessage: 'There is no card.' });
    }
});
