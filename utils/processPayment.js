import libxml from 'libxmljs';

const processPayment = (payment_object) => {

    return new Promise((resolve,reject) => {
        if(payment_object) {
            console.log("empezando a procesar el archivo");
            console.log(payment_object);
            let [envelope] = Object.keys(payment_object); 
            let envelope_object = payment_object[envelope];
            let [attributes,header,body] = Object.keys(envelope_object); 
            // console.log("attr:",attributes);
            // console.log("header:",header);
            // console.log("body:",body);
            modify_envelope_children(envelope_object,attributes,header);
            // console.log("Final",payment_object);
            modify_envelop_header(payment_object['soapenv:envelope']["soapenv:Header"]);
            let [envelope_latest_bill] = envelope_object[body]; //accedo al body de envelope
            let body_temp = modify_envelop_body(envelope_object, body);
            delete_key_value_pair(payment_object,body);
            payment_object['soapenv:envelope']['soapenv:body'] = body_temp;
            console.log("payment object:",payment_object);
            let response_xml = convertJsonToSoapXML(payment_object);
            resolve(response_xml);
        }
        else {
            reject("No se encontro informacion del pago");
        }
    })
    
}

//Funcion que modifica los hijos de la primera etiqueta.
const modify_envelope_children = (envelope_object, attributes, header) => {
    //console.log("envelope_object:",attributes);
   
    delete envelope_object[attributes]["xmlns:msp"];
    add_key_value_pair(envelope_object,"soapenv:Header",envelope_object[header])
    delete_key_value_pair(envelope_object,header)
}

//Metodo que agrega un par clave-valor al response
const add_key_value_pair = (object,key,value) => {
    object[key] = value;
}

//Metodo que elimina un par clave-valor del response
const delete_key_value_pair = (object,key) => {
    delete object[key];
}

//Funcion que modifica el header para que contega la informacion de fenix
const modify_envelop_header = (envelope_header) => {
    let envelope_header_array = envelope_header;
    let message_header_object = envelope_header_array[0]; //accedo al message del header
    let [message] = Object.keys(message_header_object); //Obtengo etiqueta del mensaje
    message_header_object['head:messageHeader'] = message_header_object[message];
    delete_key_value_pair(message_header_object,message);
    message_header_object['head:messageHeader'][0]["$"] = {'soapenv:mustUnderstand': "0", "xmlns:head": "http://mspgw.xius.com/common/header/MSPHeaderDetails.xsd" };
    let [message_header_array] = message_header_object['head:messageHeader'];
    add_key_value_pair(message_header_array,"head:trackingMessageHeader",message_header_array['msp:trackingmessageheader'])
    delete_key_value_pair(message_header_array,'msp:trackingmessageheader')
    //console.log("message header array2 nuevo",message_header_array);
    let tracking_message_object = message_header_array['head:trackingMessageHeader'][0];
    //console.log("tracking object:",tracking_message_object);
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

//Funcion que modifica el body para que contega la informacion de fenix
const modify_envelop_body = (envelope_object,body) => {
    console.log("esto es lo que me interesa",envelope_object);
    let [envelope_payment] = envelope_object[body]; //accedo al body de envelope
    // console.log("esto es lo que me interesa",envelope_payment);
    let envelope_payment_key = Object.keys(envelope_payment);
    delete_key_value_pair(envelope_payment,envelope_payment_key);
    // console.log("ahora me interesa esto:",envelope_payment);
    // //delete envelope_payment['pos:getlatestbillrequest'];
    add_key_value_pair(envelope_payment,"paymentResponse",{
            "transStatus": 123456, 
            "respCode": 106599, 
            "respDescription": "random description",
            "transactionID":100,
            "transRefNumber":16569965})
    
    let body_temp = envelope_object[body];
    // console.log("body_temp:",body_temp);
    return body_temp;
    
    
}

//Funcion para convertir JSON a XML SOAP
const convertJsonToSoapXML = (json_response) => {
    //console.log("json response:",json_response);
    let [envelope_object_components] = Object.values(json_response);
    // console.log("components",envelope_object_components); 
    let components_keys = Object.keys(envelope_object_components);
    let envelope_object_attributes = json_response['soapenv:envelope'][components_keys[0]];
    let header_tag = components_keys[2];
    let body_tag = components_keys[1];
    let [envelope_object_header_children] = json_response['soapenv:envelope'][header_tag];
    console.log(envelope_object_header_children);
    let message_header_tag = Object.keys(envelope_object_header_children)[0]
    // console.log("message header:",message_header_tag);
    // console.log(envelope_object_header_children);
    let envelope_object_header_message =  envelope_object_header_children[message_header_tag][0];
    // console.log("envelope_object:",envelope_object_header_message);
    let header_message_keys = Object.keys(envelope_object_header_message);
    let envelope_object_header_message_attr = envelope_object_header_message[header_message_keys[0]];
    // console.log("envelope_object attr:",envelope_object_header_message_attr);
    let tracking_message_tag = header_message_keys[1];
    let tracking_message_tag_children_object= envelope_object_header_message[tracking_message_tag][0];
    let [message_id_tag,carrier_id_tag,user_id_tag,password_tag] =  Object.keys(tracking_message_tag_children_object);
    let [message_id_value,carrier_id_value,user_id_value,password_value] =  Object.values(tracking_message_tag_children_object);
  
   
    let [envelope_object_body_children] = json_response['soapenv:envelope'][body_tag];
    let [paymentdetails_tag] = Object.keys(envelope_object_body_children);
    // console.log(envelope_object_body_children[paymentdetails_tag]);
    let [trans_status_tag,resp_code_tag, resp_description_tag, trans_id_tag,trans_ref_num_tag] = Object.keys(envelope_object_body_children[paymentdetails_tag]);
    let [trans_status_value,resp_code_value, resp_description_value, trans_id_value,trans_ref_num_value] = Object.values(envelope_object_body_children[paymentdetails_tag]);

    //Creacion del XML
    let doc = new libxml.Document();
    doc.node('soapenv:envelope').attr(envelope_object_attributes)
        .node(header_tag)
            .node(message_header_tag).attr(envelope_object_header_message_attr)
                .node(tracking_message_tag)
                    .node(message_id_tag,message_id_value.toString())
                .parent()
                    .node(carrier_id_tag,carrier_id_value.toString())
                .parent()
                    .node(user_id_tag,user_id_value.toString())
                .parent()
                    .node(password_tag,password_value.toString())
                .parent()
            .parent()
        .parent()
    .parent()
        .node(body_tag)
            .node(paymentdetails_tag)
                .node(trans_status_tag,trans_status_value.toString())
            .parent()
                .node(resp_code_tag,resp_code_value.toString())
            .parent()
                .node(resp_description_tag,resp_description_value.toString())
            .parent()
                .node(trans_id_tag,trans_id_value.toString())
            .parent()
                .node(trans_ref_num_tag,trans_ref_num_value.toString())
            .parent()
    .parent()
    .parent()
  
    return doc.toString();
        

}


export default processPayment