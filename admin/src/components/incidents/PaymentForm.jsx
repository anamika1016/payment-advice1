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
      dispatch(setIncidentData(incident));
    }

    return () => dispatch(resetIncident());
  }, [incident, dispatch]);

  const handleStatusSelect = (status) => {
    dispatch(setIncidentData({ status: status.name }));
  };

  const onInputChange = (e) => {
    const { id, value } = e.target;
    dispatch(setIncidentData({ [id]: value }));
  };

  const handleSubmit = () => {
    if (incident) {
      dispatch(updateIncident({ id: incidentData._id, incidentData }));
    } else {
      dispatch(addIncident(incidentData));
    }

    onClose();
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

      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>{incident ? "Update" : "Add"}</Button>
      </div>
    </div>
  );
};

export default paymentForm;
