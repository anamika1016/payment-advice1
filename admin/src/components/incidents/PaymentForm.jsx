import React, { useEffect, useState } from "react";
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
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";

const PaymentForm = ({ incident, onClose }) => {
  const dispatch = useDispatch();
  const { incidentData, recipientNames } = useSelector(
    (state) => state.incidents
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (incident) {
      const formattedIncident = {
        ...incident,
        invoices:
          incident.invoices?.map((invoice) => ({
            ...invoice,
            additionalInvoices: invoice.additionalInvoices || [],
          })) || [],
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
          transactionDate: "",
          invoices: [],
          company: "asa", // Default value for company
        })
      );
    }

    return () => dispatch(resetIncident());
  }, [incident, dispatch]);

  const handleChange = (id, value) => {
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

    // Ensure company field is set (if not already in the data)
    if (!dataToSubmit.company) {
      dataToSubmit.company = "asa"; // Default value
    }

    if (dataToSubmit.invoices && dataToSubmit.invoices.length > 0) {
      dataToSubmit.invoices = dataToSubmit.invoices.map((invoice) => {
        // Create the base invoice object
        const invoiceData = {
          refNo: invoice.refNo,
          recipientName: invoice.recipientName,
          recipientEmail: invoice.recipientEmail,
          recipientAddress: invoice.recipientAddress,
          phone: invoice.phone,
          accountNumber: invoice.accountNumber,
          ifscCode: invoice.ifscCode,
          date: invoice.date,
          amount: invoice.amount,
          particulars: invoice.particulars,
          invoiceNo: invoice.invoiceNo,
          invoiceDate: invoice.invoiceDate,
          grossAmount: invoice.grossAmount,
          tds: invoice.tds,
          otherDeductions: invoice.otherDeductions,
          netAmount: invoice.netAmount,
          status: invoice.status || "Pending",
        };

        // Add additionalInvoices if they exist
        if (
          invoice.additionalInvoices &&
          invoice.additionalInvoices.length > 0
        ) {
          invoiceData.additionalInvoices = invoice.additionalInvoices.map(
            (addInv) => ({
              invoiceNo: addInv.invoiceNo || "",
              invoiceDate: addInv.invoiceDate || "",
              particulars: addInv.particulars || "",
              grossAmount: parseFloat(addInv.grossAmount) || 0,
              tds: parseFloat(addInv.tds) || 0,
              otherDeductions: parseFloat(addInv.otherDeductions) || 0,
              netAmount: parseFloat(addInv.netAmount) || 0,
            })
          );
        } else {
          invoiceData.additionalInvoices = [];
        }

        return invoiceData;
      });
    }

    console.log("Submitting data:", dataToSubmit);

    if (incident) {
      dispatch(
        updateIncident({ id: dataToSubmit._id, incidentData: dataToSubmit })
      );
    } else {
      dispatch(addIncident(dataToSubmit));
    }
    navigate("/payment");
    onClose();
  };

  const handleInvoiceChange = (index, field, value) => {
    const updatedInvoices = [...(incidentData.invoices || [])];
    const invoice = { ...updatedInvoices[index], [field]: value };

    // Auto-fill grossAmount if amount is entered
    if (field === "amount") {
      invoice.grossAmount = value;
    }

    // Calculate netAmount if tds or otherDeductions or grossAmount are updated
    const grossAmount = parseFloat(invoice.grossAmount) || 0;
    const tds = parseFloat(invoice.tds) || 0;
    const otherDeductions = parseFloat(invoice.otherDeductions) || 0;

    // Calculate netAmount only if any of the dependent fields are updated
    if (["tds", "otherDeductions", "grossAmount", "amount"].includes(field)) {
      invoice.netAmount = (grossAmount - tds - otherDeductions).toFixed(2);
    }

    updatedInvoices[index] = invoice;
    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  const handleRecipientSelect = (index, field, value) => {
    const updatedInvoices = [...(incidentData.invoices || [])];

    // If receiving the entire recipient data object
    if (field === "recipient_data") {
      // Map recipient data fields to our invoice fields
      updatedInvoices[index] = {
        ...updatedInvoices[index],
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
        // Add any other fields you want to map
      };
    } else {
      // Handle individual field updates (backward compatibility)
      const fieldMapping = {
        recipient_name: "recipientName",
        recipient_email: "recipientEmail",
        phone: "phone",
        recipient_address: "recipientAddress",
        account_number: "accountNumber",
        ifsc_code: "ifscCode",
      };

      const mappedField = fieldMapping[field] || field;
      updatedInvoices[index] = {
        ...updatedInvoices[index],
        [mappedField]: value,
      };
    }

    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  const handleRecipientSearch = (index, value) => {
    handleInvoiceChange(index, "recipientName", value);
    dispatch(fetchRecipientByName({ namePrefix: value.toLowerCase() }));
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
            phone: "",
            accountNumber: "",
            ifscCode: "",
            date: "",
            particulars: "",
            invoiceNo: "",
            grossAmount: "",
            tds: "",
            otherDeductions: "",
            netAmount: "",
            invoiceDate: "",
            additionalInvoices: [],
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

  // Function to add additional invoice details to an existing recipient
  const addAdditionalInvoice = (index) => {
    const updatedInvoices = [...(incidentData.invoices || [])];
    const invoice = updatedInvoices[index];

    // Create new additional invoice object with empty fields
    const newInvoiceDetails = {
      invoiceNo: "",
      invoiceDate: "",
      particulars: "",
      grossAmount: "",
      tds: "",
      otherDeductions: "",
      netAmount: "",
    };

    // Ensure additionalInvoices array exists
    if (!invoice.additionalInvoices) {
      invoice.additionalInvoices = [];
    }

    // Add new invoice to additionalInvoices array
    updatedInvoices[index] = {
      ...invoice,
      additionalInvoices: [...invoice.additionalInvoices, newInvoiceDetails],
    };

    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  // Function to handle changes to additional invoice fields
  const handleAdditionalInvoiceChange = (
    invoiceIndex,
    additionalIndex,
    field,
    value
  ) => {
    const updatedInvoices = [...(incidentData.invoices || [])];
    const invoice = updatedInvoices[invoiceIndex];
    const additionalInvoices = [...(invoice.additionalInvoices || [])];
    const additionalInvoice = {
      ...additionalInvoices[additionalIndex],
      [field]: value,
    };

    // Calculate netAmount for additional invoice
    if (["grossAmount", "tds", "otherDeductions"].includes(field)) {
      const grossAmount = parseFloat(additionalInvoice.grossAmount) || 0;
      const tds = parseFloat(additionalInvoice.tds) || 0;
      const otherDeductions =
        parseFloat(additionalInvoice.otherDeductions) || 0;
      additionalInvoice.netAmount = (
        grossAmount -
        tds -
        otherDeductions
      ).toFixed(2);
    }

    additionalInvoices[additionalIndex] = additionalInvoice;
    updatedInvoices[invoiceIndex] = {
      ...invoice,
      additionalInvoices: additionalInvoices,
    };

    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  // Function to remove an additional invoice
  const removeAdditionalInvoice = (invoiceIndex, additionalIndex) => {
    const updatedInvoices = [...(incidentData.invoices || [])];
    const invoice = updatedInvoices[invoiceIndex];
    const additionalInvoices = [...(invoice.additionalInvoices || [])];

    additionalInvoices.splice(additionalIndex, 1);
    updatedInvoices[invoiceIndex] = {
      ...invoice,
      additionalInvoices: additionalInvoices,
    };

    dispatch(setIncidentData({ invoices: updatedInvoices }));
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1
          className="text-xl text-[#0E3B65] mb-4 uppercase"
          style={{ fontFamily: "Mukta" }}
        >
          Payments / Add Payment
        </h1>
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
            <Label htmlFor="transactionDate" className="required-input">
              Transaction Date
            </Label>
            <Input
              id="transactionDate"
              type="date"
              value={incidentData.transactionDate || ""}
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
                    {/* Replace the recipient name input with the SearchResults component */}
                    <SearchResults
                      id={`recipientName_${index}`}
                      label="Recipient Name"
                      items={recipientNames || []}
                      value={invoice.recipientName || ""}
                      onInputChange={(_, value) =>
                        handleRecipientSearch(index, value)
                      }
                      onItemSelect={(field, value) =>
                        handleRecipientSelect(index, field, value)
                      }
                      placeholder="Search for recipient..."
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={`recipientEmail_${index}`}
                      className="required-input"
                    >
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
                    <Label htmlFor={`recipientAddress_${index}`}>Address</Label>
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
                    <Label htmlFor={`phone_${index}`}>Phone</Label>
                    <Input
                      id={`phone_${index}`}
                      type="text"
                      value={invoice.phone || ""}
                      onChange={(e) =>
                        handleInvoiceChange(index, "phone", e.target.value)
                      }
                      placeholder="Enter Phone Number"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor={`accountNumber_${index}`}
                      className="required-input"
                    >
                      Account Number
                    </Label>
                    <Input
                      id={`accountNumber_${index}`}
                      type="text"
                      value={invoice.accountNumber || ""}
                      onChange={(e) =>
                        handleInvoiceChange(
                          index,
                          "accountNumber",
                          e.target.value
                        )
                      }
                      placeholder="Enter Account Number"
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor={`ifscCode_${index}`}
                      className="required-input"
                    >
                      IFSC Code
                    </Label>
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
                    <Label htmlFor={`date_${index}`}>Date</Label>
                    <Input
                      id={`date_${index}`}
                      type="date"
                      value={invoice.date || ""}
                      onChange={(e) =>
                        handleInvoiceChange(index, "date", e.target.value)
                      }
                      placeholder="Enter Date"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`particulars_${index}`}>Particulars</Label>
                    <Input
                      id={`particulars_${index}`}
                      type="text"
                      value={invoice.particulars || ""}
                      onChange={(e) =>
                        handleInvoiceChange(
                          index,
                          "particulars",
                          e.target.value
                        )
                      }
                      placeholder="Enter Particulars"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`invoiceNo_${index}`}>
                      Invoice Number/RFP Number
                    </Label>
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
                    <Label htmlFor={`invoiceDate_${index}`}>
                      Invoice Date/RFP Date{" "}
                    </Label>
                    <Input
                      id={`invoiceDate_${index}`}
                      type="date"
                      value={invoice.invoiceDate || ""}
                      onChange={(e) =>
                        handleInvoiceChange(
                          index,
                          "invoiceDate",
                          e.target.value
                        )
                      }
                      placeholder="Enter Invoice Date"
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
                        handleInvoiceChange(
                          index,
                          "grossAmount",
                          e.target.value
                        )
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
                      Other Deductions/Advance Adjustment
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
                </div>

                {/* Additional Invoices Section */}
                {invoice.additionalInvoices &&
                  invoice.additionalInvoices.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-medium mb-2">Additional Invoices</h4>
                      {invoice.additionalInvoices.map(
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
                                onClick={() =>
                                  removeAdditionalInvoice(
                                    index,
                                    additionalIndex
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label
                                  htmlFor={`additionalInvoiceNo_${index}_${additionalIndex}`}
                                >
                                  Invoice Number
                                </Label>
                                <Input
                                  id={`additionalInvoiceNo_${index}_${additionalIndex}`}
                                  type="text"
                                  value={additionalInvoice.invoiceNo || ""}
                                  onChange={(e) =>
                                    handleAdditionalInvoiceChange(
                                      index,
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
                                  htmlFor={`additionalInvoiceDate_${index}_${additionalIndex}`}
                                >
                                  Invoice Date
                                </Label>
                                <Input
                                  id={`additionalInvoiceDate_${index}_${additionalIndex}`}
                                  type="date"
                                  value={additionalInvoice.invoiceDate || ""}
                                  onChange={(e) =>
                                    handleAdditionalInvoiceChange(
                                      index,
                                      additionalIndex,
                                      "invoiceDate",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`additionalParticulars_${index}_${additionalIndex}`}
                                >
                                  Particulars
                                </Label>
                                <Input
                                  id={`additionalParticulars_${index}_${additionalIndex}`}
                                  type="text"
                                  value={additionalInvoice.particulars || ""}
                                  onChange={(e) =>
                                    handleAdditionalInvoiceChange(
                                      index,
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
                                  htmlFor={`additionalGrossAmount_${index}_${additionalIndex}`}
                                >
                                  Gross Amount
                                </Label>
                                <Input
                                  id={`additionalGrossAmount_${index}_${additionalIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={additionalInvoice.grossAmount || ""}
                                  onChange={(e) =>
                                    handleAdditionalInvoiceChange(
                                      index,
                                      additionalIndex,
                                      "grossAmount",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter Gross Amount"
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor={`additionalTds_${index}_${additionalIndex}`}
                                >
                                  TDS
                                </Label>
                                <Input
                                  id={`additionalTds_${index}_${additionalIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={additionalInvoice.tds || ""}
                                  onChange={(e) =>
                                    handleAdditionalInvoiceChange(
                                      index,
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
                                  htmlFor={`additionalOtherDeductions_${index}_${additionalIndex}`}
                                >
                                  Other Deductions
                                </Label>
                                <Input
                                  id={`additionalOtherDeductions_${index}_${additionalIndex}`}
                                  type="number"
                                  step="0.01"
                                  value={
                                    additionalInvoice.otherDeductions || ""
                                  }
                                  onChange={(e) =>
                                    handleAdditionalInvoiceChange(
                                      index,
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
                                  htmlFor={`additionalNetAmount_${index}_${additionalIndex}`}
                                >
                                  Net Amount
                                </Label>
                                <Input
                                  id={`additionalNetAmount_${index}_${additionalIndex}`}
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

                <div className="flex gap-2 mt-4">
                  <Button
                    className="bg-gray-500 hover:bg-custom-gray text-white"
                    onClick={() => addAdditionalInvoice(index)}
                  >
                    Add Invoice
                  </Button>

                  <Button
                    className="bg-red-500 hover:bg-custom-red text-white"
                    onClick={() => removeInvoice(index)}
                  >
                    Remove Recipient
                  </Button>
                </div>
              </div>
            ))}

            <Button
              className="mt-4 bg-green-500 hover:bg-green-600 text-white"
              onClick={addInvoice}
            >
              Add New Recipient
            </Button>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit}>
              {incident ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentForm;
