import http from 'http';
import fs from 'fs';
import path from 'path';
/*
implement your server code here
*/
 
// create path for database json file
const DB_PATH = path.join(__dirname, '/database.json');
 
// create http server and pass in the listener function
// The listener function is a callback passed to http.createServer.
// It is called whenever a request is sent to the server
const server = http.createServer((req, res) => {
 const method = req.method;
 
 if (method === 'GET') {
   // Get all existing data from db
   const db = get();
   send(res, db);
 } else if (method === 'POST') {
   req.on('data', chunk => {
     // convert chunk (bytes) to string
     // parse as JSON object
     const data = JSON.parse(chunk.toString());
     create(data);
     send(res, data, 201);
     //console.log(send(res, data))
   });
 } else if (method === 'PUT') {
   const id = Number(req.url?.slice(1));
   req.on('data', chunk => {
     const data = JSON.parse(chunk.toString());
     const editedData = edit(id, data);
     send(res, editedData);
   });
 } else if (method === 'DELETE') {
   const id = Number(req.url?.slice(1));
   remove(id);
   send(res, { message: `record with id ${id} deleted successfully` });
 }
});
 
// function for sending response back to the client
const send = (res, data, statusCode = 200) => {
 res.writeHead(statusCode, { 'Content-Type': 'application/json' });
 res.write(JSON.stringify(data));
 res.end();
};
 
const get = () => {
 let db;
 try {
   db = readDB();    // try to read from the db
 } catch (error) {
   writeToDB([]);   // if db read fails.  // create empty db
   db = readDB();    // read db again
 }
 return JSON.parse(db);   // return db data parsed as JSON
};
 
const create = (data) => {
 const db = get();
 db.push(data);
 writeToDB(db);  //writing to database
}
 
const edit = (id, data) => {
 let db = get();
 let updatedRecord;
 db = db.map((record) => {
   if (record.id === id) {
     // prevent updating id
     delete data.id;
 
     updatedRecord = {
       ...record,
       ...data
     };
 
     return updatedRecord;
   }
 
   return record;
 });
 writeToDB(db);
 return updatedRecord;
};
 
const remove = (id) => {
 let db = get();
 db = db.filter((record) => record.id !== id);
 writeToDB(db);
};
 
const writeToDB = (data) => {
 fs.writeFileSync(DB_PATH, JSON.stringify(data));
};
 
const readDB = () => {
 return fs.readFileSync(DB_PATH, { encoding:'utf8', flag:'r' });
};
 
// starts the server to listen on port 3005
server.listen(3005, () => {
  console.log("listening on port 3005...")
});