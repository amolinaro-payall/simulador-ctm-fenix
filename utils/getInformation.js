import libxml from 'libxmljs';
let contracts = [
    {
        contract: '99324561'
    }, 
    {
        contract: '48484848'
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
                convertJsonToSoapXML(response);
                const response_xml = convertJsonToSoapXML(response);
                reject(response_xml);
            },3000)
        }
        else if(contract.length > 8 || contract.length < 8) {
            console.log("No tiene 8 digitos")
            resp_code = "P8";
            const response = create_response(contract_object);
            convertJsonToSoapXML(response);
            const response_xml = convertJsonToSoapXML(response);
            reject(response_xml);
            // reject("El contrato es invalido");
        }
        else if(!contract.match(valid_values)) {
            resp_code = "P8";
            const response = create_response(contract_object);
            convertJsonToSoapXML(response);
            const response_xml = convertJsonToSoapXML(response);
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
                convertJsonToSoapXML(response);
                const response_xml = convertJsonToSoapXML(response);
                resolve(response_xml);
                
            } else {
                console.log("El contrato no existe");
                resp_code = "P7";
                // reject("El contrato no esta registrado");
                const response = create_response(contract_object);
                convertJsonToSoapXML(response);
                const response_xml = convertJsonToSoapXML(response);
                reject(response_xml);
            }
        }
        
    })
}
//Funcion que construye el response simulado de fenix
const create_response = (json_object) => {
    console.log("el contrato a analizar:",json_object);
    let [envelope] = Object.keys(json_object); 
    let envelope_object = json_object[envelope];
    let [attributes,header,body] = Object.keys(envelope_object); 
    modify_envelope_children(envelope_object,attributes,header);
    console.log("Final1",json_object);
    modify_envelop_header(json_object['soapenv:envelope']["soapenv:Header"]);
    console.log("Final2",json_object);
    let [envelope_latest_bill] = envelope_object[body]; //accedo al body de envelope
    delete_key_value_pair(envelope_latest_bill,'pos:contractInvoiceRequest');
    let body_temp = modify_envelop_body(envelope_object, body);
    console.log("body_temp:",body_temp);
    delete_key_value_pair(envelope_object,body);
    delete envelope_object[body];
    json_object['soapenv:envelope']['soapenv:body'] = body_temp;
    console.log("Final3:",json_object['soapenv:envelope']['soapenv:body']);
    //convertJsonToSoapXML(json_object);
    // console.log("el objeto terminado:",OBJtoXML(json_object));
    return json_object;
   
}


//Funcion que modifica el body para que contega la informacion de fenix
const modify_envelop_body = (envelope_object,body) => {
    let [envelope_contract_invoice] = envelope_object[body]; //accedo al body de envelope
    console.log("hanla pa ve:",envelope_contract_invoice);
    let envelope_contract_invoice_keys = Object.keys(envelope_contract_invoice);
    console.log("las keys:",Object.keys(envelope_contract_invoice));
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
            "contractID": contract_id, 
            "invoiceID": 10, 
            "invoiceGenerationDate": "dd/mm/yyyy",
            "invoiceAmount":100,
            "PaymentDueDate":"dd/mm/yyyy",
            "transStatus":"1",
            "respCode":resp_code,
            "respDescription":"random description",
            "transactionID":1459859,
            "transRefNumber":484994})
    }
    else if(resp_code === "P8"){
        add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
            "contractID": contract_id, 
            "transStatus":"0",
            "respCode":resp_code,
            "respDescription":"Contrato Invalido"})
    }
    else if(resp_code === "P7"){
            add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
                "contractID": contract_id, 
                "transStatus":"0",
                "respCode":resp_code,
                "respDescription":"El contrato no existe"})
    }
    else {
        add_key_value_pair(envelope_contract_invoice,"pos:contractInvoiceResponse",{
            "contractID": contract_id, 
            "transStatus":"0",
            "respCode":resp_code,
            "respDescription":"Error de conexion"})
    }

   
    
    let body_temp = envelope_object[body];
    return body_temp;
    
    
}

//Funcion para convertir JSON a XML SOAP
const convertJsonToSoapXML = (json_response) => {
    // console.log("json response:",json_response);
    let [envelope_object_components] = Object.values(json_response);
    // console.log("components",envelope_object_components); 
    let components_keys = Object.keys(envelope_object_components);
    let envelope_object_attributes = json_response['soapenv:envelope'][components_keys[0]];
    let header_tag = components_keys[1];
    let body_tag = components_keys[2];
    let [envelope_object_header_children] = json_response['soapenv:envelope'][header_tag];
    let message_header_tag = Object.keys(envelope_object_header_children)[0]
    // console.log(envelope_object_header_children);
    // console.log("eo attr:",envelope_object_attributes);
    // console.log("eo header:", envelope_object_header_children[message_header_tag][0]);
    let envelope_object_header_message =  envelope_object_header_children[message_header_tag][0];
    // console.log("eo header attr:",envelope_object_header_message );
    let header_message_keys = Object.keys(envelope_object_header_message);
    // console.log("keys:",header_message_keys)
    let envelope_object_header_message_attr = envelope_object_header_message[header_message_keys[0]];
    // console.log("mis atributos",envelope_object_header_message_attr)
    let tracking_message_tag = header_message_keys[1];
    let tracking_message_tag_children_object= envelope_object_header_message[tracking_message_tag][0];
    // console.log("holi",header_message_keys[1]);
    // console.log("holi2:",tracking_message_tag_children_object );
    let [message_id_tag,carrier_id_tag,user_id_tag,password_tag] =  Object.keys(tracking_message_tag_children_object);
    let [message_id_value,carrier_id_value,user_id_value,password_value] =  Object.values(tracking_message_tag_children_object);
    // console.log(message_id_tag);
    // console.log(carrier_id_tag);
    // console.log(user_id_tag);
    // console.log(password_tag);
    // console.log(password_value);


    let [envelope_object_body_children] = json_response['soapenv:envelope'][body_tag];
    // let [billdetails_tag] = Object.keys(envelope_object_body_children);
    // console.log("esto es lo que quiero:",envelope_object_body_children);
    let [envelope_object_body_children_keys] = Object.keys(envelope_object_body_children);
    
    if(resp_code === "00") {
        let [contract_id_tag,invoice_id_tag, invoice_date_tag, invoice_amount_tag,payment_tag,trans_status_tag,resp_code_tag,resp_desc_tag,trans_id_tag,trans_ref_tag] = Object.keys(envelope_object_body_children[envelope_object_body_children_keys]);
        let [contract_id_value,invoice_id_value, invoice_date_value, invoice_amount_value,payment_value,trans_status_value,resp_code_value,resp_desc_value,trans_id_value,trans_ref_value] = Object.values(envelope_object_body_children[envelope_object_body_children_keys]);
         //let envelope_object_attributes_keys = Object.keys(envelope_object_attributes);
        let doc = new libxml.Document()
        doc.node('soapenv:envelope').attr(envelope_object_attributes)
            .node(header_tag)
                .node(message_header_tag).attr(envelope_object_header_message_attr)
                    .node(tracking_message_tag)
                        .node(message_id_tag,message_id_value[0])
                    .parent()
                        .node(carrier_id_tag,carrier_id_value[0])
                    .parent()
                        .node(user_id_tag,user_id_value[0])
                    .parent()
                        .node(password_tag,password_value[0])
                    .parent()

                .parent()
            .parent()
        .parent()
            .node(body_tag)
                .node(envelope_object_body_children_keys)
                    .node(contract_id_tag,contract_id_value.toString())
                .parent()
                    .node(invoice_id_tag,invoice_id_value.toString())
                .parent()
                    .node(invoice_date_tag,invoice_date_value)
                .parent()
                    .node(invoice_amount_tag,invoice_amount_value.toString())
                .parent()
                    .node(payment_tag,payment_value)
                .parent()
                    .node(trans_status_tag,trans_status_value)
                .parent()
                    .node(resp_code_tag,resp_code_value.toString())
                .parent()
                    .node(resp_desc_tag,resp_desc_value)
                .parent()
                    .node(trans_id_tag,trans_id_value.toString())
                .parent()
                    .node(trans_ref_tag,trans_ref_value.toString())
                .parent()

            .parent()
        .parent()
        .parent()

        console.log(doc.toString());
        return doc.toString();
    }
    else if( resp_code==="P8" || resp_code === "P7" || resp_code === "P9") {
        let [contract_id_tag,trans_status_tag,resp_code_tag,resp_desc_tag] = Object.keys(envelope_object_body_children[envelope_object_body_children_keys]);
        let [contract_id_value,trans_status_value,resp_code_value,resp_desc_value] = Object.values(envelope_object_body_children[envelope_object_body_children_keys]);
        let doc = new libxml.Document()
        doc.node('soapenv:envelope').attr(envelope_object_attributes)
            .node(header_tag)
                .node(message_header_tag).attr(envelope_object_header_message_attr)
                    .node(tracking_message_tag)
                        .node(message_id_tag,message_id_value[0])
                    .parent()
                        .node(carrier_id_tag,carrier_id_value[0])
                    .parent()
                        .node(user_id_tag,user_id_value[0])
                    .parent()
                        .node(password_tag,password_value[0])
                    .parent()

                .parent()
            .parent()
        .parent()
            .node(body_tag)
                .node(envelope_object_body_children_keys)
                    .node(contract_id_tag,contract_id_value.toString())
                .parent()
                    .node(trans_status_tag,trans_status_value)
                .parent()
                    .node(resp_code_tag,resp_code_value.toString())
                .parent()
                    .node(resp_desc_tag,resp_desc_value)
                .parent()
            .parent()
        .parent()
        .parent()

        console.log(doc.toString());
        return doc.toString();

    }

  
        

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