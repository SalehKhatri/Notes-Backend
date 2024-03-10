const connectToMongo=require('./db');
const express = require('express')

const app = express()
connectToMongo() //function to connect to db function written in db.js

var cors = require('cors')
 
app.use(cors())
app.use(express.json());
const port = 3000
//Available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/note'))


app.get('/', (req, res) => {
  res.send('Hello Saleh!')
})

app.listen(port, () => {
  console.log(`iNotebook_backend listening on port http://localhost:${port}`)
})