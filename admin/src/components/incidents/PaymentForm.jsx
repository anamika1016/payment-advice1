import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  addIncident,
  fetchRecipientByName,
  resetIncident,
  setIncidentData,
  updateIncident,
} from "@/redux/incidents/incidentSlice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import SearchResults from "./SearchResult";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const PaymentForm = ({ incident, onClose }) => {
  const dispatch = useDispatch();
  const { incidentData, recipientNames } = useSelector(
    (state) => state.incidents
  );
  console.log("recipientNames", recipientNames);

  useEffect(() => {
    if (incident) {
      const formattedIncident = {
        ...incident,
        invoices: incident.invoices || [],
      };
      dispatch(setIncidentData(formattedIncident));
    } else {
      dispatch(
        setIncidentData({
          paymentType: "",
          utrNo: "",
          bankName: "",
          senderAccountNumber: "",
          amount: null,
          transactionDate: new Date().toISOString().split("T")[0],
          invoices: [],
        })
      );
    }

    return () => dispatch(resetIncident());
  }, [incident, dispatch]);

  const handleChange = (id, value) => {
    dispatch(setIncidentData({ [id]: value }));
    if (id === "recipientName") {
      dispatch(fetchRecipientByName({ namePrefix: value.toLowerCase() }));
    }
  };

  const onSelectChange = (id, value) => {
    dispatch(setIncidentData({ [id]: value }));
  };

  const onInputChange = (e) => {
    const { id, value } = e.target;
    dispatch(
      setIncidentData({
        ...incidentData,
        [id]: value,
      })
    );
  };

  const handleSubmit = () => {
    const dataToSubmit = { ...incidentData };
    
    // Map field names to match schema before submission
    if (dataToSubmit.invoices && dataToSubmit.invoices.length > 0) {
      dataToSubmit.invoices = dataToSubmit.invoices.map(invoice => ({
        refNo: invoice.refNo,
        recipientName: invoice.recipientName,
        recipientEmail: invoice.recipientEmail,
        recipientAddress: invoice.recipientAddress,
        accountNumber: invoice.accountNumber,
        ifscCode: invoice.ifscCode,
        amount: invoice.amount,
        invoiceNo: invoice.invoiceNo,
        grossAmount: invoice.grossAmount,
        tds: invoice.tds,
        otherDeductions: invoice.otherDeductions,
        netAmount: invoice.netAmount,
        status: invoice.status || "Pending"
      }));
    }

    console.log("Submitting data:", dataToSubmit);

    if (incident) {
      dispatch(
        updateIncident({ id: dataToSubmit._id, incidentData: dataToSubmit })
      );
    } else {
      dispatch(addIncident(dataToSubmit));
    }
    onClose();
  };

  const handleInvoiceChange = (index, field, value) => {
    const updatedInvoices = [...(incidentData.invoices || [])];
    updatedInvoices[index] = { ...updatedInvoices[index], [field]: value };
    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  const addInvoice = () => {
    dispatch(
      setIncidentData({
        invoices: [
          ...(incidentData.invoices || []),
          {
            refNo: "",
            recipientName: "",
            recipientEmail: "",
            recipientAddress: "",
            accountNumber: "",
            ifscCode: "",
            amount: "",
            invoiceNo: "",
            invoiceDate: new Date().toISOString().split("T")[0],
            grossAmount: "",
            tds: "",
            otherDeductions: "",
            netAmount: "",
            status: "Pending"
          },
        ],
      })
    );
  };

  const removeInvoice = (index) => {
    const updatedInvoices = [...(incidentData.invoices || [])];
    updatedInvoices.splice(index, 1);
    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Label htmlFor="paymentType" className="required-input">
          Payment Type
        </Label>
        <Select
          value={incidentData.paymentType}
          onValueChange={(value) => onSelectChange("paymentType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nft">NFT</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="utrNo" className="required-input">
          UTR Number
        </Label>
        <Input
          id="utrNo"
          type="text"
          value={incidentData.utrNo || ""}
          onChange={onInputChange}
          placeholder="Enter UTR Number"
          required
        />
      </div>

      <div>
        <Label htmlFor="bankName" className="required-input">
          Bank Name
        </Label>
        <Input
          id="bankName"
          type="text"
          value={incidentData.bankName || ""}
          onChange={onInputChange}
          placeholder="Enter Bank Name"
          required
        />
      </div>

      <div>
        <Label htmlFor="senderAccountNumber" className="required-input">
          Account Number
        </Label>
        <Input
          id="senderAccountNumber"
          type="text"
          value={incidentData.senderAccountNumber || ""}
          onChange={onInputChange}
          placeholder="Enter Account Number"
          required
        />
      </div>

      <div>
        <Label htmlFor="amount" className="required-input">
          Amount
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={incidentData.amount || ""}
          onChange={onInputChange}
          placeholder="Enter Amount"
          required
        />
      </div>

      <div>
        <Label htmlFor="transactionDate" className="required-input">
          Transaction Date
        </Label>
        <Input
          id="transactionDate"
          type="date"
          value={
            incidentData.transactionDate
              ? new Date(incidentData.transactionDate)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0]
          }
          onChange={onInputChange}
          required
        />
      </div>

      {/* Invoice Fields */}
      <div>
        <h3 className="text-lg font-semibold">Invoices</h3>
        <div className="text-sm text-gray-500 mb-2">
          Add one or more invoice details below
        </div>

        {(incidentData.invoices || []).map((invoice, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-sm mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`refNo_${index}`}>Reference Number</Label>
                <Input
                  id={`refNo_${index}`}
                  type="text"
                  value={invoice.refNo || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "refNo", e.target.value)
                  }
                  placeholder="Enter Reference Number"
                />
              </div>

              <div>
                <Label htmlFor={`recipientName_${index}`} className="required-input">
                  Recipient Name
                </Label>
                <Input
                  id={`recipientName_${index}`}
                  type="text"
                  value={invoice.recipientName || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "recipientName", e.target.value)
                  }
                  placeholder="Enter Recipient Name"
                  required
                />
              </div> 

              <div>
                <Label htmlFor={`recipientEmail_${index}`} className="required-input">
                  Recipient Email
                </Label>
                <Input
                  id={`recipientEmail_${index}`}
                  type="email"
                  value={invoice.recipientEmail || ""}
                  onChange={(e) =>
                    handleInvoiceChange(
                      index,
                      "recipientEmail",
                      e.target.value
                    )
                  }
                  placeholder="Enter Recipient Email"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`recipientAddress_${index}`}>
                  Bank Address
                </Label>
                <Input
                  id={`recipientAddress_${index}`}
                  type="text"
                  value={invoice.recipientAddress || ""}
                  onChange={(e) =>
                    handleInvoiceChange(
                      index,
                      "recipientAddress",
                      e.target.value
                    )
                  }
                  placeholder="Enter Recipient Address"
                />
              </div>

              <div>
                <Label htmlFor={`accountNumber_${index}`} className="required-input">
                  Account Number
                </Label>
                <Input
                  id={`accountNumber_${index}`}
                  type="text"
                  value={invoice.accountNumber || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "accountNumber", e.target.value)
                  }
                  placeholder="Enter Account Number"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`ifscCode_${index}`} className="required-input">IFSC Code</Label>
                <Input
                  id={`ifscCode_${index}`}
                  type="text"
                  value={invoice.ifscCode || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "ifscCode", e.target.value)
                  }
                  placeholder="Enter IFSC Code"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`amount_${index}`} className="required-input">Amount</Label>
                <Input
                  id={`amount_${index}`}
                  type="number"
                  step="0.01"
                  value={invoice.amount || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "amount", e.target.value)
                  }
                  placeholder="Enter Amount"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`invoiceNo_${index}`}>Invoice Number</Label>
                <Input
                  id={`invoiceNo_${index}`}
                  type="text"
                  value={invoice.invoiceNo || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "invoiceNo", e.target.value)
                  }
                  placeholder="Enter Invoice Number"
                />
              </div>
              
              <div>
                <Label htmlFor={`invoiceDate_${index}`}>Invoice Date</Label>
                <Input
                  id={`invoiceDate_${index}`}
                  type="date"
                  value={
                    invoice.invoiceDate
                      ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    handleInvoiceChange(index, "invoiceDate", e.target.value)
                  }
                />
              </div>
              
              <div>
                <Label htmlFor={`grossAmount_${index}`}>Gross Amount</Label>
                <Input
                  id={`grossAmount_${index}`}
                  type="number"
                  step="0.01"
                  value={invoice.grossAmount || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "grossAmount", e.target.value)
                  }
                  placeholder="Enter Gross Amount"
                />
              </div>

              <div>
                <Label htmlFor={`tds_${index}`}>TDS</Label>
                <Input
                  id={`tds_${index}`}
                  type="number"
                  step="0.01"
                  value={invoice.tds || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "tds", e.target.value)
                  }
                  placeholder="Enter TDS"
                />
              </div>

              <div>
                <Label htmlFor={`otherDeductions_${index}`}>
                  Other Deductions
                </Label>
                <Input
                  id={`otherDeductions_${index}`}
                  type="number"
                  step="0.01"
                  value={invoice.otherDeductions || ""}
                  onChange={(e) =>
                    handleInvoiceChange(
                      index,
                      "otherDeductions",
                      e.target.value
                    )
                  }
                  placeholder="Enter Other Deductions"
                />
              </div>

              <div>
                <Label htmlFor={`netAmount_${index}`}>Net Amount</Label>
                <Input
                  id={`netAmount_${index}`}
                  type="number"
                  step="0.01"
                  value={invoice.netAmount || ""}
                  onChange={(e) =>
                    handleInvoiceChange(index, "netAmount", e.target.value)
                  }
                  placeholder="Enter Net Amount"
                />
              </div>
              
              <div>
                <Label htmlFor={`status_${index}`}>Status</Label>
                <Select
                  value={invoice.status || "Pending"}
                  onValueChange={(value) => handleInvoiceChange(index, "status", value)}
                >
                  <SelectTrigger id={`status_${index}`}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-4 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => removeInvoice(index)}
            >
              Remove Invoice
            </Button>
          </div>
        ))}

        <Button
          className="mt-4 bg-green-500 hover:bg-green-600 text-white"
          onClick={addInvoice}
        >
          Add Invoice
        </Button>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>{incident ? "Update" : "Add"}</Button>
      </div>
    </div>
  );
};

export default PaymentForm;