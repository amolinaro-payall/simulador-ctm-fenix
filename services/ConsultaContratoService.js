import getInformation from "../utils/getInformation.js";



//Servicio con el cual se simula la comunicacion con la API de fenix
const ContratoService =  (contract_object) => {
    let [envelope] = Object.keys(contract_object); //obtengo etiquetas hijos //envelope tag
    let contract_object2 = Object.assign({},contract_object);
    let envelope_object = contract_object[envelope] // accedo al objeto envelope
    let [attributes,header,body] = Object.keys(envelope_object); //obtengo etiquetas de atributos, header y body
    // console.log("attributes:",attributes);
    // console.log("body:",envelope_object[body]);
    let contract_number = get_contract_number(envelope_object[body]);

    return getInformation(contract_number, contract_object2);
}

// Funcion que retorna el numero de contrato que contiene el xml recibido en el request
const get_contract_number = (body) => {
    let body_object = body[0];
    let [body_object_keys] = Object.keys(body_object);
    console.log("keys:",body_object_keys);
    let [get_contractinvoice_object] = body_object[body_object_keys];
    console.log("body:",get_contractinvoice_object);
    let [contract_key] = Object.keys(get_contractinvoice_object);
    let contract_number = get_contractinvoice_object[contract_key][0];
    console.log("contract number:",contract_number);
    return contract_number;

}

export default ContratoService