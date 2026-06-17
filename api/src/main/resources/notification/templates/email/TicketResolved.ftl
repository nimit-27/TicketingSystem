Subject: Anna Darpan: Ticket Resolved – ${ticketId!""}

Dear ${userName!"User"},

Your ticket has been resolved. Please review the resolution and submit feedback within 72 hours.

Resolution Summary:
- Issue: ${issue!(ticketId!"Ticket")}
- Resolution: ${resolution!"Resolved"}

Click here to submit feedback: ${feedbackLink!("/tickets/" + (ticketId!"") + "/feedback")}

Regards,
Anna Darpan Support Team
