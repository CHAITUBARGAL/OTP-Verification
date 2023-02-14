import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
// import ENV from '../config.js'
const ATLAS_URI = process.env.ATLAS_URI;

async function connect(){
    const mongod = await MongoMemoryServer.create();
    const getUri = mongod.getUri();

    mongoose.set('strictQuery', true)
    // const db = await mongoose.connect(getUri);
    const db = await mongoose.connect(ATLAS_URI)
    console.log("DataBase Connected")
    return db;
}

export default connect;