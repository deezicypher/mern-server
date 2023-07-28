import express from 'express';
import userRoute from './routes/users.routes';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import transactRoute from './routes/transact.routes';
import adminRoute from './routes/admin/index.routes'
import ContactEmail from './utils/contact';

dotenv.config();

const app = express();
app.use(cookieParser())
const allowedOrigins =['http://localhost:5173','http://localhost:5174', 'http://localhost:3000']
app.use(express.json({limit:'50mb'}));
if(process.env.NODE_ENV === 'dev'){
    app.use(cors({
        credentials: true,
        origin:allowedOrigins
    }))
}


app.use('/api/users', userRoute)
app.use('/api/admin', adminRoute)
app.use('/api/order', transactRoute)
app.post('/api/contact', async (req, res) => {

  const {email,fullname, phone, message} = req.body 
  try{
  ContactEmail(email,message,fullname,phone,res)
  }catch(err) {
    console.log(err)
  }
})

if(process.env.NODE_ENV === 'production'){
    //app.use(express.static('../client/dist'))
    
    
    app.use('/admin/', express.static(path.join(__dirname, 'static/admin')));
    app.get('/admin*', (req, res) => {
      res.sendFile(path.join(__dirname, 'admin', 'index.html'))
    })

    app.use('/app/', express.static(path.join(__dirname, 'static/app')));
    app.get('/app*', (req, res) => {
      res.sendFile(path.join(__dirname, 'app', 'index.html'))
    })
     
 
    app.use(express.static(path.join(__dirname, 'static')));
    app.get('/*', (req, res) => {
      res.sendFile(path.join(__dirname, 'home', 'index.html'))
    })
 
  }  
   
   
   
app.listen(5000,()=>{
    console.log(`⚡️[server]:  Server is running at 5000`);
})
  