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
  const { recipientNames } = useSelector((state) => state.incidents);
  const [invoiceData, setInvoiceData] = useState({});

  useEffect(() => {
    if (invoice) {
      setInvoiceData({ ...invoice });
    }
  }, [invoice]);

  const handleInputChange = (field, value) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    });
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
    dispatch(
      updateIncident({
        id: paymentId,
        incidentData: invoiceData,
      })
    );
    onClose();
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
            <Label htmlFor="status">Paticulers</Label>
            <Input
              id="particulars"
              type="text"
              value={invoiceData.particulars || ""}
              onChange={(e) => handleInputChange("particulars", e.target.value)}
              placeholder="Enter Particulars"
            />
          </div>

          <div>
            <Label htmlFor="invoiceNo">Invoice Number</Label>
            <Input
              id="invoiceNo"
              type="text"
              value={invoiceData.invoiceNo || ""}
              onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
              placeholder="Enter Invoice Number"
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate">Invoice Date</Label>
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
            <Label htmlFor="otherDeductions">Other Deductions</Label>
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
              onChange={(e) => handleInputChange("netAmount", e.target.value)}
              placeholder="Enter Net Amount"
            />
          </div>
        </div>

        <DialogFooter>
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
