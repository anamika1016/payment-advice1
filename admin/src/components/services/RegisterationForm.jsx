import React, { useEffect } from "react";
import { serviceStatus } from "@/data";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  addService,
  resetService,
  setSeviceData,
  updateService,
} from "@/redux/services/serviceSlice";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const RegisterationForm = ({ service, onClose }) => {
  const dispatch = useDispatch();
  const { serviceData, isLoading, error } = useSelector(
    (state) => state.services
  );

  useEffect(() => {
    if (service) {
      dispatch(setSeviceData(service));
    }

    return () => dispatch(resetService());
  }, [service, dispatch]);

  const handleStatusSelect = (status) => {
    dispatch(setSeviceData({ status: status.name }));
  };

  const onInputChange = (e) => {
    const { id, value } = e.target;
    dispatch(setSeviceData({ [id]: value }));
  };

  const handleSubmit = () => {
    if (service) {
      dispatch(updateService({ id: serviceData._id, serviceData }));
    } else {
      dispatch(addService(serviceData));
    }

    onClose();
  };

  const currentStatus = serviceStatus.find(
    (status) => status.name === serviceData.status
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Label htmlFor="name" className="required-input">
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={serviceData.name}
          onChange={onInputChange}
          placeholder="Enter service name"
          required
        />
      </div>
      <div>
        <Label htmlFor="email" className="required-input">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={serviceData.email}
          onChange={onInputChange}
          placeholder="Enter Email Address"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone" className="required-input">
          Phone Number
        </Label>
        <Input
          id="phone"
          type="number"
          value={serviceData.phone}
          onChange={onInputChange}
          placeholder="Enter Phone Number"
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
          value={serviceData.bankName}
          onChange={onInputChange}
          placeholder="Enter Bank Name"
          required
        />
      </div>
      <div>
        <Label htmlFor="accountNumber" className="required-input">
          Account Number
        </Label>
        <Input
          id="accountNumber"
          type="number"
          value={serviceData.accountNumber}
          onChange={onInputChange}
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
          value={serviceData.ifscCode}
          onChange={onInputChange}
          placeholder="Enter IFSC Code"
          required
        />
      </div>
      <div>
        <Label htmlFor="bankAddress" className="required-input">
          Address
        </Label>
        <Input
          id="bankAddress"
          type="text"
          value={serviceData.bankAddress}
          onChange={onInputChange}
          placeholder="Enter Address"
          required
        />
      </div>
      <div>
        <Label htmlFor="state" className="required-input">
          State
        </Label>
        <Input
          id="state"
          type="text"
          value={serviceData.state}
          onChange={onInputChange}
          placeholder="Enter State"
          required
        />
      </div>
      <div>
        <Label htmlFor="district" className="required-input">
          District
        </Label>
        <Input
          id="district"
          type="text"
          value={serviceData.district}
          onChange={onInputChange}
          placeholder="Enter District"
          required
        />
      </div>
      <div>
        <Label htmlFor="type" className="required-input">
          Type
        </Label>
        <Select
          value={serviceData.type || ""}
          onValueChange={(value) => dispatch(setSeviceData({ type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>{service ? "Update" : "Add"}</Button>
      </div>
    </div>
  );
};

export default RegisterationForm;
