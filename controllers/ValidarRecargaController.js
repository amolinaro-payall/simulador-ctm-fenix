//Controlador a traves del cual se empieza a procesar el xml recibido
const Validar_Recarga = (req,res) => {

    let json_object = req.body;
    // console.log("json:object:",json_object);
    console.log("mas info:", json_object['s:envelope']['s:body'][0]['ns2:validaterechargefacaderequest'][0]['customerorder'][0]['customerorderitem'][0]['customeraccountinteractionrole'][0]['customeraccount']);

}

export default Validar_Recarga

