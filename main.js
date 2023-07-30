require('dotenv').config()
const express=require('express')
const mongoose=require('mongoose')
const session=require('express-session')
const nocache=require('nocache')
const morgan = require('morgan')//

const app=express()
const PORT=process.env.PORT||4000

// database connection
// mongoose.connect(process.env.DB_URI,{useNewparser:true})
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
const db=mongoose.connection
db.on('error',(err)=>{
    console.log(err);
})
db.on('open',function(){
    console.log('connected...!');
})

// middleware
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app. use(morgan('tiny'));
app.use(nocache())

app.use(session({
    secret:'my secret key',
    saveUninitialized:true,
    resave:false
}))

app.use((req,res,next)=>{
    res.locals.message=req.session.message
    delete req.session.message
    next()
})

app.use(express.static('uploads'))
// set template engine
app.set('view engine','ejs')

// route prefix
app.use("",require('./routes/routes'))

// app.get('/',(req,res)=>{
//     res.send("hello world")
// })

app.listen(PORT,()=>{
    console.log(`server started at http://localhost:${PORT}`);
})