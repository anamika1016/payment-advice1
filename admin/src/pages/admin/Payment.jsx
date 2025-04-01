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

const Payment = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isPdfViewOpen, setIsPdfViewOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [invoiceHtml, setInvoiceHtml] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [invoiceTemplate, setInvoiceTemplate] = useState("");

  const { incidents } = useSelector((state) => state.incidents);
  const dispatch = useDispatch();

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

  const generateInvoicePdf = (incident) => {
    try {
      if (!invoiceTemplate) {
        throw new Error("Invoice template not loaded");
      }

      let html = invoiceTemplate;

      html = html
        .replace("{{customer_name}}", incident.recipientName || "Customer")
        .replace("{{invoice_number}}", incident.invoiceNo || "INV-000")
        .replace("{{invoice_amount}}", `₹${incident.amount || "0.00"}`)
        .replace("{{payment_date}}", incident.invoiceDate || "01/01/2025")
        .replace("{{invoice_download_link}}", "#")
        .replace("{{company_name}}", "Your Company")
        .replace("{{company_email}}", "support@yourcompany.com");

      return html;
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
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

  const sendInvoiceEmail = async (incident) => {
    setIsSending(true);
    try {
      const html = generateInvoicePdf(incident);

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(`Invoice sent to ${incident.recipientEmail}`);

      return true;
    } catch (error) {
      console.error("Error sending invoice email:", error);
      toast.error("Failed to send invoice email: " + error.message);
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (status === "Approved" && selectedIncident) {
      try {
        const html = generateInvoicePdf(selectedIncident);

        // Update the status and send the invoice
        dispatch(
          updateIncidentStatus({
            id,
            status,
            invoiceHtml: html,
          })
        );

        closePdfView();

        toast.success("The payment has been approved and invoice sent");
      } catch (error) {
        console.error("Error generating invoice:", error);
        toast.error("Failed to generate invoice: " + error.message);
      }
    } else {
      // Just update the status
      dispatch(updateIncidentStatus({ id, status }));
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
            <Button onClick={() => openIncidentDialog(null)}>
              New Payment
            </Button>
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
                {incidents.map((incident) =>
                  incident.invoices.map((invoice, index) => (
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
                            onClick={() => openIncidentDialog(incident)}
                          >
                            <FaEdit className="mr-2" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteConfirmation(incident)}
                          >
                            <FaTrash className="mr-2" /> Delete
                          </Button>
                          <Button
                            variant="outline"
                            className="px-2 py-0.5 text-xs border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white"
                            size="sm"
                            onClick={() => handleShow(incident)}
                          >
                            <FaEye className="mr-1" /> Show
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogContent className="w-[90vw] sm:w-[600px] h-auto max-h-[90vh] p-6 rounded-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedIncident ? "Edit Payment" : "New Payment"}
                </DialogTitle>
              </DialogHeader>
              <PaymentForm incident={selectedIncident} onClose={closeDialog} />
            </DialogContent>
          </Dialog>

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

              {(selectedIncident?.status === "Pending" ||
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

              {selectedIncident?.status === "Approved" && (
                <DialogFooter className="flex justify-end p-4 bg-white border-t">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => sendInvoiceEmail(selectedIncident)}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaEnvelope className="mr-2" /> Resend Invoice
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
                <strong>{selectedIncident?.recipient_name}</strong>?
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