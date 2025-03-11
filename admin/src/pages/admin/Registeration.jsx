import Layout from "@/components/layout/Layout";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

const Registeration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
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

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1
          className="text-xl text-[#0E3B65] mb-4 uppercase"
          style={{ fontFamily: "Mukta" }}
        >
          Registerations
        </h1>
        <div className="flex flex-col items-center gap-10 w-[100%]">
          <div className="flex justify-end w-[100%]">
            <Button onClick={() => openServiceDialog(null)}>
              Add Registerations
            </Button>
          </div>

          <div className="w-[100%] border rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Service URL</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...services]
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
                      <TableCell>
                        {service.link ? (
                          <div className="flex items-center">
                            <a
                              href={service.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
                            >
                              <span className="max-w-[200px] truncate mr-2">
                                view
                              </span>
                              <FaExternalLinkAlt className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            No link provided
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip status={service.status} />
                      </TableCell>
                      <TableCell>{formatDate(service.updatedAt)}</TableCell>
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
                  ))}
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
              <RegisterationForm service={selectedService} onClose={closeDialog} />
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
        </div>
      </div>
    </Layout>
  );
};

export default Registeration;
