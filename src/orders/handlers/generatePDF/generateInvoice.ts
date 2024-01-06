import { Item, Order } from "src/orders/entities";
import * as PDFDocument from 'pdfkit'


export const generateInvoice = (order: Order) => {
    let doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.font('src/orders/handlers/generatePDF/resources/Lato-Regular.ttf');
    generateHeader(doc)
    generateCustomerInformation(doc, order)
    generateInvoiceTable(doc, order)
    doc.end()
    return doc
}



const generateHeader = (doc: PDFKit.PDFDocument) => {
    doc
        .image("src/orders/handlers/generatePDF/resources/OTP.png", 40, 10, { width: 250 })
        .fillColor("#444444")
        .moveDown();
}

const generateCustomerInformation = (doc, order: Order) => {
    doc
        .fillColor("#444444")
        .fontSize(22)
        .text("Bill To", 50, 185)
        .fontSize(20)
        //.text(`#3123123`, 450, 185)
        .text(`Shipping address`, 395, 185)
        .fontSize(15)
        .text(`${formatDate(order.created_at)}`, 470, 50)
    generateHr(doc, 210);

    const customerInformationTop = 215;

    doc
        .fontSize(13)
        .text(`${order.user.name} ${order.user.surname}`, 50, customerInformationTop)
        .text(`${order.user.email}`, 50, customerInformationTop + 15);

    if (order.nip) {
        doc.text(`NIP: ${order.nip}`, 50, customerInformationTop + 30);
    }


    doc
        .text(`${order.address.street}`, 430, customerInformationTop)
        .text(`${order.address.city}`, 430, customerInformationTop + 15)
        .text(`${order.address.postCode}`, 430, customerInformationTop + 30)
        .moveDown();

    generateHr(doc, 280);
}




const formatDate = (date) => {

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return day + "/" + month + "/" + year;
}


const generateFooter = (doc) => {
    doc
        .fontSize(10)
        .text(
            "Payment is due within 15 days. Thank you for your business.",
            50,
            780,
            { align: "center", width: 500 }
        );
}


const generateHr = (doc, y) => {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}


function generateTableRow(
    doc,
    y,
    item,
    unitCost,
    vat,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(unitCost, 250, y, { width: 90, align: "right" })
      .text(vat, 310, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }


function generateInvoiceTable(doc, order) {
    let i;
    const invoiceTableTop = 330;
    let paidToDatePosition;
    let totalNet: number = 0;
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Unit Net Cost",
      "VAT",
      "Quantity",
      "Total Net Cost"
    );
    generateHr(doc, invoiceTableTop + 20);

    const items = order.items.sort((a, b) => a.shop.name.localeCompare(b.shop.name));
    
    
    for (i = 0; i < items.length; i++) {
      const item: Item = items[i];
      const position = invoiceTableTop + (i + 1) * 30;  
      generateTableRow(
        doc,
        position,
        item.name,
        item.getNetPrice().toFixed(2),
        item.vat + '%',
        item.amount,
        (item.getNetPrice() * item.amount).toFixed(2)
      );
       
        
      generateHr(doc, position + 20);
      paidToDatePosition = position + 20
      const priceNet = Number(item.getNetPrice() * item.amount)
      totalNet = totalNet + priceNet

      
    }

    generateTableRow(
        doc,
        paidToDatePosition + 20,
        "",
        "",
        "",
        'Net Price:',
        totalNet.toFixed(2) + ' €'
      );

      generateTableRow(
        doc,
        paidToDatePosition + 40,
        "",
        "",
        "",
        'Tax:',
        (order.totalPrice - totalNet).toFixed(2) + ' €'
      );

      generateTableRow(
        doc,
        paidToDatePosition + 60,
        "",
        "",
        "",
        'Total Price:',
        order.totalPrice.toFixed(2) + ' €'
      );
   
}
