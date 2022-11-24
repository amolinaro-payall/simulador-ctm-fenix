import ContratoService from "../services/ConsultaContratoService.js";

//Controlador a traves del cual se empieza a procesar el xml recibido
const Consulta_Contrato = (req,res) => {

    let json_object = req.body;
    console.log("json:object:",json_object);
    
    ContratoService(json_object)
    .then((response) => {
        console.log("status existente",response);
        // res.header("Content-Type", "text/xml")
        res.status(200).send(response);
    })
    .catch((response) => {
        console.log("status inexistente",response);
        res.status(400).send(response);
    })
}

export default Consulta_Contrato