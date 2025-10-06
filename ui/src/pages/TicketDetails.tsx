import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TicketView from '../components/TicketView/TicketView';
import HistorySidebar from '../components/TicketView/HistorySidebar';

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams();
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!ticketId) return null;

  return (
    <div className="container" style={{ display: 'flex' }}>
      <div style={{ flexGrow: 1, marginRight: historyOpen ? 400 : 0 }}>
        <TicketView ticketId={ticketId} />
      </div>
      <HistorySidebar ticketId={ticketId} open={historyOpen} setOpen={setHistoryOpen} />
    </div>
  );
};

export default TicketDetails;

