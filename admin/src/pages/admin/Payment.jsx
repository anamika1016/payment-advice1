import Layout from "@/components/layout/Layout";
import React, { useEffect, useState } from "react";
import { FaCheck, FaEdit, FaEye, FaTrash, FaEnvelope } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import PaymentForm from "@/components/incidents/PaymentForm";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteIncident,
  fetchIncidents,
  updateIncidentStatus,
} from "@/redux/incidents/incidentSlice";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import InvoiceEditDialog from "@/components/incidents/InvoiceEditDialog";

const Payment = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPdfViewOpen, setIsPdfViewOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [invoiceHtml, setInvoiceHtml] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [invoiceTemplate, setInvoiceTemplate] = useState("");

  // Add new state variables for the invoice edit dialog
  const [isInvoiceEditDialogOpen, setIsInvoiceEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState(null);

  const { incidents } = useSelector((state) => state.incidents);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchIncidents());
    fetchInvoiceTemplate();
  }, [dispatch]);

  const fetchInvoiceTemplate = async () => {
    try {
      const response = await fetch("/pdf/template.html");
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`);
      }
      const html = await response.text();
      setInvoiceTemplate(html);
    } catch (error) {
      console.error("Error loading invoice template:", error);
      toast.error("Failed to load invoice template");
    }
  };

  const openIncidentDialog = (incident) => {
    setSelectedIncident(incident);
    setIsDialogOpen(true);
  };

  // Add a new function to open the invoice edit dialog
  const openInvoiceEditDialog = (incident, invoiceIndex = 0) => {
    setSelectedIncident(incident);
    setSelectedInvoice(incident); // Since the incident structure is flat in your table, use the same object
    setSelectedInvoiceIndex(invoiceIndex);
    setIsInvoiceEditDialogOpen(true);
  };

  // Add a function to close the invoice edit dialog
  const closeInvoiceEditDialog = () => {
    setIsInvoiceEditDialogOpen(false);
    setSelectedIncident(null);
    setSelectedInvoice(null);
    setSelectedInvoiceIndex(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedIncident(null);
  };

  const openDeleteConfirmation = (incident) => {
    setSelectedIncident(incident);
    setIsConfirmDialogOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSelectedIncident(null);
    setIsConfirmDialogOpen(false);
  };

  const handleDeleteIncident = (id) => {
    dispatch(deleteIncident(id));
    closeDeleteConfirmation();
  };

  // The rest of your existing functions remain unchanged
  const generateInvoicePdf = (invoice) => {
    try {
      if (!invoiceTemplate) {
        throw new Error("Invoice template not loaded");
      }

      console.log("Invoice data to populate:", invoice);

      let html = invoiceTemplate;

      // Format the current date
      const today = new Date();
      const formattedDate = today
        .toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");

      // Assign safe default values
      const totalGrossAmount = invoice.grossAmount || 0;
      const totalTds = invoice.tds || 0;
      const totalOtherDeductions = invoice.otherDeductions || 0;
      const totalNetAmount = invoice.netAmount || 0;

      // Replace invoice details in template
      const updatedHtml = html
        .replace(/<p>Date<\/p>/g, `<p>Date: ${formattedDate}</p>`)
        .replace(
          /<p>Ref No\.<br><\/p>/g,
          `<p>Ref No.: ${invoice.refNo || "-"}<br></p>`
        )
        .replace(
          /<p>To,<br><\/p>/g,
          `<p>To,<br>${invoice.recipientName || ""}<br>${
            invoice.recipientAddress || ""
          }</p>`
        )
        .replace(/Rs\. ------------------/g, `Rs. ${totalNetAmount.toFixed(2)}`)
        .replace(
          /Account No\.------------------/g,
          `Account No. ${invoice.accountNumber || "-"}`
        )
        .replace(
          /IFSC Code ---------------/g,
          `IFSC Code ${invoice.ifscCode || "N/A"}`
        )
        .replace(
          /UTR No\.---------------------/g,
          `UTR No. ${invoice.utrNo ? invoice.utrNo : "N/A"}`
        )
        .replace(
          /dated -------------/g,
          `dated ${invoice.invoiceDate || formattedDate}`
        );

      // Generate table rows for the invoice
      const tableRows = `
        <tr>
          <td>${invoice.particulars || "-"}</td>
          <td>${invoice.invoiceNo || "-"}<br>${invoice.invoiceDate || "-"}</td>
          <td>₹${Number(totalGrossAmount).toFixed(2)}</td>
          <td>₹${Number(totalTds).toFixed(2)}</td>
          <td>₹${Number(totalOtherDeductions).toFixed(2)}</td>
          <td>₹${Number(totalNetAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <th>TOTAL</th>
          <td></td>
          <td></td>
          <td>₹${totalGrossAmount.toFixed(2)}</td>
          <td>₹${totalTds.toFixed(2)}</td>
          <td>₹${totalOtherDeductions.toFixed(2)}</td>
        </tr>
      `;

      // Replace the table content dynamically
      const resultHtml = updatedHtml.replace(
        /<table[\s\S]*?<\/table>/i,
        `<table>
          <thead>
            <tr>
              <th>Particulars</th>
              <th>Invoice No/Date</th>
              <th>Gross Amount</th>
              <th>TDS</th>
              <th>Other Deductions</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>`
      );

      return resultHtml;
    } catch (error) {
      console.error("Error generating invoice HTML:", error);
      throw error;
    }
  };

  const handleShow = (incident) => {
    console.log("incident", incident);
    setSelectedIncident(incident);
    try {
      const html = generateInvoicePdf(incident);
      setInvoiceHtml(html);
      setIsPdfViewOpen(true);
    } catch (error) {
      toast.error("Failed to generate invoice: " + error.message);
    }
  };

  const closePdfView = () => {
    setIsPdfViewOpen(false);
    setSelectedIncident(null);
    setInvoiceHtml("");
  };

  const handleStatusChange = async (invoiceId, status) => {
    if (status === "Approved" && selectedIncident) {
      try {
        setIsSending(true);
        const html = generateInvoicePdf(selectedIncident);

        await dispatch(
          updateIncidentStatus({
            invoiceId: invoiceId,
            status,
            invoiceHtml: html,
          })
        );

        setIsSending(false);
        closePdfView();

        toast.success("The payment has been approved and invoice sent");
      } catch (error) {
        setIsSending(false);
        console.error("Error generating invoice:", error);
        toast.error("Failed to generate invoice: " + error.message);
      }
    } else {
      dispatch(
        updateIncidentStatus({
          invoiceId: invoiceId,
          status,
        })
      );
      closePdfView();

      if (status === "Approved") {
        toast.success("The payment has been approved");
      } else {
        toast.error("The payment has been rejected");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "Rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const handleAddPayment = () => {
    navigate("/payment/add_payment");
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1
          className="text-xl text-[#0E3B65] mb-4 uppercase"
          style={{ fontFamily: "Mukta" }}
        >
          Payments
        </h1>
        <div className="flex flex-col items-center gap-10 w-[100%]">
          <div className="flex justify-end w-[100%]">
            <Button onClick={handleAddPayment}>New Payment</Button>
          </div>
          <div className="w-[100%] border rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Recipient Name</TableHead>
                  <TableHead>Recipient Email</TableHead>
                  <TableHead>Recipient Address</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>IFSC Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>TDS</TableHead>
                  <TableHead>Other Deductions</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((invoice, index) => (
                  <TableRow key={invoice.refNo || index}>
                    {/* Invoice Fields */}
                    <TableCell>{invoice.refNo}</TableCell>
                    <TableCell>{invoice.recipientName}</TableCell>
                    <TableCell>{invoice.recipientEmail}</TableCell>
                    <TableCell>{invoice.recipientAddress}</TableCell>
                    <TableCell>{invoice.accountNumber}</TableCell>
                    <TableCell>{invoice.ifscCode}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{invoice.invoiceNo}</TableCell>
                    <TableCell>{invoice.grossAmount}</TableCell>
                    <TableCell>{invoice.tds}</TableCell>
                    <TableCell>{invoice.otherDeductions}</TableCell>
                    <TableCell>{invoice.netAmount}</TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status || "Pending")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          className="px-2 py-0.5 text-xs border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                          size="sm"
                          onClick={() => openInvoiceEditDialog(invoice, 0)}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteConfirmation(invoice)}
                        >
                          <FaTrash className="mr-2" /> Delete
                        </Button>
                        <Button
                          variant="outline"
                          className="px-2 py-0.5 text-xs border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                          size="sm"
                          onClick={() => handleShow(invoice)}
                        >
                          <FaEye className="mr-1" /> Show
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Invoice Edit Dialog */}
          <InvoiceEditDialog
            isOpen={isInvoiceEditDialogOpen}
            onClose={closeInvoiceEditDialog}
            paymentId={selectedIncident?._id}
            invoice={selectedInvoice}
            invoiceIndex={selectedInvoiceIndex}
          />

          <Dialog open={isPdfViewOpen} onOpenChange={closePdfView}>
            <DialogContent className="w-[90vw] sm:w-[1650px] h-auto max-h-[90vh] p-0 rounded-lg overflow-y-auto">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Payment Invoice</DialogTitle>
              </DialogHeader>

              <div className="w-full h-[500px] overflow-auto">
                {invoiceHtml ? (
                  <iframe
                    srcDoc={invoiceHtml}
                    title="Payment Invoice"
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin"
                  />
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <span className="ml-2">Loading invoice...</span>
                  </div>
                )}
              </div>

              {/* Modified condition to show buttons for both Pending and Rejected status */}
              {(selectedIncident?.status === "Pending" ||
                selectedIncident?.status === "Rejected" ||
                !selectedIncident?.status) && (
                <DialogFooter className="flex justify-end p-4 bg-white border-t">
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() =>
                      handleStatusChange(selectedIncident._id, "Rejected")
                    }
                    disabled={isSending}
                  >
                    Reject Payment
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      handleStatusChange(selectedIncident._id, "Approved")
                    }
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaCheck className="mr-2" /> Approve & Send Invoice
                      </>
                    )}
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={isConfirmDialogOpen}
            onOpenChange={closeDeleteConfirmation}
          >
            <DialogContent className="max-w-[90vw] w-auto">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to delete the payment for{" "}
                <strong>{selectedIncident?.recipientName}</strong>?
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={closeDeleteConfirmation}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteIncident(selectedIncident._id)}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
