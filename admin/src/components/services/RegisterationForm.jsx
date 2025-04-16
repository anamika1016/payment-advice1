import React, { useEffect } from "react";
import { serviceStatus } from "@/data";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  addService,
  resetService,
  setSeviceData,
  updateService,
  clearValidationErrors,
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
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const RegisterationForm = ({ service, onClose }) => {
  const dispatch = useDispatch();
  const { serviceData, isLoading, error, validationErrors } = useSelector(
    (state) => state.services
  );

  useEffect(() => {
    if (service) {
      dispatch(setSeviceData(service));
    }

    // Clear any existing validation errors when the form is opened
    dispatch(clearValidationErrors());

    return () => dispatch(resetService());
  }, [service, dispatch]);

  const onInputChange = (e) => {
    const { id, value } = e.target;
    dispatch(setSeviceData({ [id]: value }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[id]) {
      dispatch(clearValidationErrors());
    }
  };

  const handleSubmit = async () => {
    // Basic form validation
    const requiredFields = ["name", "email", "phone"];
    const missingFields = requiredFields.filter((field) => !serviceData[field]);

    if (missingFields.length > 0) {
      const fieldNames = missingFields
        .map((field) => field.charAt(0).toUpperCase() + field.slice(1))
        .join(", ");
      toast.error(`Please fill in all required fields: ${fieldNames}`);
      return;
    }

    try {
      let actionResult;
      if (service) {
        actionResult = await dispatch(
          updateService({ id: serviceData._id, serviceData })
        );
      } else {
        actionResult = await dispatch(addService(serviceData));
      }

      // Check if the action was fulfilled (no error)
      if (!actionResult.error) {
        onClose();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  // Helper function to determine if field has error
  const hasError = (fieldName) => {
    return validationErrors[fieldName] ? true : false;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Display general error if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <Label
          htmlFor="name"
          className={`required-input ${hasError("name") ? "text-red-500" : ""}`}
        >
          Name
        </Label>
        <Input
          id="name"
          type="text"
          value={serviceData.name || ""}
          onChange={onInputChange}
          placeholder="Enter service name"
          required
          className={
            hasError("name") ? "border-red-500 focus:ring-red-500" : ""
          }
        />
        {validationErrors.name && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.name}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="email"
          className={`required-input ${
            hasError("email") ? "text-red-500" : ""
          }`}
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={serviceData.email || ""}
          onChange={onInputChange}
          placeholder="Enter Email Address"
          required
          className={
            hasError("email") ? "border-red-500 focus:ring-red-500" : ""
          }
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.email}
          </p>
        )}
      </div>

      <div>
        <Label
          htmlFor="phone"
          className={`required-input ${
            hasError("phone") ? "text-red-500" : ""
          }`}
        >
          Phone Number
        </Label>
        <Input
          id="phone"
          type="text"
          value={serviceData.phone || ""}
          onChange={onInputChange}
          placeholder="Enter Phone Number"
          required
          className={
            hasError("phone") ? "border-red-500 focus:ring-red-500" : ""
          }
        />
        {validationErrors.phone && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.phone}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="bankName" className="required-input">
          Bank Name
        </Label>
        <Input
          id="bankName"
          type="text"
          value={serviceData.bankName || ""}
          onChange={onInputChange}
          placeholder="Enter Bank Name"
          required
        />
      </div>

      <div>
        <Label
          htmlFor="accountNumber"
          className={`required-input ${
            hasError("accountNumber") ? "text-red-500" : ""
          }`}
        >
          Account Number
        </Label>
        <Input
          id="accountNumber"
          type="text"
          value={serviceData.accountNumber || ""}
          onChange={onInputChange}
          placeholder="Enter Account Number"
          required
          className={
            hasError("accountNumber") ? "border-red-500 focus:ring-red-500" : ""
          }
        />
        {validationErrors.accountNumber && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.accountNumber}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="ifscCode" className="required-input">
          IFSC Code
        </Label>
        <Input
          id="ifscCode"
          type="text"
          value={serviceData.ifscCode || ""}
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
          value={serviceData.bankAddress || ""}
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
          value={serviceData.state || ""}
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
          value={serviceData.district || ""}
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

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="min-w-[80px]"
        >
          {isLoading ? "Processing..." : service ? "Update" : "Add"}
        </Button>
      </div>
    </div>
  );
};

export default RegisterationForm;
