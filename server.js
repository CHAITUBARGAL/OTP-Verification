import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js'

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by'); 

const PORT= process.env.PORT || 5000;
  
// HTTP GET Request
app.get('/', (req, res)=>{
    res.status(201).json("Home GET Request");
})
// API route 
app.use('/api', router)

// start server only when we valid connection

connect().then(()=>{
    try {
        app.listen(port, ()=>{
            console.log(`Server  connected to http://localhost:${PORT}`);
        })
        
    } catch (error) {
        console.log("Cannot connect to the Server")
        
    }
}).catch(error =>{
    console.log("Invalid database connection")
})


