import React from "react";
import TicketsList from "../components/AllTickets/TicketsList";
import SlaManagementTable from "../components/SlaManagement/SlaManagementTable";

const SlaManagement: React.FC = () => (
  <TicketsList
    titleKey="SLA Management"
    permissionPathPrefix="allTickets"
    restrictStatusesToAllowed={false}
    allowAll
    allowGrid={false}
    slaManagement
    renderTable={(tickets, refresh) => <SlaManagementTable tickets={tickets} refresh={refresh} />}
  />
);

export default SlaManagement;
