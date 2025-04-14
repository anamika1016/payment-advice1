import Layout from "@/components/layout/Layout";
import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaExternalLinkAlt,
  FaUpload,
  FaSearch,
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
} from "@/components/ui/dialog";
import Chip from "@/components/common/Chip";
import { useDispatch, useSelector } from "react-redux";
import { deleteService, fetchServices } from "@/redux/services/serviceSlice";
import { formatDate } from "@/utils.js";
import RegisterationForm from "@/components/services/RegisterationForm";
import axios from "@/api/axios";

const Registeration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { services } = useSelector((state) => state.services);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const openServiceDialog = (service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedService(null);
  };

  const openDeleteConfirmation = (service) => {
    setSelectedService(service);
    setIsConfirmDialogOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSelectedService(null);
    setIsConfirmDialogOpen(false);
  };

  const handleDeleteService = (id) => {
    dispatch(deleteService(id));
    closeDeleteConfirmation();
  };

  const handleBulkUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const submitBulkUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/service/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      dispatch(fetchServices());

      setIsBulkUploadOpen(false);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  // Filter services based on search term
  const filteredServices = services.filter((service) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name?.toLowerCase().includes(searchLower) ||
      service.email?.toLowerCase().includes(searchLower) ||
      service.phone?.toLowerCase().includes(searchLower) ||
      service.bankName?.toLowerCase().includes(searchLower) ||
      service.accountNumber?.toLowerCase().includes(searchLower) ||
      service.ifscCode?.toLowerCase().includes(searchLower) ||
      service.state?.toLowerCase().includes(searchLower) ||
      service.district?.toLowerCase().includes(searchLower) ||
      service.type?.toLowerCase().includes(searchLower)
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
            Registerations
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-10 w-full">
          <div className="flex gap-4 justify-end w-full">
            <Button onClick={() => openServiceDialog(null)}>
              Add Registerations
            </Button>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
              <FaUpload className="mr-2" /> Bulk Upload
            </Button>
          </div>

          <div className="w-full border rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Bank Name</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>IFSC Code</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length > 0 ? (
                  [...filteredServices]
                    .sort((a, b) => {
                      const dateA = new Date(a.updatedAt || 0);
                      const dateB = new Date(b.updatedAt || 0);
                      return dateB - dateA;
                    })
                    .map((service) => (
                      <TableRow key={service._id}>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.email}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.phone}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.bankName}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.accountNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.ifscCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.bankAddress}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.state}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.district}
                        </TableCell>
                        <TableCell className="font-medium">
                          {service.type}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openServiceDialog(service)}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteConfirmation(service)}
                            >
                              <FaTrash className="mr-2" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-4">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Service Form Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogContent className="w-[90vw] sm:w-[600px] h-auto max-h-[90vh] p-6 rounded-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedService ? "Edit Registeration" : "Add Registeration"}
                </DialogTitle>
              </DialogHeader>
              <RegisterationForm
                service={selectedService}
                onClose={closeDialog}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={isConfirmDialogOpen}
            onOpenChange={closeDeleteConfirmation}
          >
            <DialogContent className="max-w-[90vw] w-auto">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to delete the service{" "}
                <strong>{selectedService?.name}</strong>?
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={closeDeleteConfirmation}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteService(selectedService._id)}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Upload Dialog */}
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogContent className="w-[400px] p-6 rounded-lg">
              <DialogHeader>
                <DialogTitle>Bulk Upload</DialogTitle>
              </DialogHeader>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={handleBulkUpload}
                className="w-full border p-2 rounded-md"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsBulkUploadOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={submitBulkUpload} disabled={!file}>
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default Registeration;
