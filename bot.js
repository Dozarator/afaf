const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf("6883027495:AAGi4v-eyoBxlBX2BKHccpWvHPP7hhxhjfw");

let allCars = []; 
let currentCars = []; 

// Список марок и моделей автомобилей
const carBrands = [
    { brand: 'Toyota', models: ['Corolla', 'Camry'] },
    { brand: 'Honda', models: ['Civic', 'Accord'] },
    { brand: 'Ford', models: ['Focus', 'Mustang'] },
    { brand: 'Chevrolet', models: ['Cruze', 'Malibu'] },
    { brand: 'Volkswagen', models: ['Golf', 'Passat'] },
    { brand: 'BMW', models: ['3 Series', '5 Series'] },
    { brand: 'Mercedes-Benz', models: ['C-Class', 'E-Class'] },
    { brand: 'Audi', models: ['A4', 'A6'] },
    { brand: 'Nissan', models: ['Altima', 'Maxima'] },
    { brand: 'Hyundai', models: ['Elantra', 'Sonata'] }
];

async function searchCars(brand, model, chatId) {
    const url = 'https://tronk.pro/';

    try {
        const response = await fetch(url);
        const data = await response.json();

        allCars = data.items; 

        currentCars = allCars.slice(0, 5); 
        const message = getCarsMessage(currentCars);

        bot.telegram.sendMessage(chatId, message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Еще объявления', callback_data: 'more_cars' }],
                    [{ text: 'Другая марка', callback_data: 'other_brand' }]
                ]
            }
        });
    } catch (error) {
        bot.telegram.sendMessage(chatId, 'Ошибка при выполнении запроса');
    }
}

function getCarsMessage(cars) {
    let message = '';
    cars.forEach((car, index) => {
        message +=' Объявление ${index + 1}:\nМарка: ${car.brand}\nМодель: ${car.model}\nЦена: ${car.price}\n\n';
    });
    return message;
}

bot.action('other_brand', ctx => {
    allCars = [];
    currentCars = [];
    ctx.reply('Введите другую марку автомобиля для поиска:');
});

bot.command('start', ctx => {
    const chatId = ctx.chat.id;
    ctx.reply('Привет! Введите марку и модель автомобиля, чтобы найти объявления о продаже:');
});

bot.on('text', ctx => {
    const chatId = ctx.chat.id;
    const userInput = ctx.message.text.split(' ');
    const brand = userInput[0];
    const model = userInput.slice(1).join(' ');

    searchCars(brand, model, chatId);
});

bot.action('more_cars', ctx => {
    currentCars = allCars.slice(currentCars.length, currentCars.length + 5);
    const message = getCarsMessage(currentCars);

    if (ctx.update.message && message !== ctx.update.message.text) {
        ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Еще объявления', callback_data: 'more_cars' }],
                    [{ text: 'Другая марка', callback_data: 'other_brand' }]
                ]
            }
        });
    }
});

bot.launch();