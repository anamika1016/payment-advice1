import Layout from "@/components/layout/Layout";
import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaEdit,
  FaEye,
  FaTrash,
  FaEnvelope,
  FaSearch,
  FaPaperPlane,
} from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [logoImage, setLogoImage] = useState(null);
  const [paplImage, setPaplImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [asaImage, setAsaImage] = useState(null);

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
    loadImages();
  }, [dispatch]);

  // New function to load and encode images
  const convertToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const loadImages = async () => {
    try {
      // Load logo image
      const logoResponse = await fetch("/img/papllogo.jpg");
      if (!logoResponse.ok) throw new Error("Failed to load papllogo.jpg");
      const logoBlob = await logoResponse.blob();
      const logoBase64 = await convertToBase64(logoBlob);
      setLogoImage(logoBase64);

      // Load ASA image
      const asaResponse = await fetch("/img/asa.png");
      if (!asaResponse.ok) throw new Error("Failed to load asa.png");
      const asaBlob = await asaResponse.blob();
      const asaBase64 = await convertToBase64(asaBlob);
      setAsaImage(asaBase64); // Make sure you have this state declared

      // Load PAPL image
      const paplResponse = await fetch("/img/papl.png");
      if (!paplResponse.ok) throw new Error("Failed to load papl.png");
      const paplBlob = await paplResponse.blob();
      const paplBase64 = await convertToBase64(paplBlob);
      setPaplImage(paplBase64);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Failed to load images for invoice");
    }
  };

  const fetchInvoiceTemplate = async () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const company = user?.company?.toLowerCase(); // Normalize the name

      let templatePath = "";

      switch (company) {
        case "papl":
          templatePath = "/pdf/papltem.html";
          break;
        case "asa":
          templatePath = "/pdf/asatem.html";
          break;
        default:
          throw new Error("Unknown company template");
      }

      const response = await fetch(templatePath);

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

  const generateInvoicePdf = (incident) => {
    try {
      if (!invoiceTemplate) {
        throw new Error("Invoice template not loaded");
      }

      console.log("Invoice data to populate:", incident);

      let html = invoiceTemplate;

      if (logoImage) {
        html = html.replace(/src=["'].*?logo\.jpg["']/g, `src="${logoImage}"`);
        html = html.replace(/src=["'].*?logo\.png["']/g, `src="${logoImage}"`);
      }
      if (asaImage) {
        html = html.replace(/src=["'].*?asa\.png["']/g, `src="${asaImage}"`);
      }
      if (paplImage) {
        html = html.replace(/src=["'].*?papl\.png["']/g, `src="${paplImage}"`);
        html = html.replace(/src=["'].*?papl\.jpg["']/g, `src="${paplImage}"`);
      }

      // Format the transaction date
      const transactionDate = incident.transactionDate
        ? new Date(incident.transactionDate)
            .toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-")
        : new Date()
            .toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-");

      // Format invoice date for invoice-specific fields
      const invoiceDate = incident.invoiceDate
        ? new Date(incident.invoiceDate)
            .toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .replace(/\//g, "-")
        : "-";

      // Calculate total amounts across all invoices
      let allInvoices = [];
      const mainInvoice = {
        invoiceNo: incident.invoiceNo || "-",
        invoiceDate: invoiceDate,
        particulars: incident.particulars || "-",
        grossAmount: incident.grossAmount || 0,
        tds: incident.tds || 0,
        otherDeductions: incident.otherDeductions || 0,
        netAmount: incident.netAmount || 0,
      };
      allInvoices.push(mainInvoice);

      // Add additional invoices if they exist
      if (
        incident.additionalInvoices &&
        incident.additionalInvoices.length > 0
      ) {
        incident.additionalInvoices.forEach((invoice) => {
          const additionalInvoiceDate = invoice.invoiceDate
            ? new Date(invoice.invoiceDate)
                .toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "-")
            : "-";

          allInvoices.push({
            invoiceNo: invoice.invoiceNo || "-",
            invoiceDate: additionalInvoiceDate,
            particulars: invoice.particulars || "-",
            grossAmount: invoice.grossAmount || 0,
            tds: invoice.tds || 0,
            otherDeductions: invoice.otherDeductions || 0,
            netAmount: invoice.netAmount || 0,
          });
        });
      }

      // Calculate grand totals
      const totalGrossAmount = allInvoices.reduce(
        (sum, inv) => sum + (inv.grossAmount || 0),
        0
      );
      const totalTds = allInvoices.reduce(
        (sum, inv) => sum + (inv.tds || 0),
        0
      );
      const totalOtherDeductions = allInvoices.reduce(
        (sum, inv) => sum + (inv.otherDeductions || 0),
        0
      );
      const totalNetAmount = allInvoices.reduce(
        (sum, inv) => sum + (inv.netAmount || 0),
        0
      );

      let updatedHtml = html
        .replace(
          /Invoice No\/Date/g,
          `Invoice No: ${mainInvoice.invoiceNo} / Date: ${invoiceDate}`
        )
        .replace(/<p>Date<\/p>/g, `<p>Date: ${transactionDate}</p>`) // Use transaction date here
        .replace(
          /<p>Ref No\.<br><\/p>/g,
          `<p>Ref No.: ${incident.refNo || "-"}<br></p>`
        )
        .replace(
          /<p>To,<br><\/p>/g,
          `<p>To,<br>${incident.recipientName || ""}<br>${
            incident.recipientAddress || ""
          }</p>`
        )
        .replace(/Rs\.\s*-+/g, `Rs. ${totalNetAmount.toFixed(2)}`)
        .replace(
          /Account No\.\s*-+/g,
          `Account No. ${incident.accountNumber || "-"}`
        )
        .replace(/IFSC Code\s*-+/g, `IFSC Code ${incident.ifscCode || "N/A"}`)
        .replace(
          /UTR No\.\s*-+/g,
          `UTR No. ${incident.utrNo ? incident.utrNo : "N/A"}`
        )
        .replace(/dated\s*-+/g, `dated ${formatDate(incident.date || "")}`);

      let processedHtml = updatedHtml;

      // Create table rows for each invoice
      let invoiceRows = allInvoices
        .map(
          (invoice) => `
        <tr>
          <td style="border: 1px solid black; padding: 8px;">${
            invoice.particulars
          }</td>
          <td style="border: 1px solid black; padding: 8px;">
            ${invoice.invoiceNo}<br>
            ${invoice.invoiceDate}
          </td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">₹${invoice.grossAmount.toFixed(
            2
          )}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">₹${invoice.tds.toFixed(
            2
          )}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">₹${invoice.otherDeductions.toFixed(
            2
          )}</td>
          <td style="border: 1px solid black; padding: 8px; text-align: right;">₹${invoice.netAmount.toFixed(
            2
          )}</td>
        </tr>
      `
        )
        .join("");

      const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid black;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 8px; text-align: left;">Particulars</th>
            <th style="border: 1px solid black; padding: 8px; text-align: left;">Invoice No/Date</th>
            <th style="border: 1px solid black; padding: 8px; text-align: right;">Gross Amount</th>
            <th style="border: 1px solid black; padding: 8px; text-align: right;">TDS</th>
            <th style="border: 1px solid black; padding: 8px; text-align: right;">Other Deductions</th>
            <th style="border: 1px solid black; padding: 8px; text-align: right;">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceRows}
          <tr>
            <td style="border: 1px solid black; padding: 8px; font-weight: bold;" colspan="2">TOTAL</td>
            <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;"></td>
            <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;"></td>
            <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;"></td>
            <td style="border: 1px solid black; padding: 8px; text-align: right; font-weight: bold;">₹${totalNetAmount.toFixed(
              2
            )}</td>
          </tr>
        </tbody>
      </table>
      `;

      if (processedHtml.includes("<!-- TABLE_PLACEHOLDER -->")) {
        processedHtml = processedHtml.replace(
          "<!-- TABLE_PLACEHOLDER -->",
          tableHtml
        );
      } else {
        processedHtml = processedHtml.replace(
          /<table[\s\S]*?<\/table>/i,
          tableHtml
        );
        if (!processedHtml.includes(tableHtml)) {
          processedHtml = processedHtml.replace(
            "</body>",
            tableHtml + "</body>"
          );
        }
      }

      console.log("Final HTML with table:", processedHtml);
      return processedHtml;
    } catch (error) {
      console.error("Error generating invoice HTML:", error);
      throw error;
    }
  };
  function formatDate(dateString) {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }

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

  // Add new resend function
  const handleResendInvoice = async (invoiceId) => {
    if (selectedIncident) {
      try {
        setIsResending(true);
        const html = generateInvoicePdf(selectedIncident);

        await dispatch(
          updateIncidentStatus({
            invoiceId: invoiceId,
            status: "Approved", // Keep the status as approved
            invoiceHtml: html,
          })
        );

        setIsResending(false);
        toast.success("Invoice has been resent successfully");
      } catch (error) {
        setIsResending(false);
        console.error("Error resending invoice:", error);
        toast.error("Failed to resend invoice: " + error.message);
      }
    }
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

  // Filter the incidents based on search term
  const filteredIncidents = incidents.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (invoice.refNo?.toLowerCase() || "").includes(searchLower) ||
      (invoice.recipientName?.toLowerCase() || "").includes(searchLower) ||
      (invoice.recipientEmail?.toLowerCase() || "").includes(searchLower) ||
      (invoice.recipientAddress?.toLowerCase() || "").includes(searchLower) ||
      (invoice.accountNumber?.toString().toLowerCase() || "").includes(
        searchLower
      ) ||
      (invoice.ifscCode?.toLowerCase() || "").includes(searchLower) ||
      (invoice.amount?.toString().toLowerCase() || "").includes(searchLower) ||
      (invoice.invoiceNo?.toLowerCase() || "").includes(searchLower) ||
      (invoice.grossAmount?.toString().toLowerCase() || "").includes(
        searchLower
      ) ||
      (invoice.netAmount?.toString().toLowerCase() || "").includes(
        searchLower
      ) ||
      (invoice.status?.toLowerCase() || "").includes(searchLower)
    );
  });

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-xl text-[#0E3B65] uppercase"
            style={{ fontFamily: "Mukta" }}
          >
            Payments
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 w-full">
          <div className="flex justify-end w-full">
            <Button onClick={handleAddPayment}>New Payment</Button>
          </div>
          <div className="w-full border rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Recipient Name</TableHead>
                  <TableHead>Recipient Email</TableHead>
                  <TableHead>Recipient Address</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>IFSC Code</TableHead>
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
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((invoice, index) => (
                    <TableRow key={invoice.refNo || index}>
                      {/* Invoice Fields */}
                      <TableCell>{invoice.refNo}</TableCell>
                      <TableCell>{invoice.recipientName}</TableCell>
                      <TableCell>{invoice.recipientEmail}</TableCell>
                      <TableCell>{invoice.recipientAddress}</TableCell>
                      <TableCell>{invoice.accountNumber}</TableCell>
                      <TableCell>{invoice.ifscCode}</TableCell>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-4">
                      No matching payments found
                    </TableCell>
                  </TableRow>
                )}
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

              {/* Add resend button if status is already approved */}
              {selectedIncident?.status === "Approved" && (
                <DialogFooter className="flex justify-end p-4 bg-white border-t">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleResendInvoice(selectedIncident._id)}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" /> Resend Invoice
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
