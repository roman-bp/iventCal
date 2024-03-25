const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

// Создание экземпляра приложения
const app = express();
const PORT = 3000;

// Создание и подключение к базе данных
const db = new sqlite3.Database('./booking.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) return console.error(err.message);

    console.log('Успешное подключение к базе данных.');
    // Создание таблицы, если она не существует
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL
    )`, (err) => {
        if (err) return console.error(err.message);
        console.log('Таблица успешно создана или уже существует.');
    });
});

app.use(express.json());
app.use(cors());

app.post('/submit_booking', (req, res) => {
    const { date, time } = req.body;
    console.log(`Запись на дату: ${date}, время: ${time}`);

    // Добавление записи в базу данных
    const sql = `INSERT INTO bookings (date, time) VALUES (?, ?)`;
    const params = [date, time];
    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Ошибка при добавлении записи в базу данных' });
            return;
        }
        console.log(`Запись успешно добавлена с ID: ${this.lastID}`);
        res.json({ message: 'Запись успешно создана', id: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}.`);
});

app.get('/bookings', (req, res) => {
    const sql = "SELECT * FROM bookings";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

app.use(express.static('public'));

