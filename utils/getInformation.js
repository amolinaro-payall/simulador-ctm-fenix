import xml2js from 'xml2js';
let contracts = [
    {
        contract: '99324561347'
    }, 
    {
        contract: '48484848484'
    }
]
// let contract1 = '99324561';
let valid_values = /^[0-9]+$/;
let contract_exist = false;
let resp_code = -1;
let connection_error = false;

//Funcion que verifica si el contrato esta registrado en fenix
const getInformation = (contract,contract_object) => {
    console.log("contrato",contract);
    return new Promise((resolve, reject) => {
        if(connection_error) {
            console.log("error de conexion");
            resp_code = "P9";
            setTimeout(function(){
                const response = create_response(contract_object);
                let builder = new xml2js.Builder();
                let response_xml = builder.buildObject(response);
                console.log("a ver si furula:");
                console.log(response_xml);
                console.log("se acabo");
                // convertJsonToSoapXML(response);
                // const response_xml = convertJsonToSoapXML(response);
                reject(response_xml);
            },3000)
        }
        else if(contract.length > 11 || contract.length < 11) {
            console.log("No tiene 8 digitos")
            resp_code = "P8";
            const response = create_response(contract_object);
            let builder = new xml2js.Builder();
            let response_xml = builder.buildObject(response);
            console.log("a ver si furula:");
            console.log(response_xml);
            console.log("se acabo");
            // convertJsonToSoapXML(response);
            // const response_xml = convertJsonToSoapXML(response);
            reject(response_xml);
            // reject("El contrato es invalido");
        }
        else if(!contract.match(valid_values)) {
            resp_code = "P8";
            const response = create_response(contract_object);
            let builder = new xml2js.Builder();
            let response_xml = builder.buildObject(response);
            console.log("a ver si furula:");
            console.log(response_xml);
            console.log("se acabo");
            // convertJsonToSoapXML(response);
            // const response_xml = convertJsonToSoapXML(response);
            reject(response_xml);
            // reject("El contrato debe ser numerico");
        }
        
        else {
            for(let i = 0; i < contracts.length; i++) {
                console.log("contrato que estoy comparando:",contracts[i].contract);
                if(contracts[i].contract === contract) {
                    console.log("entre")
                    contract_exist = true;
                    resp_code = "00";
                    break;
                }
            }
            if(contract_exist) {
                console.log("El contrato existe");
                const response = create_response(contract_object);
                let builder = new xml2js.Builder();
                let response_xml = builder.buildObject(response);
                console.log("a ver si furula:");
                console.log(response_xml);
                console.log("se acabo");
                // convertJsonToSoapXML(response);
                // const response_xml = convertJsonToSoapXML(response);
                resolve(response_xml);
                
            } else {
                console.log("El contrato no existe");
                resp_code = "P7";
                // reject("El contrato no esta registrado");
                const response = create_response(contract_object);
                let builder = new xml2js.Builder();
                let response_xml = builder.buildObject(response);
                console.log("a ver si furula:");
                console.log(response_xml);
                console.log("se acabo");
                
                // convertJsonToSoapXML(response);
                // const response_xml = convertJsonToSoapXML(response);
                reject(response_xml);
            }
        }
        
    })
}
//Funcion que construye el response simulado de fenix
const create_response = (json_object) => {
    // console.log("el contrato a analizar:",json_object);
    let [envelope] = Object.keys(json_object); 
    let envelope_object = json_object[envelope];
    let [attributes,header,body] = Object.keys(envelope_object); 
    modify_envelope_children(envelope_object,attributes,header);
    // console.log("Final1",json_object);
    modify_envelop_header(json_object['soapenv:envelope']["soapenv:Header"]);
    // console.log("Final2",json_object);
    let [envelope_latest_bill] = envelope_object[body]; //accedo al body de envelope
    delete_key_value_pair(envelope_latest_bill,'pos:contractInvoiceRequest');
    let body_temp = modify_envelop_body(envelope_object, body);
    console.log("body_temp:",body_temp);
    delete_key_value_pair(envelope_object,body);
    delete envelope_object[body];
    json_object['soapenv:envelope']['soapenv:body'] = body_temp;
    // console.log("Final3:",json_object['soapenv:envelope']['soapenv:body']);
    //convertJsonToSoapXML(json_object);
    // console.log("el objeto terminado:",OBJtoXML(json_object));
    return json_object;
   
}


//Funcion que modifica el body para que contega la informacion de fenix
const modify_envelop_body = (envelope_object,body) => {
    let [envelope_contract_invoice] = envelope_object[body]; //accedo al body de envelope
    // console.log("hanla pa ve:",envelope_contract_invoice);
    let envelope_contract_invoice_keys = Object.keys(envelope_contract_invoice);
    // console.log("las keys:",Object.keys(envelope_contract_invoice));
    let contract_array = envelope_contract_invoice[envelope_contract_invoice_keys[0]];
    let contract_object = contract_array[0];
    let [contract_object_key] = Object.keys(contract_object);
    let contract_id = contract_object[contract_object_key][0]
    // console.log(contract_object_key);
    // console.log(contract_object[contract_object_key][0]);
    // console.log(envelope_contract_invoice[envelope_contract_invoice_keys[0]])
    delete_key_value_pair(envelope_contract_invoice,envelope_contract_invoice_keys[0])
    //delete envelope_contract_invoice['pos:getlatestbillrequest'];
    if(resp_code === "00") {
        add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
            "pos:contractID": contract_id,
            "pos:invoiceID": 10,
            "pos:invoiceGenerationDate": "dd/mm/yyyy",
            "pos:invoiceAmount":100,
            "pos:PaymentDueDate":"dd/mm/yyyy",
            "pos:transStatus":"1",
            "pos:respCode":resp_code,
            "pos:respDescription":"random description",
            "pos:transactionID":1459859,
            "pos:transRefNumber":484994})
    }
    else if(resp_code === "P8"){
        add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
            "pos:contractID": contract_id,
            "pos:transStatus":"0",
            "pos:respCode":resp_code,
            "pos:respDescription":"Contrato Invalido"})
    }
    else if(resp_code === "P7"){
            add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
                "pos:contractID": contract_id,
                "pos:transStatus":"0",
                "pos:respCode":resp_code,
                "pos:respDescription":"El contrato no existe"})
    }
    else {
        add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
            "pos:contractID": contract_id,
            "pos:transStatus":"0",
            "pos:respCode":resp_code,
            "pos:respDescription":"Error de conexion"})
    }

   
    
    let body_temp = envelope_object[body];
    return body_temp;
    
    
}



//Funcion que modifica el header para que contega la informacion de fenix
const modify_envelop_header = (envelope_header) => {
    // console.log("header inicial:",envelope_header);
    let envelope_header_array = envelope_header;
    let message_header_object = envelope_header_array[0]; //accedo al message del header
    let [message] = Object.keys(message_header_object); //Obtengo etiqueta del mensaje
    message_header_object['head:messageHeader'] = message_header_object[message];
    delete_key_value_pair(message_header_object,message);
    message_header_object['head:messageHeader'][0]["$"] = {'soapenv:mustUnderstand': "0", "xmlns:head": "http://mspgw.xius.com/common/header/MSPHeaderDetails.xsd" };
    let [message_header_array] = message_header_object['head:messageHeader'];
    add_key_value_pair(message_header_array,"head:trackingMessageHeader",message_header_array['msp:trackingmessageheader'])
    delete_key_value_pair(message_header_array,'msp:trackingmessageheader')
    //delete message_header_array['msp:trackingmessageheader'];
    //console.log("message header array2 nuevo",message_header_array);
    let tracking_message_object = message_header_array['head:trackingMessageHeader'][0];
    // console.log("tracking object:",tracking_message_object);
    add_key_value_pair(tracking_message_object,'head:messageid',tracking_message_object['msp:messageid'])
    add_key_value_pair(tracking_message_object,'head:carrierid',tracking_message_object['msp:carrierid'])
    add_key_value_pair(tracking_message_object,'head:userid',tracking_message_object['msp:userid'])
    add_key_value_pair(tracking_message_object,'head:password',tracking_message_object['msp:password'])
    delete_key_value_pair(tracking_message_object,'msp:password')
    delete_key_value_pair(tracking_message_object,'msp:messageid')
    delete_key_value_pair(tracking_message_object,'msp:carrierid')
    delete_key_value_pair(tracking_message_object,'msp:userid')
    
    // console.log("nuevo header actualizado",message_header_array["head:trackingMessageHeader"]);
}


//Funcion que modifica los hijos de la primera etiqueta.
const modify_envelope_children = (envelope_object, attributes, header) => {
    //console.log("envelope_object:",attributes);
   
    delete envelope_object[attributes]["xmlns:msp"];
    //envelope_object["soapenv:Header"] = envelope_object[header];
    add_key_value_pair(envelope_object,"soapenv:Header",envelope_object[header])
    delete_key_value_pair(envelope_object,header)
    //delete envelope_object[header];
}

//Metodo que agrega un par clave-valor al response
const add_key_value_pair = (object,key,value) => {
    object[key] = value;
}

//Metodo que elimina un par clave-valor del response
const delete_key_value_pair = (object,key) => {
    delete object[key];
}



export default getInformation;