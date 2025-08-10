import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PriorityIcon, { PriorityLevel } from '../components/PriorityIcon';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: PriorityLevel;
  assignee?: string;
}

const users = ['Alice', 'Bob', 'Charlie'];

const AllTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 1, title: 'Sample Ticket 1', status: 'Open', priority: 'low' },
    { id: 2, title: 'Sample Ticket 2', status: 'In Progress', priority: 'medium' },
    { id: 3, title: 'Sample Ticket 3', status: 'Open', priority: 'high' },
  ]);
  const [view, setView] = useState<'card' | 'table'>('card');
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);
  const [currentAction, setCurrentAction] = useState<'assign' | 'close' | null>(null);
  const [remark, setRemark] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const handleSelectAssignee = (ticketId: number, user: string) => {
    setSelectedAssignee(user);
    setExpandedTicket(ticketId);
    setCurrentAction('assign');
    setRemark(`Assigning to ${user}`);
  };

  const submitAssign = (ticketId: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, assignee: selectedAssignee } : t))
    );
    console.log(`Assign ticket ${ticketId} to ${selectedAssignee} with remark: ${remark}`);
    resetAction();
  };

  const handleClose = (ticketId: number) => {
    setExpandedTicket(ticketId);
    setCurrentAction('close');
    setRemark('Closing ticket');
    setSelectedAssignee('');
  };

  const submitClose = (ticketId: number) => {
    console.log(`Close ticket ${ticketId} with remark: ${remark}`);
    resetAction();
  };

  const resetAction = () => {
    setExpandedTicket(null);
    setCurrentAction(null);
    setRemark('');
    setSelectedAssignee('');
  };

  return (
    <Box p={2}>
      <Button variant="outlined" onClick={() => setView(view === 'card' ? 'table' : 'card')}>
        {view === 'card' ? 'Table View' : 'Card View'}
      </Button>
      {view === 'card' ? (
        <Box mt={2} className="row g-3">
          {tickets.map((ticket) => (
            <Box key={ticket.id} className="col-md-4">
              <Card>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label={ticket.status} size="small" color="primary" />
                    <PriorityIcon level={ticket.priority} />
                  </Box>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {ticket.title}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  {expandedTicket === ticket.id && currentAction === 'assign' && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                      />
                      <Button sx={{ mt: 1 }} variant="contained" onClick={() => submitAssign(ticket.id)}>
                        Submit
                      </Button>
                    </Box>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Select
                      fullWidth
                      displayEmpty
                      size="small"
                      value={ticket.id === expandedTicket && currentAction === 'assign' ? selectedAssignee : ticket.assignee || ''}
                      onChange={(e) => handleSelectAssignee(ticket.id, e.target.value as string)}
                    >
                      <MenuItem value="">
                        <em>Assign...</em>
                      </MenuItem>
                      {users.map((u) => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      ) : (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <React.Fragment key={ticket.id}>
                <TableRow>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.title}</TableCell>
                  <TableCell>
                    <Chip label={ticket.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <PriorityIcon level={ticket.priority} />
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleClose(ticket.id)}>
                      Close
                    </Button>
                    <Select
                      sx={{ ml: 1, minWidth: 120 }}
                      displayEmpty
                      size="small"
                      value={ticket.id === expandedTicket && currentAction === 'assign' ? selectedAssignee : ''}
                      onChange={(e) => handleSelectAssignee(ticket.id, e.target.value as string)}
                    >
                      <MenuItem value="">
                        <em>Assign...</em>
                      </MenuItem>
                      {users.map((u) => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                </TableRow>
                {expandedTicket === ticket.id && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      {currentAction === 'assign' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                          />
                          <Button variant="contained" onClick={() => submitAssign(ticket.id)}>
                            Submit
                          </Button>
                        </Box>
                      )}
                      {currentAction === 'close' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                          />
                          <Button variant="contained" onClick={() => submitClose(ticket.id)}>
                            Confirm
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default AllTickets;
