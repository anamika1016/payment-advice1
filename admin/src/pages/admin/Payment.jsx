import Layout from "@/components/layout/Layout";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
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
import PaymentForm from "@/components/incidents/PaymentForm";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteIncident,
  fetchIncidents,
} from "@/redux/incidents/incidentSlice";

const Payment = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const { incidents } = useSelector((state) => state.incidents);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchIncidents());
  }, [dispatch]);

  const openIncidentDialog = (incident) => {
    setSelectedIncident(incident);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedIncident(null);
  };

  const openDeleteConfirmation = (incident) => {
    setSelectedIncident(incident);
    setIsConfirmDialogOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSelectedIncident(null);
    setIsConfirmDialogOpen(false);
  };

  const handleDeleteIncident = (id) => {
    dispatch(deleteIncident(id));
    closeDeleteConfirmation();
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1
          className="text-xl text-[#0E3B65] mb-4 uppercase"
          style={{ fontFamily: "Mukta" }}
        >
          Payments
        </h1>
        <div className="flex flex-col items-center gap-10 w-[100%]">
          <div className="flex justify-end w-[100%]">
            <Button onClick={() => openIncidentDialog(null)}>
              new Payment
            </Button>
          </div>

          <div className="w-[100%] border rounded-lg shadow-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient Name</TableHead>
                  <TableHead>Recipient Email</TableHead>
                  <TableHead>Recipient Address</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>IFSC Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>UTR Number</TableHead>
                  <TableHead>Transaction Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident._id}>
                    <TableCell className="font-medium">
                      {incident.ref_no}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.date}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.recipient_name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.recipient_email}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.recipient_address}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.account_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.ifsc_code}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.amount}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.utr_no}
                    </TableCell>
                    <TableCell className="font-medium">
                      {incident.transaction_date}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openIncidentDialog(incident)}
                        >
                          <FaEdit className="mr-2" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteConfirmation(incident)}
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

          {/* Incident Form Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
            <DialogContent className="w-[90vw] sm:w-[600px] h-auto max-h-[90vh] p-6 rounded-lg overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedIncident ? "Edit Payment" : " new Payment"}
                </DialogTitle>
              </DialogHeader>
              <PaymentForm incident={selectedIncident} onClose={closeDialog} />
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
                Are you sure you want to delete the incident{" "}
                <strong>{selectedIncident?.name}</strong>?
              </p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={closeDeleteConfirmation}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteIncident(selectedIncident._id)}
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

export default Payment;
