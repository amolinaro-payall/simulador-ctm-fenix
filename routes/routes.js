import { Router } from "express";
import Consulta_Contrato from "../controllers/ConsultaContratoController.js";
import Pago_Contrato from "../controllers/PagoContratoController.js"


const router = Router()
router.post("/consulta",Consulta_Contrato);
router.post("/pago",Pago_Contrato);
export default router