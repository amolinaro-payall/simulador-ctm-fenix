import processPayment from "../utils/processPayment.js";

const PagoService = (payment_object) => {
    console.log("en el servicio:", payment_object);
    let payment_object2 = Object.assign({},payment_object);
    return processPayment(payment_object2);
    
}

export default PagoService