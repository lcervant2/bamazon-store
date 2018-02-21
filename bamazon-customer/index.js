const inquirer = require('inquirer')
const mysql = require('promise-mysql')
require('console.table')

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'bamazon_storedb'
})
.then(conn => {
    conn.query('SELECT * from products')
        .catch(err => console.log(err))
        .then(rows => {
            console.table(rows)
            const questions = [{
                type: 'input',
                name: 'item_id',
                message: 'What is the ID of the item you would you like to purchase? [Quit with Q]',
                validate: val => !isNaN(val) || val.toLowerCase() === 'q'
            },
            {
                type: 'input',
                name: 'units',
                message: 'How many units would you like to buy? [Quit with Q]',
                validate: val => !isNaN(val) || val.toLowerCase() === 'q'
            }]

            inquirer.prompt(questions)
                .then(answers => {
                    const product = rows.filter(item => answers.item_id == item.item_id)

                    if (!product.length) throw 'That item id does not exist!'
                    if (answers.units > product[0].stock_quantity) throw 'Insufficient quantity!'
                    return {
                        product: product[0],
                        quantity: answers.units
                    }
                })
                .then(res => makePurchase(res, conn))
                .catch(err => console.log(err))
        })
})
.catch(err => console.log(err))


function makePurchase(data, conn) {
    return conn.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?', [data.quantity, data.product.item_id])
        .catch(err => console.log(err))
        .then(() => console.log('Purchase was successful! Here is your total: ' + data.quantity * data.product.price))
}