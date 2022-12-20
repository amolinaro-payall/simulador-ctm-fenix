import PagoService from "../services/PagoService.js";

const Pago_Contrato = (req,res) => {
    let payment_object = req.body;
    PagoService(payment_object)
    .then((response) => {
        console.log("pago exitoso");
        res.header("Content-Type", "text/xml")
        res.status(200).send(response);
    })
    .catch((response) => {
        console.log("pago falllido");
        res.status(400).send(response);
    });
}

export default Pago_Contrato