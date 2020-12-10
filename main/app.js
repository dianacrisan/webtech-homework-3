const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')

const mysql = require('mysql2/promise')

// TODO: change the credentials to fit your own
// if user does not have the right to create, run (as root): GRANT ALL PRIVILEGES ON *.* TO 'app'@'localhost';
const DB_USERNAME = 'root'
const DB_PASSWORD = 'password'

let conn

mysql.createConnection({
    user : DB_USERNAME,
    password : DB_PASSWORD
})
.then((connection) => {
    conn = connection
    return connection.query('CREATE DATABASE IF NOT EXISTS tw_homework')
})
.then(() => {
    return conn.end()
})
.catch((err) => {
    console.warn(err.stack)
})

const sequelize = new Sequelize('tw_homework', DB_USERNAME, DB_PASSWORD,{
    dialect : 'mysql',
    logging: false
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()
// TODO
app.use(bodyParser.json());

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

app.post('/food-items', async (req, res) => {
    try{
        // TODO
        if(Object.keys(req.body).length !== 0)
        {
            // let foodItem = await FoodItem.create(req.body)

            //aici!!!
            if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('category') || !req.body.hasOwnProperty('calories')) 
            {
                return res.status(400).json({message : 'malformed request'})
            }
            else if(req.body.calories < 0) 
            {
                return res.status(400).json({message : 'calories should be a positive number'})
            }
            else if(req.body.category.length <3 || req.body.category.length > 10)
            {
                return res.status(400).json({message : 'not a valid category'})
            }
            return res.status(201).json({message: 'created'})
        }
        else 
        {
            return res.status(400).json({message : 'body is missing'})
        }
    }
    catch(err)
    {
        // res.status(500).json({ message: err });
        console.log(err)
    }
})

module.exports = app