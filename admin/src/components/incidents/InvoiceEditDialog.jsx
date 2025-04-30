import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  fetchRecipientByName,
  updateIncident,
} from "@/redux/incidents/incidentSlice";
import SearchResults from "./SearchResult";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const InvoiceEditDialog = ({
  isOpen,
  onClose,
  paymentId,
  invoice,
  invoiceIndex,
}) => {
  const dispatch = useDispatch();
  const { recipientNames, payment } = useSelector((state) => state.incidents);
  const [invoiceData, setInvoiceData] = useState({});

  useEffect(() => {
    if (invoice) {
      // Ensure additionalInvoices exists
      setInvoiceData({
        ...invoice,
        additionalInvoices: invoice.additionalInvoices || [],
      });
    }
  }, [invoice]);

  const handleInputChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });

    // Auto-calculation for netAmount
    if (["grossAmount", "tds", "otherDeductions"].includes(field)) {
      const grossAmount =
        field === "grossAmount"
          ? parseFloat(value) || 0
          : parseFloat(invoiceData.grossAmount) || 0;
      const tds =
        field === "tds"
          ? parseFloat(value) || 0
          : parseFloat(invoiceData.tds) || 0;
      const otherDeductions =
        field === "otherDeductions"
          ? parseFloat(value) || 0
          : parseFloat(invoiceData.otherDeductions) || 0;

      setInvoiceData((prev) => ({
        ...prev,
        netAmount: (grossAmount - tds - otherDeductions).toFixed(2),
      }));
    }
  };

  const handleRecipientSearch = (value) => {
    // Update the recipientName field
    handleInputChange("recipientName", value);
    // Fetch matching recipients
    dispatch(fetchRecipientByName({ namePrefix: value.toLowerCase() }));
  };

  const handleRecipientSelect = (field, value) => {
    // If receiving the entire recipient data object
    if (field === "recipient_data") {
      // Map recipient data fields to our invoice fields
      setInvoiceData({
        ...invoiceData,
        recipientName: value.name || "",
        recipientEmail: value.email || "",
        recipientAddress: value.bankAddress
          ? `${value.bankAddress}${
              value.district ? `, ${value.district}` : ""
            }${value.state ? `, ${value.state}` : ""}`
          : "",
        accountNumber: value.accountNumber || "",
        ifscCode: value.ifscCode || "",
        phone: value.phone || "",
      });
    } else {
      // Handle individual field updates (backward compatibility)
      const fieldMapping = {
        recipient_name: "recipientName",
        recipient_email: "recipientEmail",
        recipient_address: "recipientAddress",
        account_number: "accountNumber",
        ifsc_code: "ifscCode",
        phone: "phone",
      };

      const mappedField = fieldMapping[field] || field;
      setInvoiceData({
        ...invoiceData,
        [mappedField]: value,
      });
    }
  };

  const handleSave = () => {
    // Check if invoice has an ID (existing invoice)
    const invoiceId = invoiceData?._id;

    if (invoiceId) {
      // Method 1: If we need to update a specific invoice by its ID
      dispatch(
        updateIncident({
          id: invoiceId, // Use the invoice's ID for the endpoint
          incidentData: invoiceData,
        })
      ).then(() => {
        onClose();
      });
    } else if (payment && payment.invoices && payment.invoices[invoiceIndex]) {
      // Method 2: If we're updating an invoice in a payment object by index
      const updatedPayment = { ...payment };
      updatedPayment.invoices[invoiceIndex] = invoiceData;

      dispatch(
        updateIncident({
          id: paymentId,
          incidentData: updatedPayment,
        })
      ).then(() => {
        onClose();
      });
    } else {
      // Method 3: Fallback - Update with both pieces of information
      dispatch(
        updateIncident({
          id: paymentId,
          invoiceIndex: invoiceIndex,
          invoiceData: invoiceData,
        })
      ).then(() => {
        onClose();
      });
    }
  };

  // Function to add a new additional invoice
  const addAdditionalInvoice = () => {
    const newAdditionalInvoice = {
      invoiceNo: "",
      invoiceDate: "",
      particulars: "",
      grossAmount: "",
      tds: "",
      otherDeductions: "",
      netAmount: "",
    };

    setInvoiceData({
      ...invoiceData,
      additionalInvoices: [
        ...(invoiceData.additionalInvoices || []),
        newAdditionalInvoice,
      ],
    });
  };

  // Function to handle changes to additional invoice fields
  const handleAdditionalInvoiceChange = (additionalIndex, field, value) => {
    const updatedAdditionalInvoices = [
      ...(invoiceData.additionalInvoices || []),
    ];
    const additionalInvoice = {
      ...updatedAdditionalInvoices[additionalIndex],
      [field]: value,
    };

    // Calculate netAmount for additional invoice
    if (["grossAmount", "tds", "otherDeductions"].includes(field)) {
      const grossAmount =
        field === "grossAmount"
          ? parseFloat(value) || 0
          : parseFloat(additionalInvoice.grossAmount) || 0;

      const tds =
        field === "tds"
          ? parseFloat(value) || 0
          : parseFloat(additionalInvoice.tds) || 0;

      const otherDeductions =
        field === "otherDeductions"
          ? parseFloat(value) || 0
          : parseFloat(additionalInvoice.otherDeductions) || 0;

      additionalInvoice.netAmount = (
        grossAmount -
        tds -
        otherDeductions
      ).toFixed(2);
    }

    updatedAdditionalInvoices[additionalIndex] = additionalInvoice;

    setInvoiceData({
      ...invoiceData,
      additionalInvoices: updatedAdditionalInvoices,
    });
  };

  // Function to remove an additional invoice
  const removeAdditionalInvoice = (additionalIndex) => {
    const updatedAdditionalInvoices = [
      ...(invoiceData.additionalInvoices || []),
    ];
    updatedAdditionalInvoices.splice(additionalIndex, 1);

    setInvoiceData({
      ...invoiceData,
      additionalInvoices: updatedAdditionalInvoices,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[80%] h-auto max-h-[90vh] rounded-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="refNo">Reference Number</Label>
            <Input
              id="refNo"
              type="text"
              value={invoiceData.refNo || ""}
              onChange={(e) => handleInputChange("refNo", e.target.value)}
              placeholder="Enter Reference Number"
            />
          </div>

          <div>
            <SearchResults
              id="recipientName"
              label="Recipient Name"
              items={recipientNames || []}
              value={invoiceData.recipientName || ""}
              onInputChange={(_, value) => handleRecipientSearch(value)}
              onItemSelect={handleRecipientSelect}
              placeholder="Search for recipient..."
            />
          </div>

          <div>
            <Label htmlFor="recipientEmail" className="required-input">
              Recipient Email
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              value={invoiceData.recipientEmail || ""}
              onChange={(e) =>
                handleInputChange("recipientEmail", e.target.value)
              }
              placeholder="Enter Recipient Email"
              required
            />
          </div>

          <div>
            <Label htmlFor="recipientAddress">Address</Label>
            <Input
              id="recipientAddress"
              type="text"
              value={invoiceData.recipientAddress || ""}
              onChange={(e) =>
                handleInputChange("recipientAddress", e.target.value)
              }
              placeholder="Enter Recipient Address"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="text"
              value={invoiceData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter Phone Number"
            />
          </div>

          <div>
            <Label htmlFor="accountNumber" className="required-input">
              Account Number
            </Label>
            <Input
              id="accountNumber"
              type="text"
              value={invoiceData.accountNumber || ""}
              onChange={(e) =>
                handleInputChange("accountNumber", e.target.value)
              }
              placeholder="Enter Account Number"
              required
            />
          </div>

          <div>
            <Label htmlFor="ifscCode" className="required-input">
              IFSC Code
            </Label>
            <Input
              id="ifscCode"
              type="text"
              value={invoiceData.ifscCode || ""}
              onChange={(e) => handleInputChange("ifscCode", e.target.value)}
              placeholder="Enter IFSC Code"
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={invoiceData.date || ""}
              onChange={(e) => handleInputChange("date", e.target.value)}
              placeholder="Enter Date"
            />
          </div>

          <div>
            <Label htmlFor="particulars">Particulars</Label>
            <Input
              id="particulars"
              type="text"
              value={invoiceData.particulars || ""}
              onChange={(e) => handleInputChange("particulars", e.target.value)}
              placeholder="Enter Particulars"
            />
          </div>

          <div>
            <Label htmlFor="invoiceNo">Invoice Number/RFP Number</Label>
            <Input
              id="invoiceNo"
              type="text"
              value={invoiceData.invoiceNo || ""}
              onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
              placeholder="Enter Invoice Number"
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate">Invoice Date/RFP Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoiceData.invoiceDate || ""}
              onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
              placeholder="Enter Invoice Date"
            />
          </div>

          <div>
            <Label htmlFor="grossAmount">Gross Amount</Label>
            <Input
              id="grossAmount"
              type="number"
              step="0.01"
              value={invoiceData.grossAmount || ""}
              onChange={(e) => handleInputChange("grossAmount", e.target.value)}
              placeholder="Enter Gross Amount"
            />
          </div>

          <div>
            <Label htmlFor="tds">TDS</Label>
            <Input
              id="tds"
              type="number"
              step="0.01"
              value={invoiceData.tds || ""}
              onChange={(e) => handleInputChange("tds", e.target.value)}
              placeholder="Enter TDS"
            />
          </div>

          <div>
            <Label htmlFor="otherDeductions">
              Other Deductions/Advance Adjustment
            </Label>
            <Input
              id="otherDeductions"
              type="number"
              step="0.01"
              value={invoiceData.otherDeductions || ""}
              onChange={(e) =>
                handleInputChange("otherDeductions", e.target.value)
              }
              placeholder="Enter Other Deductions"
            />
          </div>

          <div>
            <Label htmlFor="netAmount">Net Amount</Label>
            <Input
              id="netAmount"
              type="number"
              step="0.01"
              value={invoiceData.netAmount || ""}
              readOnly
              className="bg-gray-50"
              placeholder="Calculated automatically"
            />
          </div>
        </div>

        {/* Additional Invoices Section */}
        {invoiceData.additionalInvoices &&
          invoiceData.additionalInvoices.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-2">Additional Invoices</h4>
              {invoiceData.additionalInvoices.map(
                (additionalInvoice, additionalIndex) => (
                  <div
                    key={additionalIndex}
                    className="border p-3 rounded mt-2 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">
                        Additional Invoice #{additionalIndex + 1}
                      </h5>
                      <Button
                        className="bg-red-500 hover:bg-red-600 text-white text-xs py-1"
                        onClick={() => removeAdditionalInvoice(additionalIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor={`additionalInvoiceNo_${additionalIndex}`}
                        >
                          Invoice Number
                        </Label>
                        <Input
                          id={`additionalInvoiceNo_${additionalIndex}`}
                          type="text"
                          value={additionalInvoice.invoiceNo || ""}
                          onChange={(e) =>
                            handleAdditionalInvoiceChange(
                              additionalIndex,
                              "invoiceNo",
                              e.target.value
                            )
                          }
                          placeholder="Enter Invoice Number"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`additionalInvoiceDate_${additionalIndex}`}
                        >
                          Invoice Date
                        </Label>
                        <Input
                          id={`additionalInvoiceDate_${additionalIndex}`}
                          type="date"
                          value={additionalInvoice.invoiceDate || ""}
                          onChange={(e) =>
                            handleAdditionalInvoiceChange(
                              additionalIndex,
                              "invoiceDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`additionalParticulars_${additionalIndex}`}
                        >
                          Particulars
                        </Label>
                        <Input
                          id={`additionalParticulars_${additionalIndex}`}
                          type="text"
                          value={additionalInvoice.particulars || ""}
                          onChange={(e) =>
                            handleAdditionalInvoiceChange(
                              additionalIndex,
                              "particulars",
                              e.target.value
                            )
                          }
                          placeholder="Enter Particulars"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`additionalGrossAmount_${additionalIndex}`}
                        >
                          Gross Amount
                        </Label>
                        <Input
                          id={`additionalGrossAmount_${additionalIndex}`}
                          type="number"
                          step="0.01"
                          value={additionalInvoice.grossAmount || ""}
                          onChange={(e) =>
                            handleAdditionalInvoiceChange(
                              additionalIndex,
                              "grossAmount",
                              e.target.value
                            )
                          }
                          placeholder="Enter Gross Amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`additionalTds_${additionalIndex}`}>
                          TDS
                        </Label>
                        <Input
                          id={`additionalTds_${additionalIndex}`}
                          type="number"
                          step="0.01"
                          value={additionalInvoice.tds || ""}
                          onChange={(e) =>
                            handleAdditionalInvoiceChange(
                              additionalIndex,
                              "tds",
                              e.target.value
                            )
                          }
                          placeholder="Enter TDS"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`additionalOtherDeductions_${additionalIndex}`}
                        >
                          Other Deductions
                        </Label>
                        <Input
                          id={`additionalOtherDeductions_${additionalIndex}`}
                          type="number"
                          step="0.01"
                          value={additionalInvoice.otherDeductions || ""}
                          onChange={(e) =>
                            handleAdditionalInvoiceChange(
                              additionalIndex,
                              "otherDeductions",
                              e.target.value
                            )
                          }
                          placeholder="Enter Other Deductions"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`additionalNetAmount_${additionalIndex}`}
                        >
                          Net Amount
                        </Label>
                        <Input
                          id={`additionalNetAmount_${additionalIndex}`}
                          type="number"
                          step="0.01"
                          value={additionalInvoice.netAmount || ""}
                          readOnly
                          className="bg-gray-50"
                          placeholder="Calculated automatically"
                        />
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        {/* Add additional invoice button */}
        {/* <div className="mt-4">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={addAdditionalInvoice}
          >
            Add Invoice for this Recipient
          </Button>
        </div> */}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceEditDialog;
