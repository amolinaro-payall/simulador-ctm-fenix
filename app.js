//Importar librerias necesarias
import express from "express";
import cors from "cors";
import xmlparser from 'express-xml-bodyparser';
// import libxmljs from 'libxmljs';

import routes from "./routes/routes.js";



const app = express();
app.use(cors());
app.use(xmlparser());
app.use("/api", routes);


export default app;

