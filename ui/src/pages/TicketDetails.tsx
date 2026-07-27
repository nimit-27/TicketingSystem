import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import TicketView from '../components/TicketView/TicketView';
import HistorySidebar from '../components/TicketView/HistorySidebar';
import { checkAccessMaster } from '../utils/permissions';

const TicketDetails: React.FC = () => {
  const { ticketId } = useParams();
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!ticketId) return null;

  return (
    <div className="container" style={{ display: 'flex', overflowWrap: 'anywhere' }}>
      <div style={{ flexGrow: 1, marginRight: historyOpen ? 400 : 0 }}>
        <TicketView
          ticketId={ticketId}
          showHistory={checkAccessMaster(['ticketView', 'ticketHistory'])}
        />
      </div>
      <HistorySidebar ticketId={ticketId} open={historyOpen} setOpen={setHistoryOpen} />
    </div>
  );
};

export default TicketDetails;

