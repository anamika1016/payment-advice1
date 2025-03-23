import React, { useEffect } from "react";
import { incidentStatus } from "@/data";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";

import {
  addIncident,
  resetIncident,
  setIncidentData,
  updateIncident,
} from "@/redux/incidents/incidentSlice";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const paymentForm = ({ incident, onClose }) => {
  const dispatch = useDispatch();
  const { incidentData } = useSelector((state) => state.incidents);

  useEffect(() => {
    if (incident) {
      dispatch(setIncidentData({ ...incident })); // Load all incident attributes
    } else {
      dispatch(
        setIncidentData({
          // Initialize with empty/default values
          ref_no: "",
          date: null,
          recipient_name: "",
          recipient_email: "",
          recipient_address: "",
          account_number: "",
          ifsc_code: "",
          amount: null,
          utr_no: "",
          transaction_date: null,
          invoices: [],
        })
      );
    }

    return () => dispatch(resetIncident());
  }, [incident, dispatch]);

  const handleStatusSelect = (status) => {
    dispatch(setIncidentData({ status: status.name }));
  };

  const onInputChange = (e) => {
    const { id, value } = e.target;

    dispatch(
      setIncidentData({
        ...incidentData, // Preserve existing values
        [id]: value, // Update only the changed field
      })
    );
  };

  const handleSubmit = () => {
    if (incident) {
      dispatch(updateIncident({ id: incidentData._id, incidentData }));
    } else {
      dispatch(addIncident(incidentData));
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
            invoice_no: "",
            invoice_date: "",
            rfd_id: "",
            rfd_date: "",
            gross_amount: "",
            tds: "",
            other_deductions: "",
            net_amount: "",
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
        <Label htmlFor="ref_no" className="required-input">
          Reference Number
        </Label>
        <Input
          id="ref_no"
          type="text"
          value={incidentData.ref_no}
          onChange={onInputChange}
          placeholder="Enter Reference Number"
          required
        />
      </div>

      <div>
        <Label htmlFor="date" className="required-input">
          Date
        </Label>
        <Input
          id="date"
          type="date"
          value={incidentData.date}
          onChange={onInputChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="recipient_name" className="required-input">
          Recipient Name
        </Label>
        <Input
          id="recipient_name"
          type="text"
          value={incidentData.recipient_name}
          onChange={onInputChange}
          placeholder="Enter Recipient Name"
          required
        />
      </div>
      <div>
        <Label htmlFor="recipient_name" className="required-input">
          Recipient Email
        </Label>
        <Input
          id="recipient_email"
          type="text"
          value={incidentData.recipient_email}
          onChange={onInputChange}
          placeholder="Enter Recipient email"
          required
        />
      </div>

      <div>
        <Label htmlFor="recipient_address" className="required-input">
          Recipient Address
        </Label>
        <Input
          id="recipient_address"
          type="text"
          value={incidentData.recipient_address}
          onChange={onInputChange}
          placeholder="Enter Recipient Address"
          required
        />
      </div>

      <div>
        <Label htmlFor="account_number" className="required-input">
          Account Number
        </Label>
        <Input
          id="account_number"
          type="text"
          value={incidentData.account_number}
          onChange={onInputChange}
          placeholder="Enter Account Number"
          required
        />
      </div>

      <div>
        <Label htmlFor="ifsc_code" className="required-input">
          IFSC Code
        </Label>
        <Input
          id="ifsc_code"
          type="text"
          value={incidentData.ifsc_code}
          onChange={onInputChange}
          placeholder="Enter IFSC Code"
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
          value={incidentData.amount}
          onChange={onInputChange}
          placeholder="Enter Amount"
          required
        />
      </div>

      <div>
        <Label htmlFor="utr_no" className="required-input">
          UTR Number
        </Label>
        <Input
          id="utr_no"
          type="text"
          value={incidentData.utr_no}
          onChange={onInputChange}
          placeholder="Enter UTR Number"
          required
        />
      </div>

      <div>
        <Label htmlFor="transaction_date" className="required-input">
          Transaction Date
        </Label>
        <Input
          id="transaction_date"
          type="date"
          value={incidentData.transaction_date}
          onChange={onInputChange}
          required
        />
      </div>

      {/* Invoice Fields */}
      <div>
        <h3 className="text-lg font-semibold">Invoices</h3>
        {(incidentData.invoices || []).map((invoice, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-sm mb-4">
            <Label htmlFor={`invoice_no_${index}`}>Invoice Number</Label>
            <Input
              id={`invoice_no_${index}`}
              type="text"
              value={invoice.invoice_no || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "invoice_no", e.target.value)
              }
              placeholder="Enter Invoice Number"
            />

            <Label htmlFor={`invoice_date_${index}`}>Invoice Date</Label>
            <Input
              id={`invoice_date_${index}`}
              type="date"
              value={invoice.invoice_date || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "invoice_date", e.target.value)
              }
            />

            <Label htmlFor={`rfd_id_${index}`}>RFD ID</Label>
            <Input
              id={`rfd_id_${index}`}
              type="text"
              value={invoice.rfd_id || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "rfd_id", e.target.value)
              }
              placeholder="Enter RFD ID"
            />

            <Label htmlFor={`rfd_date_${index}`}>RFD Date</Label>
            <Input
              id={`rfd_date_${index}`}
              type="date"
              value={invoice.rfd_date || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "rfd_date", e.target.value)
              }
            />

            <Label htmlFor={`gross_amount_${index}`}>Gross Amount</Label>
            <Input
              id={`gross_amount_${index}`}
              type="number"
              step="0.01"
              value={invoice.gross_amount || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "gross_amount", e.target.value)
              }
              placeholder="Enter Gross Amount"
            />

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

            <Label htmlFor={`other_deductions_${index}`}>
              Other Deductions
            </Label>
            <Input
              id={`other_deductions_${index}`}
              type="number"
              step="0.01"
              value={invoice.other_deductions || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "other_deductions", e.target.value)
              }
              placeholder="Enter Other Deductions"
            />

            <Label htmlFor={`net_amount_${index}`}>Net Amount</Label>
            <Input
              id={`net_amount_${index}`}
              type="number"
              step="0.01"
              value={invoice.net_amount || ""}
              onChange={(e) =>
                handleInvoiceChange(index, "net_amount", e.target.value)
              }
              placeholder="Enter Net Amount"
            />

            <Button
              className="mt-2 bg-red-500 hover:bg-red-600 text-white"
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

export default paymentForm;
